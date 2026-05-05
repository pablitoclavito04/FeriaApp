# 04. Style guide and prototyping.

## Figma prototype.

The FeriaApp prototype was developed in Figma before implementation began. It includes the main flows for the administration panel and the public website, with interactive navigation between screens.

https://www.figma.com/files/team/1552254852217140725/all-projects?fuid=1552254847944696626

---

## Colour palette.

### Public website.

The public site evokes the visual identity of the *Feria de Jerez* — a warm earthy palette built around a deep red and a saffron accent, layered over creamy off-white backgrounds. Every value is declared as a CSS custom property in `public-web/styles/base/variables.css`, and the site supports a full **dark theme** activated with `[data-theme="dark"]` on `<html>` (the user's choice is persisted to `localStorage` and re-applied before paint to avoid the dark-mode flash).

**Light theme** (default):

| CSS variable | HEX | Usage |
|---|---|---|
| `--primary` | `#C0392B` | Primary brand colour, links, active states |
| `--primary-dark` | `#9E2E22` | Hover state of primary CTAs |
| `--secondary` | `#F39C12` | Saffron accent for secondary highlights |
| `--dark` | `#1A1A2E` | Headings and main text |
| `--dark-soft` | `#222A44` | Footers, secondary surfaces |
| `--cream` | `#F7E7DC` | Soft warm backgrounds |
| `--cream-soft` | `#FBF1E9` | App-shell background |
| `--card` | `#F1D9C8` | Stall and feature cards |
| `--background` | `#FAFAFA` | Landing page background |
| `--surface` | `#FFFFFF` | White panels and modals |
| `--text` | `#2A2A35` | Body text |
| `--muted` | `#6B6B76` | Captions, footer copy |
| `--border` | `#E5DCD4` | Default border |
| `--header-bg` | `rgba(255,255,255,0.95)` | Sticky header background (light) |

**Dark theme** (`[data-theme="dark"]`) — same semantic tokens remapped to a navy palette while preserving the warm accents:

| CSS variable | HEX | Usage |
|---|---|---|
| `--primary` | `#E05546` | Lightened primary for dark contrast |
| `--primary-dark` | `#C0392B` | Hover state |
| `--secondary` | `#F5B041` | Lightened saffron accent |
| `--background` | `#0F1320` | Page background |
| `--surface` | `#1A1F2E` | Panels and modals |
| `--card` | `#242A3C` | Cards (feature, install banner, detail tabs) |
| `--cream` | `#1F2433` | Inverted cream for dark surfaces |
| `--cream-soft` | `#151A27` | Inverted soft cream for app shell |
| `--text` | `#E6E3DE` | Body text |
| `--muted` | `#9CA3B5` | Captions |
| `--border` | `#2A3145` | Borders |
| `--header-bg` | `#1A1F2E` | Sticky header background (dark) |

**State colours** (used inside cards regardless of theme):

| HEX | Usage |
|---|---|
| `#6EE7A3` (dark) / inherits `--success` (light) | "Abierta" status on stall cards |
| `#F5A3A3` (dark) / inherits `--error` (light) | "Cerrado" status on stall cards |
| `#2F4467` | Stall card background in dark mode (overrides `--card`) |

### Admin panel.

The admin panel uses a structured token system with two themes (light and dark). Every visual decision flows through CSS custom properties defined in `frontend/src/styles/abstracts/_themes.scss`, so switching theme is a single attribute toggle on the `<html>` element (`data-theme="dark"`).

**Brand & state tokens** (shared across both themes, declared as SCSS variables in `_variables.scss`):

| Token | HEX | Usage |
|---|---|---|
| `$primary` | `#3B82F6` | Primary buttons, links, focus ring |
| `$primary-dark` | `#2563EB` | Hover state of primary buttons |
| `$success` | `#10B981` | Success toasts, "active" badges |
| `$error` | `#EF4444` | Validation errors, destructive actions |
| `$warning` | `#F59E0B` | Warning toasts, secondary accents |

**Light theme** (default) — built around a slate-blue neutral scale with white surfaces:

| CSS variable | HEX | Usage |
|---|---|---|
| `--bg` | `#F1F5F9` | Page background |
| `--surface` | `#FFFFFF` | Cards, modals, table rows |
| `--surface-alt` | `#F8FAFC` | Alternating rows, subtle panels |
| `--sidebar-bg` | `#F8FAFC` | Sidebar background |
| `--text-primary` | `#0F172A` | Headings and main text |
| `--text-secondary` | `#475569` | Labels, captions, table body |
| `--text-muted` | `#94A3B8` | Placeholders, disabled state |
| `--border` | `#E2E8F0` | Default borders and dividers |
| `--border-strong` | `#CBD5E1` | Sidebar separator, table cell borders |

**Dark theme** (activated with `[data-theme="dark"]`) — same semantic tokens remapped to a navy palette:

| CSS variable | HEX | Usage |
|---|---|---|
| `--bg` | `#0F172A` | Page background |
| `--surface` | `#1E293B` | Cards, modals |
| `--surface-alt` | `#1A2332` | Alternating rows |
| `--sidebar-bg` | `#0B1120` | Sidebar background |
| `--primary` | `#60A5FA` | Lightened primary for dark contrast |
| `--text-primary` | `#E2E8F0` | Headings and main text |
| `--text-secondary` | `#94A3B8` | Labels, captions |
| `--text-muted` | `#64748B` | Placeholders, disabled state |
| `--border` | `rgba(255,255,255,0.08)` | Default borders |

The split between **SCSS variables** (`$primary`, `$radius-md`) and **CSS custom properties** (`--primary`, `--bg`) is intentional: SCSS tokens drive compile-time decisions (radii, transitions, brand colours that never change), while CSS variables drive runtime theming so the same compiled stylesheet serves both modes without duplicated rules.

---

## Typography.

Both stacks lean on system-installed fonts to keep the payload light and the rendering consistent across platforms — no web-font is downloaded on the public site, and the admin panel falls back to the same OS font when Inter is not available.

### Public website.

The public site uses **Segoe UI** as the primary face, falling back to Inter, the system UI font and finally `sans-serif`. Type sizes are defined with `clamp()` to scale fluidly between mobile and desktop viewports without media-query stepping.

```css
font-family: 'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif;
```

| Usage | Size | Weight | Notes |
|---|---|---|---|
| Hero title (`.hero-inner h1`) | `clamp(1.8rem, 3vw, 2.6rem)` | 700 | Scales fluidly with viewport |
| Section heading (`.features-head h2`, `.cta-inner h2`) | `clamp(1.6rem, 2.4vw, 2.1rem)` | 700 | |
| Sub-heading (`.feature-card h3`, `.detail-tab-card h2`) | `1.35rem` | 700 | |
| Lead paragraph (`.hero-inner p`, `.cta-inner p`) | `1.05rem` | 400 | Slightly larger than body |
| Body text (`body`) | `1rem` | 400 | `line-height: 1.5` |
| Card body (`.feature-card p`, `.caseta-card p`) | `0.95rem` | 400 | |
| Nav link (`.app-nav-btn`) | `0.95rem` | 600 | |
| Small text (footer, captions) | `0.9rem` | 400 | |
| Button label (`.btn`) | `0.98rem` | 600 | `letter-spacing: 0.2px` |

### Admin panel.

The admin panel deliberately uses a **denser** type scale than the public site — the admin works with tables, forms and modals where vertical real estate matters, so most text sits between `0.72rem` and `1rem`.

| Usage | Family | Size | Weight | Notes |
|---|---|---|---|---|
| Page title (`.page-header h1`) | Inter | 1.75rem | 700 | `letter-spacing: -0.5px` for a tighter look |
| Modal title (`.modal-header h3`) | Inter | 1.25rem | 700 | |
| Form section heading (`.form-container h2`) | Inter | 1.1rem | 700 | |
| Body text (`body`) | Inter | 1rem | 400 | `line-height: 1.5` |
| Form input | Inter | 0.9rem | 400 | |
| Table cell (`.data-table td`) | Inter | 0.875rem | 400 | |
| Button label | Inter | 0.85rem | 600 | |
| Form label | Inter | 0.8rem | 600 | Uppercase + `letter-spacing: 0.3px` |
| Table header (`th`) | Inter | 0.75rem | 700 | Uppercase + `letter-spacing: 0.5px` |
| Badge / bulk-row header | Inter | 0.72rem | 700 | Uppercase |

Anti-aliasing is enabled globally via `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` in `base/_global.scss`.

---

## Spacing.

The spacing system follows an 8px scale:

| Token | Value | Usage |
|---|---|---|
| xs | 4px | Minimum spacing |
| sm | 8px | Small spacing |
| md | 16px | Standard spacing |
| lg | 24px | Large spacing |
| xl | 32px | Extra large spacing |
| 2xl | 48px | Section spacing |

### Admin panel — radii, shadows and transitions.

In addition to the spacing scale, the admin panel ships a set of **shape and motion tokens** so every component reaches for the same primitives:

| Token | Value | Usage |
|---|---|---|
| `$radius-sm` | `6px` | Buttons, inputs, badges |
| `$radius-md` | `10px` | Mid-size containers (rare) |
| `$radius-lg` | `16px` | Cards, modals, tables, form containers |
| `$transition` | `0.15s ease` | All hover/focus state changes |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Tables, cards in resting state |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)` | Forms, hovered buttons |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)` | Modals, dropdowns |

