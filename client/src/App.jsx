import { useState, useEffect, useCallback } from 'react';
import {
  fetchBooks,
  fetchStats,
  createBook,
  replaceBook,
  patchBook,
  deleteBook
} from './api/books.js';
import BookControls from './components/BookControls.jsx';
import BookForm from './components/BookForm.jsx';
import BookList from './components/BookList.jsx';
import StatsPanel from './components/StatsPanel.jsx';

const INITIAL_FILTERS = {
  q: '',
  genre: '',
  read: '',
  sort: 'id',
  order: 'asc'
};

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  const [formError, setFormError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  const loadBooks = useCallback(async (currentFilters, signal) => {
    setLoading(true);
    setListError(null);
    try {
      const data = await fetchBooks(currentFilters, signal);
      setBooks(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setListError(err.message);
    } finally {
      if (!signal || !signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const loadStats = useCallback(async (signal) => {
    setStatsError(null);
    try {
      const data = await fetchStats(signal);
      setStats(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setStatsError(err.message);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadBooks(filters, controller.signal);
    return () => controller.abort();
  }, [filters, loadBooks]);

  useEffect(() => {
    const controller = new AbortController();
    loadStats(controller.signal);
    return () => controller.abort();
  }, [loadStats]);

  const refreshAll = async () => {
    await Promise.all([loadBooks(filters), loadStats()]);
  };

  const handleFormSubmit = async (payload, editId) => {
    setSubmitting(true);
    setFormError(null);
    setActionError(null);
    try {
      if (editId !== null) {
        await replaceBook(editId, payload);
        setEditingBook(null);
      } else {
        await createBook(payload);
      }
      await refreshAll();
      return true;
    } catch (err) {
      setFormError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRead = async (book) => {
    setBusyId(book.id);
    setActionError(null);
    try {
      const nextRead = !book.read;
      const patch = nextRead ? { read: true } : { read: false, rating: null };
      await patchBook(book.id, patch);
      await refreshAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRate = async (id, rating) => {
    setBusyId(id);
    setActionError(null);
    try {
      await patchBook(id, { rating });
      await refreshAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    setActionError(null);
    try {
      await deleteBook(id);
      if (editingBook && editingBook.id === id) {
        setEditingBook(null);
      }
      await refreshAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Reading List</h1>
        <p className="subtitle">CMP309 Full-Stack Book Tracker (Express 5 + React)</p>
      </header>

      <StatsPanel stats={stats} error={statsError} />

      <BookForm
        editingBook={editingBook}
        onSubmit={handleFormSubmit}
        onCancelEdit={() => {
          setEditingBook(null);
          setFormError(null);
        }}
        submitting={submitting}
        serverError={formError}
      />

      <BookControls filters={filters} onFilterChange={setFilters} />

      {actionError && <div className="alert-error">{actionError}</div>}

      <BookList
        books={books}
        loading={loading}
        error={listError}
        busyId={busyId}
        onToggleRead={handleToggleRead}
        onRate={handleRate}
        onEdit={(book) => {
          setEditingBook(book);
          setFormError(null);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
