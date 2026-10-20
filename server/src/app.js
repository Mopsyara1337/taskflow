import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
const PORT = 3000;
app.use(express.json());

let tasks = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        title: 'Подготовить макет главной страницы',
        project: 'Учебный проект',
        status: 'В работе',
        priority: 'Высокий',
        dueDate: '2026-09-20',
        description: 'Создать макет интерфейса приложения TaskFlow',
    },
    {
        id: '22222222-2222-4222-8222-222222222222',
        title: 'Разобраться с REST API',
        project: 'Обучение',
        status: 'Нужно сделать',
        priority: 'Средний',
        dueDate: '2026-09-25',
        description: 'Изучить основные методы REST API',
    },
    {
        id: '33333333-3333-4333-8333-333333333333',
        title: 'Проверить запросы к серверу',
        project: 'TaskFlow',
        status: 'Готово',
        priority: 'Низкий',
        dueDate: '2026-09-18',
        descrition: 'Выполнить добавленные запросы к серверу',
    },
];

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
    if (data.status !== undefined && !allowedStatuses.includes(data.status)) {
        errors.push('Недопустимый status');
    }
    if (data.priority !== undefined && !allowedPriorities.includes(data.priority)) {
        errors.push('Недопустимый priority');
    }
    if (data.dueDate !== undefined) {
        if (typeof data.dueDate !== 'string'){
            errors.push('Поле dueDate должно быть строкой');
        }
        else if(!/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)){
            errors.push('Поле dueDate должно быть в формате YYYY-MM-DD');
        }
    }
    if (data.description !== undefined && typeof data.description !== 'string'){
        errors.push('Поле discription должно быть строкой');
    }
    if (partial && Object.keys(data).length === 0) {
        errors.push('Передайте хотя бы одно поле для изменения');
    }
    return errors;
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/tasks', (req, res) => {
    const { status, priority, project } = req.query;
    let result = tasks;
    if (status) {
        result = result.filter((task) => task.status === status);
    }
    if (priority) {
        result = result.filter((task) => task.priority === priority);
    }
    if (project){
        result = result.filter((task) => task.project === project);
    }
    res.json(result);
});

app.get('/api/tasks/:id', (req, res) => {
    const task = tasks.find((item) => item.id === req.params.id);

    if (!task) {
        return res.status(404).json({
            message: 'Задача не найдена',
        });
    }

    res.json(task);
});

app.post('/api/tasks', (req, res) => {
    const errors = validateTask(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    const newTask = {
        id: randomUUID(),
        title: req.body.title.trim(),
        project: req.body.project.trim(),
        status: req.body.status ?? 'Нужно сделать',
        priority: req.body.priority ?? 'Средний',
        dueDate: req.body.dueDate ?? '',
        description: req.body.description ?? '',
    };
    tasks.unshift(newTask);
    res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', (req, res) => {
    const taskIndex = tasks.findIndex(
        (item) => item.id === req.params.id
    );

    if (taskIndex === -1) {
        return res.status(404).json({
            message: 'Задача не найдена',
        });
    }

    const errors = validateTask(req.body, true);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const currentTask = tasks[taskIndex];
    const updatedTask = {
        ...currentTask,
        title: req.body.title !== undefined
            ? req.body.title.trim()
            : currentTask.title,
        project: req.body.project !== undefined
            ? req.body.project.trim()
            : currentTask.project,
        status: req.body.status ?? currentTask.status,
        priority: req.body.priority ?? currentTask.priority,
        dueDate: req.body.dueDate ?? currentTask.dueDate,
        description: req.body.description ?? currentTask.description,
    };

    app.delete('/api/tasks/:id', (req, res) => {
        const taskIndex = tasks.findIndex(
            (item) => item.id === req.params.id
        );

        if (taskIndex === -1) {
            return res.status(404).json({
                message: 'Задача не найдена',
            });
        }

        tasks.splice(taskIndex, 1);
        res.status(204).send();
    });

    app.use((req, res) => {
        res.status(404).json({
            message: 'Endpoint не найден',
        });
    });

    app.use((error, req, res, next) => {
        console.error(error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    });


    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
});


app.listen(PORT, () => {
    console.log(`TaskFlow API: http://localhost:${PORT}`);
});