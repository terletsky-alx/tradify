import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { api } from '../api/client';
import AdCard from '../components/AdCard';
import Pagination from '../components/Pagination';
import { formatDate } from '../utils/format';

export default function UserPage() {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 0;

    const [profile, setProfile] = useState(null);
    const [ads, setAds] = useState(null);
    const [error, setError] = useState('');
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        setProfile(null);
        setError('');
        setShowPhone(false);
        api.get(`/api/users/${id}`)
            .then(setProfile)
            .catch(e => setError(e.status === 404 ? 'Пользователь не найден' : e.message));
    }, [id]);

    useEffect(() => {
        api.get(`/api/users/${id}/ads?page=${page}`)
            .then(setAds)
            .catch(() => setAds(null));
    }, [id, page]);

    const goToPage = nextPage => {
        setSearchParams({ page: nextPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (error) {
        return (
            <main className="container">
                <div className="empty">{error}</div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="container">
                <p className="muted">Загрузка...</p>
            </main>
        );
    }

    return (
        <main className="container">
            <div className="panel profile-header">
                {profile.avatarUrl ? (
                    <div className="avatar avatar-lg" style={{ backgroundImage: `url('${profile.avatarUrl}')` }} />
                ) : (
                    <div className="avatar avatar-lg">{profile.displayName.charAt(0).toUpperCase()}</div>
                )}

                <div className="profile-info">
                    <h1>{profile.displayName}</h1>
                    <div className="muted">
                        {profile.cityName && <>{profile.cityName} · </>}
                        На Tradify с {formatDate(profile.memberSince)} ·
                        Объявлений: {profile.activeAdsCount}
                    </div>

                    {profile.phone && (
                        <div className="actions">
                            {showPhone ? (
                                <a className="btn btn-primary" href={`tel:${profile.phone}`}>{profile.phone}</a>
                            ) : (
                                <button className="btn btn-primary" onClick={() => setShowPhone(true)}>
                                    Показать телефон
                                </button>
                            )}
                        </div>
                    )}

                    {profile.about && <p className="profile-about">{profile.about}</p>}
                </div>
            </div>

            <h2 className="section-title">Объявления продавца</h2>

            <div className="grid">
                {!ads && <p className="muted">Загрузка...</p>}
                {ads && ads.content.length === 0 && <div className="empty">У продавца пока нет активных объявлений</div>}
                {ads?.content.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>

            <Pagination page={ads} onPage={goToPage} />
        </main>
    );
}