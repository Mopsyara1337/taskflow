import express from 'express';
import pool from './db/pool.js';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { requireAuth } from './middleware/requireAuth.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    validateLogin,
    validateRegistration,
    validateTask,
} from './validation/validators.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(
    __dirname,
    '../../client/dist'
);


const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(
        cors({
            origin: 'http://localhost:5173',
            credentials: true,
        })
    );
}


app.use(express.json());

if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET не задан в .env');
}

const PgSession = connectPgSimple(session);
app.use(
    session({
        store: new PgSession({
            pool,
            tableName: 'user_sessions',
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    })
);

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
    return UUID_PATTERN.test(value);
}

async function getUserProfile(userId) {
    const result = await pool.query(
        `SELECT
         u.id,
         u.name,
         u.email,
         u.created_at AS "createdAt",
         COUNT(t.id)::int AS "taskCount"
         FROM users u
         LEFT JOIN tasks t ON t.user_id = u.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [userId]
    );
    return result.rows[0] || null;
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

app.post('/api/auth/register', async (req, res, next) => {
    try {
        const validationError = validateRegistration(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }

        const name = req.body.name.trim();
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;
        const passwordHash = await bcrypt.hash(password, 12);
        const userId = randomUUID();
        await pool.query(
            `INSERT INTO users (id, name, email, password_hash)
 VALUES ($1, $2, $3, $4)`,
            [userId, name, email, passwordHash]
        );
        req.session.userId = userId;
        const user = await getUserProfile(userId);
        res.status(201).json(user);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'Пользователь с таким email уже существует',
            });
        }
        next(error);
    }
});

app.post('/api/auth/login', async (req, res, next) => {
    try {
        const validationError = validateLogin(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }

        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;
        const result = await pool.query(
            `SELECT id, name, email, password_hash
 FROM users
 WHERE email = $1`,
            [email]
        );
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({
                message: 'Неверный email или пароль',
            });
        }
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );
        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Неверный email или пароль',
            });
        }
        req.session.userId = user.id;
        const profile = await getUserProfile(user.id);
        res.json(profile);
    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/logout', (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }
        res.clearCookie('connect.sid');
        res.status(204).end();
    });
});

app.get('/api/auth/me', requireAuth, async (req, res, next) => {
    try {
        const user = await getUserProfile(req.session.userId);
        if (!user) {
            return res.status(401).json({
                message: 'Сессия пользователя недействительна',
            });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
});


app.get('/api/tasks', requireAuth, async (req, res, next) => {
    try {
        const { status, priority, project } = req.query;
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
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [req.session.userId]
        );
        res.json(result.rows);

    } catch (error) {
        next(error);
    }
});

app.get('/api/stats', requireAuth, async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'В работе') AS "inProgress",
            COUNT(*) FILTER (WHERE status = 'Готово') AS completed
            FROM tasks
            WHERE user_id = $1`,
            [req.session.userId]
        );

        const stats = result.rows[0];

        res.json({
            total: Number(stats.total),
            inProgress: Number(stats.inProgress),
            completed: Number(stats.completed),
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/tasks/:id', requireAuth, async (req, res, next) => {
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
            WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.session.userId]
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

app.post('/api/tasks', requireAuth, async (req, res, next) => {
    try {
        const validationError = validateTask(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }
        const id = randomUUID();
        const status = req.body.status ?? 'Нужно сделать';
        const priority = req.body.priority ?? 'Средний';
        const dueDate = req.body.dueDate || null;

        const result = await pool.query(
            `INSERT INTO tasks (
                id,
                user_id,
                title,
                project,
                status,
                priority,
                due_date
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
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
                req.session.userId,
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

app.patch('/api/tasks/:id', requireAuth, async (req, res, next) => {
    try {
        if (!isUuid(req.params.id)) {
            return res.status(400).json({
                message: 'Некорректный id задачи',
            });
        }
        const validationError = validateTask(req.body, { partial: true });

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }
        const currentResult = await pool.query(
            `SELECT
                id,
                title,
                project,
                status,
                priority,
                due_date::text AS "dueDate",
                description
                FROM tasks
                WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.session.userId]
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
        const description = req.body.description ?? current.description;
        const result = await pool.query(
            `UPDATE tasks
                SET
                title = $1,
                project = $2,
                status = $3,
                priority = $4,
                due_date = $5,
                description = $6,
                updated_at = NOW()
                WHERE id = $7 AND user_id = $8
                RETURNING
                id,
                title,
                project,
                description,
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
                description,
                req.params.id,
                req.session.userId,
            ]
        );
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/tasks/:id', requireAuth, async (req, res, next) => {
    try {
        if (!isUuid(req.params.id)) {
            return res.status(400).json({
                message: 'Некорректный id задачи',
            });
        }
        const result = await pool.query(
            `DELETE FROM tasks
            WHERE id = $1 AND user_id = $2
            RETURNING id`,
            [req.params.id, req.session.userId]
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

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(clientDist));

    app.use((req, res, next) => {
        if (
            req.method !== 'GET' ||
            req.path.startsWith('/api/')
        ) {
            return next();
        }

        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

app.use(notFound);
app.use(errorHandler);

export default app;