The shadow tokens are CSS variables, so they take darker, more contrasted values automatically when the dark theme is active (defined in `[data-theme="dark"]`).

---

## Reusable components.

### Public website (HTML/CSS/JS).

The public site is a single `index.html` that toggles between two views (`#landing` and `#app`) — no SPA framework, just vanilla DOM updates from `app.js`. Every component is its own CSS partial under `public-web/styles/components/` or `public-web/styles/pages/` and reads the theme tokens (`--primary`, `--cream`, `--card`, …), so the entire site flips between light and dark mode by toggling a single attribute on `<html>`.

**Layout & navigation**

| Component | Partial | Description |
|---|---|---|
| **Landing header** (`.landing-header`) | `components/header.css` | Sticky top bar shown on the welcome page: brand logo on the left, *Entrar* and *Instalar* CTAs on the right. |
| **App header** (`.app-header`) | `components/header.css` | Sticky top bar inside the app view with the brand logo, the section nav (`.app-nav` → Casetas / Menús / Programa) and the theme toggle. |
| **Footer** (`.landing-footer`, `.app-footer`) | `components/footer.css` | Three-column footer with brand block, link lists (about, legal) and social icons. Two variants share the same internal grid. |
| **App shell** (`.app`) | `layout/app.css` | Wrapper that holds the in-app pages (Casetas, Menús, Programa, detail) below the sticky header. |

