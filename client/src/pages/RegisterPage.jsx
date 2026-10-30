import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi.js';
export default function RegisterPage({ onAuthenticated }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const user = await registerUser(form);
            onAuthenticated(user);
            navigate('/');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <main className="authPage">
            <section className="authCard">
                <p className="eyebrow">TaskFlow</p>
                <h1>Создать аккаунт</h1>
                <p className="subtitle">Зарегистрируйтесь для работы со своими
                    задачами.</p>
                {error && <div className="authError">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Имя</span>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="field">
                        <span>Email</span>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="field">
                        <span>Пароль</span>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            minLength="8"
                            required
                        />
                    </label>
                    <button
                        className="primaryButton authSubmit"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className="authSwitch">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </section>
        </main>
    );
}