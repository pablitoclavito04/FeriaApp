# 06. Development.

## Development sequence:

Development was organised into 5 sprints following an agile methodology with GitHub Projects as the Kanban board.

### Sprint 1 – Initial setup.
- Repository creation on GitHub with the `main`, `develop` and `gh-pages` branches.
- GitHub Projects board configuration.
- Figma prototyping of the main screens.
- Technical architecture design.

### Sprint 2 – Backend.
- Implementation of data models: Fair, Caseta, Menu, Concert, User.
- REST API development with Express and JWT authentication.
- Swagger configuration for automatic API documentation.
- Manual testing of all endpoints with Insomnia.
- `seedAdmin.js` script to create the initial administrator user.

### Sprint 3 – Administration panel.
- Administration panel development with React and Vite.
- Login system implementation with JWT and protected routes.
- CRUD forms for fairs, stalls, menus and concerts.
- Leaflet.js integration for the stall location editor on the official plan.
- Image uploads with Multer.
- "Publish" button implementation with Octokit to generate and publish the public website.

### Sprint 4 – Public website.
- Static public website development as a PWA.
- Leaflet.js integration for the interactive stall map.
- Smart search implementation with Fuse.js and typo tolerance.
- Service Worker and manifest.json configuration for offline support and installation.
- Menu PDF generation with jsPDF.
- Deployment on GitHub Pages from the `gh-pages` branch.

### Sprint 5 – Deployment and testing.
- Dockerfile creation for backend, frontend and public website.
- Nginx configuration as a reverse proxy.
- Orchestration with docker-compose.
- CI/CD pipeline with GitHub Actions.
- Unit tests with Jest and Supertest.
- Complete documentation in `/docs`.

---

## Key technical decisions.

### Hybrid architecture (MERN + GitHub Pages):

A hybrid architecture was chosen instead of a traditional server to serve the public website. The main reason is that fair visitors need a website that loads quickly and works offline, something that can only be achieved with a static page. GitHub Pages allows hosting that website for free with very good availability.

### Octokit for automatic publishing:

Instead of a manual deployment process, Octokit was implemented so the administrator can publish the public website with a single click from the panel. This removes the need for the administrator to have technical knowledge of Git or deployment.

### Fuse.js for typo-tolerant search:

Fuse.js was chosen because it provides fuzzy search without the need for an external search server. This allows visitors to find stalls even if they misspell the name, which is especially useful in a festive environment where attention to detail decreases.

### jsPDF for client-side PDF generation:

PDF generation happens in the visitor's browser, without requiring a server. This reduces backend load and allows the PDF to be generated even without a connection if the app is installed as a PWA.

### JWT stored in sessionStorage:

SessionStorage was chosen over localStorage to store the JWT token. This means the session closes automatically when the browser is closed, which is more secure for an administration panel.

---

## Difficulties encountered and how they were overcome.

### Problem: The .env file was accidentally committed to the gh-pages branch.

When copying public website files to the `gh-pages` branch, the backend `.env` file was included in the commit. GitHub detected it and blocked the push with its Push Protection system.

**Solution:** `Remove-Item C:\FeriaApp\backend\.env` was added before each commit on `gh-pages`, and `git filter-branch` was used to clean the history when the token had already been included. Long-term, this will be automated with GitHub Actions.

### Problem: @octokit/rest v22 uses ES Modules and Jest uses CommonJS.

When running tests with Jest, they failed because `@octokit/rest` v22 only supports ES Modules and cannot be loaded with `require()`.

**Solution:** An Octokit mock was added to the tests using `jest.mock()` so that Jest does not attempt to load the real module.

### Problem: The frontend in Docker made requests to localhost:5000 instead of /api/.

In local development, the frontend pointed directly to the backend at `http://localhost:5000/api`. This did not work in Docker because containers do not share `localhost`.

**Solution:** The axios client configuration was modified to use `import.meta.env.VITE_API_URL || '/api'`, so that in development it uses the environment variable and in Docker it uses the relative path that Nginx redirects to the backend.

### Problem: React routes returned 404 in Nginx.

When accessing a route like `/login` directly, Nginx returned 404 because it looked for a physical file instead of serving `index.html`.

**Solution:** A custom `nginx.conf` was added to the frontend container with `try_files $uri $uri/ /index.html` so that all routes return `index.html` and React Router handles them on the client side.

