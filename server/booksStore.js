// In-memory book store with simulated async delay and immutable state updates

const SEED_BOOKS = [
  { id: 1, title: 'Dune', author: 'Frank Herbert', year: 1965, genre: 'science', read: true, rating: 5 },
  { id: 2, title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937, genre: 'fantasy', read: true, rating: 5 },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'history', read: true, rating: 4 },
  { id: 4, title: '1984', author: 'George Orwell', year: 1949, genre: 'fiction', read: true, rating: 5 },
  { id: 5, title: 'Clean Code', author: 'Robert C. Martin', year: 2008, genre: 'non-fiction', read: false, rating: null },
  { id: 6, title: 'The Name of the Wind', author: 'Patrick Rothfuss', year: 2007, genre: 'fantasy', read: false, rating: null },
  { id: 7, title: 'A Brief History of Time', author: 'Stephen Hawking', year: 1988, genre: 'science', read: true, rating: 4 }
];

let books = SEED_BOOKS.map((book) => ({ ...book }));
let nextId = 8;

const delay = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getBooks({ genre, read, q, sort = 'id', order = 'asc', limit = 50, page = 1 } = {}) {
  await delay();

  let result = [...books];

  if (genre !== undefined) {
    result = result.filter((b) => b.genre === genre);
  }

  if (read !== undefined) {
    result = result.filter((b) => b.read === read);
  }

  if (q !== undefined && q.length > 0) {
    const term = q.toLowerCase();
    result = result.filter(
      (b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );
  }

  const dir = order === 'desc' ? -1 : 1;

  result.sort((a, b) => {
    if (sort === 'rating') {
      // Unrated books always sort last regardless of asc/desc
      if (a.rating === null && b.rating === null) return a.id - b.id;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
      return (a.rating - b.rating) * dir;
    }
    if (sort === 'title' || sort === 'author') {
      return a[sort].localeCompare(b[sort], undefined, { sensitivity: 'base' }) * dir;
    }
    if (sort === 'year') {
      return (a.year - b.year) * dir;
    }
    return (a.id - b.id) * dir;
  });

  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit).map((b) => ({ ...b }));
  return paged;
}

export async function getBookById(id) {
  await delay();
  const found = books.find((b) => b.id === id);
  return found ? { ...found } : null;
}

export async function hasDuplicate(title, author, excludeId = null) {
  await delay(5);
  const normTitle = title.trim().toLowerCase();
  const normAuthor = author.trim().toLowerCase();
  return books.some(
    (b) =>
      b.id !== excludeId &&
      b.title.trim().toLowerCase() === normTitle &&
      b.author.trim().toLowerCase() === normAuthor
  );
}

export async function createBook(bookData) {
  await delay();
  const newBook = {
    id: nextId++,
    title: bookData.title,
    author: bookData.author,
    year: bookData.year,
    genre: bookData.genre,
    read: bookData.read,
    rating: bookData.rating
  };
  books = [...books, newBook];
  return { ...newBook };
}

export async function replaceBook(id, bookData) {
  await delay();
  const exists = books.some((b) => b.id === id);
  if (!exists) return null;

  const updated = {
    id,
    title: bookData.title,
    author: bookData.author,
    year: bookData.year,
    genre: bookData.genre,
    read: bookData.read,
    rating: bookData.rating
  };
  books = books.map((b) => (b.id === id ? updated : b));
  return { ...updated };
}

export async function deleteBook(id) {
  await delay();
  const exists = books.some((b) => b.id === id);
  if (!exists) return false;
  books = books.filter((b) => b.id !== id);
  return true;
}

export async function getStats() {
  await delay();
  const total = books.length;
  const readCount = books.filter((b) => b.read).length;
  const unreadCount = total - readCount;

  const ratedBooks = books.filter((b) => b.rating !== null);
  const averageRating =
    ratedBooks.length > 0
      ? Number((ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1))
      : null;

  const byGenre = books.reduce((acc, b) => {
    acc[b.genre] = (acc[b.genre] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    read: readCount,
    unread: unreadCount,
    averageRating,
    byGenre
  };
}