**Buttons**

| Class | Description |
|---|---|
| `.btn` | Base button — pill-ish radius, `font-weight: 600`, lifts 1px on hover. |
| `.btn-primary` | Primary CTA on filled `--primary` red. |
| `.btn-ghost` | Outline button used for secondary actions ("Entrar", "Volver"). |
| `.btn-dark` | Solid dark button for the *Instalar* PWA CTA. |
| `.btn-lg` | Larger size variant for hero CTAs. |

**Cards & content blocks**

| Component | Partial | Description |
|---|---|---|
| **Hero** (`.hero`, `.hero-overlay`, `.hero-inner`) | `pages/landing.css` | Full-bleed background image with a tinted overlay, centred title, lead paragraph and a pair of CTAs. |
| **Feature card** (`.feature-card`) | `pages/landing.css` | Square illustration card used in the "Todo al alcance de tus manos" grid (icon + heading + body). |
| **Feature split** (`.feature-split`) | `pages/landing.css` | Image-on-one-side / list-on-the-other block that introduces the app's main highlights. |
| **CTA banner** (`.cta`) | `pages/landing.css` | Full-bleed red panel with the *Entrar* call-to-action at the bottom of the landing. |
| **Stall card** (`.caseta-card`) | `pages/casetas.css` | Stall preview with image (or fallback), name, opening status (`.caseta-status.is-open` / `is-closed`) and a CTA button. |
| **Menu caseta card** (`.menu-caseta-card`) | `pages/menus.css` | Per-stall card on the Menús page that lists the stall's dishes. |
| **Detail tab card** (`.detail-tab-card`) | `pages/caseta-detail.css` | Tabbed panel on the stall detail page (menu list, schedule list). |
| **Schedule item** (`.detail-schedule-list`) | `pages/caseta-detail.css` | Concert row with artist, genre, date and time. |

