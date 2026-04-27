# FeriaApp.

A full stack web platform for consulting information about the **Feria de Jerez de la Frontera**. The project is divided into two distinct parts: a MERN administration panel and a static public PWA automatically published on GitHub Pages.

**Public website:** [pablitoclavito04.github.io/FeriaApp](https://pablitoclavito04.github.io/FeriaApp/)

**Figma prototype:** [View prototype](https://www.figma.com/files/team/1552254852217140725/all-projects?fuid=1552254847944696626)

---

## Performance metrics

| Metric | Score | Tool |
|---|---|---|
| Performance | 68/100 | Lighthouse |
| Accessibility | 93/100 | Lighthouse |
| Best Practices | 100/100 | Lighthouse |
| SEO | 100/100 | Lighthouse |

---

## Testing

| Metric | Value |
|---|---|
| Unit tests | 208 |
| Test files | 5 |
| Test framework | Jest + Supertest |
| CI/CD | GitHub Actions |
| Test execution | Serial (--runInBand) |

---

## Main features

### Administration panel
- JWT authentication with bcrypt password hashing.
- Full CRUD management for fairs, stalls, menus and concerts.
- Interactive map editor using Leaflet.js with the official fairground plan — simply click to place each stall.
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
- **Multer** for image uploads.
- **Octokit** for automated publishing to GitHub Pages.
- **Swagger** for REST API documentation.

### Public website:
- Vanilla **HTML5 / CSS3 / JavaScript**.
- **Leaflet.js** for the interactive stall map.
- **Fuse.js** for smart fuzzy search.
- **jsPDF** for client-side PDF generation.
- **Service Workers** for offline support.
- **Web App Manifest** for PWA installation.

### DevOps:
- **Docker** and **Docker Compose** for containerisation.
- **Nginx** as a reverse proxy.
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
Nginx (port 80)
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
JWT_SECRET=your_jwt_secret_here
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=FeriaApp
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

**2. Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your real values
```

**3. Start all containers**
```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Administration panel | http://localhost |
| Public website | http://localhost/public/ |
| API | http://localhost/api/ |

**4. Create the administrator user**
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

The REST API is documented with Swagger. Once the backend is running, visit:

```
http://localhost:5000/api-docs
```

### Main endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Administrator login |
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
| GET | /api/stats | Public | Get general statistics and aggregations |
| POST | /api/fairs | Private | Create a fair |
| POST | /api/casetas | Private | Create a stall |
| POST | /api/menus | Private | Create a menu item |
| POST | /api/menus/bulk | Private | Create multiple menu items at once |
| POST | /api/concerts | Private | Create a concert |
| PUT | /api/fairs/:id | Private | Update a fair |
| PUT | /api/casetas/:id | Private | Update a stall |
| PUT | /api/menus/:id | Private | Update a menu item |
| PUT | /api/concerts/:id | Private | Update a concert |
| DELETE | /api/fairs/:id | Private | Delete a fair |
| DELETE | /api/casetas/:id | Private | Delete a stall |
| DELETE | /api/menus/:id | Private | Delete a menu item |
| DELETE | /api/concerts/:id | Private | Delete a concert |
| POST | /api/publish | Private | Publish public website to GitHub Pages |


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
- [09-user-manual](docs/09-manual-usuario.md) — End-user guide with FAQs
- [10-conclusions](docs/10-conclusiones.md) — Evaluation, lessons learned and future work

---

## Target users:

| User type | Description |
|---|---|
| Fair visitor | Person attending the fair who needs quick, offline-capable information from their mobile |
| Administrator | The developer, who loads and maintains data from the admin panel using official public sources |

---

## License.

This project was developed as a Final Degree Project (TFG) for the **Desarrollo de Aplicaciones Web (DAW)**