export function formatPrice(price) {
    return price == null ? 'Договорная' : `${Number(price).toLocaleString('ru-RU')} р.`;
}

export function formatDate(value) {
    return value ? new Date(value).toLocaleDateString('ru-RU') : '';
}

export const CONDITION_LABELS = { NEW: 'Новое', USED: 'Б/у' };
export const STATUS_LABELS = { ACTIVE: 'Активно', SOLD: 'Продано', ARCHIVED: 'В архиве' };