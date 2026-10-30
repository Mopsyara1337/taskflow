const API_URL = 'http://localhost:3000/api';
async function authRequest(path, options = {}) {
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
        throw new Error(
            data?.message || `Ошибка HTTP ${response.status}`
        );
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

export function registerUser(data) {
    return authRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function loginUser(data) {
    return authRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function logoutUser() {
    return authRequest('/auth/logout', {
        method: 'POST',
    });
}

export function getCurrentUser() {
    return authRequest('/auth/me');
}