**Maps**

| Component | Partial | Description |
|---|---|---|
| **Stalls map** (`.casetas-map`) | `pages/casetas.css` | Leaflet map showing every stall with custom red pins (`.caseta-pin`). |
| **Detail map** (`.detail-map`) | `pages/caseta-detail.css` | Single-marker Leaflet map on the stall detail page, plus a "nearby stalls" link block. |

**Modals & overlays**

| Component | Partial | Description |
|---|---|---|
| **Info modal** (`.info-modal`, `.info-modal-card`) | `components/modal.css` | Reusable modal used for legal pages (Privacy, Terms, About) — backdrop, centred card, close button (×), animated entrance. |
| **Install banner** (`.install-banner`) | `components/install-banner.css` | Dismissible PWA install prompt that appears when the browser fires `beforeinstallprompt`. |

**Inputs & utilities**

| Component | Partial | Description |
|---|---|---|
| **Search input** (`.menus-search`, `.casetas-toolbar input`) | `components/search.css` | Round-cornered text input with an embedded magnifying-glass icon, used to filter stalls and menus. |
| **Theme toggle** (`.theme-toggle`) | `components/theme-toggle.css` | Sun/moon icon button that flips `data-theme` on `<html>` and persists the choice to `localStorage`. |
| **Sort selector** (`.casetas-sort`) | `pages/casetas.css` | Native `<select>` re-styled to match the brand. |
| **Tabs** (`.detail-tabs`, `.detail-tab`) | `pages/caseta-detail.css` | Underlined tab strip used on the stall detail page (Menú / Programa). |

### Admin panel (React + SCSS).

The admin panel is built around a small library of reusable components, each living in its own SCSS partial under `frontend/src/styles/components/`. Every component reads the theme tokens (`--bg`, `--surface`, `--primary`, …), so they all flip automatically between light and dark mode.

| Component | Partial | Description |
|---|---|---|
| **Sidebar** | `layout/_sidebar.scss` | Fixed left navigation with sections (Fairs, Stalls, Menus, Concerts), active-route highlight and a logout entry at the bottom. Collapses on mobile. |
| **Page header** | `components/_forms.scss` (`.page-header`) | Wraps the page title and the primary action button (`+ Add fair`, `+ Add stall`…) in a flex row with consistent spacing. |
| **Data table** | `components/_tables.scss` (`.data-table`) | Sortable table with bordered cells, uppercase header (`th`), `:hover` row highlight and rounded corners. Used in every CRUD page. |
| **Form container** | `components/_forms.scss` (`.form-container`) | White card with `radius-lg`, soft shadow and a separator under the section title. Hosts every create/edit form. |
| **Form group** | `components/_forms.scss` (`.form-group`) | Label + input pair. Inputs share a 1.5px border, a 3px focus ring built with `rgba($primary, 0.1)` and `:focus` border swap to `--primary`. |
| **Bulk row** | `components/_forms.scss` (`.bulk-row`) | 4-column grid (name / description / price / remove) used in the "Add menus in bulk" form. Collapses to a stacked layout under 720px. |
| **Modal** | `components/_modals.scss` (`.modal`, `.modal-overlay`) | Centered dialog with darkened backdrop (`rgba(0,0,0,0.4)`), slide-up animation and a header containing the title + close button. Used for destructive confirmations and quick edits. |
| **Toast** | `components/_toast.scss` | Stacked notifications anchored to the top-right corner. Three variants (success/error/info) coloured via `--success`, `--error`, `--text-secondary`. |
| **Badge** | `components/_badges.scss` | Pill-shaped tag with a 999px border-radius. Two variants: `.badge-success` (active fairs) and `.badge-muted` (inactive). |
| **Validation message** | `components/_validation.scss` | Inline error messages under inputs. Tied to the `.form-group input--error` modifier on the input itself. |
| **Theme toggle** | inside Sidebar | Sun/moon icon button that toggles `data-theme` on `<html>` and persists the choice to `localStorage`. |
| **Map picker** (`MapPicker.jsx`) | dedicated component | Leaflet-based interactive map for picking stall coordinates when creating/editing a stall. |

