# Command & Conquer: Map Installer

A modern tactical desktop application built with **Electron**, **React 19**, **Vite**, and **Tailwind CSS v4** in a custom **Teal Military HUD** theme for downloading and installing maps for **Command & Conquer: Generals** and **Command & Conquer: Generals - Zero Hour**.

---

## Features

- **Step 1: Game Version & Folder Selection**:
  - Switch between **Generals: Zero Hour** (500+ maps) and **Generals (Classic)** (170+ maps).
  - Native Windows directory browser dialog to select custom maps folders.
  - Auto-detection of standard user maps locations:
    - Zero Hour: `%USERPROFILE%\Documents\Command and Conquer Generals Zero Hour Data\Maps`
    - Classic: `%USERPROFILE%\Documents\Command and Conquer Generals Data\Maps`
  - Scans and detects already installed maps in your game directory.
  - One-click button to open your maps folder in Windows File Explorer.

- **Step 2: C&C Labs Online Repository Synchronizer**:
  - Direct integration with [C&C Labs Zero Hour Maps](https://www.cnclabs.com/maps/generals/zerohour-maps.aspx) and [C&C Labs Classic Maps](https://www.cnclabs.com/maps/generals/maps.aspx).
  - Displays **Map Name**, **Recon Satellite Photo**, **Detailed Briefing / Description**, **Author**, **File Size**, and **Download Count**.
  - Interactive player slots filter (`All`, `2P`, `3P`, `4P`, `5P`, `6P`, `7P`, `8P`).
  - Sort by Most Downloads, Newest Date, Alphabetical (A-Z), Rating, File Size, or Player Slots.
  - Instant search across map titles, authors, and keywords.
  - Grid View & Compact List View toggle.
  - Filter by "Installed in Game Only".
  - High-resolution reconnaissance image zoom preview modal.
  - Full mission briefing modal.

- **1-Click Map Installation**:
  - Download zip archives directly from C&C Labs.
  - Automatically handles zip extraction into the game's custom maps directory with proper folder hierarchy (`<MapName>/<MapName>.map`).
  - Real-time download and extraction progress indicators.
  - "Installed" status tracking and re-install capabilities.

- **Teal Military Tactical HUD Theme**:
  - Sleek dark tactical command center styling with cyan/teal neon accents, radar grid textures, glassmorphic panels, and military typography (`Chakra Petch`, `Inter`, `JetBrains Mono`).

---

## Tech Stack

| Technology | Version | Description |
|---|---|---|
| [Electron](https://www.electronjs.org/) | ^44.7.0 | Cross-platform desktop app framework |
| [React](https://react.dev/) | ^19.3.0 | UI library |
| [Vite](https://vite.dev/) | ^8.3.4 | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.3.3 | Utility-first CSS framework |
| [adm-zip](https://github.com/cthackers/adm-zip) | ^0.6.1 | Archive extraction for C&C map archives |
| [lucide-react](https://lucide.dev/) | ^1.54.0 | Tactical military UI icon set |
| [ESLint](https://eslint.org/) | ^9.39.5 | Code linting |
| [Electron Builder](https://www.electron.build/) | ^26.15.3 | Packaging and distribution |

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v24+ LTS recommended, v20+ supported)

---

## Usage

**Start Development Server & Launch Electron App**:

```bash
npm run dev
```

*(Alternatively, run `npm run react:dev` and `npm run electron:dev` in separate terminals).*

**Build React Frontend**:

```bash
npm run react:build
```

**Package App for Distribution**:

```bash
npm run electron:build
```