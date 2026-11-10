import { Link, Route, Routes } from 'react-router';
import Header from './components/Header';
import RequireAuth from './components/RequireAuth';
import AdFormPage from './pages/AdFormPage';
import AdPage from './pages/AdPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyAdsPage from './pages/MyAdsPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import UserPage from './pages/UserPage';

function NotFound() {
    return (
        <main className="container">
            <div className="empty">
                Страница не найдена. <Link to="/" style={{ color: 'var(--primary)' }}>На главную</Link>
            </div>
        </main>
    );
}

export default function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/ads/new" element={<RequireAuth><AdFormPage /></RequireAuth>} />
                <Route path="/ads/:id" element={<AdPage />} />
                <Route path="/ads/:id/edit" element={<RequireAuth><AdFormPage /></RequireAuth>} />
                <Route path="/users/:id" element={<UserPage />} />
                <Route path="/my" element={<RequireAuth><MyAdsPage /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}