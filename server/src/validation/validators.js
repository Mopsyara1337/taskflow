const ALLOWED_STATUSES = [
    'Нужно сделать',
    'В работе',
    'Готово',
];
const ALLOWED_PRIORITIES = [
    'Низкий',
    'Средний',
    'Высокий',
];
export function validateRegistration(body) {
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    if (!name || name.length < 2) {
        return 'Имя должно содержать минимум 2 символа';
    }
    if (!email || !email.includes('@')) {
        return 'Укажите корректный email';
    }
    if (!password || password.length < 8) {
        return 'Пароль должен содержать минимум 8 символов';
    }
    return null;
}
export function validateLogin(body) {
    if (!body.email?.trim() || !body.password) {
        return 'Укажите email и пароль';
    }
    return null;
}
export function validateTask(body, { partial = false } = {}) {
    const fields = [
        'title',
        'project',
        'status',
        'priority',
        'dueDate',
    ];
    const unknownField = Object.keys(body).find(
        (key) => !fields.includes(key)
    );
    if (unknownField) {
        return `Неизвестное поле: ${unknownField}`;
    }
    if (!partial || 'title' in body) {
        if (!body.title?.trim()) {
            return 'Название задачи обязательно';
        }
    }
    if (!partial || 'project' in body) {
        if (!body.project?.trim()) {
            return 'Проект обязателен';
        }
    }
    if ('status' in body && !ALLOWED_STATUSES.includes(body.status)) {
        return 'Недопустимый статус задачи';
    }
    if ('priority' in body && !ALLOWED_PRIORITIES.includes(body.priority)) {
        return 'Недопустимый приоритет задачи';
    }
    if ('dueDate' in body && body.dueDate) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(body.dueDate)) {
            return 'Срок должен иметь формат YYYY-MM-DD';
        }
    }
    return null;
}