import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="site-header">
            <div className="container header-inner">
                <Link to="/" className="logo">Tradify</Link>
                <nav className="nav">
                    {user ? (
                        <>
                            <Link className="btn btn-primary" to="/ads/new">+ Подать объявление</Link>
                            <Link className="btn" to="/my">Мои объявления</Link>
                            <Link className="btn" to="/profile">{user.displayName}</Link>
                            <button className="btn" onClick={handleLogout}>Выйти</button>
                        </>
                    ) : (
                        <>
                            <Link className="btn" to="/login">Войти</Link>
                            <Link className="btn btn-primary" to="/register">Регистрация</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}