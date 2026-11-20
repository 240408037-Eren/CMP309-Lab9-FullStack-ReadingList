# CMP309 Web Programming — Assignment 9: Full-Stack Reading List

**Student:** Eren Ozan Yazar  
**Student ID:** 240408037  
**Course:** CMP309 Web Programming (Fall 2026)  
**Instructor:** Ali Daghighi  

---

## 1. Project Overview & Setup Instructions

This project is a full-stack Reading List application built with a Node.js / Express 5 REST API back-end (`server/`) and a Vite + React 18 front-end (`client/`). The server manages an in-memory collection of books with full CRUD operations, query filtering/sorting/pagination, manual input validation, and live statistics, while the React client communicates through a dedicated Fetch API module (`src/api/books.js`) with `AbortController` cleanup and origin-restricted CORS.

### Setup & Running Both Parts

**1. Start the Express Server (Port 3000):**
```bash
git clone https://github.com/240408037-Eren/CMP309-Lab9-FullStack-ReadingList.git
cd CMP309-Lab9-FullStack-ReadingList/server
npm install
npm run dev       # runs node --watch server.js (or npm start)
```
Server environment variables:
- `PORT` (defaults to `3000`)
- `CLIENT_ORIGIN` (defaults to `http://localhost:5173`)

**2. Start the React Client (Port 5173):**
```bash
cd ../client
npm install
cp .env.example .env
npm run dev
```
Client environment variable (`client/.env`):
- `VITE_API_URL=http://localhost:3000`

---

## 2. Architecture & File Organization

```
CMP309-Lab9-FullStack-ReadingList/
├── server/
│   ├── server.js         # Express 5 app, CORS, JSON parser, routes, 404 & 500 middleware
│   ├── booksStore.js     # Async in-memory store with 7 seed books and immutable updates
│   ├── validate.js       # Manual validation for book bodies, PATCH merges, and query params
│   ├── package.json      # ESM config, start/dev scripts, express 5 & cors dependencies
│   └── package-lock.json # Locked server dependency tree
├── client/
│   ├── src/
│   │   ├── api/books.js           # Shared fetch helper, URLSearchParams, AbortSignal, 204 support
│   │   ├── components/
│   │   │   ├── BookControls.jsx   # Search, genre/read filters, sort field & order controls
│   │   │   ├── BookForm.jsx       # Controlled add (POST) and edit (PUT) book form
│   │   │   ├── BookList.jsx       # Book cards with read toggle, rating (PATCH), edit & delete
│   │   │   └── StatsPanel.jsx     # Live reading statistics panel
│   │   ├── App.jsx                # Root state, AbortController effects, server error display
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Responsive layout and status styles
│   ├── .env.example      # Documents VITE_API_URL
│   ├── index.html        # HTML shell
│   ├── vite.config.js    # Vite config (no proxy)
│   └── package.json      # React 18 & Vite 5 dependencies
├── .gitignore            # Excludes node_modules/, dist/, .env, and OS/workspace files
└── README.md             # Setup, curl logs, preflight, reasoning questions, and self-study
```

*Note:* `GET /api/crash` is included in `server/server.js` as a deliberate async throw route to verify that the 4-parameter global error middleware catches rejected async handlers and returns `{ "error": "Something went wrong" }` with status 500 without leaking a stack trace.

---

## 3. Testing Evidence (`curl --include` & Preflight)

### 1. `GET /api/stats` (Before Changes)
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-1JV0X4GvEn/jAtq0xDtRoGc/BV0"
Date: Fri, 20 Nov 2026 08:04:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":7,"read":5,"unread":2,"averageRating":4.6,"byGenre":{"science":2,"fantasy":2,"history":1,"fiction":1,"non-fiction":1}}
```

### 2. `GET /api/books?genre=science&sort=year&order=desc` (200 Filtered & Sorted List)
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 226
ETag: W/"e2-05dZLcA4iBatShfefTUVC/r+i0k"
Date: Fri, 20 Nov 2026 08:05:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":7,"title":"A Brief History of Time","author":"Stephen Hawking","year":1988,"genre":"science","read":true,"rating":4},{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":true,"rating":5}]
```

