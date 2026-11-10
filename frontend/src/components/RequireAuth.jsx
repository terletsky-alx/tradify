import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <main className="container">
                <p className="muted">Загрузка...</p>
            </main>
        );
    }

    if (!user) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    return children;
}