All components retain their original flat names from before the BEM refactor (`.modal-overlay`, `.data-table`, `.form-group`) — only newer partials such as the login page already follow the strict BEM convention. See the **CSS architecture** section below for the migration plan.

---

## Wireframes and mockups.

The main screens prototyped in Figma are:

**Public website:**
- Landing — hero, features grid, feature-split block and bottom CTA
- App view — top nav with three sections (Casetas, Menús, Programa)
- **Casetas** page — interactive Leaflet map, sort selector, search-filtered grid of stall cards
- **Stall detail** — image header, tabs (Menú / Programa), Leaflet map and "nearby stalls" link
- **Menús** page — search bar plus per-stall menu cards listing the dishes
- **Programa** page — chronological list of concerts grouped by date
- **Install banner** — PWA install prompt overlay
- **Info modals** — Privacy, Terms and About dialogs reachable from the footer
- **Light / dark theme toggle**, persisted in `localStorage`

**Admin panel:**
- Login screen with email/password and inline validation
- Dashboard with key metrics (active fair, count of stalls, menus and concerts)
- Fairs CRUD (list with active badge + create/edit form with date pickers)
- Stalls CRUD (list with thumbnail + create/edit form with image upload and map picker)
- Menus CRUD (list filterable by stall + bulk-create form with dynamic rows)
- Concerts CRUD (list filterable by stall + create/edit form with time picker)
- Confirmation modal for destructive actions (delete fair / stall / menu / concert)
- Publish action (button in Fairs page that triggers the JSON snapshot to `gh-pages`)
- Light / dark theme toggle, persisted in `localStorage`

---

## CSS architecture and methodology.

### 7-1 pattern (folder structure).

The admin panel stylesheet (`frontend/src/styles/`) is organised following the **7-1 pattern**, which splits the codebase into seven folders plus one entry-point file:

```
frontend/src/styles/
├── main.scss               # Index file (only @use imports)
├── abstracts/              # Tools and helpers, no actual CSS output
│   ├── _variables.scss     # SCSS tokens ($primary, $radius, ...)
│   ├── _themes.scss        # CSS custom properties (light/dark)
│   └── _animations.scss    # @keyframes
├── base/                   # Reset, typography, global rules
│   ├── _global.scss
│   └── _responsive.scss
├── layout/                 # Big structural pieces
│   ├── _page.scss          # .app-layout, .main-content
│   └── _sidebar.scss
├── components/             # Reusable UI pieces
│   ├── _buttons.scss
│   ├── _forms.scss
│   ├── _tables.scss
│   ├── _modals.scss
│   ├── _toast.scss
│   ├── _badges.scss
│   └── _validation.scss
└── pages/                  # Page-specific styles
    ├── _login.scss
    ├── _dashboard.scss
    └── _misc.scss
```

`main.scss` only contains `@use` directives — the order matters because `abstracts/themes` defines the CSS custom properties (`--primary`, `--bg`, …) that the rest of the stylesheet consumes via `var(--…)`.

