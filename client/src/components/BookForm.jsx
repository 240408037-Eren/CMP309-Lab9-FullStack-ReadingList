import { useState, useEffect } from 'react';

const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

const EMPTY_FORM = {
  title: '',
  author: '',
  year: '',
  genre: 'fiction',
  read: false,
  rating: ''
};

export default function BookForm({ editingBook, onSubmit, onCancelEdit, submitting, serverError }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingBook) {
      setForm({
        title: editingBook.title,
        author: editingBook.author,
        year: String(editingBook.year),
        genre: editingBook.genre,
        read: Boolean(editingBook.read),
        rating: editingBook.rating !== null ? String(editingBook.rating) : ''
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingBook]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      author: form.author,
      year: form.year === '' ? NaN : Number(form.year),
      genre: form.genre,
      read: form.read,
      rating: form.rating === '' ? null : Number(form.rating)
    };

    const ok = await onSubmit(payload, editingBook ? editingBook.id : null);
    if (ok && !editingBook) {
      setForm(EMPTY_FORM);
    }
  };

  return (
    <section className="panel form-panel">
      <h2>{editingBook ? `Edit Book #${editingBook.id}` : 'Add a New Book'}</h2>

      {serverError && <div className="alert-error">{serverError}</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-grid">
          <label className="field">
            <span>Title</span>
            <input type="text" value={form.title} onChange={handleChange('title')} placeholder="Book title" />
          </label>

          <label className="field">
            <span>Author</span>
            <input type="text" value={form.author} onChange={handleChange('author')} placeholder="Author name" />
          </label>

          <label className="field">
            <span>Year</span>
            <input type="number" value={form.year} onChange={handleChange('year')} placeholder="e.g. 2024" />
          </label>

          <label className="field">
            <span>Genre</span>
            <select value={form.genre} onChange={handleChange('genre')}>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Rating (1–5)</span>
            <select value={form.rating} onChange={handleChange('rating')}>
              <option value="">Unrated (null)</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>

          <label className="field checkbox-field">
            <input type="checkbox" checked={form.read} onChange={handleChange('read')} />
            <span>Mark as Read</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingBook ? 'Save Changes' : 'Add Book'}
          </button>
          {editingBook && (
            <button type="button" className="btn-secondary" onClick={onCancelEdit} disabled={submitting}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
