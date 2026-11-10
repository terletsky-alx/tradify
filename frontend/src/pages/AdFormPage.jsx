import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const MAX_IMAGES = 10;
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';

const EMPTY_FORM = {
    title: '',
    description: '',
    price: '',
    condition: 'USED',
    cityId: '',
    categoryId: '',
};

function groupByRegion(cities) {
    return cities.reduce((acc, city) => {
        (acc[city.region] ??= []).push(city);
        return acc;
    }, {});
}

export default function AdFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        Promise.all([api.get('/api/cities'), api.get('/api/categories')])
            .then(([citiesData, categoriesData]) => {
                setCities(citiesData);
                setCategories(categoriesData);
            })
            .catch(e => setError(e.message));
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        api.get(`/api/ads/${id}`)
            .then(ad => {
                if (ad.seller.id !== user.id) {
                    setError('Можно редактировать только свои объявления');
                    return;
                }
                setForm({
                    title: ad.title,
                    description: ad.description ?? '',
                    price: ad.price ?? '',
                    condition: ad.condition,
                    cityId: String(ad.cityId),
                    categoryId: String(ad.categoryId),
                });
                setImages(ad.images);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id, isEdit, user.id]);

    useEffect(() => {
        const urls = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(urls);
        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [newFiles]);

    const handleChange = event => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleFiles = event => {
        const selected = Array.from(event.target.files);
        event.target.value = '';
        if (images.length + newFiles.length + selected.length > MAX_IMAGES) {
            setError(`Можно загрузить не больше ${MAX_IMAGES} фото`);
            return;
        }
        setError('');
        setNewFiles([...newFiles, ...selected]);
    };

    const removeNewFile = index => {
        setNewFiles(newFiles.filter((_, i) => i !== index));
    };

    const removeExistingImage = async imageId => {
        if (!window.confirm('Удалить это фото?')) return;
        try {
            const updated = await api.del(`/api/ads/${id}/images/${imageId}`);
            setImages(updated.images);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        const payload = {
            title: form.title,
            description: form.description || null,
            price: form.price === '' ? null : Number(form.price),
            condition: form.condition,
            cityId: Number(form.cityId),
            categoryId: Number(form.categoryId),
        };

        try {
            let adId = id;
            if (isEdit) {
                await api.put(`/api/ads/${id}`, payload);
            } else {
                const created = await api.post('/api/ads', payload);
                adId = created.id;
            }

            if (newFiles.length) {
                const formData = new FormData();
                newFiles.forEach(file => formData.append('files', file));
                try {
                    await api.upload(`/api/ads/${adId}/images`, formData);
                } catch (e) {
                    alert(`Объявление сохранено, но фото не загрузились: ${e.message}`);
                    navigate(`/ads/${adId}/edit`);
                    return;
                }
            }

            navigate(`/ads/${adId}`);
        } catch (e) {
            setError(e.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="container">
                <p className="muted">Загрузка...</p>
            </main>
        );
    }

    const regions = groupByRegion(cities);
    const parentCategories = categories.filter(c => c.parentId == null);
    const totalImages = images.length + newFiles.length;

    return (
        <main className="container">
            <div className="panel form-card">
                <h1>{isEdit ? 'Редактирование объявления' : 'Новое объявление'}</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field full">
                            <label>Заголовок *</label>
                            <input name="title" value={form.title} onChange={handleChange}
                                   maxLength={120} placeholder="Например: iPhone 13, 128 ГБ" required />
                        </div>

                        <div className="form-field">
                            <label>Категория *</label>
                            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                                <option value="">Выберите категорию</option>
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

                        <div className="form-field">
                            <label>Город *</label>
                            <select name="cityId" value={form.cityId} onChange={handleChange} required>
                                <option value="">Выберите город</option>
                                {Object.entries(regions).map(([region, list]) => (
                                    <optgroup key={region} label={region}>
                                        {list.map(city => (
                                            <option key={city.id} value={city.id}>{city.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Цена, р. (пусто — договорная)</label>
                            <input name="price" type="number" min="0.01" step="0.01"
                                   value={form.price} onChange={handleChange} />
                        </div>

                        <div className="form-field">
                            <label>Состояние *</label>
                            <select name="condition" value={form.condition} onChange={handleChange}>
                                <option value="USED">Б/у</option>
                                <option value="NEW">Новое</option>
                            </select>
                        </div>

                        <div className="form-field full">
                            <label>Описание</label>
                            <textarea name="description" value={form.description} onChange={handleChange}
                                      maxLength={5000} placeholder="Состояние, комплектация, причина продажи..." />
                        </div>

                        <div className="form-field full">
                            <label>Фото ({totalImages} из {MAX_IMAGES}). Первое фото будет обложкой.</label>
                            <input type="file" accept={ACCEPTED_TYPES} multiple onChange={handleFiles}
                                   disabled={totalImages >= MAX_IMAGES} />

                            <div className="image-list">
                                {images.map((image, index) => (
                                    <div key={image.id} className="image-item"
                                         style={{ backgroundImage: `url('${image.url}')` }}>
                                        {index === 0 && <span className="badge">Обложка</span>}
                                        <button type="button" className="image-remove"
                                                onClick={() => removeExistingImage(image.id)}
                                                aria-label="Удалить фото">×</button>
                                    </div>
                                ))}
                                {previews.map((url, index) => (
                                    <div key={url} className="image-item" style={{ backgroundImage: `url('${url}')` }}>
                                        {images.length === 0 && index === 0 && <span className="badge">Обложка</span>}
                                        <button type="button" className="image-remove"
                                                onClick={() => removeNewFile(index)}
                                                aria-label="Убрать фото">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn btn-primary" type="submit" disabled={submitting}>
                            {submitting ? 'Сохраняем...' : isEdit ? 'Сохранить' : 'Опубликовать'}
                        </button>
                        <button className="btn" type="button" onClick={() => navigate(-1)}>Отмена</button>
                    </div>

                    {error && <p className="error">{error}</p>}
                </form>
            </div>
        </main>
    );
}