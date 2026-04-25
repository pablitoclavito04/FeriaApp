# 02. Description.

## General overview.

FeriaApp is a web platform with a hybrid architecture composed of two distinct parts: an administration panel developed with the MERN stack, and a static public website automatically generated and published on GitHub Pages. This architecture guarantees optimal performance for the visitor and straightforward management for the administrator.

All information comes from official public sources such as the Jerez de la Frontera City Council, and is managed directly by the administrator from the internal panel, without depending on third parties. The platform is designed to be reused for each new edition of the fair and to scale to other events in the future.

---

## Main features.

### 1. Authentication and roles.

The authentication system is based on JSON Web Tokens (JWT). There are two distinct roles:

- **Administrator:** Full access to the administration panel. Can manage fairs, stalls, menus, concerts and generate the public website.
- **Visitor:** Access to the static public website. No registration or authentication required.

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

### 8. Official map import.

The administrator can upload the image or PDF of the official map published by the Jerez City Council. That map is displayed as a background in the panel and the administrator simply clicks on it to mark the location of each stall, minimising manual data entry.

### 9. Interactive map.

The public website displays all stalls on the official venue map using Leaflet.js. The visitor can tap on any stall to see its detailed information, menu and schedule.

### 10. Smart search.

The stall search engine incorporates typo tolerance via Fuse.js. Visitors find what they are looking for even if they misspell the stall name.

---

## User Interface and user experience (UI/UX).

### Design principles.

- **Mobile first:** The design is primarily intended for mobile, since most visitors will consult the application from their phone during the fair.
- **Simplicity:** Clean and intuitive interface that allows information to be found quickly.
- **Accessibility:** Compliance with WCAG 2.1 level AA standard, with a minimum colour contrast ratio of 4.5:1 and keyboard-accessible navigation.
- **Performance:** The public website is a static page, ensuring minimal load times even on a slow connection.

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