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