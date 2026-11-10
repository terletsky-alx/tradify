import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';

function safeRedirect(value) {
    return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default function LoginPage() {
    const { user, login } = useAuth();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const redirectTo = safeRedirect(searchParams.get('redirect'));

    if (user) {
        return <Navigate to={redirectTo} replace />;
    }

    const handleChange = event => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(form.username, form.password);
        } catch (err) {
            setError(err.status === 401 ? 'Неверный логин или пароль' : err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="container">
            <div className="panel auth-card">
                <h1>Вход</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label>Логин</label>
                        <input name="username" value={form.username} onChange={handleChange}
                               autoComplete="username" required />
                    </div>
                    <div className="form-field">
                        <label>Пароль</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange}
                               autoComplete="current-password" required />
                    </div>
                    <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
                        {submitting ? 'Входим...' : 'Войти'}
                    </button>
                    {error && <p className="error">{error}</p>}
                </form>
                <p className="hint">
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
            </div>
        </main>
    );
}