export default function BookList({
  books,
  loading,
  error,
  busyId,
  onToggleRead,
  onRate,
  onEdit,
  onDelete
}) {
  if (loading) {
    return <div className="state-box">Loading books...</div>;
  }

  if (error) {
    return <div className="state-box state-error">Error: {error}</div>;
  }

  if (books.length === 0) {
    return <div className="state-box">No books match your current filters.</div>;
  }

  return (
    <section className="panel list-panel">
      <h2>Books ({books.length})</h2>
      <div className="book-grid">
        {books.map((book) => {
          const isBusy = busyId === book.id;
          return (
            <article key={book.id} className={`book-card ${book.read ? 'is-read' : ''}`}>
              <div className="book-header">
                <h3>{book.title}</h3>
                <span className="genre-badge">{book.genre}</span>
              </div>

              <p className="book-meta">
                {book.author} &middot; {book.year}
              </p>

              <div className="book-status-row">
                <span className={`read-badge ${book.read ? 'read' : 'unread'}`}>
                  {book.read ? 'Read' : 'Unread'}
                </span>
                <span className="rating-text">
                  Rating: {book.rating !== null ? `${book.rating} / 5` : 'Unrated'}
                </span>
              </div>

              <div className="book-actions">
                <button
                  type="button"
                  className="btn-small"
                  disabled={isBusy}
                  onClick={() => onToggleRead(book)}
                >
                  {book.read ? 'Mark Unread' : 'Mark Read'}
                </button>

                <select
                  aria-label={`Rate ${book.title}`}
                  value={book.rating !== null ? String(book.rating) : ''}
                  disabled={isBusy}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    onRate(book.id, val);
                  }}
                >
                  <option value="">Rate...</option>
                  <option value="1">1 ★</option>
                  <option value="2">2 ★</option>
                  <option value="3">3 ★</option>
                  <option value="4">4 ★</option>
                  <option value="5">5 ★</option>
                </select>

                <button
                  type="button"
                  className="btn-small"
                  disabled={isBusy}
                  onClick={() => onEdit(book)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="btn-small btn-danger"
                  disabled={isBusy}
                  onClick={() => onDelete(book.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
