import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { user, login } = useAuth();
    const [cities, setCities] = useState([]);
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        displayName: '',
        phone: '',
        cityId: '',
        about: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/api/cities').then(setCities).catch(() => setCities([]));
    }, []);

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleChange = event => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/api/auth/register', {
                ...form,
                phone: form.phone || null,
                about: form.about || null,
                cityId: form.cityId ? Number(form.cityId) : null,
            });
            await login(form.username, form.password);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="container">
            <div className="panel auth-card">
                <h1>Регистрация</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label>Логин *</label>
                        <input name="username" value={form.username} onChange={handleChange}
                               autoComplete="username" minLength={3} maxLength={50} required />
                    </div>
                    <div className="form-field">
                        <label>Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                               autoComplete="email" required />
                    </div>
                    <div className="form-field">
                        <label>Пароль * (не меньше 8 символов)</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange}
                               autoComplete="new-password" minLength={8} maxLength={72} required />
                    </div>
                    <div className="form-field">
                        <label>Имя, которое увидят покупатели *</label>
                        <input name="displayName" value={form.displayName} onChange={handleChange}
                               maxLength={100} required />
                    </div>
                    <div className="form-field">
                        <label>Телефон</label>
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                               placeholder="+375 29 123-45-67" maxLength={20} />
                    </div>
                    <div className="form-field">
                        <label>Город</label>
                        <select name="cityId" value={form.cityId} onChange={handleChange}>
                            <option value="">Не указан</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field">
                        <label>О себе</label>
                        <textarea name="about" value={form.about} onChange={handleChange} />
                    </div>
                    <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
                        {submitting ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
                    </button>
                    {error && <p className="error">{error}</p>}
                </form>
                <p className="hint">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </main>
    );
}