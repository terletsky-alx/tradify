import { Route, Routes } from 'react-router';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdPage from './pages/AdPage';
import UserPage from './pages/UserPage';

function NotFound() {
    return (
        <main className="container">
            <div className="empty">Страница пока не готова</div>
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
                <Route path="/ads/:id" element={<AdPage />} />
                <Route path="/users/:id" element={<UserPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}