### 3. `GET /api/books/1` (200 Single Book)
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 101
ETag: W/"65-imtguC0biqtv8FVKP54vGf/dVoY"
Date: Fri, 20 Nov 2026 08:05:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":true,"rating":5}
```

### 4. `POST /api/books` (201 Created with `Location` Header)
```http
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/8
Content-Type: application/json; charset=utf-8
Content-Length: 100
ETag: W/"64-31RL76/M9UWcI0ya93xHI5+vh80"
Date: Fri, 20 Nov 2026 08:05:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":8,"title":"Cosmos","author":"Carl Sagan","year":1980,"genre":"science","read":true,"rating":5}
```

### 5. `POST /api/books` with Invalid Body (400 Bad Request)
```http
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 52
ETag: W/"34-EkD05VxVszGrIq87djsyCpaUirg"
Date: Fri, 20 Nov 2026 08:05:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"rating is allowed only when read is true"}
```

### 6. `GET /api/books?genre=fiction&genre=history` (400 Repeated Query Parameter)
```http
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-Xxb2E2E2Y7muhgAZOIWL5ZTVvQA"
Date: Fri, 20 Nov 2026 08:05:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Repeated query parameter 'genre' is not allowed"}
```

### 7. `GET /api/books/999` (404 Missing Book)
```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Fri, 20 Nov 2026 08:05:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

### 8. `POST /api/books` Duplicate Title & Author (409 Conflict)
```http
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 60
ETag: W/"3c-YJy0XpDp5agPe/8cl8QkvyagI8A"
Date: Fri, 20 Nov 2026 08:05:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with this title and author already exists"}
```

### 9. `PUT /api/books/8` vs `PATCH /api/books/8` on the Same Book
**PUT (full replacement of all fields):**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 110
ETag: W/"6e-y0NK2X9OAn8DTjdtP6bNhPEw5Wc"
Date: Fri, 20 Nov 2026 08:05:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":8,"title":"Cosmos (Updated)","author":"Carl Sagan","year":1980,"genre":"science","read":true,"rating":4}
```
**PATCH (partial update sending only `{"rating":5}`):**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 110
ETag: W/"6e-jgfwhMLS2EVxuCNhArerFs87aUg"
Date: Fri, 20 Nov 2026 08:05:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":8,"title":"Cosmos (Updated)","author":"Carl Sagan","year":1980,"genre":"science","read":true,"rating":5}
```

### 10. `GET /api/stats` (After Creating Book #8)
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-806uLkcX+1NLt7jER5ieMZSJ6Iw"
Date: Fri, 20 Nov 2026 08:05:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":8,"read":6,"unread":2,"averageRating":4.7,"byGenre":{"science":3,"fantasy":2,"history":1,"fiction":1,"non-fiction":1}}
```

### 11. `DELETE /api/books/8` (204) Followed by Repeated `DELETE /api/books/8` (404)
```http
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Fri, 20 Nov 2026 08:05:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```
```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"
Date: Fri, 20 Nov 2026 08:05:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book not found"}
```

### 12. CORS Preflight `OPTIONS /api/books` Evidence
When the React client (`http://localhost:5173`) sends a `POST`, `PUT`, `PATCH`, or `DELETE` request with `Content-Type: application/json`, the browser automatically dispatches a preflight `OPTIONS` request first:
```http
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin, Access-Control-Request-Headers
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: Content-Type
Content-Length: 0
Date: Fri, 20 Nov 2026 08:05:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```
In the browser Network tab, this appears as an `OPTIONS /api/books` (status `204`) immediately preceding the actual `POST /api/books` (status `201`), confirming that Express returned the exact allowed origin (`http://localhost:5173`), allowed methods, and `Content-Type` header.

---

## 4. Reasoning Questions & Experimental Observations

1. **Parameters (route vs query):**  
   A book's `id` identifies a specific resource in the `/api/books/:id` hierarchy, so it belongs in the URL path as a route parameter, whereas `genre` and `sort` filter or order the collection and belong in the query string. If `id` were placed in the query string (e.g., `/api/books?id=1`), `GET`, `PUT`, `PATCH`, and `DELETE` would all target the collection endpoint, forcing the server to branch on query presence instead of clean REST resource routing.