---

## Version control tools.

- **Git** with the `main`, `develop` and `gh-pages` branches.
- **GitHub Projects** as the Kanban board for task management.
- **GitHub Actions** for the automated CI/CD pipeline.
- Workflow: development on `develop` → merge to `main` at the end of each sprint.

---

## Relevant code snippets.

### Publishing with Octokit:

```javascript
const uploadFile = async (path, content, message) => {
  const contentBase64 = Buffer.from(content).toString('base64');
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path,
      ref: 'gh-pages',
    });
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path,
      message,
      content: contentBase64,
      sha: data.sha,
      branch: 'gh-pages',
    });
  } catch {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path,
      message,
      content: contentBase64,
      branch: 'gh-pages',
    });
  }
};
```

### PDF Generation with jsPDF.

```javascript
const downloadMenuPDF = (id) => {
  const caseta = casetas.find((c) => c._id === id);
  const casetaMenus = menus.filter((m) => m.caseta?._id === id || m.caseta === id);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text(`Menu - ${caseta.name}`, 20, 20);
  let y = 45;
  casetaMenus.forEach((m) => {
    doc.text(m.name, 20, y);
    doc.text(`${m.price}€`, 170, y, { align: 'right' });
    y += 10;
  });
  doc.save(`menu-${caseta.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};
```

---

## Pagination, filtering and sorting:

In Sprint 5, pagination, filtering and sorting support was added to all main GET endpoints. This improvement allows clients to request specific subsets of data rather than retrieving all documents at once.

### Implementation:

Each controller was updated to support the following pattern:

```javascript
const filter = {};
if (req.query.fair) filter.fair = req.query.fair;

const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 100;
const skip = (page - 1) * limit;

const total = await Model.countDocuments(filter);
const data = await Model.find(filter)
  .skip(skip)
  .limit(limit)
  .sort({ field: 1 });

