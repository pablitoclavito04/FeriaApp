# 05. Design.

## Application architecture.

FeriaApp follows a hybrid architecture composed of two distinct systems:

**System 1 – Administration Panel (MERN):**
- **Frontend:** React SPA served from an Nginx container.
- **Backend:** REST API with Node.js and Express.
- **Database:** MongoDB.
- **Proxy:** Nginx as a reverse proxy routing requests between the frontend, backend and public website.

**System 2 – Static Public Website (GitHub Pages):**
- Static HTML, CSS and JavaScript served from GitHub Pages.
- Data is published in JSON format via Octokit when the administrator presses "Publish".
- Functions as a PWA with Service Workers for offline support.

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
└── uploads/ (images)

Administrator
      │
      ▼
Nginx (port 80)
├── / → React Frontend (admin panel)
├── /api/ → Express Backend (port 5000)
└── /public/ → Static public website
      │
      ▼
MongoDB (port 27017)
```

---

## Entity-Relationship diagram.

![Entity-Relationship diagram](./ER-Diagram.png)

---

## API Endpoints.

### Authentication.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Log in |
| GET | /api/auth/profile | Private | Get admin profile |

### Fairs.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/fairs | Public | Get all fairs |
| POST | /api/fairs | Private | Create a fair |
| PUT | /api/fairs/:id | Private | Update a fair |
| DELETE | /api/fairs/:id | Private | Delete a fair |

### Casetas.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/casetas | Public | Get all stalls |
| POST | /api/casetas | Private | Create a stall |
| PUT | /api/casetas/:id | Private | Update a stall |
| DELETE | /api/casetas/:id | Private | Delete a stall |

### Menus.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/menus | Public | Get all menu items |
| GET | /api/menus/caseta/:casetaId | Public | Get menu items for a stall |
| POST | /api/menus | Private | Create a dish |
| POST | /api/menus/bulk | Private | Create multiple dishes at once |
| PUT | /api/menus/:id | Private | Update a dish |
| DELETE | /api/menus/:id | Private | Delete a dish |

### Concerts.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/concerts | Public | Get all concerts |
| POST | /api/concerts | Private | Create a concert |
| PUT | /api/concerts/:id | Private | Update a concert |
| DELETE | /api/concerts/:id | Private | Delete a concert |

### Publishing.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/publish | Private | Generate and publish the public website on GitHub Pages |

---

## Use case diagram.

**Administrator:**
- Log into the panel.
- Manage fairs (CRUD).
- Manage stalls (CRUD + map location).
- Manage menus (individual and bulk CRUD).
- Manage concerts (CRUD).
- Publish the public website.

**Visitor:**
- View general fair information.
- See the interactive map with stalls.
- Search for stalls by name.
- View stall detail (menu + schedule).
- Download the full menu as PDF.
- Install the app as a PWA.
- Use the app offline.

---

## Flow diagrams.

### Public website publishing flow.

```
Admin presses "Publish"
        │
        ▼
Backend queries MongoDB
(fairs, stalls, menus, concerts)
        │
        ▼
Generates JSON files
        │
        ▼
Octokit uploads JSON to gh-pages branch
        │
        ▼
Octokit uploads images to gh-pages/uploads/
        │
        ▼
GitHub Pages deploys automatically
        │
        ▼
Public website updated ✓
```

### Authentication flow.

```
Admin enters email and password
        │
        ▼
Backend verifies credentials with bcrypt
        │
    ┌───┴───┐
    │       │
  Error   Success
    │       │
    ▼       ▼
  401    Generates JWT
          │
          ▼
  Frontend stores token
  in sessionStorage
          │
          ▼
  Access to panel
```