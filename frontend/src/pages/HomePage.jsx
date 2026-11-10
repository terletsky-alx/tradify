import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '../api/client';
import AdCard from '../components/AdCard';
import Pagination from '../components/Pagination';

const FIELDS = ['q', 'cityId', 'categoryId', 'minPrice', 'maxPrice', 'condition', 'sort'];

function formFromParams(params) {
    return Object.fromEntries(
        FIELDS.map(name => [name, params.get(name) ?? (name === 'sort' ? 'createdAt,desc' : '')])
    );
}

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [form, setForm] = useState(() => formFromParams(searchParams));
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Promise.all([api.get('/api/cities'), api.get('/api/categories')])
            .then(([citiesData, categoriesData]) => {
                setCities(citiesData);
                setCategories(categoriesData);
            })
            .catch(e => setError(e.message));
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');

        api.get(`/api/ads?${searchParams}`)
            .then(data => { if (!cancelled) setResult(data); })
            .catch(e => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [searchParams]);

    const applyFilters = values => {
        const params = new URLSearchParams();
        Object.entries(values).forEach(([key, value]) => {
            if (String(value).trim()) params.set(key, String(value).trim());
        });
        setSearchParams(params);
    };

    const handleChange = event => {
        const next = { ...form, [event.target.name]: event.target.value };
        setForm(next);
        if (event.target.tagName === 'SELECT') applyFilters(next);
    };

    const handleSubmit = event => {
        event.preventDefault();
        applyFilters(form);
    };

    const goToPage = page => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const regions = cities.reduce((acc, city) => {
        (acc[city.region] ??= []).push(city);
        return acc;
    }, {});

    const parentCategories = categories.filter(c => c.parentId == null);

    return (
        <main className="container">
            <form className="panel" onSubmit={handleSubmit}>
                <div className="search-bar">
                    <input name="q" type="search" placeholder="Поиск по объявлениям"
                           value={form.q} onChange={handleChange} />
                    <button className="btn btn-primary" type="submit">Найти</button>
                </div>

                <div className="filters">
                    <div>
                        <label>Город</label>
                        <select name="cityId" value={form.cityId} onChange={handleChange}>
                            <option value="">Вся Беларусь</option>
                            {Object.entries(regions).map(([region, list]) => (
                                <optgroup key={region} label={region}>
                                    {list.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Категория</label>
                        <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                            <option value="">Все категории</option>
                            {parentCategories.map(parent => [
                                <option key={parent.id} value={parent.id}>{parent.name}</option>,
                                ...categories
                                    .filter(c => c.parentId === parent.id)
                                    .map(child => (
                                        <option key={child.id} value={child.id}>— {child.name}</option>
                                    )),
                            ])}
                        </select>
                    </div>

                    <div>
                        <label>Цена от</label>
                        <input name="minPrice" type="number" min="0"
                               value={form.minPrice} onChange={handleChange} />
                    </div>

                    <div>
                        <label>Цена до</label>
                        <input name="maxPrice" type="number" min="0"
                               value={form.maxPrice} onChange={handleChange} />
                    </div>

                    <div>
                        <label>Состояние</label>
                        <select name="condition" value={form.condition} onChange={handleChange}>
                            <option value="">Любое</option>
                            <option value="NEW">Новое</option>
                            <option value="USED">Б/у</option>
                        </select>
                    </div>

                    <div>
                        <label>Сортировка</label>
                        <select name="sort" value={form.sort} onChange={handleChange}>
                            <option value="createdAt,desc">Сначала новые</option>
                            <option value="price,asc">Сначала дешёвые</option>
                            <option value="price,desc">Сначала дорогие</option>
                        </select>
                    </div>
                </div>
            </form>

            {error && <p className="error">{error}</p>}
            {result && <p className="muted">Найдено объявлений: {result.totalElements}</p>}

            <div className="grid">
                {loading && !result && <p className="muted">Загрузка...</p>}
                {result && result.content.length === 0 && <div className="empty">Ничего не найдено</div>}
                {result?.content.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>

            <Pagination page={result} onPage={goToPage} />
        </main>
    );
}