# 09. User manual.

## Administration panel.

### Accessing the panel.

1. Open the browser and go to `http://localhost` (with Docker) or `http://localhost:5173` (local development).
2. On the entry screen ("how do you want to access?"), choose **Sign in** or **Sign up**.
   - **Sign in** with existing credentials. The default administrator is:
     - **Email:** admin@feriaapp.com
     - **Password:** admin1234
   - **Sign up** to create a new account. New accounts are always created as **viewer** (read-only); an administrator can promote them later (see *User management* below).
3. After logging in, a banner shows your role and what it allows.

![alt text](image.png)

---

### User management (admin only).

Administrators can manage who accesses the panel and with which role:

1. Go to the **Users** section in the sidebar (visible to administrators only).
2. Each user has a role selector to set **admin**, **editor** or **viewer**:
   - **admin** — full access, including publishing and managing users.
   - **editor** — can edit existing content, but cannot create, delete, publish or manage users.
   - **viewer** — read-only access.
3. Your own account is not listed here, so you cannot change or remove your own role by accident.

---

### Dashboard.

The Dashboard shows a general summary of available information: number of fairs, stalls, menus and concerts registered.

From here you can press the **Publish website** button to generate and publish the updated public website on GitHub Pages.

![alt text](image-1.png)

---

### Fair management.

**Create a fair:**
1. Go to the **Fairs** section in the sidebar.
2. Fill in the form with the name, description, start and end dates, and location.
3. Press **Save**.

**Edit or delete a fair:**
1. In the fair listing, press the edit or delete icon for the corresponding fair.
2. To edit, modify the fields and press **Save**.
3. To delete, confirm the action in the confirmation dialog.

![alt text](image-2.png)

![alt text](image-3.png)

---

### Caseta management.

**Create a caseta:**
1. Go to the **Casetas** section in the sidebar.
2. Fill in the form with the name, number and description.
3. Upload a stall image (optional).
4. Select the fair it belongs to.
5. Click on the venue map to mark the stall location.
6. Press **Save**.

**Edit or delete a caseta:**
1. In the stall listing, press the edit or delete icon.
2. To edit, modify the fields and press **Save**.
3. To delete, confirm the action.

![alt text](image-4.png)

![alt text](image-5.png)

---

### Import stalls from a map (AI).

Instead of creating stalls one by one, the administrator can detect them all automatically from a fair map.

1. In the **Casetas** section, press **Import from map**.
2. Choose the fair the stalls belong to (or leave the active fair) and select the map image.
3. Press **Detect**. The AI analyses the map and, after a moment, shows every detected stall as a numbered marker.

While the AI is working, the modal shows a progress message. Detection of a full map typically takes under a minute:

![AI detection in progress: the import modal shows the message "Running AI detection, this can take up to a minute…"](ai-import-detecting.png)

4. Review the result:
   - **Drag** any marker to fine-tune its exact position.
   - **Edit** the number or name of any stall in the list on the right.
   - **Click** an empty spot on the map to add a stall the AI missed.
   - Use the **trash icon** to remove a false detection.
   - Untick any stall you do not want to import.
5. Press **Import** to save the selected stalls into the fair.

The review screen shows the detected stalls as numbered markers on the uploaded map (left), alongside an editable list (right) with each stall's number, name and detection confidence. A summary at the top reports how many stalls were detected, how many need review and how many are selected for import:

![Review screen: the uploaded fair map with numbered stall markers on the left, and an editable table on the right listing each stall's number (#), name, confidence (CONF.) and a trash icon to remove it. The header reads "Detected 178. To review: 0. Selected: 178." and the import button reads "Import 178 casetas".](ai-import-review.png)

> Notes: stall names are optional during import (a default "Caseta N" is used and can be edited later with the Edit button). Re-importing the same fair updates the matching stalls by number instead of duplicating them. Images are added afterwards from each stall's Edit form.

If the chosen fair already contains stalls, the review screen shows a warning before importing. This makes it clear that importing will update the matching stalls and replace the fair's map, so a different fair should be created first if the new map belongs to a different venue:

![Re-import warning: a red notice at the top of the review screen reading "This fair already has 175 casetas. Importing updates casetas with a matching number and adds new ones; casetas you don't re-detect are kept with their old positions, and the fair's map is replaced by this one. To set up a different fair instead, cancel and pick (or create) that fair first."](ai-import-reimport-warning.png)

---

### Menu management.

![alt text](image-6.png)

**Add dishes to a stall:**
1. Go to the **Menus** section in the sidebar.
2. Select the stall you want to add dishes to.
3. Fill in the rows with name, price and optional description.
4. Press **Add row** to include more dishes.
5. Press **Save**.

![alt text](image-7.png)

**Edit or delete a dish:**
1. In the dish listing, press the edit or delete icon for the corresponding dish.

![alt text](image-8.png)


---

### Concert management.

**Add a concert:**
1. Go to the **Schedule** section in the sidebar.
2. Fill in the form with the artist, genre, date, time and stall.
3. Press **Save**.

![alt text](image-9.png)

![alt text](image-10.png)

---

### Publishing the public website.

1. Go to the **Dashboard**.
2. Press the **Publish website** button.
3. Confirm the action in the dialog.
4. Wait for the **"Published successfully"** message to appear.
5. Within 2–3 minutes the public website will be updated on GitHub Pages.

![alt text](image-11.png)

---

## Public website.

### Access.

The public website is available at:
- **GitHub Pages:** https://pablitoclavito04.github.io/FeriaApp/
- **Docker:** http://localhost/public/

### Exploring the fair.

1. Open the public website from your mobile or browser.
2. Press **Explore the Fair** on the welcome screen.
3. You will see the interactive map with all stalls marked.

![alt text](image-12.png)
![alt text](image-13.png)
![alt text](image-14.png)
![alt text](image-15.png)

### Searching for a Casetas.

1. Go to the **Casetas** section from the navigation menu.
2. Type the stall name in the search box (typos are tolerated).
3. Press on the stall to view its detailed information.

![alt text](image-16.png)

### Viewing a Caseta Menu.

1. Access the caseta detail.
2. In the **Menu** tab you will see the 3 chef's suggestions.
3. Press **Download full menu (PDF)** to get the complete menu as a PDF.

![alt text](image-17.png)

### Viewing the schedule.

1. Go to the **Schedule** section from the navigation menu.
2. You will see all concerts and activities ordered by date.

![alt text](image-18.png)

### Installing the app.

1. Open the public website from your mobile using Chrome or Edge.
2. Press the **Install** button that appears on the welcome screen.
3. Confirm the installation in the browser dialog.
4. The app will appear on your home screen like a native app.

![alt text](image-19.png)

![alt text](image-20.png)

---

## Frequently asked questions (FAQ).

**Does the public website work without internet?**
Yes, once you have loaded it with a connection, you can consult it without internet if you have it installed as a PWA.

**How often is the public website updated?**
The public website is updated every time the administrator presses the "Publish" button in the panel.

**Can I access the panel from my mobile?**
Yes, the administration panel is responsive and works on mobile, although it is optimised for desktop.

**The public website data has not updated.**
Press `Ctrl+Shift+R` to force a reload and clear the browser cache. If the problem persists, the Service Worker may be caching the previous version.