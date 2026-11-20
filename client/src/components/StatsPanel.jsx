export default function StatsPanel({ stats, error }) {
  if (error) {
    return (
      <section className="panel stats-panel">
        <h2>Statistics</h2>
        <p className="state-error">Failed to load stats: {error}</p>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="panel stats-panel">
        <h2>Statistics</h2>
        <p>Loading statistics...</p>
      </section>
    );
  }

  const genreEntries = Object.entries(stats.byGenre || {});

  return (
    <section className="panel stats-panel">
      <h2>Reading Statistics</h2>
      <div className="stats-cards">
        <div className="stat-box">
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Read</span>
          <span className="stat-value">{stats.read}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Unread</span>
          <span className="stat-value">{stats.unread}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Avg Rating</span>
          <span className="stat-value">{stats.averageRating !== null ? stats.averageRating : '—'}</span>
        </div>
      </div>

      {genreEntries.length > 0 && (
        <div className="genre-breakdown">
          {genreEntries.map(([genre, count]) => (
            <span key={genre} className="genre-chip">
              {genre}: {count}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
