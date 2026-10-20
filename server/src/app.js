import express from 'express';
import { randomUUID } from 'node:crypto';
import pool from './db/pool.js';

const app = express();
const PORT = 3000;
app.use(express.json());

const allowedStatuses = [
    'Нужно сделать',
    'В работе',
    'Готово',
];
const allowedPriorities = [
    'Низкий',
    'Средний',
    'Высокий',
];
function validateTask(data, partial = false) {
    const errors = [];
    if (!partial || data.title !== undefined) {
        if (typeof data.title !== 'string' || !data.title.trim()) {
            errors.push('Поле title обязательно');
        }
    }
    if (!partial || data.project !== undefined) {
        if (typeof data.project !== 'string' || !data.project.trim()) {
            errors.push('Поле project обязательно');
        }
    }
    if (
        data.status !== undefined &&
        !allowedStatuses.includes(data.status)
    ) {
        errors.push('Недопустимый status');
    }
    if (
        data.priority !== undefined &&
        !allowedPriorities.includes(data.priority)
    ) {
        errors.push('Недопустимый priority');
    }
    if (
        data.dueDate !== undefined &&
        typeof data.dueDate !== 'string'
    ) {
        errors.push('Поле dueDate должно быть строкой');
    }
    if (partial && Object.keys(data).length === 0) {
        errors.push('Передайте хотя бы одно поле для изменения');
    }
    return errors;
}


const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
    return UUID_PATTERN.test(value);
}

app.get('/api/health', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT NOW() AS db_time'
        );
        res.json({
            status: 'ok',
            database: 'connected',
            dbTime: result.rows[0].db_time,
        });
    } catch (error) {
        next(error);
    }
});


app.get('/api/tasks', async (req, res, next) => {
    try {
        const { status, priority } = req.query;
        const result = await pool.query(
            `SELECT
                id,
                title,
                project,
                status,
                priority,
                due_date::text AS "dueDate",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
                FROM tasks
                WHERE ($1::text IS NULL OR status = $1)
                AND ($2::text IS NULL OR priority = $2)
                ORDER BY created_at DESC`,
            [status ?? null, priority ?? null]
        );
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.get('/api/tasks/:id', async (req, res, next) => {
    try {
        if (!isUuid(req.params.id)) {
            return res.status(400).json({
                message: 'Некорректный id задачи',
            });
        }
        const result = await pool.query(
            `SELECT
                id,
                title,
                project,
                status,
                priority,
                due_date::text AS "dueDate",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
                FROM tasks
                WHERE id = $1`,
            [req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Задача не найдена',
            });
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.post('/api/tasks', async (req, res, next) => {
    try {
        const errors = validateTask(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const id = randomUUID();
        const status = req.body.status ?? 'Нужно сделать';
        const priority = req.body.priority ?? 'Средний';
        const dueDate = req.body.dueDate || null;

        const result = await pool.query(
            `INSERT INTO tasks (
                id,
                title,
                project,
                status,
                priority,
                due_date
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING
                id,
                title,
                project,
                status,
                priority,
                due_date::text AS "dueDate",
                created_at AS "createdAt",
                updated_at AS "updatedAt"`,
            [
                id,
                req.body.title.trim(),
                req.body.project.trim(),
                status,
                priority,
                dueDate,
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.patch('/api/tasks/:id', async (req, res, next) => {
    try {
        if (!isUuid(req.params.id)) {
            return res.status(400).json({
                message: 'Некорректный id задачи',
            });
        }
        const errors = validateTask(req.body, true);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const currentResult = await pool.query(
            `SELECT
                id,
                title,
                project,
                status,
                priority,
                due_date::text AS "dueDate"
                FROM tasks
                WHERE id = $1`,
            [req.params.id]
        );
        if (currentResult.rowCount === 0) {
            return res.status(404).json({
                message: 'Задача не найдена',
            });
        }
        const current = currentResult.rows[0];
        const title = req.body.title !== undefined
            ? req.body.title.trim()
            : current.title;
        const project = req.body.project !== undefined
            ? req.body.project.trim()
            : current.project;
        const status = req.body.status ?? current.status;
        const priority = req.body.priority ?? current.priority;
        const dueDate = req.body.dueDate !== undefined
            ? req.body.dueDate || null
            : current.dueDate;
        const result = await pool.query(
            `UPDATE tasks
                SET
                title = $1,
                project = $2,
                status = $3,
                priority = $4,
                due_date = $5,
                updated_at = NOW()
                WHERE id = $6
                RETURNING
                id,
                title,
                project,
                status,
                priority,
                due_date::text AS "dueDate",
                created_at AS "createdAt",
                updated_at AS "updatedAt"`,
            [
                title,
                project,
                status,
                priority,
                dueDate,
                req.params.id,
            ]
        );
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
    try {
        if (!isUuid(req.params.id)) {
            return res.status(400).json({
                message: 'Некорректный id задачи',
            });
        }
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1',
            [req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Задача не найдена',
            });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

app.use((req, res) => {
    res.status(404).json({
        message: 'Endpoint не найден',
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    const badDataCodes = [
        '22P02',
        '22007',
        '22008',
        '23502',
        '23514',
    ];

    if (badDataCodes.includes(error.code)) {
        return res.status(400).json({
            message: 'База данных отклонила переданные данные',
        });
    }

    res.status(500).json({
        message: 'Внутренняя ошибка сервера',
    });
});

app.listen(PORT, () => {
    console.log(`TaskFlow API: http://localhost:${PORT}`);
});