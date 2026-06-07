# FeriaApp.

A full stack web platform for consulting information about the **Feria de Jerez de la Frontera**. The project is divided into two distinct parts: a MERN administration panel and a static public PWA. Both are deployed on a cloud server (DigitalOcean) under their own subdomain, and the public PWA is also mirrored to GitHub Pages.

## Live links

- **Public website (PWA):** [https://feriaapp.com](https://feriaapp.com) — no login required. Also mirrored at [pablitoclavito04.github.io/FeriaApp](https://pablitoclavito04.github.io/FeriaApp/).
- **Administration panel:** [https://admin.feriaapp.com](https://admin.feriaapp.com) — reachable from anywhere, with a trusted HTTPS certificate (Let's Encrypt).

Both subdomains are served from the same DigitalOcean server: `feriaapp.com` serves the public site and `admin.feriaapp.com` serves the panel, split by nginx.

**Demo credentials (administration panel):**

| Role | Email | Password |
|---|---|---|
| Admin | admin@feriaapp.com | admin1234 |
| Editor | editor@feriaapp.com | editor1234 |
| Viewer | viewer@feriaapp.com | viewer1234 |

**Figma prototype:**
- [Mockup](https://www.figma.com/design/Yl0MYP8yugGAy1L8tQh9kA/Mockup-de-FeriaApp)
- [Wireframe](https://www.figma.com/design/L6zzfNaLYFHTk8sE7yzBYQ/WireFrame-FeriaApp)
- [Flow diagram](https://www.figma.com/board/UWFIxMcH9YrrtgggqFh2UN/Diagrama-de-flujo-de-FeriaApp)
- [Sitemap](https://www.figma.com/board/cWkr8TztE7vuPHASmIO8ma/SiteMap-FeriaApp)

---

## Performance metrics

Lighthouse audit of the deployed public site at `https://pablitoclavito04.github.io/FeriaApp/`. See [docs/07-pruebas.md](docs/07-pruebas.md#lighthouse-report) for the full reports.

| Metric | Desktop | Mobile |
|---|---|---|
| Performance | 87/100 | 71/100 |
| Accessibility | 93/100 | 92/100 |
| Best Practices | 100/100 | 100/100 |
| SEO | 100/100 | 100/100 |

---

## Testing

| Metric | Value |
|---|---|
| Unit tests | 342 |
| Test files | 10 |
| Test framework | Jest + Supertest |
| CI/CD | GitHub Actions |
| Test execution | Serial (--runInBand) |

---

## Main features

### Administration panel
- JWT authentication with bcrypt password hashing, self-registration, and a "how do you want to access?" entry screen.
- Role-based access control with three roles (admin, editor, viewer) and a Users section to manage them.
- Full CRUD management for fairs, stalls, menus and concerts.
- AI-powered stall detection: upload any fair map and Claude (Anthropic) detects each stall, reads its number, and proposes a position. The admin then drags markers to fine-tune, edits, adds or removes stalls, and bulk-imports them. Each fair stores its own map.
- Interactive map editor using Leaflet.js — drag markers or click to place each stall.
- Stall image uploads with Multer.
- Bulk menu creation: add multiple dishes to a stall in a single operation.
- One-click publishing: the backend generates all JSON files and uploads them to GitHub Pages via the GitHub API using Octokit.

### Public website (PWA)
- Installable on mobile as a native app via Web App Manifest.
- Works offline after the first load, thanks to Service Workers.
- Interactive map showing all stalls on the official venue plan.
- Smart search with typo tolerance powered by Fuse.js.
- Stall detail view with menu suggestions and full concert schedule.
- Full menu PDF download generated client-side with jsPDF.
- Automatically updated every time the administrator publishes from the panel.

---

## Technologies.

### Frontend (Administration panel):
- **React 18** with Vite and React Router.
- **SCSS** for styling.
- **Leaflet.js** for the interactive map and stall location editor.
- **Axios** for HTTP requests with JWT interceptors.
- **Docker + Nginx** for containerised deployment.

### Backend:
- **Node.js** with **Express 5**.
- **MongoDB** with **Mongoose**.
- **JWT** authentication with **bcryptjs**.
- **express-validator** for request body validation (422 with field-level error details).
- **Multer** for image uploads.
- **Anthropic SDK** (`@anthropic-ai/sdk`, Claude vision) for AI stall detection from any fair map.
- **Octokit** for automated publishing to GitHub Pages.
- **Swagger / OpenAPI 3.0** for REST API documentation (interactive UI + exported `openapi.json`).

### Public website:
- Vanilla **HTML5 / CSS3 / JavaScript**.
- **Leaflet.js** for the interactive stall map.
- **Fuse.js** for smart fuzzy search.
- **jsPDF** for client-side PDF generation.
- **Service Workers** for offline support.
- **Web App Manifest** for PWA installation.

### DevOps:
- **Docker** and **Docker Compose** for containerisation.
- **Nginx** as a reverse proxy with **HTTPS** (TLS 1.2/1.3, self-signed cert for local dev, Let's Encrypt-ready for production).
- **GitHub Actions** for the CI/CD pipeline.
- **GitHub Pages** for static hosting of the public website.

---

## Architecture.

FeriaApp uses a hybrid architecture that combines the best of both worlds:

```
Visitor
      │
      ▼
GitHub Pages (gh-pages branch)
├── index.html / app.js / styles.css
├── data/fairs.json
├── data/casetas.json
├── data/menus.json
├── data/concerts.json
└── uploads/ (stall images)

Administrator
      │
      ▼
Nginx (HTTPS on port 443, HTTP→HTTPS redirect on port 80)
├── /        → React admin panel
├── /api/    → Express backend (port 5000)
└── /public/ → Static public website
      │
      ▼
MongoDB (port 27017)
```

The public website is a fully static site hosted on GitHub Pages for free. It is automatically regenerated every time the administrator presses "Publish" in the panel. This ensures fast load times and offline availability without any server costs.

---

## Installation.

### Prerequisites:

| Tool | Minimum version |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| MongoDB | 7.0 |
| Docker | 28.x |
| Docker Compose | 2.x |
| Git | 2.x |

---

### Option A: Local Development

**1. Clone the repository**
```bash
git clone https://github.com/pablitoclavito04/FeriaApp.git
cd FeriaApp
git checkout develop
```

**2. Set up the backend**
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feriaApp
MONGODB_TEST_URI=mongodb://localhost:27017/feriaApp_test
JWT_SECRET=your_jwt_secret_here
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=FeriaApp
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**3. Create the administrator user**
```bash
node seedAdmin.js
```
Credentials: `admin@feriaapp.com` / `admin1234`

**4. Start the backend**
```bash
node server.js
```
Available at `http://localhost:5000`

**5. Set up the frontend**
```bash
cd ../frontend
npm install
```

Create a `.env.development` file inside `frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

**6. Start the frontend**
```bash
npm run dev
```
Available at `http://localhost:5173`

---

### Option B: Docker

**1. Clone the repository**
```bash
git clone https://github.com/pablitoclavito04/FeriaApp.git
cd FeriaApp
```

**2. Configure environment variables** ⚠️ **mandatory step**
```bash
cp .env.example .env
# Edit .env with your real values
```

The `.env` file is **gitignored** for security, so it does not come with the clone — you must create it yourself. Without it, `docker-compose up` will print four warnings about unset variables and the **admin login** and **Publish** button will not work. See [docs/08-despliegue.md](docs/08-despliegue.md#deployment-process-1) for the full list of variables and what each one is for.

**3. Generate a self-signed SSL certificate for HTTPS**
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/feriaapp.key \
  -out nginx/ssl/feriaapp.crt \
  -subj "/C=ES/ST=Cadiz/L=Jerez/O=FeriaApp/OU=TFG/CN=localhost"
```
The certificate is `.gitignore`d, so each clone must regenerate it. See [docs/08-despliegue.md](docs/08-despliegue.md#https-configuration) for details and the production workflow with Let's Encrypt.

**4. Start all containers**
```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Administration panel | https://localhost |
| API | https://localhost/api/ |

> The browser will warn about the self-signed certificate the first time. Click **Advanced → Continue to localhost** to accept it.

To test the production subdomain split (`feriaapp.com` + `admin.feriaapp.com`) locally, add `127.0.0.1 feriaapp.com admin.feriaapp.com` to your hosts file and run with the local override:
>
> ```bash
> docker compose -f docker-compose.yaml -f docker-compose.local.yaml up --build
> ```

**5. Create the administrator user**
```bash
docker exec feriaapp-backend node seedAdmin.js
```

---

## CI/CD Pipeline.

The GitHub Actions pipeline runs automatically on every push to `develop` or `main`:

1. **Test backend** — runs unit tests with Jest and Supertest against a real MongoDB instance.
2. **Build frontend** — verifies the React app compiles without errors.
3. **Build Docker** — verifies all Dockerfiles are valid by building the images.

---

## API Documentation.

The REST API is documented in three complementary formats:

- **Interactive Swagger UI** (runtime): with the stack running, browse to `https://localhost/api/docs` to see every endpoint grouped by tag and exercise JWT-protected routes from the browser.
- **OpenAPI 3.0 spec** (offline): exported as a static file at [`docs/api/openapi.json`](docs/api/openapi.json) — importable into Postman, Insomnia or Stoplight without running the backend. Regenerate it with `npm run export:openapi` from `backend/`.
- **Curl examples**: end-to-end requests for every endpoint in [`docs/08-despliegue.md`](docs/08-despliegue.md#api-verification-with-curl).

### Main endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Administrator login |
| GET | /api/auth/profile | Private (admin) | Get administrator profile |
| GET | /api/fairs | Public | Get all fairs. Supports `?page=1&limit=10&active=true` |
| GET | /api/fairs/active | Public | Get only active fairs |
| GET | /api/fairs/latest | Public | Get most recent fair |
| GET | /api/fairs/range | Public | Get fairs by date range `?startDate=&endDate=` |
| GET | /api/fairs/count/status | Public | Count active vs inactive fairs |
| GET | /api/fairs/sorted/enddate | Public | Get fairs sorted by end date descending |
| GET | /api/fairs/search/:name | Public | Search fairs by name |
| GET | /api/fairs/:id | Public | Get a fair by ID |
| GET | /api/fairs/:id/casetas | Public | Get a fair with its stalls |
| GET | /api/fairs/:id/full | Public | Get a fair with stalls, menus and concerts |
| GET | /api/casetas | Public | Get all stalls. Supports `?page=1&limit=10&fair=ID&number=1` |
| GET | /api/casetas/sorted/desc | Public | Get stalls sorted by number descending |
| GET | /api/casetas/filter/withimage | Public | Get stalls with image |
| GET | /api/casetas/filter/noimage | Public | Get stalls without image |
| GET | /api/casetas/filter/highest | Public | Get stall with highest number |
| GET | /api/casetas/filter/withlocation | Public | Get stalls with location defined |
| GET | /api/casetas/count/byfair | Public | Count stalls per fair |
| GET | /api/casetas/search/:name | Public | Search stalls by name |
| GET | /api/casetas/:id | Public | Get a stall by ID |
| GET | /api/casetas/:id/full | Public | Get a stall with its menus and concerts |
| GET | /api/menus | Public | Get all menus. Supports `?page=1&limit=10&caseta=ID` |
| GET | /api/menus/sorted/price | Public | Get menus sorted by price ascending |
| GET | /api/menus/filter/price | Public | Get menus by price range `?min=5&max=15` |
| GET | /api/menus/filter/mostexpensive | Public | Get most expensive menu item |
| GET | /api/menus/filter/cheapest | Public | Get cheapest menu item |
| GET | /api/menus/filter/nodescription | Public | Get menus without description |
| GET | /api/menus/filter/full | Public | Get menus with full caseta and fair info |
| GET | /api/menus/count/bycaseta | Public | Count menus per stall |
| GET | /api/menus/search/:name | Public | Search menus by name |
| GET | /api/menus/caseta/:id | Public | Get menus by stall |
| GET | /api/menus/:id/caseta | Public | Get the caseta of a menu |
| GET | /api/menus/:id/similar | Public | Get menus with similar price |
| GET | /api/menus/:id/caseta/concerts | Public | Get concerts of the caseta of a menu |
| GET | /api/concerts | Public | Get all concerts. Supports `?page=1&limit=10&caseta=ID` |
| GET | /api/concerts/sorted/desc | Public | Get concerts sorted by date descending |
| GET | /api/concerts/filter/daterange | Public | Get concerts by date range `?startDate=&endDate=` |
| GET | /api/concerts/filter/upcoming | Public | Get upcoming concerts |
| GET | /api/concerts/filter/nogenre | Public | Get concerts without genre |
| GET | /api/concerts/filter/full | Public | Get concerts with full caseta and fair info |
| GET | /api/concerts/count/bycaseta | Public | Count concerts per stall |
| GET | /api/concerts/filter/genre/:genre | Public | Get concerts by genre |
| GET | /api/concerts/search/:artist | Public | Search concerts by artist |
| GET | /api/concerts/caseta/:id | Public | Get concerts by stall |
| GET | /api/concerts/:id/caseta | Public | Get the caseta of a concert |
| GET | /api/concerts/:id/sameday | Public | Get concerts on the same day |
| GET | /api/concerts/:id/samegenre | Public | Get concerts of the same genre |
| GET | /api/concerts/:id/caseta/menus | Public | Get menus of the caseta of a concert |
| GET | /api/stats | Public | Get general statistics and aggregations |
| GET | /api/users | Private (admin) | List panel users |
| PUT | /api/users/:id/role | Private (admin) | Change a user's role |
| DELETE | /api/users/:id | Private (admin) | Delete a user |
| POST | /api/casetas/detect | Private (admin) | Detect stalls from an uploaded map (AI vision) |
| POST | /api/casetas/bulk | Private (admin) | Bulk create/update stalls after map review |
| POST | /api/fairs | Private (admin) | Create a fair |
| POST | /api/casetas | Private (admin) | Create a stall |
| POST | /api/menus | Private (admin) | Create a menu item |
| POST | /api/menus/bulk | Private (admin) | Create multiple menu items at once |
| POST | /api/concerts | Private (admin) | Create a concert |
| PUT | /api/fairs/:id | Private (admin, editor) | Update a fair |
| PUT | /api/casetas/:id | Private (admin, editor) | Update a stall |
| PUT | /api/menus/:id | Private (admin, editor) | Update a menu item |
| PUT | /api/concerts/:id | Private (admin, editor) | Update a concert |
| DELETE | /api/fairs/:id | Private (admin) | Delete a fair |
| DELETE | /api/casetas/:id | Private (admin) | Delete a stall |
| DELETE | /api/menus/:id | Private (admin) | Delete a menu item |
| DELETE | /api/concerts/:id | Private (admin) | Delete a concert |
| POST | /api/publish | Private (admin) | Publish public website to GitHub Pages |


### Nested routes summary

| Route file | Nested routes |
|---|---|
| fairRoutes.js | 8 |
| casetaRoutes.js | 12 |
| menuRoutes.js | 3 |
| concertRoutes.js | 4 |
| **Total** | **27** |


### Role-based access control

FeriaApp implements role-based authorization with three panel roles. Users reach the panel through an initial "how do you want to access?" screen with sign-in and sign-up; self-registration always creates a `viewer` account, and an administrator promotes users from a dedicated **Users** section (an admin cannot change their own role). On entering, each user sees a banner explaining what their role allows.

| Role | Access |
|---|---|
| `admin` | Full access — read, create, update, delete, publish, and manage user roles |
| `editor` | Can update existing resources (`PUT`), but cannot create, delete, publish or manage users |
| `viewer` | Read-only access |

`PUT` (update) endpoints accept `admin` and `editor`. All other write endpoints (`POST`, `DELETE`, publish, and user management) require `admin`. Unauthorized attempts return `403 Forbidden` with `code: FORBIDDEN`.


### Paginated response format

All `GET` collection endpoints return a paginated response:

```json
{
  "total": 8,
  "page": 1,
  "pages": 1,
  "data": [...]
}
```


---

## Project structure:

```
FeriaApp/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # DB, Octokit, Swagger
│   │   ├── controllers/      # Route handlers
│   │   ├── middlewares/      # Auth, upload
│   │   ├── models/           # Mongoose schemas
│   │   └── routes/           # Express routers
│   ├── tests/                # Jest unit tests
│   ├── uploads/              # Stall images
│   ├── Dockerfile
│   └── server.js
├── frontend/                 # React admin panel
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API calls
│   │   └── styles/           # SCSS
│   ├── Dockerfile
│   └── nginx.conf
├── public-web/               # Static PWA
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   ├── sw.js
│   └── manifest.json
├── docs/                     # Full project documentation
├── .github/workflows/        # GitHub Actions CI/CD
├── nginx.conf                # Reverse proxy config
├── docker-compose.yaml
└── .env.example
```

---

## Documentation

Full project documentation is available in the `/docs` folder:

- [01-introduction](docs/01-introduccion.md) — Project origin, objectives and background
- [02-description](docs/02-descripcion.md) — Features, UI/UX and use cases
- [03-installation](docs/03-instalacion.md) — Step-by-step setup guide
- [04-style-guide](docs/04-guia-estilos.md) — Colours, typography and Figma prototype
- [05-design](docs/05-diseno.md) — Architecture, ER diagram and API design
- [06-development](docs/06-desarrollo.md) — Sprint sequence, decisions and code snippets
- [07-testing](docs/07-pruebas.md) — Testing methodology and results
- [08-deployment](docs/08-despliegue.md) — GitHub Pages and Docker deployment
- [08-deployment-eval](docs/08-despliegue-eval.md) — Module rubric mapping for evaluation purposes
- [09-user-manual](docs/09-manual-usuario.md) — End-user guide with FAQs
- [10-conclusions](docs/10-conclusiones.md) — Evaluation, lessons learned and future work

---

## Target users:

| User type | Description |
|---|---|
| Fair visitor | Person attending the fair who needs quick, offline-capable information from their mobile |
| Administrator | Full panel access: loads and maintains data, manages users and publishes the public website |
| Editor | Panel user who can edit existing content but not create, delete or publish |
| Viewer | Panel user with read-only access |

---

## License.

This project was developed as a Final Degree Project (TFG) for the **Desarrollo de Aplicaciones Web (DAW)**