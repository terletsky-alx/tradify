import { Route, Routes } from 'react-router';
import Header from './components/Header';
import HomePage from './pages/HomePage';

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
  );
}