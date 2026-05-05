# 08-eval. Web application deployment — module rubric mapping.

This document is a companion to [08-despliegue.md](08-despliegue.md). Its only purpose is to make explicit how the deployment work in this project covers the criteria of the *Despliegue de Aplicaciones Web* module rubric, so that a teacher reviewing the project for evaluation purposes can verify each criterion without having to reconstruct the mapping.

The main deployment document ([08-despliegue.md](08-despliegue.md)) is the source of truth for the deployment itself. This document only:

1. States which rubric criteria are addressed.
2. Explains how each one is implemented in the project.
3. Points to the concrete evidence (file, code snippet, command, screenshot) that proves it.

Whenever possible, evidence is referenced rather than duplicated.

---

## Criteria covered.

| # | Criterion | RA | Why it is here |
|---|---|---|---|
| **c1** | Buen diseño de arquitectura de la aplicación | RA1 | RA1 is the pending learning outcome for this student — both criteria associated with it (c1, c2) are worked in depth as the rubric requires. |
| **c2** | Buena implementación en Docker | RA1 | Same as above. |
| **C7** | Gestión básica de ficheros y artefactos del despliegue | RA4 | Mandatory for every student per the teacher's evaluation message. |
| **C8** | Verificación básica de red del despliegue | RA5 | Mandatory for every student per the teacher's evaluation message. |

---

## c1 (RA1) — Application architecture.

### What the criterion asks for.

The rubric's "Excellent" level requires a clearly defined architecture, separated by services (web/front, app/back, database and others if applicable), with each service's responsibility and communication explained, evidenced with a diagram or schema in README/DEPLOY and with the compose file showing those services. The project must function when started.

### How it is implemented.

FeriaApp is split into **five independent services**, each running in its own container, communicating through a single private Docker network (`feriaapp_feriaapp-network`). Only the reverse proxy is exposed to the host; everything else is reachable only from inside the network.

| Service | Image / build context | Role | Internal port |
|---|---|---|---|
| `nginx` | `nginx:alpine` | Reverse proxy + TLS termination + entry point | 80, 443 (the only ports published to the host) |
| `backend` | [`./backend`](../backend/Dockerfile) | REST API (Node.js + Express) | 5000 |
| `frontend` | [`./frontend`](../frontend/Dockerfile) | Administration panel (React build served by nginx) | 80 |
| `public-web` | [`./public-web`](../public-web/Dockerfile) | Public website (static HTML+JS, falls back to GitHub Pages) | 80 |
| `mongo` | `mongo:7` | Database | 27017 |

### Architecture diagram.

```
                       ┌─────────────────────┐
                       │   Browser / curl    │
                       └──────────┬──────────┘
                                  │ HTTPS (443) / HTTP (80 → 301 → 443)
                                  ▼
                  ┌────────────────────────────────┐
                  │            nginx               │
                  │  reverse proxy + TLS (Helmet)  │
                  └───┬───────────┬───────────┬────┘
                      │           │           │
              /api/   │      /    │   /public/│
                      ▼           ▼           ▼
                ┌──────────┐ ┌──────────┐ ┌──────────┐
                │ backend  │ │ frontend │ │public-web│
                │ Node:5000│ │nginx:80  │ │nginx:80  │
                └────┬─────┘ └──────────┘ └──────────┘
                     │
                     │ mongodb://mongo:27017
                     ▼
                ┌──────────┐
                │  mongo   │
                │  :27017  │  ─── volume: mongo-data → /data/db
                └──────────┘
                     ▲
                     │
                     └─── volume: backend-uploads → /app/uploads (used by backend)

       Docker network: feriaapp_feriaapp-network (bridge, 172.23.0.0/16)
       Host-exposed ports: 80, 443 (nginx only)
```

### Communication between services.

A typical request flows as follows:

