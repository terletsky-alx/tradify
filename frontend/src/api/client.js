async function request(method, url, body, isForm = false) {
    const options = { method, headers: {}, credentials: 'same-origin' };

    if (body !== undefined) {
        if (isForm) {
            options.body = body;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
    }

    const response = await fetch(url, options);
    if (response.status === 204) return null;

    const text = await response.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }

    if (!response.ok) {
        let message = data?.message || data?.error || `Ошибка ${response.status}`;
        if (Array.isArray(data?.errors) && data.errors.length) {
            message = data.errors.map(e => `${e.field}: ${e.defaultMessage}`).join('; ');
        }
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }
    return data;
}

export const api = {
    get: url => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    patch: (url, body) => request('PATCH', url, body),
    del: url => request('DELETE', url),
    upload: (url, formData) => request('POST', url, formData, true),
};