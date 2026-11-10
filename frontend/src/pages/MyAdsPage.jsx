import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api/client';
import AdCard from '../components/AdCard';

const TABS = [
    { status: 'ACTIVE', label: 'Активные' },
    { status: 'SOLD', label: 'Проданные' },
    { status: 'ARCHIVED', label: 'Удалённые' },
];

export default function MyAdsPage() {
    const [ads, setAds] = useState(null);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('ACTIVE');

    useEffect(() => {
        api.get('/api/ads/my')
            .then(setAds)
            .catch(e => setError(e.message));
    }, []);

    const countByStatus = status => ads?.filter(ad => ad.status === status).length ?? 0;
    const visibleAds = ads?.filter(ad => ad.status === tab) ?? [];

    return (
        <main className="container">
            <div className="page-head">
                <h1>Мои объявления</h1>
                <Link className="btn btn-primary" to="/ads/new">+ Подать объявление</Link>
            </div>

            <div className="tabs">
                {TABS.map(item => (
                    <button
                        key={item.status}
                        className={`btn ${tab === item.status ? 'active' : ''}`}
                        onClick={() => setTab(item.status)}
                    >
                        {item.label} ({countByStatus(item.status)})
                    </button>
                ))}
            </div>

            {error && <p className="error">{error}</p>}

            <div className="grid">
                {!ads && !error && <p className="muted">Загрузка...</p>}
                {ads && visibleAds.length === 0 && (
                    <div className="empty">
                        {tab === 'ACTIVE' ? (
                            <>
                                У вас пока нет активных объявлений.{' '}
                                <Link to="/ads/new" style={{ color: 'var(--primary)' }}>Подать первое</Link>
                            </>
                        ) : (
                            'Здесь пока пусто'
                        )}
                    </div>
                )}
                {visibleAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
        </main>
    );
}