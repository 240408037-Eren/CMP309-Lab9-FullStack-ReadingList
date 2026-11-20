const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

export default function BookControls({ filters, onFilterChange }) {
  const handleChange = (field) => (e) => {
    onFilterChange({
      ...filters,
      [field]: e.target.value
    });
  };

  return (
    <section className="panel controls-panel">
      <h2>Search &amp; Filter</h2>
      <div className="controls-grid">
        <label className="field">
          <span>Search (Title / Author)</span>
          <input
            type="text"
            value={filters.q}
            onChange={handleChange('q')}
            placeholder="e.g. Dune, Orwell..."
          />
        </label>

        <label className="field">
          <span>Genre</span>
          <select value={filters.genre} onChange={handleChange('genre')}>
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Read Status</span>
          <select value={filters.read} onChange={handleChange('read')}>
            <option value="">All</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>
        </label>

        <label className="field">
          <span>Sort By</span>
          <select value={filters.sort} onChange={handleChange('sort')}>
            <option value="id">Default (ID)</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
          </select>
        </label>

        <label className="field">
          <span>Order</span>
          <select value={filters.order} onChange={handleChange('order')}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>
    </section>
  );
}
