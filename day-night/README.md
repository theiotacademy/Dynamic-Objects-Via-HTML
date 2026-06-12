# Day / Night Theme Toggle Button

An animated day/night theme toggle button with a 3D-style face, moon/sun icons, ripple transition effect, and a glowing border animation.

---

## ⚠️ How to Run

> **This project will NOT work if you open the HTML file directly in the browser via `file://`.**
>
> It uses `type="module"` for the JavaScript, which browsers block on the `file://` protocol due to CORS restrictions.

### Option 1 — VS Code Live Preview / Live Server (Recommended)

1. Open the project folder in VS Code.
2. Install the **Live Preview** or **Live Server** extension if you haven't already.
3. Right-click `change-theme-button.html` → **Open with Live Server** (or click **Go Live** in the status bar).
4. The page will open at `http://127.0.0.1:5500` (or similar) and work correctly.

### Option 2 — Any Local HTTP Server

Using Node.js:
```bash
npx serve .
```

Using Python:
```bash
# Python 3
python -m http.server 8080
```

Then open `http://localhost:8080/change-theme-button.html` in your browser.

---

## Project Structure

```
day-night/
├── change-theme-button.html   # Main HTML file
├── change-theme-button.css    # All styles, animations, and theme layers
└── change-theme-button.js     # Theme toggle logic, ripple, and border glow
```

---

## Features

- **Day / Night toggle** — switches between light and dark `color-scheme` using `data-theme` on `<html>`
- **3D button face** — layered shadows, plate, shine, and glow effects built purely in CSS
- **Moon icon** — shown in dark mode with a floating + glowing animation and twinkling stars
- **Sun icon** — shown in light mode with a continuous spin + glow animation
- **Ripple transition** — a full-screen radial ripple expands from the button center on every toggle
- **Border glow** — a conic-gradient border light sweeps around the button on click
- **Accessible** — uses `aria-pressed` to convey toggle state, and `.sr-only` label for screen readers

---

## How It Works

1. On load, the theme defaults to `dark` and `data-theme="dark"` is set on `<html>`.
2. Clicking the button flips the theme between `light` and `dark`.
3. A `.theme-ripple` div is created at the button's center coordinates and expands to cover the screen.
4. After 700ms (when the ripple covers the screen), the actual theme is applied — making the transition feel seamless.
5. The border glow animation is restarted on every click using a forced reflow (`void el.offsetWidth`).
