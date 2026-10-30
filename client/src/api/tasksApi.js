const API_URL = 'http://localhost:3000/api';
async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
            data?.message ||
            data?.errors?.join(', ') ||
            `Ошибка HTTP ${response.status}`;
        throw new Error(message);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

export function getTasks() {
    return request('/tasks');
}

export function getTask(id) {
    return request(`/tasks/${id}`);
}

export function createTask(task) {
    return request('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
    });
}

export function updateTask(id, changes) {
    return request(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
    });
}

export function deleteTask(id) {
    return request(`/tasks/${id}`, {
        method: 'DELETE',
    });
}