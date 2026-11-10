export default function Pagination({ page, onPage }) {
    if (!page || page.totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button className="btn" disabled={page.page === 0} onClick={() => onPage(page.page - 1)}>
                ← Назад
            </button>
            <span className="muted">Страница {page.page + 1} из {page.totalPages}</span>
            <button className="btn" disabled={page.page + 1 >= page.totalPages} onClick={() => onPage(page.page + 1)}>
                Вперёд →
            </button>
        </div>
    );
}