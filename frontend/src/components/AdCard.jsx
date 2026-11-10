import { Link } from 'react-router';
import { formatDate, formatPrice, STATUS_LABELS } from '../utils/format';

export default function AdCard({ ad }) {
    return (
        <Link className="card" to={`/ads/${ad.id}`}>
            {ad.coverUrl ? (
                <div className="card-img" style={{ backgroundImage: `url('${ad.coverUrl}')` }} />
            ) : (
                <div className="card-img">Нет фото</div>
            )}
            <div className="card-body">
                <div className="price">{formatPrice(ad.price)}</div>
                <div className="card-title">{ad.title}</div>
                <div className="muted">{ad.cityName} · {formatDate(ad.createdAt)}</div>
                {ad.status && ad.status !== 'ACTIVE' && (
                    <span className="badge">{STATUS_LABELS[ad.status]}</span>
                )}
            </div>
        </Link>
    );
}