# 02. Description.

## General overview.

FeriaApp is a web platform with a hybrid architecture composed of two distinct parts: an administration panel developed with the MERN stack, and a static public website automatically generated and published on GitHub Pages. This architecture guarantees optimal performance for the visitor and straightforward management for the administrator.

All information comes from official public sources such as the Jerez de la Frontera City Council, and is managed directly by the administrator from the internal panel, without depending on third parties. The platform is designed to be reused for each new edition of the fair and to scale to other events in the future.

---

## Main features.

### 1. Authentication and roles.

The authentication system is based on JSON Web Tokens (JWT). Users reach the panel through an initial screen that lets them sign in or sign up; self-registration always creates a read-only account, and an administrator promotes users from a dedicated Users section. There are three panel roles plus the public visitor:

- **Administrator:** Full access to the administration panel. Can manage fairs, stalls, menus, concerts, change user roles, and publish the public website.
- **Editor:** Can edit existing content, but cannot create, delete, publish, or manage users.
- **Viewer:** Read-only access to the panel.
- **Visitor:** Access to the static public website. No registration or authentication required.

On entering the panel, each user sees an information banner explaining what their role allows.

### 2. Fair management.

The administrator can create, edit and delete fairs with the following data:

- Fair name.
- Description.
- Start and end dates.
- General location.

### 3. Stall management.

The administrator can register, edit and delete stalls with the following data:

- Stall name and number.
- Description.
- Location on the venue map.

### 4. Menu management.

Each stall can have an associated menu with:

- Dish or drink name.
- Price.
- Optional description.

### 5. Schedule management.

The administrator can manage the concert and activity schedule with:

- Artist or activity name.
- Date and time.
- Associated stall.

### 6. Automatic static page generation.

Whenever the administrator saves changes in the panel, the backend automatically generates the updated static files and publishes them on GitHub Pages via the GitHub API using Octokit. This ensures the public website is always up to date and does not require a server to function.

### 7. Public website as an installable PWA.

The website visited by users is a static page designed as a Progressive Web App (PWA):

- Installable on mobile as if it were a native app.
- Works without an internet connection once loaded, thanks to Service Workers.
- Especially useful when mobile coverage inside the fairground is limited.

### 8. AI-powered map import.

The administrator uploads the image of any fair map and an AI vision model (Claude, by Anthropic) analyses it automatically: it detects each stall, reads its number, reads the **name** from the map's side legend (matching each number to its name), and proposes an approximate position on the map. Because the model interprets the map visually rather than relying on rules tuned to one specific plan, the feature adapts to **any** fair map, not just a single venue.

The detected stalls are shown for review on the map: the administrator drags each marker to fine-tune its exact position, edits numbers or names, and can add or remove stalls before confirming the import. Optionally, the administrator can **crop** the map — dragging a rectangle to select the region published on the public site (e.g. excluding the legend) — and the backend crops the image and re-maps the stall positions accordingly. This combines automatic detection (which does the bulk of the work) with a final human adjustment that guarantees precise placement. Each fair stores its own map, so the public website always shows the active fair's plan with its stalls in the right place.

### 9. Interactive map.

The public website displays all stalls on the official venue map using Leaflet.js. The visitor can tap on any stall to see its detailed information, menu and schedule.

### 10. Smart search.

The stall search engine incorporates typo tolerance via Fuse.js. Visitors find what they are looking for even if they misspell the stall name.

---

## User Interface and user experience (UI/UX).

### Design principles.

- **Mobile first:** The design is primarily intended for mobile, since most visitors will consult the application from their phone during the fair.
- **Simplicity:** Clean and intuitive interface that allows information to be found quickly.
- **Accessibility:** Compliance with WCAG 2.1 level AA standard, with a minimum colour contrast ratio of 4.5:1 and keyboard-accessible navigation. In the panel, modal dialogs use `role="dialog"`/`aria-modal` with labelled titles and can be closed with the Escape key.
- **Usability feedback:** Toast notifications for every action, inline form validation messages, confirmation dialogs for destructive actions, loading states and pagination for large listings.
- **Performance:** The public website is a static page, ensuring minimal load times even on a slow connection. The panel applies route-based code splitting (lazy loading) so each section is downloaded only when visited.

### Administration panel.

SPA interface developed with React 18, with the following sections:

- **Dashboard:** General summary of fairs, stalls and schedules.
- **Fair Management:** Listing and CRUD forms.
- **Stall Management:** Listing, CRUD forms and location editor on the map.
- **Menu Management:** Listing and CRUD forms per stall.
- **Schedule Management:** Listing and CRUD forms per stall.
- **Publish:** Button to generate and publish the static public website.

### Public website.

Static PWA page with the following sections:

- **Home:** General fair information and quick access to the map.
- **Map:** Interactive map with all venue stalls.
- **Stalls:** Listing with smart search and detailed profiles.
- **Schedule:** Concert and activity agenda ordered by date and time.

---

## Target users and use cases.

### Target users.

| User Type | Description |
|---|---|
| Fair visitor | Person attending the fair who needs to look up information quickly from their mobile |
| Administrator | The developer themselves, who loads and maintains data using official public information |

### Main use cases.

**Use case 1: Looking up stall information**
1. The visitor opens the public website from their mobile.
2. They access the interactive map.
3. They tap on a stall.
4. They view the stall name, menu and schedule.

**Use case 2: Searching for a stall**
1. The visitor accesses the stalls section.
2. They type the stall name in the search box (even if they make a typo).
3. The search engine displays the most relevant results.
4. The visitor accesses the stall profile.

**Use case 3: Checking the schedule**
1. The visitor accesses the schedule section.
2. They view concerts and activities ordered by date and time.
3. They tap on a concert to see which stall is hosting it.

**Use case 4: Using the app without internet**
1. The visitor has previously loaded the website with a connection.
2. During the fair, without coverage, they open the installed app on their mobile.
3. They consult all locally stored information without needing internet.

**Use case 5: Updating information as administrator**
1. The administrator logs into the panel with their credentials.
2. They edit a stall's information or add a new concert.
3. They press "Publish".
4. The system automatically generates the updated public website and publishes it on GitHub Pages.