import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [cities, setCities] = useState([]);
    const [form, setForm] = useState({
        displayName: user.displayName,
        phone: user.phone ?? '',
        cityId: user.cityId ? String(user.cityId) : '',
        about: user.about ?? '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        api.get('/api/cities').then(setCities).catch(() => setCities([]));
    }, []);

    const handleChange = event => {
        setForm({ ...form, [event.target.name]: event.target.value });
        setMessage('');
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);
        try {
            const updated = await api.put('/api/users/me', {
                displayName: form.displayName,
                phone: form.phone || null,
                cityId: form.cityId ? Number(form.cityId) : null,
                about: form.about || null,
            });
            setUser(updated);
            setMessage('Профиль сохранён');
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatar = async event => {
        const file = event.target.files[0];
        event.target.value = '';
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setError('');
        setUploading(true);
        try {
            setUser(await api.upload('/api/users/me/avatar', formData));
            setMessage('Фото профиля обновлено');
        } catch (e) {
            setError(e.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="container">
            <div className="panel form-card">
                <div className="page-head">
                    <h1>Мой профиль</h1>
                    <Link className="btn" to={`/users/${user.id}`}>Как меня видят покупатели →</Link>
                </div>

                <div className="avatar-row">
                    {user.avatarUrl ? (
                        <div className="avatar avatar-lg" style={{ backgroundImage: `url('${user.avatarUrl}')` }} />
                    ) : (
                        <div className="avatar avatar-lg">{user.displayName.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                        <label className="btn">
                            {uploading ? 'Загружаем...' : 'Сменить фото'}
                            <input type="file" accept="image/jpeg,image/png,image/webp"
                                   onChange={handleAvatar} disabled={uploading} hidden />
                        </label>
                        <div className="muted" style={{ marginTop: 8 }}>
                            Логин: {user.username} · Email: {user.email}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field">
                            <label>Имя, которое видят покупатели *</label>
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
                        <div className="form-field full">
                            <label>О себе</label>
                            <textarea name="about" value={form.about} onChange={handleChange} maxLength={2000} />
                        </div>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving ? 'Сохраняем...' : 'Сохранить'}
                    </button>
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                </form>
            </div>
        </main>
    );
}