### Conventions.

- **Partials**: every file in a subfolder starts with an underscore (`_variables.scss`) so SCSS does not compile it on its own. Only `main.scss` produces a CSS output.
- **Modules with `@use`**: imports use the modern `@use` syntax (not the deprecated `@import`). When a partial needs the SCSS tokens, it starts with `@use '../abstracts/variables' as *;`.
- **Variables split by purpose**:
  - **SCSS variables** (`$primary`, `$radius-md`, `$transition`) for values that never change at runtime — used inside SCSS expressions.
  - **CSS custom properties** (`--primary`, `--bg`, `--text-primary`) for values that switch between light and dark theme — set in `:root` and `[data-theme="dark"]` and read with `var(--…)`.
- **No global styles inside components**: each partial only declares its own selectors.

### BEM naming.

Selectors follow the **BEM** (Block, Element, Modifier) convention:

```
.block { … }
.block__element { … }
.block__element--modifier { … }
```

- **Block**: an independent component (`.login`, `.modal`, `.data-table`).
- **Element**: a part of the block that has no meaning on its own (`.login__field`, `.modal__header`).
- **Modifier**: a variation of a block or element (`.login__submit--loading`, `.modal__btn--confirm`).

The login screen is implemented in BEM as a reference (see `frontend/src/styles/pages/_login.scss`):

```scss
.login { … }
.login__box { … }
.login__welcome { … }
.login__welcome-title { … }
.login__field { … }
.login__field-error { … }       // element with state
.login__input--error { … }      // modifier "error" on the input element
.login__submit { … }
.login__submit--loading { … }
```

The same convention is applied to new components added after the refactor; older components retain their original flat names (e.g. `.modal-overlay`, `.data-table`) to avoid touching every JSX file in a single pass — they will be migrated incrementally.

### Public website — modular CSS (no preprocessor).

The public website (`public-web/`) is **vanilla HTML/CSS/JS** and is served statically from GitHub Pages without any build step. Because it has no preprocessor, it cannot use SCSS modules, but the same modular philosophy is applied with **native CSS `@import`**:

```
public-web/
├── styles.css                  # Index file (only @import url(...))
├── styles/
│   ├── base/
│   │   ├── variables.css       # :root tokens (light + dark theme)
│   │   └── global.css          # Reset, body, .hidden
│   ├── components/
│   │   ├── buttons.css
│   │   ├── header.css
│   │   ├── footer.css
│   │   ├── modal.css
│   │   ├── theme-toggle.css
│   │   ├── install-banner.css
│   │   └── search.css
│   ├── layout/
│   │   └── app.css
│   ├── pages/
│   │   ├── landing.css
│   │   ├── casetas.css
│   │   ├── menus.css
│   │   ├── schedule.css
│   │   └── caseta-detail.css
│   └── responsive/
│       └── media.css
└── index.html                  # Loads only styles.css (unchanged)
```

The `styles.css` file at the root is a **29-line index** that imports every partial in the correct cascade order (base → components → layout → pages → responsive). The HTML keeps a single `<link rel="stylesheet" href="styles.css">` tag, so the change is invisible to the browser.

### Why two different stacks.

| | Admin panel (`frontend/`) | Public website (`public-web/`) |
|---|---|---|
| **Stack** | React + Vite + SCSS | Vanilla HTML/CSS/JS |
| **Build step** | Yes (Vite compiles SCSS) | No (served as-is) |
| **Module syntax** | `@use` (SCSS modules) | `@import url(...)` (native CSS) |
| **Variables** | SCSS `$tokens` + CSS `--vars` | CSS `--vars` only |
| **Why** | Rich UI with complex state, benefits from SCSS features | Must run on GitHub Pages without dependencies; fast first load and offline support |

Both stacks share the same architectural principle: **partials by responsibility, single index file, theme via CSS custom properties**. The decision not to introduce a build step on the public site keeps the deployment trivial (push to `gh-pages` branch and done) and the PWA payload minimal.