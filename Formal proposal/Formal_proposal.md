# FeriaApp.

- **Author:** Pablo Sanz Aznar.
- **Date:** March 10, 2025.
- **Degree:** Web Application Development.

---

## Table of contents:

1. [Needs Identification](#1-needs-identification)
2. [Business Opportunities](#2-business-opportunities)
3. [Project Type](#3-project-type)
4. [Specific Features](#4-specific-features)
5. [Legal Obligations and Prevention](#5-legal-obligations-and-prevention)
6. [Grants and Subsidies](#6-grants-and-subsidies)
7. [Work Plan](#7-work-plan)

---

## 1. Needs identification.

### Problem description:

Local fairs in Spain, such as the Feria de Jerez, are events of great cultural and economic importance that attract thousands of visitors over several days. However, there is currently no official digital platform that centralizes their information in a structured and accessible way.

Visitors, especially those unfamiliar with the fair, face a series of concrete problems:

- Information about casetas, menus and schedules is scattered across social media, outdated PDFs or simply not available online.
- During the fair itself, mobile coverage is limited due to the concentration of people, making it difficult to consult information in real time.
- There is no easy way to locate a specific caseta within the fairground.
- Visitors are unaware of the concert and activity schedule until they arrive on site.

### How the need was detected:

The need was identified through a proposal from the workplace tutor during the work placement period (FFEOE), who highlighted the absence of a modern digital solution for this type of local events.

### Target users:

- **Fair visitors:** People attending the fair who need to find their way around, check menus, schedules and locate casetas quickly and without depending on an internet connection.
- **Platform administrator:** The developer themselves, who loads and maintains data using official public information available from sources such as the Jerez City Council.

---

## 2. Business opportunities.

### Market analysis:

There are currently some partial solutions for events and fairs:

| Solution | Description | Limitations |
|---|---|---|
| Official Jerez City Council website | Basic fair information | Not interactive, no map, no detailed schedule |
| Social media (Instagram, Facebook) | Caseta posts | Scattered information, not centralized |
| Generic event apps (Fever, Eventbrite) | Ticket and event management | Not oriented to local fairs, no caseta map |
| Previous Android TFG app | Caseta map on Android | Android only, no real deployment, invented data |

### Differential value proposition:

FeriaApp differs from existing solutions in several key aspects:

- **Centralization:** All fair information in one structured and accessible place.
- **Offline functionality:** Thanks to PWA technology, the application works without an internet connection once loaded, which is especially useful in environments with poor coverage such as a fair.
- **Static page generation:** The public website is automatically generated as static HTML and published on GitHub Pages, ensuring minimum load times.
- **Interactive map:** Visualization of casetas on the official venue map, imported directly from the council's public resources.
- **Smart search:** With tolerance for typographical errors using Fuse.js, making search easier for any type of user.

### Potential and scalability:

Although the main use case is the Feria de Jerez, the platform is designed generically to scale to any other local fair or event, simply by adding new events from the administration panel. This gives it real potential beyond a single edition and makes it a reusable solution year after year.

---

## 3. Project type.

### Application type:

FeriaApp is a web application with a hybrid architecture composed of two distinct parts:

- **Administration panel (SPA):** Single page application developed with React 18, which allows managing all fair information. Only accessible to the administrator via JWT authentication.

- **Public website (PWA + Static page):** Static page automatically generated and published on GitHub Pages every time the administrator updates the data. It is designed as a Progressive Web App (PWA), which allows it to be installed on mobile and consulted without an internet connection.

### Architecture justification:

This hybrid architecture is justified by the specific needs of the project:

- **Static page generation** eliminates the need for a server for the public website, reducing costs and improving performance.
- The **PWA** solves the problem of poor mobile coverage at fairs, allowing previously downloaded information to be consulted.
- The **MERN panel** provides a complete administration interface with REST API, role-based authentication and MongoDB database.

### Technical architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    ADMINISTRATOR                        │
│                                                         │
│  React SPA (admin panel) ──► Express REST API           │
│                                    │                    │
│                               MongoDB Atlas             │
│                                    │                    │
│                          Static generation              │
│                                    │                    │
│                          Octokit ──► GitHub Pages       │
└─────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────┐
│                     VISITOR                             │
│                                                         │
│          Static PWA (GitHub Pages)                      │
│          - Works offline                                │
│          - Installable on mobile                        │
│          - Interactive map                              │
│          - Smart search                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Specific features.

### MVP - Required functionalities:

| Priority | Feature | Description |
|---|---|---|
| High | JWT Authentication | Administrator login with roles |
| High | Fair management | Full CRUD for fairs |
| High | Caseta management | Full CRUD with map location |
| High | Menu management | CRUD for dishes and prices per caseta |
| High | Schedule management | CRUD for concerts with date and time |
| High | Static page generation | Automatic build and push to GitHub Pages |
| High | Public PWA website | Installable and offline-functional page |
| High | Interactive map | Caseta visualization with Leaflet.js |
| High | Official map import | Upload of official map image/PDF from city council |
| High | Smart search | Typographic tolerance search with Fuse.js |
| High | Docker deployment | Full containerization of admin panel |
| High | CI/CD with GitHub Actions | Continuous integration and deployment pipeline |

### Optional features (Future Improvements):

| Priority | Feature |
|---|---|
| Medium | Support for multiple simultaneous fairs |
| Medium | Advanced filters by caseta type or activity |
| Low | Push notifications for concert reminders |
| Low | Usage statistics for the administration panel |

### Technical requirements:

**Frontend (administration panel):**
- React 18
- JavaScript ES6+
- Vite
- SCSS
- React Router DOM
- Axios
- Context API
- JWT Decode
- Leaflet.js

**Frontend (public website):**
- Static HTML/CSS/JS generated from Node.js
- Leaflet.js for the interactive map
- Fuse.js for smart search
- Service Workers and Web App Manifest for PWA

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT + bcrypt
- express-validator
- Helmet.js
- Morgan
- Swagger
- Octokit (GitHub API integration)

**Database:**
- MongoDB local in development
- MongoDB Atlas in production

**Deployment:**
- Docker and Docker Compose
- Nginx as reverse proxy
- GitHub Actions for CI/CD
- GitHub Pages for static public website

---

## 5. Legal obligations and prevention.

### Applicable regulations:

**GDPR (General Data Protection Regulation):**
The application only manages administrator data (username and encrypted password). Public website visitors do not need to register or provide personal data, so the GDPR impact is minimal. Nevertheless, the following measures will be implemented:

- Passwords are stored encrypted with bcrypt.
- JWT tokens have a defined expiration time.
- No personal data from visitors is stored.

**LSSI-CE (Law on Information Society Services):**
- The public website will include a legal notice with the application owner's information.
- It will be clearly stated that the information comes from official public sources.

**Intellectual Property:**
- The data used (maps, schedules, menus) comes from official public sources such as the Jerez City Council, so its use is permitted.
- Original sources will be cited in the application.

### Security measures:

- JWT authentication with token expiration.
- Password encryption with bcrypt.
- Server-side data validation with express-validator.
- Security headers with Helmet.js.
- Environment variables managed with dotenv.
- Database access restricted to the backend.
- Administration panel protected by authentication.

### Web accessibility:

The public website will comply with the **WCAG 2.1 level AA** standard:

- Minimum color contrast ratio of 4.5:1.
- Keyboard-accessible navigation.
- Alternative text for images.
- Responsive design for any device.
- Readable typography and appropriate font sizes.

---

## 6. Grants and subsidies.

### Available grants:

**Kit Digital:**
Spanish Government programme for the digitalization of small businesses and self-employed workers. Although this project is a final degree project and not a business, the type of solution developed (digitalization of local events) fits the "Internet presence and website" category of the programme, which could be relevant if the project is continued in a professional context.

**ENISA (National Innovation Company):**
Offers participatory loans for young entrepreneurs. Should the project be continued as a commercial product, this could be a funding avenue to explore.

### Free and low-cost resources used:

| Resource | Cost | Use in the project |
|---|---|---|
| GitHub | Free | Version control and CI/CD |
| GitHub Pages | Free | Static public website publication |
| MongoDB Atlas (free tier) | Free | Production database |
| Docker Hub | Free | Docker image publishing |
| Leaflet.js | Free (open source) | Interactive maps |
| Fuse.js | Free (open source) | Smart search |
| Octokit | Free (open source) | GitHub API integration |
| Figma (free plan) | Free | Prototyping and style guide |
| Visual Studio Code | Free | Development environment |

The total cost of the project is **€0**, using exclusively free or open source tools.

---

## 7. Work plan.

### Methodology:

**SCRUM** will be applied in individual mode with two-week sprints. At the end of each sprint a demonstration video (maximum 5 minutes) will be recorded showing the progress made.

**Management tools:**
- **GitHub Projects:** for backlog management and task tracking.
- **GitHub:** for version control with feature branches.
- **Toggl Track:** for recording hours spent.

**GitHub Projects board configuration:**

| Field | Values |
|---|---|
| Status | Backlog, To Do, In Progress, Done |
| Sprint | 0, 1, 2, 3, 4 |
| Priority | High, Medium, Low |
| Estimation | Estimated hours |
| Category | Frontend, Backend, DB, DevOps, Testing, Docs |

### Schedule:

#### Sprint 0 (March 10 - 23): Configuration and design.
- Development environment setup.
- Repository and GitHub Projects creation.
- Figma prototyping (all screens).
- Style guide: colors, typography, components.
- MongoDB data model design.
- REST API endpoint design.

**Deliverable:** Functional Figma prototype + documented architecture.

#### Sprint 1 (March 24 - April 6): Backend and authentication.
- Node.js + Express + MongoDB setup.
- Model implementation: Fair, Caseta, Menu, Concert.
- Full REST API with all CRUD endpoints.
- JWT authentication system with roles.
- API documentation with Swagger.
- Endpoint testing with Insomnia.

**Deliverable:** Functional and documented REST API.

#### Sprint 2 (April 7 - 20): Administration panel.
- Administration panel development in React.
- Forms for managing fairs, casetas, menus and concerts.
- REST API integration via Axios.
- Octokit implementation for static generation and push to GitHub Pages.
- Official map image/PDF import.

**Deliverable:** Functional administration panel with static generation.

#### Sprint 3 (April 21 - May 4): Public PWA website.
- Static public website development.
- Leaflet.js integration for interactive map.
- Fuse.js smart search implementation.
- Service Workers and manifest configuration for PWA.
- Offline functionality verification.

**Deliverable:** Functional and installable public PWA website.

#### Sprint 4 (May 5 - 18): Deployment and documentation.
- Full Dockerization of the administration panel.
- Nginx reverse proxy configuration.
- CI/CD pipeline with GitHub Actions.
- Unit and integration testing of the backend.
- Complete documentation in /docs.
- Loading real data from the Feria de Jerez.

**Deliverable:** Deployed application and complete documentation.

#### Final week (May 19 - 22): Review and submission.
- General application review.
- Bug fixes.
- Final project submission.

### Milestones summary:

| Date | Milestone |
|---|---|
| March 23 | Functional Figma prototype and documented architecture |
| April 6 | Functional and documented REST API |
| April 20 | Administration panel with static generation |
| May 4 | Functional public PWA website |
| May 18 | Deployed and documented application |
| May 22 | Final submission |