res.json({ total, page, pages: Math.ceil(total / limit), data });
```

### Decisions made:

- Default `limit` is set to 100 to maintain backwards compatibility with the frontend while still supporting explicit pagination.
- Each endpoint has its own sorting criteria based on the most logical field for that entity.
- Filters are optional — if no query parameters are provided, all documents are returned.

### Frontend adaptation:

All frontend services and pages were updated to handle the new paginated response format, accessing `response.data` instead of the raw array.

### Test adaptation:

All 208 unit tests were updated to use `res.body.data` instead of `res.body` when asserting on collection responses.

---

## New endpoints and complex queries

In Sprint 4, 32 new endpoints were added to the API covering advanced queries, filters, sorting and aggregations across all modules.

### New endpoints per module

**Fairs (8 new endpoints):**
- `GET /api/fairs/active` — active fairs only
- `GET /api/fairs/latest` — most recent fair
- `GET /api/fairs/range` — fairs by date range
- `GET /api/fairs/count/status` — count active vs inactive
- `GET /api/fairs/sorted/enddate` — sorted by end date descending
- `GET /api/fairs/search/:name` — search by name using regex
- `GET /api/fairs/:id/casetas` — fair with its stalls
- `GET /api/fairs/:id/full` — fair with stalls, menus and concerts

**Stalls (8 new endpoints):**
- `GET /api/casetas/sorted/desc` — sorted by number descending
- `GET /api/casetas/filter/withimage` — stalls with image
- `GET /api/casetas/filter/noimage` — stalls without image
- `GET /api/casetas/filter/highest` — stall with highest number
- `GET /api/casetas/filter/withlocation` — stalls with location
- `GET /api/casetas/count/byfair` — count per fair using aggregate
- `GET /api/casetas/search/:name` — search by name using regex
- `GET /api/casetas/:id/full` — stall with its menus and concerts

**Menus (8 new endpoints):**
- `GET /api/menus/sorted/price` — sorted by price ascending
- `GET /api/menus/filter/price` — by price range
- `GET /api/menus/filter/mostexpensive` — most expensive item
- `GET /api/menus/filter/cheapest` — cheapest item
- `GET /api/menus/filter/nodescription` — without description
- `GET /api/menus/filter/full` — with caseta and fair info via lookup
- `GET /api/menus/count/bycaseta` — count per stall using aggregate
- `GET /api/menus/search/:name` — search by name using regex

**Concerts (8 new endpoints):**
- `GET /api/concerts/sorted/desc` — sorted by date descending
- `GET /api/concerts/filter/daterange` — by date range
- `GET /api/concerts/filter/upcoming` — upcoming concerts
- `GET /api/concerts/filter/nogenre` — without genre
- `GET /api/concerts/filter/full` — with caseta and fair info via lookup
- `GET /api/concerts/count/bycaseta` — count per stall using aggregate
- `GET /api/concerts/filter/genre/:genre` — by genre using regex
- `GET /api/concerts/search/:artist` — search by artist using regex

### Statistics endpoint

A dedicated `GET /api/stats` endpoint was created using MongoDB aggregation pipelines with `$group`, `$lookup`, `$project`, `$match` and `$sort` stages to generate complex statistics across all collections.

### Total complex queries

| Module | Queries |
|---|---|
| fairController | 10 |
| casetaController | 10 |
| menuController | 11 |
| concertController | 11 |
| statsController | 13 |
| **Total** | **55** |

---

## Nested routes for menus and concerts

In addition to the nested routes under `/api/fairs/:id` and `/api/casetas/:id`, nested routes were also added for menus and concerts to allow navigation between related resources.

**Menus nested routes:**
- `GET /api/menus/:id/caseta` — get the stall of a specific menu item
- `GET /api/menus/:id/similar` — get menu items with a similar price (±2€)
- `GET /api/menus/:id/caseta/concerts` — get the concerts of the stall that serves this menu item

**Concerts nested routes:**
- `GET /api/concerts/:id/caseta` — get the stall of a specific concert
- `GET /api/concerts/:id/sameday` — get other concerts happening on the same day
- `GET /api/concerts/:id/samegenre` — get other concerts of the same genre
- `GET /api/concerts/:id/caseta/menus` — get the menu items of the stall where a concert takes place

### Total nested routes summary

| Route file | Nested routes |
|---|---|
| fairRoutes.js | 8 |
| casetaRoutes.js | 12 |
| menuRoutes.js | 3 |
| concertRoutes.js | 4 |
| **Total** | **27** |

---

## Role-based authorization

The original implementation used JWT only with a single `admin` user. To meet the rubric requirement of "authentication and authorization with roles", the system was extended with three roles (`admin`, `editor`, `viewer`) and a dedicated `authorize` middleware.

### Decisions made

- **Role enum on the `User` model** (`enum: ['admin', 'editor', 'viewer']`) instead of a free-form string — this keeps the set of valid roles closed and Mongoose rejects anything outside it.
- **Role loaded from the database on every request, not from the JWT payload.** The JWT only carries the user id; `protect` reads the user (with their current role) from MongoDB. Effect: if an admin is demoted to `viewer`, the next request fails with 403 immediately, without waiting for the token to expire.
- **`authorize(...roles)` is a separate middleware**, applied *after* `protect`. This separation keeps "is the request authenticated?" and "does this user have permission?" as two independent checks, each with its own status code (401 vs 403) and error code (`UNAUTHORIZED` vs `FORBIDDEN`).
- **All write routes (`POST`, `PUT`, `DELETE`) require `admin`.** GET routes are open to all authenticated users (or public). This matches the actual product: only the administrator publishes data; editor/viewer roles exist as a demonstration of the access control layer.
- **`seedAdmin.js` creates the three roles** in a single idempotent run (using `upsert`), so the demo accounts can be recreated without producing duplicates.

### Implementation

```javascript
// backend/src/middlewares/auth.js
const protect = async (req, res, next) => {
  // ...verify JWT, load user from DB into req.user...
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized', code: 'UNAUTHORIZED' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Role '${req.user.role}' is not authorized to access this route`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

Routes apply both middlewares in order:

```javascript
// backend/src/routes/fairRoutes.js
router.post('/', protect, authorize('admin'), createFair);
router.put('/:id', protect, authorize('admin'), updateFair);
router.delete('/:id', protect, authorize('admin'), deleteFair);
```

### Verification

A dedicated test file `backend/tests/roles.test.js` exercises the authorization layer end to end: it logs in as `editor` and `viewer`, hits every write endpoint and asserts `403 / code: FORBIDDEN`. It also confirms that GET routes remain accessible to non-admin authenticated users. See [docs/07-pruebas.md](07-pruebas.md) for the full test breakdown.