# 03. Installation and setup.

## Prerequisites.

| Tool | Minimum Version | Purpose |
|---|---|---|
| Node.js | 20.x | Backend and frontend runtime |
| npm | 10.x | Dependency management |
| MongoDB | 7.0 | Database |
| Docker | 28.x | Containerisation |
| Docker Compose | 2.x | Container orchestration |
| Git | 2.x | Version control |

---

## Option A: Local Development (without Docker).

### 1. Clone the repository.

```bash
git clone https://github.com/pablitoclavito04/FeriaApp.git
cd FeriaApp
git checkout develop
```

### 2. Set up the backend.

```bash
cd backend
npm install
```

Create the `.env` file inside the `backend/` folder with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feriaApp
JWT_SECRET=your_jwt_secret_here
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=FeriaApp
```

### 3. Create the administrator user.

```bash
node seedAdmin.js
```

This creates the administrator user with the following credentials:
- **Email:** admin@feriaapp.com
- **Password:** admin1234

### 4. Start the backend.

```bash
node server.js
```

The backend will be available at `http://localhost:5000`.

### 5. Set up the frontend.

```bash
cd ../frontend
npm install
```

Create the `.env.development` file inside the `frontend/` folder with the following content:

```
VITE_API_URL=http://localhost:5000/api
```

### 6. Start the frontend.

```bash
npm run dev
```

The administration panel will be available at `http://localhost:5173`.

---

## Option B: Docker Installation.

### 1. Clone the repository.

```bash
git clone https://github.com/pablitoclavito04/FeriaApp.git
cd FeriaApp
```

### 2. Configure environment variables.

Create the `.env` file in the project root with the following content:

```
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=FeriaApp
```

### 3. Start the containers.

```bash
docker-compose up --build
```

This will start the following services:
- **Administration panel:** `http://localhost`
- **Public website:** `http://localhost/public/`
- **API:** `http://localhost/api/`

### 4. Create the administrator user.

In another terminal, while the containers are running:

```bash
docker exec feriaapp-backend node seedAdmin.js
```

Credentials:
- **Email:** admin@feriaapp.com
- **Password:** admin1234

---

## Environment variables.

| Variable | Description | Example |
|---|---|---|
| PORT | Backend server port | 5000 |
| MONGODB_URI | MongoDB connection URI | mongodb://localhost:27017/feriaApp |
| JWT_SECRET | Secret key for JWT | any_random_string |
| GITHUB_TOKEN | GitHub personal access token | ghp_xxxxxxxxxxxx |
| GITHUB_OWNER | GitHub username | pablitoclavito04 |
| GITHUB_REPO | Repository name | FeriaApp |