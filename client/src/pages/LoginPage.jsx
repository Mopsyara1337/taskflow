import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi.js';
export default function LoginPage({ onAuthenticated }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const user = await loginUser(form);
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
                <h1>Вход</h1>
                <p className="subtitle">Введите данные своей учетной записи.</p>
                {error && <div className="authError">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Email</span>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </label>
                    <label className="field">
                        <span>Пароль</span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(event) => setShowPassword(event.target.checked)}
                        />
                        Показать пароль
                    </label>
                    <button
                        className="primaryButton authSubmit"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <p className="authSwitch">
                    Нет аккаунта? <Link to="/register">Регистрация</Link>
                </p>
            </section>
        </main>
    );
}