1. The browser hits `https://localhost/...`. The TCP connection is terminated at **nginx**, which performs TLS using the local self-signed certificate ([nginx/ssl/](../nginx/ssl/), generated with OpenSSL — see [08-despliegue.md §HTTPS configuration](08-despliegue.md#https-configuration)).
2. nginx routes the request **by path prefix**:
   - `/api/...` → `backend:5000` (Node.js / Express)
   - `/public/...` → `public-web:80` (static)
   - everything else → `frontend:80` (React admin panel)
3. If the request reached the backend and needs data, the backend talks to MongoDB at `mongodb://mongo:27017/feriaApp`. The hostname `mongo` is resolved by Docker's internal DNS — see [§C8](#c8-ra5--network-verification-of-the-deployment).
4. The response travels back through the same chain.

No service except nginx is reachable from the host. Internal-only ports use `expose:` (visible only to other containers on the network), not `ports:` (which would publish them on the host).

### Evidence.

- **Compose file showing the five services and the network**: [docker-compose.yaml](../docker-compose.yaml). The five services and the `feriaapp-network` bridge are declared explicitly.
- **Running stack**: [docker-compose-up-ps.png](docker-compose-up-ps.png) — `docker-compose up --build -d` followed by `docker-compose ps` shows all five services in `Up` state, with only `feriaapp-nginx` publishing ports to the host.
- **End-to-end chain working**: [backend-curl-and-logs.png](backend-curl-and-logs.png) — three HTTPS curl requests against `https://localhost` returning 200/200/401, with the corresponding entries appearing in `docker logs feriaapp-backend`. This single capture exercises the whole chain *browser → nginx → backend → mongo*.
- **Network membership of the five services**: [docker-network-inspect.png](docker-network-inspect.png) — `docker network inspect feriaapp_feriaapp-network` lists the five containers (`feriaapp-nginx`, `feriaapp-frontend`, `feriaapp-backend`, `feriaapp-public`, `feriaapp-mongo`) each with its own IPv4 address inside the `172.23.0.0/16` bridge subnet, confirming they all share the same private network.

---

## c2 (RA1) — Docker implementation.

### What the criterion asks for.

The rubric's "Excellent" level requires a fully *dockerized* and reproducible project with correct Dockerfile(s), a `compose.yaml` with clear instructions in DEPLOY, internal networks and clean ports (only what is necessary is exposed), volumes for persistence, properly managed environment variables (including `.env.example` and *not* committing secrets). If an image is published, evidence with a registry link and tag. Evidence with `docker compose up -d`, `docker compose ps`, startup logs and a curl test.

### How it is implemented.

#### Dockerfiles.

Each application service has its own Dockerfile, kept minimal:

- [backend/Dockerfile](../backend/Dockerfile) — `node:20-alpine`, installs production dependencies only (`npm install --production`), copies sources and runs `node server.js`.
- [frontend/Dockerfile](../frontend/Dockerfile) — **multi-stage build**: stage 1 builds the React app with `npm run build`; stage 2 serves the resulting `dist/` from `nginx:alpine`. The final image carries no Node.js runtime or `node_modules`.
- [public-web/Dockerfile](../public-web/Dockerfile) — `nginx:alpine` serving static files.

#### Compose file.

[docker-compose.yaml](../docker-compose.yaml) declares the five services, two named volumes and one bridge network. Key design decisions:

- **Only nginx publishes ports to the host** (`ports: 80:80, 443:443`). Every other service uses `expose:` so its port is reachable only from inside `feriaapp-network`. This keeps the attack surface to a single entry point.
- **Persistence is explicit** with two named volumes:
  - `mongo-data` mounted at `/data/db` — database state.
  - `backend-uploads` mounted at `/app/uploads` — administrator-uploaded caseta images.

  Both survive `docker-compose down` and are only removed with `down -v`.
- **Configuration files are mounted read-only** into nginx (`./nginx.conf` and `./nginx/ssl/` with `:ro`).
- **Secrets come from `.env` substitution**: the backend service reads `${JWT_SECRET}`, `${GITHUB_TOKEN}`, `${GITHUB_OWNER}`, `${GITHUB_REPO}` from the environment, never hard-coded in the compose file.

#### Environment variables and secrets.

- A committed [.env.example](../.env.example) documents every variable the deployment needs (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`).
- The real `.env` is **not committed**. It is listed in [.gitignore](../.gitignore) — see [§C7](#c7-ra4--deployment-files-and-artifacts) for the full list of artifacts excluded from the repository.
- The TLS certificate and key (`nginx/ssl/*.crt`, `nginx/ssl/*.key`) are also gitignored and regenerated on each clone with the OpenSSL command documented in [08-despliegue.md §HTTPS configuration](08-despliegue.md#https-configuration).

#### Image registry.

**Not applicable for this project.** Images are built locally from the Dockerfiles above; the project is not deployed to a public host, so there is no benefit to pushing the images to Docker Hub or GHCR. If the project moved to a VPS this would change — see the production note at the end of [08-despliegue.md §HTTPS configuration](08-despliegue.md#https-configuration).

The locally built images can be listed with `docker images | findstr feriaapp` — see [docker-images-list.png](docker-images-list.png), which shows the three custom-built images (`feriaapp-backend`, `feriaapp-frontend`, `feriaapp-public-web`). The remaining two services (`mongo:7` and `nginx:alpine`) reuse official images from Docker Hub without modification, which is why they don't appear in the filtered listing.

### Evidence.

- **Reproducible startup**: [08-despliegue.md §Deployment process](08-despliegue.md#deployment-process-1) lists the four-command sequence (`git clone` → `cp .env.example .env` → `docker-compose up --build` → `seedAdmin.js`).
- **Running stack** (`docker-compose up --build -d` + `docker-compose ps`): [docker-compose-up-ps.png](docker-compose-up-ps.png) — five services Up, only nginx with host port mappings.
- **Clean teardown** (`docker-compose down`): [docker-compose-down.png](docker-compose-down.png) — all five containers and the network removed.
- **Curl test through the full stack**: [backend-curl-and-logs.png](backend-curl-and-logs.png) — three HTTPS requests with their corresponding backend log lines (boot sequence + per-request morgan entries).
- **Backend startup logs (isolated)**: [docker-logs-startup.png](docker-logs-startup.png) — first lines of `docker logs feriaapp-backend` showing `Server running on port 5000` and `MongoDB connected: mongo`, confirming both that the Node process booted correctly and that it resolved the `mongo` hostname inside the Docker network.
- **HTTPS verification**: [https-curl-verification.png](https-curl-verification.png) — `curl -I http://localhost` returns `301 → https://localhost/`; `curl -k -I https://localhost/api/fairs` returns `200 OK` with Helmet security headers.
- **Custom-built images**: [docker-images-list.png](docker-images-list.png).

---

## C7 (RA4) — Deployment files and artifacts.

### What the criterion asks for.

The rubric's "Excellent" level requires the project to clearly organize and document the management of deployment artifacts: which files are necessary, which ones are generated, which ones must **not** be uploaded to the repository, what image is used or published, what data must persist and how. Evidence with links to the files in the repo, image/tag if it exists, and a brief explanation of the process.

### Files required to deploy.

Every file below must exist for the stack to come up. All of them are committed to the repository.

| File | Role | Link |
|---|---|---|
| `docker-compose.yaml` | Defines the five services, the bridge network, the two named volumes (`mongo-data`, `backend-uploads`) and the variables that come from `.env`. | [docker-compose.yaml](../docker-compose.yaml) |
| `backend/Dockerfile` | Builds the Node.js API image. | [backend/Dockerfile](../backend/Dockerfile) |
| `frontend/Dockerfile` | Multi-stage build for the React admin panel. | [frontend/Dockerfile](../frontend/Dockerfile) |
| `public-web/Dockerfile` | Builds the public-website static image. | [public-web/Dockerfile](../public-web/Dockerfile) |
| `nginx.conf` | Reverse-proxy routing rules and HTTPS configuration. | [nginx.conf](../nginx.conf) |
| `.env.example` | Template documenting every variable the deployment needs. The real `.env` is created from this file. | [.env.example](../.env.example) |
| `backend/package.json`, `frontend/package.json`, `public-web/package.json` | Dependency manifests consumed by `npm install` inside each Dockerfile. | [backend](../backend/package.json), [frontend](../frontend/package.json), [public-web](../public-web/package.json) |
| `.github/workflows/ci.yml` | CI pipeline — runs on every push to `develop` and `main`. | [.github/workflows/ci.yml](../.github/workflows/ci.yml) |

### Files generated during build or runtime.

These are produced automatically and are **not** committed:

| Generated file / artifact | When | Where | Why it is not committed |
|---|---|---|---|
| Docker images (`feriaapp-backend`, `feriaapp-frontend`, `feriaapp-public-web`) | `docker-compose up --build` | Local Docker daemon — see [docker-images-list.png](docker-images-list.png) | Rebuilt from sources on demand. |
| `frontend/dist/` | `npm run build` (inside the frontend Dockerfile, stage 1) | Inside the build container — discarded after `COPY --from=build` | Build output, regenerable. |
| `nginx/ssl/feriaapp.crt` and `feriaapp.key` | Manual OpenSSL command (see [08-despliegue.md §HTTPS configuration](08-despliegue.md#https-configuration)) | `nginx/ssl/` on the host | Self-signed certificate for *this* developer's machine — must not leak. |
| `.env` | Manually copied from `.env.example` and edited with real values | Project root | Contains secrets. |
| JSON publication files (`fairs.json`, `casetas.json`, `menus.json`, `concerts.json`) | When the admin presses "Publish" | Pushed via Octokit to the `gh-pages` branch under `data/` | They are published artifacts, not source. |
| Caseta images uploaded by the admin | At runtime when uploading | `backend-uploads` Docker volume (mounted at `/app/uploads`) and replicated to `gh-pages/uploads/` on publish | User-generated content, not source. |
| `node_modules/` (each project) | `npm install` | Inside each container (and locally for development) | Reproducible from `package-lock.json`. |
| MongoDB data files | At runtime | `mongo-data` Docker volume (mounted at `/data/db`) | Database state. |

### Files that must NOT be committed to the repository.

The [.gitignore](../.gitignore) enforces this. Relevant excerpt:

```gitignore
# Entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build
dist/
build/
.vite/

# Logs
logs/
*.log

# Dependencias
node_modules/
frontend/node_modules/
backend/node_modules/

# Docker
*.env

# SSL certificates (generated locally, never committed)
nginx/ssl/*.key
nginx/ssl/*.crt

# Insomnia
docs/insomnia/*.json
docs/insomnia/*.yaml
```

Reasoning per group:

- **Secrets** (`.env*`, `*.env`) — would expose `JWT_SECRET`, the GitHub PAT, MongoDB credentials.
- **TLS material** (`nginx/ssl/*.key`, `*.crt`) — even self-signed certs should not be reused across machines; each developer regenerates them locally.
- **Build outputs** (`dist/`, `build/`, `.vite/`) — regenerable from sources; would inflate the repo and produce noisy diffs.
- **Dependencies** (`node_modules/`) — reproducible from the lockfile; large and platform-specific.
- **Logs** (`logs/`, `*.log`) — runtime noise, may contain sensitive data.
- **Insomnia exports** — local API-client state, not part of the deployable project.

### Data persistence.

Two named Docker volumes guarantee that all stateful data survives a container restart or a `docker-compose down`:

| Data | Container path | Backed by | Survives `docker-compose down`? | Survives `down -v`? |
|---|---|---|---|---|
| MongoDB data files | `/data/db` (in `feriaapp-mongo`) | Named volume `mongo-data` | ✅ Yes | ❌ No (intentional) |
| Caseta image uploads | `/app/uploads` (in `feriaapp-backend`) | Named volume `backend-uploads` | ✅ Yes | ❌ No (intentional) |
| nginx config | `/etc/nginx/nginx.conf` | Bind-mount `./nginx.conf` (`:ro`) | ✅ Yes | ✅ Yes (it's a host file) |
| TLS material | `/etc/nginx/ssl/` | Bind-mount `./nginx/ssl/` (`:ro`) | ✅ Yes | ✅ Yes |

Both named volumes are declared at the bottom of [docker-compose.yaml](../docker-compose.yaml):

```yaml
volumes:
  mongo-data:
  backend-uploads:
```

And mounted into their respective services with:

```yaml
backend:
  ...
  volumes:
    - backend-uploads:/app/uploads

mongo:
  ...
  volumes:
    - mongo-data:/data/db
```

The persistence of the `backend-uploads` volume was verified in practice by writing a test file inside the backend container, tearing the entire stack down with `docker-compose down`, restarting it with `docker-compose up -d` and confirming the file was still present at `/app/uploads/` after the new container was built from scratch. This proves that uploaded caseta images survive container recreation. Evidence: [docker-volume-persistence.png](docker-volume-persistence.png) — full captured sequence: `echo` creating `test.txt` → first `ls` showing it → `docker-compose down` removing the five containers and the network → `docker-compose up -d` recreating everything from scratch → final `ls` showing `test.txt` is still there.

### Image and registry.

No Docker image is published to a public registry. The project runs locally with images built from the committed Dockerfiles, so there is no `image:tag` to reference. If the project were to be deployed on a VPS, the natural step would be to push tagged images to GHCR (the same GitHub account that owns the repo) and reference them from the compose file with `image: ghcr.io/pablitoclavito04/feriaapp-backend:<tag>`.

### Evidence.

- **Locally built images**: [docker-images-list.png](docker-images-list.png) — output of `docker images | findstr feriaapp` listing the three custom-built images with their IDs and sizes.
- **Volume for caseta uploads**: [docker-volume-uploads.png](docker-volume-uploads.png) — `docker volume inspect feriaapp_backend-uploads` showing the volume's mount point on the Docker host (`/var/lib/docker/volumes/feriaapp_backend-uploads/_data`), creation timestamp and Compose labels.
- **End-to-end persistence test for `backend-uploads`**: [docker-volume-persistence.png](docker-volume-persistence.png) — captured run of the test described above, demonstrating that a file written into `/app/uploads` survives a full `docker-compose down` + `up -d` cycle.
- **Volume for MongoDB**: [docker-volume-mongo-data.png](docker-volume-mongo-data.png) — same inspection for `feriaapp_mongo-data`, confirming long-term persistence (`CreatedAt: 2026-04-25`).
- **`.gitignore` content** — see the excerpt above; full file at [.gitignore](../.gitignore).

---

## C8 (RA5) — Network verification of the deployment.

### What the criterion asks for.

The rubric's "Excellent" level requires a clear and reproducible network verification: documented URL or hostname, published port, main routes, which service responds, and front/proxy/backend communication. Evidence with curl, the output of `docker compose ps` and, where applicable, name resolution via `/etc/hosts`, local DNS or equivalent. The student has checked what they did and what each result means.

### URLs, ports and routing.

| URL | Host port | Container terminating the request | Internal target | Description |
|---|---|---|---|---|
| `http://localhost/...` | 80 | `feriaapp-nginx` | (redirects) | All traffic redirected to HTTPS with `301 Moved Permanently`. |
| `https://localhost/` | 443 | `feriaapp-nginx` | `frontend:80` | Administration panel (React). |
| `https://localhost/api/...` | 443 | `feriaapp-nginx` | `backend:5000` | REST API (Express). |
| `https://localhost/api/docs` | 443 | `feriaapp-nginx` → `backend:5000` | Swagger UI | Interactive API documentation. |
| `https://localhost/public/...` | 443 | `feriaapp-nginx` | `public-web:80` | Public website (static). |
| `https://pablitoclavito04.github.io/FeriaApp/` | 443 (CDN) | GitHub Pages | n/a | Public site for end users — separate deployment. |

The routing rules live in [nginx.conf](../nginx.conf). Only ports `80` and `443` are published to the host (see `ports:` in [docker-compose.yaml](../docker-compose.yaml)); every other port (`5000`, `27017`, the two internal `80`s of `frontend` and `public-web`) is `expose:`d only to the Docker network.

### Front ↔ proxy ↔ backend ↔ database communication.

Step-by-step trace of a single authenticated write request — `POST https://localhost/api/fairs`:

1. **Browser → nginx (host:443)**. The browser opens a TLS connection to `localhost:443`. nginx terminates TLS using `nginx/ssl/feriaapp.crt`. The `Strict-Transport-Security` header in the response asks the browser to keep using HTTPS.
2. **nginx → backend (internal)**. The path matches `location /api/` in `nginx.conf`, so nginx proxies the request to `http://backend:5000`. The hostname `backend` is resolved by **Docker's embedded DNS server** (the `feriaapp_feriaapp-network` bridge), not by `/etc/hosts`. No host-side DNS or hosts-file change is needed.
3. **Backend processes the request**. The `auth` middleware validates the JWT in `Authorization: Bearer ...`. If invalid, it responds `401 UNAUTHORIZED` and the chain stops.
4. **Backend → MongoDB (internal)**. The Mongoose connection string is `mongodb://mongo:27017/feriaApp`. Again, `mongo` is resolved by Docker DNS to the IP of the `mongo` container inside `feriaapp_feriaapp-network`.
5. **Response travels back** through the same chain. `morgan` logs the request in the backend container; nginx logs the upstream response code.

The whole chain is internal except for the first hop. From outside the host there is **no way** to reach `backend`, `mongo`, `frontend` or `public-web` directly — they are not bound to any host port.

### Network membership and IP assignment.

The output of `docker network inspect feriaapp_feriaapp-network` (see [docker-network-inspect.png](docker-network-inspect.png)) lists the five containers as members of the same bridge network with the following IPs:

| Container | IPv4 inside the bridge |
|---|---|
| `feriaapp-mongo` | 172.23.0.2 |
| `feriaapp-public` | 172.23.0.3 |
| `feriaapp-backend` | 172.23.0.4 |
| `feriaapp-frontend` | 172.23.0.5 |
| `feriaapp-nginx` | 172.23.0.6 |

The network uses the subnet `172.23.0.0/16` with gateway `172.23.0.1`. These IPs are assigned dynamically by Docker on each `up`; service-to-service communication never relies on them — services always use the **service name** as the hostname (`mongo`, `backend`, `frontend`, `public-web`), and Docker's embedded DNS resolves them.

### Verification commands and what each output means.

The following commands are reproducible from any clone of the repository after `docker-compose up --build -d`.

```powershell
# 1. Confirm all five containers are up and only nginx publishes ports.
docker-compose ps
```

Expected: five rows in `Up` state; the only non-empty `Ports` column is on `feriaapp-nginx` (`0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp`). Evidence: [docker-compose-up-ps.png](docker-compose-up-ps.png).

```powershell
# 2. Confirm the HTTP→HTTPS redirect at the proxy.
curl -I http://localhost
```

Expected: `HTTP/1.1 301 Moved Permanently` with `Location: https://localhost/`. This proves nginx is serving on port 80 and enforcing HTTPS. Evidence: [https-curl-verification.png](https-curl-verification.png) (top half).

```powershell
# 3. Confirm the proxy reaches the backend over HTTPS.
curl -k -I https://localhost/api/fairs
```

Expected: `HTTP/1.1 200 OK`, `Content-Type: application/json`, plus Helmet headers (`Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`). The `200` means the request was successfully proxied from nginx to `backend:5000` and back. The `-k` flag tells curl to accept the self-signed certificate. Evidence: [https-curl-verification.png](https-curl-verification.png) (bottom half).

```powershell
# 4. Confirm an unauthenticated write is rejected (auth chain working).
curl -k -X POST https://localhost/api/fairs -H "Content-Type: application/json" -d '{}'
```

Expected: `401 UNAUTHORIZED`. This confirms the request reached the Express auth middleware. Evidence: [backend-curl-and-logs.png](backend-curl-and-logs.png).

```powershell
# 5. Confirm Docker-internal name resolution from inside a container.
docker exec feriaapp-backend ping -c 2 mongo
```

Expected: the hostname `mongo` is resolved to a container IP on `feriaapp_feriaapp-network` (`172.23.0.2` in the current run), and two ICMP replies come back. This proves that **service-to-service name resolution works without any `/etc/hosts` entry on the host** — Docker provides the DNS automatically. Evidence: [docker-internal-dns.png](docker-internal-dns.png).

```powershell
# 5b. Confirm real HTTP communication between proxy and backend by service name.
docker exec feriaapp-nginx wget -qO- http://backend:5000/api/fairs
```

Expected: a valid JSON payload returned by the backend (e.g. `{"total":0,"page":1,"pages":0,"data":[]}`). This goes one step further than the previous `ping`: it shows that nginx — the reverse proxy — can reach the backend **over HTTP, using the service name `backend` as the hostname**, and that the backend answers with a real API response. It is the strongest piece of evidence that the front/proxy/backend chain works end-to-end inside the Docker network. Evidence: [docker-internal-wget.png](docker-internal-wget.png).

```powershell
# 6. Inspect the network membership.
docker network inspect feriaapp_feriaapp-network
```

Expected: a JSON document listing all five containers as members of the `bridge` network, each with its internal IPv4 in `172.23.0.0/16`. Evidence: [docker-network-inspect.png](docker-network-inspect.png).

### Note on `/etc/hosts` / local DNS.

No host-side `/etc/hosts` modification is required for this project — `localhost` is sufficient because nginx is the only entry point and it accepts requests for any `Host` header. Inside the Docker network, name resolution is provided by Docker itself, not by `/etc/hosts`. If a custom local domain were desired (e.g. `feriaapp.local`), the standard approach would be to add `127.0.0.1 feriaapp.local` to the host's `hosts` file and reissue the self-signed certificate with that CN; this is not done here because `localhost` already serves the purpose for a local developer setup.

### Evidence index.

| What it proves | Capture |
|---|---|
| Five services up, only nginx publishes ports | [docker-compose-up-ps.png](docker-compose-up-ps.png) |
| Clean teardown | [docker-compose-down.png](docker-compose-down.png) |
| HTTP→HTTPS redirect + HTTPS reaches backend (Helmet headers visible) | [https-curl-verification.png](https-curl-verification.png) |
| End-to-end request chain (curl + backend logs) | [backend-curl-and-logs.png](backend-curl-and-logs.png) |
| Public website reachable on its real domain | [public-site-github-pages.png](public-site-github-pages.png) |
| Docker-internal DNS (`ping mongo` from `feriaapp-backend`) | [docker-internal-dns.png](docker-internal-dns.png) |
| Real HTTP call between proxy and backend by service name (`wget` from nginx to `backend:5000`) | [docker-internal-wget.png](docker-internal-wget.png) |
| Backend startup logs (`Server running on port 5000`, `MongoDB connected: mongo`) | [docker-logs-startup.png](docker-logs-startup.png) |
| Network membership (5 containers on `feriaapp_feriaapp-network` with their IPs) | [docker-network-inspect.png](docker-network-inspect.png) |

---

## Quick mapping criterion → section → evidence.

| Criterion | Section in this doc | Key evidence |
|---|---|---|
| **c1** Architecture | [§c1](#c1-ra1--application-architecture) | Architecture diagram in this doc · [docker-compose.yaml](../docker-compose.yaml) · [docker-compose-up-ps.png](docker-compose-up-ps.png) · [docker-network-inspect.png](docker-network-inspect.png) |
| **c2** Docker | [§c2](#c2-ra1--docker-implementation) | The four [Dockerfiles](../backend/Dockerfile) · [docker-compose.yaml](../docker-compose.yaml) · [.env.example](../.env.example) · [.gitignore](../.gitignore) · [docker-compose-up-ps.png](docker-compose-up-ps.png) · [docker-images-list.png](docker-images-list.png) · [docker-logs-startup.png](docker-logs-startup.png) · [backend-curl-and-logs.png](backend-curl-and-logs.png) |
| **C7** Artifacts | [§C7](#c7-ra4--deployment-files-and-artifacts) | Files-required / files-generated / files-not-committed tables · [.gitignore](../.gitignore) · `mongo-data` and `backend-uploads` volumes in [docker-compose.yaml](../docker-compose.yaml) · [docker-volume-mongo-data.png](docker-volume-mongo-data.png) · [docker-volume-uploads.png](docker-volume-uploads.png) · [docker-volume-persistence.png](docker-volume-persistence.png) · [docker-images-list.png](docker-images-list.png) |
| **C8** Network | [§C8](#c8-ra5--network-verification-of-the-deployment) | URL/port/route table · curl commands 1–6 · [docker-network-inspect.png](docker-network-inspect.png) · [docker-internal-dns.png](docker-internal-dns.png) · [docker-internal-wget.png](docker-internal-wget.png) · [https-curl-verification.png](https-curl-verification.png) · [backend-curl-and-logs.png](backend-curl-and-logs.png) |
