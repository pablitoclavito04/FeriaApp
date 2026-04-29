# 04. Style guide and prototyping.

## Figma prototype.

The FeriaApp prototype was developed in Figma before implementation began. It includes the main flows for the administration panel and the public website, with interactive navigation between screens.

https://www.figma.com/files/team/1552254852217140725/all-projects?fuid=1552254847944696626

---

## Colour palette.

### Public website.

| Name | HEX | Usage |
|---|---|---|
| Feria Pink | `#F4D6D6` | Main background |
| Salmon Pink | `#F8C9C0` | Stall cards background |
| Cream | `#FBE8C8` | Install banner background |
| Sky Blue | `#DDE9F8` | Secondary buttons (Entrar) |
| Black | `#000000` | Primary buttons (Instalar) and main text |
| White | `#FFFFFF` | Card backgrounds and text on dark |
| Open Green | `#2ECC71` | "Abierta" status indicator |
| Closed Red | `#E74C3C` | "Cerrado" status indicator |


---

## Typography.

### Public website.

| Usage | Family | Size | Weight |
|---|---|---|---|
| Main headings | Inter | 2rem – 3rem | 700 |
| Subheadings | Inter | 1.25rem – 1.5rem | 600 |
| Body text | Inter | 1rem | 400 |
| Small text | Inter | 0.875rem | 400 |

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

---

## Reusable components.

### Public website (HTML/CSS/JS).

- **Stall Card:** Card with image, name and opening status of each stall.
- **Menu Card:** Card with the stall image and a list of suggested dishes.
- **Concert Card:** Card with artist, genre, date and time of the concert.
- **Install Banner:** PWA installation banner that appears when the browser supports it.

---

## Wireframes and mockups.

The main screens prototyped in Figma are:

**Public website:**
- Landing / Welcome
- Interactive map with stalls
- Stall listing with search
- Stall detail (menu + schedule)
- Menus section
- Schedule section

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