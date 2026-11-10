import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CONDITION_LABELS, formatDate, formatPrice, STATUS_LABELS } from '../utils/format';

export default function AdPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [ad, setAd] = useState(null);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setAd(null);
        setError('');
        setActiveImage(0);
        api.get(`/api/ads/${id}`)
            .then(setAd)
            .catch(e => setError(e.status === 404 ? 'Объявление не найдено' : e.message));
    }, [id]);

    if (error) {
        return (
            <main className="container">
                <div className="empty">{error}</div>
            </main>
        );
    }

    if (!ad) {
        return (
            <main className="container">
                <p className="muted">Загрузка...</p>
            </main>
        );
    }

    const isOwner = user && user.id === ad.seller.id;
    const mainImage = ad.images[activeImage];

    const changeStatus = async status => {
        setBusy(true);
        try {
            setAd(await api.patch(`/api/ads/${id}/status`, { status }));
        } catch (e) {
            alert(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Удалить объявление? Его больше никто не увидит.')) return;
        setBusy(true);
        try {
            await api.del(`/api/ads/${id}`);
            navigate('/my');
        } catch (e) {
            alert(e.message);
            setBusy(false);
        }
    };

    return (
        <main className="container">
            <button className="btn back-link" onClick={() => navigate(-1)}>← Назад</button>

            <div className="ad-layout">
                <div className="panel">
                    {mainImage ? (
                        <div className="gallery-main" style={{ backgroundImage: `url('${mainImage.url}')` }} />
                    ) : (
                        <div className="gallery-main">Нет фото</div>
                    )}

                    {ad.images.length > 1 && (
                        <div className="thumbs">
                            {ad.images.map((image, index) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    className={`thumb ${index === activeImage ? 'active' : ''}`}
                                    style={{ backgroundImage: `url('${image.url}')` }}
                                    onClick={() => setActiveImage(index)}
                                    aria-label={`Фото ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="panel">
                    <p className="ad-price">{formatPrice(ad.price)}</p>
                    <h1 className="ad-title">{ad.title}</h1>
                    {ad.status !== 'ACTIVE' && <span className="badge">{STATUS_LABELS[ad.status]}</span>}

                    <dl className="details">
                        <dt>Город</dt>
                        <dd>{ad.cityName}</dd>
                        <dt>Категория</dt>
                        <dd>{ad.categoryName}</dd>
                        <dt>Состояние</dt>
                        <dd>{CONDITION_LABELS[ad.condition]}</dd>
                        <dt>Опубликовано</dt>
                        <dd>{formatDate(ad.createdAt)}</dd>
                        <dt>Просмотров</dt>
                        <dd>{ad.viewsCount}</dd>
                    </dl>

                    <Link to={`/users/${ad.seller.id}`} className="seller">
                        <div className="avatar">{ad.seller.displayName.charAt(0).toUpperCase()}</div>
                        <div>
                            <div><strong>{ad.seller.displayName}</strong></div>
                            <div className="muted">Все объявления продавца →</div>
                        </div>
                    </Link>

                    {isOwner && (
                        <div className="actions">
                            <Link className="btn" to={`/ads/${ad.id}/edit`}>Редактировать</Link>
                            {ad.status === 'ACTIVE' ? (
                                <button className="btn" disabled={busy} onClick={() => changeStatus('SOLD')}>
                                    Отметить проданным
                                </button>
                            ) : (
                                <button className="btn" disabled={busy} onClick={() => changeStatus('ACTIVE')}>
                                    Снова в продажу
                                </button>
                            )}
                            <button className="btn btn-danger" disabled={busy} onClick={handleDelete}>
                                Удалить
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {ad.description && (
                <div className="panel">
                    <h2>Описание</h2>
                    <p className="description">{ad.description}</p>
                </div>
            )}
        </main>
    );
}