# 01. Introduction, objectives and background.

## Origin of the idea and project motivation.

FeriaApp was born from a need identified during the internship period (FFEOE), where the workplace tutor highlighted the absence of a modern digital platform that centralises information about local fairs in Spain.

Local fairs, such as the Feria de Jerez de la Frontera, are events of great cultural and economic importance that attract thousands of visitors over several days. However, information about stalls (casetas), menus, concert schedules and services is scattered across social media, outdated PDFs or simply not available in a structured way online.

Added to this is a specific problem in the fair context: mobile coverage inside the venue is limited due to the concentration of people, which makes it difficult to look up information in real time. This combination of factors motivated the development of a digital solution that is accessible, fast and functional even without an internet connection.

---

## Expectations and specific objectives.

### General objective.

Develop a full stack web platform based on the MERN stack that centralises local fair information and allows it to be consulted comfortably, quickly and without depending on an internet connection from any device.

### Specific objectives.

- Implement a complete administration panel with JWT authentication and differentiated roles.
- Develop a well-documented REST API following RESTful principles.
- Automatically generate a static page published on GitHub Pages whenever the administrator updates the data.
- Design the public web as an installable, offline-capable Progressive Web App (PWA).
- Integrate an interactive map with Leaflet.js showing the location of each stall on the official venue map.
- Implement a smart search engine with typo tolerance using Fuse.js.
- Deploy the application with Docker and Docker Compose, with Nginx as a reverse proxy.
- Configure a CI/CD pipeline with GitHub Actions.
- Fully document the project following the established structure.

### Learning objectives.

- Apply the MERN stack in a real project from start to finish.
- Integrate modern technologies such as PWA, static site generation and CI/CD.
- Manage an individual project following a simplified SCRUM methodology.

---

## Comparative analysis of similar applications.

Several partial solutions currently exist for local events and fairs, but none fully covers the identified needs:

| Solution | Description | Limitations |
|---|---|---|
| Official Jerez City Council website | Basic fair information | Not interactive, no stall map, no detailed schedule |
| Social media (Instagram, Facebook) | Stall and organiser posts | Scattered information, not centralised, does not work offline |
| Generic event apps (Fever, Eventbrite) | Ticket and event management | Not oriented to local fairs, no stall map or menus |
| Previous TFG Android app | Stall map on Android | Android only, no real deployment, made-up data, unmaintained |

### Analysis conclusion.

None of the existing solutions combines in a single place the centralisation of information, offline functionality, high-performance static content generation and an interactive map on the official venue plan. FeriaApp fills this gap with a modern architecture, an infrastructure cost of €0 and a reusable platform for any future edition of the fair.