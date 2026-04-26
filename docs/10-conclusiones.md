# 10. Conclusions.

## Critical evaluation against initial objectives.

The main objective of the project was to develop a web platform for the Feria de Jerez that solved a real problem: the lack of an official, accessible, up-to-date app that works without an internet connection inside the fairground.

FeriaApp meets that objective with an architecture that clearly differentiates the two user profiles: the administrator, who manages data from a private panel, and the visitor, who consults information from a fast, PWA-installable public website.

---

## Degree of scope completion.

| Feature | Status | Notes |
|---|---|---|
| MERN administration panel | ✅ Completed | Full CRUD for fairs, stalls, menus and concerts |
| JWT authentication | ✅ Completed | Secure login with bcrypt and JWT |
| Map location editor | ✅ Completed | Leaflet.js with official fairground plan |
| Image uploads | ✅ Completed | Multer for stall images |
| Automatic publishing with Octokit | ✅ Completed | One click publishes the entire public website |
| Static public website | ✅ Completed | HTML/CSS/JS deployed on GitHub Pages |
| Installable PWA | ✅ Completed | Service Worker + manifest.json |
| Offline functionality | ✅ Completed | Service Worker with cache |
| Interactive map | ✅ Completed | Leaflet.js on the public website |
| Smart search | ✅ Completed | Fuse.js with typo tolerance |
| Menu PDF download | ✅ Completed | jsPDF generated on the client |
| Docker containerisation | ✅ Completed | 5 services in docker-compose |
| Nginx as reverse proxy | ✅ Completed | Routing between frontend, API and public website |
| CI/CD pipeline | ✅ Completed | GitHub Actions with tests, build and Docker |
| Unit tests | ✅ Completed | 208 tests with Jest + Supertest covering all API endpoints |
| Documentation | ✅ Completed | 10 sections in /docs |

---

## Lessons learned.

### Secrets management in Git.

The biggest technical problem of the project was managing the `.env` file with the GitHub token. When that token was accidentally uploaded to the `gh-pages` branch, GitHub detected it and blocked all pushes. Resolving this required using `git filter-branch` repeatedly to rewrite the history. The lesson is clear: secrets must never be in the code, and `.gitignore` must be correctly configured from the first commit.

### Hybrid architecture: Advantages and complexity.

The hybrid architecture (MERN + GitHub Pages) was the most important technical decision of the project. The advantages are clear: the public website is extremely fast, free and works without a server. But it adds complexity to the workflow: every time the public website is modified, the files must be manually copied to the `gh-pages` branch. In the future, this would be automated with GitHub Actions.

### Docker in shared development environments.

Working with Docker on a computer that already has other containers running (MongoDB, Nginx, etc.) causes port conflicts. It is important to document clearly which containers must be stopped for the project to work correctly.

### ES Modules vs CommonJS in the Node.js Ecosystem.

The migration of libraries like `@octokit/rest` to pure ES Modules breaks compatibility with tools like Jest that use CommonJS. The mock solution is valid but highlights that the Node.js ecosystem is still in transition.

---

## Proposed future improvements.

### Short term.

- **Expand automated tests:** Cover all API endpoints with Jest and Supertest, not just authentication.
- **Sample data seed:** Create a script that populates the Docker database with example data to make demos easier.

### Medium term.

- **Support for multiple active fairs:** Currently only the fair marked as active is displayed. An edition selector could be added to the public website.
- **Statistics dashboard:** Show how many visits the public website has had, which stalls are most visited, etc.
- **Push notifications:** Inform visitors who have the app installed when the schedule is updated.

### Long term.

- **Generalisation to other events:** The FeriaApp architecture is reusable for any event with stalls, menus and a schedule. It could be turned into a SaaS for fair and festival organisers.
- **Native app with React Native:** Develop a native version for iOS and Android that takes advantage of device capabilities (GPS for navigation inside the venue, native notifications, etc.).
- **City Council integration:** Connect directly with the Jerez City Council API to automatically import official data for each edition.

---

## Final reflection.

FeriaApp was born from observing an everyday problem: the difficulty of finding information during the Feria de Jerez. The result is a functional platform that solves that problem in a simple and scalable way.

The project has allowed the practical application of all concepts from the course: full stack development with the MERN stack, deployment with Docker, continuous integration with GitHub Actions, and working with external APIs such as the GitHub API. Beyond the technical aspects, it has been an exercise in decision-making under real constraints: limited time, changing requirements and unexpected problems such as secrets management in Git.

The code is available at: https://github.com/pablitoclavito04/FeriaApp
The public website is available at: https://pablitoclavito04.github.io/FeriaApp/