2. **Body parsing experiment (moving `express.json()` below the routes):**  
   When `app.use(express.json())` was moved below the routes, `req.body` became `undefined` inside `POST /api/books`. Consequently, `validateBookBody(req.body)` failed and the server returned `400 Bad Request` with `{"error":"Request body must be a JSON object"}`. Middleware runs in registration order, so body parsing must happen before any route reads `req.body`.

3. **One response experiment (removing `return` before an early `404`):**  
   When `return` was removed before `res.status(404).json({ error: 'Book not found' })` in `GET /api/books/:id`, the server sent the 404 response and then continued executing into `res.json(book)`. This caused Node/Express to throw `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`, crashing/logging an unhandled error after headers were already flushed.

4. **PUT and PATCH:**  
   `PATCH` is better when toggling a single field such as marking a book as read (`{ read: true }`) or updating its rating (`{ rating: 5 }`), because the client does not need to resend unchanged fields. `PUT` is better when submitting the full Edit Book form, where the user may change title, author, year, genre, read status, and rating together to replace the entire resource representation.

5. **CORS experiment (setting `CLIENT_ORIGIN` to a wrong value):**  
   When `CLIENT_ORIGIN` was set to `http://localhost:9999`, the browser console logged a CORS policy error stating that `Access-Control-Allow-Origin` did not match `http://localhost:5173`, and `fetch()` rejected with a `TypeError`. The server still received and logged the request normally because CORS is enforced by the browser—not by the network—which is why `curl` (which does not enforce browser same-origin policy) continued to receive `200 OK`.

6. **Validation:**  
   Client-side validation only improves user experience; any user or script can bypass the React UI using `curl`, Postman, or browser DevTools and send malformed types, negative years, or invalid ratings directly to the API. The server must therefore validate every input as the authoritative security and data-integrity boundary.

7. **State:**  
   When the server is restarted, any newly added, edited, or deleted books disappear and the list resets to the 7 initial seed books. This happens because `booksStore.js` stores data in volatile RAM inside the Node.js process rather than on disk. To persist changes across restarts, the store would need to write to a database (e.g., PostgreSQL or MongoDB) or a file.

---

## 5. Self-Study Notes

1. **`URLSearchParams`:** Used `new URLSearchParams()` in `client/src/api/books.js` to append active filter/sort parameters (`q`, `genre`, `read`, `sort`, `order`) safely with automatic URL encoding instead of manual string concatenation.
2. **`localeCompare`:** Used `a[sort].localeCompare(b[sort], undefined, { sensitivity: 'base' })` in `booksStore.js` so alphabetical sorting by `title` or `author` handles case-insensitivity and locale characters accurately.
3. **`import.meta.env` & `VITE_` prefix:** Vite exposes environment variables to client-side code through `import.meta.env`, but only keys prefixed with `VITE_` (such as `VITE_API_URL`) are bundled so server secrets are never accidentally leaked to the browser.
4. **Express 5 `204 No Content`:** Sent empty `204` responses via `res.status(204).send()` and updated `client/src/api/books.js` to return `null` immediately when `response.status === 204` without calling `response.json()`.
5. **`AbortController` & `AbortError`:** Created an `AbortController` inside `useEffect` in `App.jsx`, passed `controller.signal` to `fetch()`, called `controller.abort()` in the cleanup function, and ignored errors where `err.name === 'AbortError'` so stale responses never overwrite newer filter results.

---

## 6. Technical Challenges Faced & Solutions

1. **Sorting Unrated Books Last in Both Directions:**  
   *Problem:* When sorting by `rating` in descending or ascending order, `null` ratings would naturally coerce to `0` and sort before `1` in ascending order.  
   *Solution:* Added explicit `null` guards before applying the direction multiplier (`dir`) in `booksStore.js`, ensuring `rating === null` always returns `1` or `-1` to stay at the bottom regardless of `asc`/`desc`.

2. **Toggling `read` to `false` on a Rated Book:**  
   *Problem:* Server validation forbids a rating when `read` is `false` (`400 Bad Request`). Clicking "Mark Unread" on a rated book with only `{ read: false }` would therefore be rejected by `mergeAndValidatePatch`.  
   *Solution:* In `App.jsx`, `handleToggleRead` sends `{ read: false, rating: null }` when unmarking a book as read, keeping client actions consistent with server invariants.
