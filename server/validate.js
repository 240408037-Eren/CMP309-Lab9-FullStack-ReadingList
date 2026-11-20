export const VALID_GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
const VALID_SORTS = ['id', 'title', 'author', 'year', 'rating'];
const VALID_ORDERS = ['asc', 'desc'];

export function parsePositiveInt(raw) {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) {
    return null;
  }
  const num = Number(raw);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

export function validateBookBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  if (typeof body.title !== 'string') {
    return { error: 'title must be a string' };
  }
  const title = body.title.trim();
  if (title.length < 1 || title.length > 100) {
    return { error: 'title must be between 1 and 100 characters' };
  }

  if (typeof body.author !== 'string') {
    return { error: 'author must be a string' };
  }
  const author = body.author.trim();
  if (author.length < 1 || author.length > 100) {
    return { error: 'author must be between 1 and 100 characters' };
  }

  const currentYear = new Date().getFullYear();
  if (typeof body.year !== 'number' || !Number.isInteger(body.year) || body.year < 1000 || body.year > currentYear) {
    return { error: `year must be an integer between 1000 and ${currentYear}` };
  }

  if (typeof body.genre !== 'string' || !VALID_GENRES.includes(body.genre)) {
    return { error: `genre must be one of: ${VALID_GENRES.join(', ')}` };
  }

  let read = false;
  if (body.read !== undefined) {
    if (typeof body.read !== 'boolean') {
      return { error: 'read must be a boolean' };
    }
    read = body.read;
  }

  let rating = null;
  if (body.rating !== undefined && body.rating !== null) {
    if (typeof body.rating !== 'number' || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
      return { error: 'rating must be an integer from 1 to 5, or null' };
    }
    rating = body.rating;
  }

  if (rating !== null && !read) {
    return { error: 'rating is allowed only when read is true' };
  }

  return {
    data: {
      title,
      author,
      year: body.year,
      genre: body.genre,
      read,
      rating
    }
  };
}

export function mergeAndValidatePatch(existingBook, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  // Only known book fields are merged; unknown fields in body are ignored
  const merged = {
    title: body.title !== undefined ? body.title : existingBook.title,
    author: body.author !== undefined ? body.author : existingBook.author,
    year: body.year !== undefined ? body.year : existingBook.year,
    genre: body.genre !== undefined ? body.genre : existingBook.genre,
    read: body.read !== undefined ? body.read : existingBook.read,
    rating: body.rating !== undefined ? body.rating : existingBook.rating
  };

  return validateBookBody(merged);
}

export function validateQuery(query) {
  const allowedKeys = ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page'];
  for (const key of allowedKeys) {
    if (Array.isArray(query[key])) {
      return { error: `Repeated query parameter '${key}' is not allowed` };
    }
  }

  const options = {};

  if (query.genre !== undefined) {
    if (!VALID_GENRES.includes(query.genre)) {
      return { error: `Invalid genre. Must be one of: ${VALID_GENRES.join(', ')}` };
    }
    options.genre = query.genre;
  }

  if (query.read !== undefined) {
    if (query.read !== 'true' && query.read !== 'false') {
      return { error: "Invalid 'read' parameter. Must be 'true' or 'false'" };
    }
    options.read = query.read === 'true';
  }

  if (query.q !== undefined) {
    options.q = String(query.q).trim();
  }

  if (query.sort !== undefined) {
    if (!VALID_SORTS.includes(query.sort)) {
      return { error: `Invalid sort field. Must be one of: ${VALID_SORTS.join(', ')}` };
    }
    options.sort = query.sort;
  }

  if (query.order !== undefined) {
    if (!VALID_ORDERS.includes(query.order)) {
      return { error: "Invalid order. Must be 'asc' or 'desc'" };
    }
    options.order = query.order;
  }

  if (query.limit !== undefined) {
    const limit = parsePositiveInt(query.limit);
    if (limit === null || limit < 1 || limit > 50) {
      return { error: 'limit must be an integer between 1 and 50' };
    }
    options.limit = limit;
  }

  if (query.page !== undefined) {
    const page = parsePositiveInt(query.page);
    if (page === null) {
      return { error: 'page must be a positive integer' };
    }
    options.page = page;
  }

  return { options };
}
