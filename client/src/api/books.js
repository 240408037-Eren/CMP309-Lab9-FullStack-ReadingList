const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Shared request helper: sets Content-Type only when body exists, maps { error } to Error, handles 204
async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  const init = { method, headers, signal };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, init);

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = (data && data.error) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function fetchBooks(filters = {}, signal) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.genre) params.set('genre', filters.genre);
  if (filters.read !== undefined && filters.read !== '') params.set('read', filters.read);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);

  const qs = params.toString();
  const path = qs ? `/api/books?${qs}` : '/api/books';
  return request(path, { signal });
}

export function fetchStats(signal) {
  return request('/api/stats', { signal });
}

export function createBook(bookData) {
  return request('/api/books', { method: 'POST', body: bookData });
}

export function replaceBook(id, bookData) {
  return request(`/api/books/${id}`, { method: 'PUT', body: bookData });
}

export function patchBook(id, partialData) {
  return request(`/api/books/${id}`, { method: 'PATCH', body: partialData });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, { method: 'DELETE' });
}
