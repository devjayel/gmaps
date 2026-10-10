# GMaps — Command & Conquer Map Manager & Installer

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Windows%20x64-0ea5e9?style=for-the-badge&logo=windows)
![Version](https://img.shields.io/badge/Release-v1.0.0-14b8a6?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-44.x-475569?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

<p align="center">
  A tactical military HUD desktop application for seamlessly browsing, downloading, and installing custom multiplayer and skirmish maps for <b>Command & Conquer: Generals</b> and <b>Zero Hour</b> with zero manual file extraction.
</p>

[**Download Windows Setup (.exe)**](https://github.com/devjayel/gmaps/releases/latest) • [**Report an Issue**](https://github.com/devjayel/gmaps/issues)

</div>

---

> [!IMPORTANT]
> ### 🛡️ Community Disclaimer & Attribution
> **This project is an independent open-source utility and is NOT affiliated with, sponsored by, or officially associated with [C&C Labs](https://www.cnclabs.com/).**
> 
> *This tool was developed independently to simplify and accelerate the map installation process for Command & Conquer players—enabling you to search, inspect, download, and install custom maps directly in one unified interface without ever having to leave the app, open web browsers, or manually extract archives into game directories.*
> 
> All maps, aerial reconnaissance imagery, mission briefings, and creator attributions originate from the community modders and contributors hosted on C&C Labs. All rights belong to their respective authors.

---

## 🚀 Key Features

### ⚡ 1-Click Automated Map Installation
- **Direct Zip Decompression**: Downloads map archives in the background and extracts `.map` and `.tga` minimap files directly into your active game maps folder via `adm-zip`.
- **Intelligent Structure Normalization**:
  - Automatically identifies and flattens nested root directories inside community zip files so map files always land in the proper game path hierarchy (`<MapsFolder>/<MapName>/<MapName>.map`).
  - Tags installed folders with the `[GMAPS]` prefix (e.g., `[GMAPS] Desert Storm (ZH)`) for effortless organization and differentiation from vanilla game maps.
- **Real-Time Progress Feedback**: Dynamic button states tracking installation phase (`Idle` ➔ `Downloading` ➔ `Extracting` ➔ `Installed`).
- **One-Click Re-Installation**: Easily re-download or overwrite damaged or outdated map folders.

### 🌐 C&C Labs Repository Integration & Smart Caching
- **Extensive Catalog Access**:
  - **Generals: Zero Hour**: Over **500+** community skirmish and multiplayer maps.
  - **Generals (Classic)**: Over **170+** classic community maps.
- **Dual-Tier Hybrid Caching System**:
  - **In-Memory Cache**: Lightning-fast instant page switches with a 60-minute in-session cache.
  - **Persistent Disk Cache**: Automatically saves catalog snapshots to your system's app data (`userData`), allowing instant offline browsing and ultra-fast application startup.
- **On-Demand Synchronization**: Single-click "Sync" button forces a live catalog re-fetch directly from C&C Labs.

### 🎮 Dual Game Support & Directory Auto-Detection
- **Instant Version Switching**: Toggle between **Zero Hour** and **Classic Generals** at any time.
- **Windows Default Auto-Discovery**:
  - Automatically locates standard game document map directories:
    - *Zero Hour*: `%USERPROFILE%\Documents\Command and Conquer Generals Zero Hour Data\Maps`
    - *Classic*: `%USERPROFILE%\Documents\Command and Conquer Generals Data\Maps`
- **Native Windows Folder Browser**: Built-in directory picker allows you to select custom paths (e.g., portable installs, GenPatcher setups, or modded directories like ShockWave, Contra, or Rise of the Reds).
- **One-Click Directory Provisioning**: Built-in "Create Folder" and "Reveal in Windows Explorer" actions.

### 🔍 Tactical Search, Filter & View Controls
- **Real-Time Fuzzy Search**: Filter instantly across map names, author usernames, and description keywords.
- **Player Slot Filtering**: Filter maps by supported player counts (`All`, `2P`, `3P`, `4P`, `5P`, `6P`, `7P`, `8P`).
- **"Installed in Game Only" Filter**: Quickly isolate maps that are already extracted into your local directory.
- **Multi-Field Sorting**:
  - Most Downloads (Popularity)
  - Newest / Date Added
  - Alphabetical (A-Z)
  - File Size
  - Player Slots
- **Dual Viewing Modes**:
  - **Tactical Grid View**: Rich visual cards with reconnaissance image previews and quick badges.
  - **Compact List View**: High-density tactical layout for rapid catalog scanning.

### 🛰️ Reconnaissance Previews & Mission Briefings
- **High-Res Satellite Recon Modal**: Click map imagery to open an expanded full-resolution reconnaissance preview modal.
- **Expanded Tactical Briefing Modal**: Detailed briefing view containing full mission lore, map terrain descriptions, author credits, and total download statistics.

### 💾 Local Installed Maps Manager
- **Dedicated Installed Tab**: Complete inventory of every custom map currently inside your active maps folder.
- **Integrity Verification**: Scans folders and flags valid `.map` and radar `.tga` files.
- **GMaps vs. Custom Indicators**: Distinguishes maps managed by GMaps from manually copied maps.
- **Storage Footprint & Timestamps**: Displays exact folder sizes and last modified timestamps.
- **Safe Map Deletion**: Integrated deletion modal with directory traversal protection to cleanly remove maps you no longer play.
- **Explorer Reveal**: Direct button to launch Windows File Explorer directly highlighted inside any map folder.

### 🔄 Integrated GitHub Releases Auto-Updater
- **Automated Update Detection**: Periodically checks the official `devjayel/gmaps` repository on GitHub Releases for new updates on startup.
- **In-App Update Modal**: Displays new release version tag, publishing date, changelog / release notes, and download progress.
- **Background Download & 1-Click Install**: Downloads the update payload in the background with real-time download speed and byte counters, then lets you restart and install instantly or apply on exit.
- **Manual Check Capability**: Check for updates on demand via the version badge in the Header or inside the Settings modal.

### 🎖️ Teal Military Tactical HUD Theme
- Sleek dark tactical command center theme inspired by modern military HUDs.
- Glowing cyan/teal neon accents, radar grid backdrops, and glassmorphic panels.
- Tactical typography featuring **Inter** and **JetBrains Mono**.
- Clean frameless styling with native system menus cleanly disabled.

---

## 📦 Setup & Installation

### Option 1: Official Windows Installer (Recommended)

1. Download the latest setup executable from the **[GitHub Releases](https://github.com/devjayel/gmaps/releases/latest)** page:
   ```
   GMaps-Setup-1.0.0.exe
   ```
2. Run the setup wizard.
3. Choose your preferred installation directory (optional; default installs to `%LOCALAPPDATA%\Programs\GMaps`).
4. Follow the installer prompts. A desktop shortcut and Start Menu entry will be created automatically.
5. Launch **GMaps** and start installing maps!

---

## 🛠️ Quick Start Guide

1. **Launch GMaps**: Open the application via your desktop shortcut or Start Menu.
2. **Verify Maps Folder**:
   - On first launch, GMaps automatically scans your standard Documents folder for your C&C Generals / Zero Hour maps directory.
   - If your game is installed in a non-standard location or drive, click **Setup Folder** in the top navigation bar and select your custom maps folder.
3. **Select Game Version**: Click the **Zero Hour** or **Classic** button in the header depending on which game you wish to manage.
4. **Browse & Search**:
   - Filter by player count (e.g. `4P`, `8P`) or search for map names (e.g., *Tournament Desert*, *Twilight Flame*).
5. **Install with 1 Click**: Click **Install Map**. GMaps downloads, extracts, and places the files into the proper folder.
6. **Launch Command & Conquer**: Go to Skirmish or Multiplayer in-game, select **Unofficial Maps**, and play!

---

## 💻 Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Runtime / Wrapper** | [Electron 44](https://www.electronjs.org/) | Modern, secure desktop runtime |
| **Frontend Framework** | [React 19](https://react.dev/) | High-performance UI rendering |
| **Bundler & Tooling** | [Vite 8](https://vite.dev/) | Ultra-fast build and HMR dev server |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Tactical military dark HUD interface |
| **Archive Engine** | [adm-zip](https://github.com/cthackers/adm-zip) | Fast zip extraction and folder restructuring |
| **Iconography** | [Lucide React](https://lucide.dev/) | Crisp tactical UI icon set |
| **Packaging & CI/CD** | [Electron Builder](https://www.electron.build/) & GitHub Actions | Automated NSIS setup generator |

---

## 🔧 Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v24.x LTS recommended, v20+ supported)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- [Git](https://git-scm.com/)

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/devjayel/gmaps.git

# Navigate into the project folder
cd gmaps

# Install dependencies
npm install
```

### Running Locally (Development Mode)

```bash
npm run dev
```
*This starts the Vite React dev server on `http://localhost:5173` and launches the Electron desktop shell with hot-reload enabled.*

### Building the Windows Setup Installer (.exe)

```bash
npm run electron:build
```
*The packaged Windows installer (`GMaps-Setup-1.0.0.exe`) will be generated inside the `release/` directory.*

---

## 🤖 Automated GitHub Releases (CI/CD)

This repository includes a continuous integration and deployment workflow located in [`.github/workflows/release.yml`](.github/workflows/release.yml).

To publish a new GitHub Release with the compiled setup installer attached:

1. **Update Version**: Bump the `"version"` field in `package.json` (e.g. `1.0.1`).
2. **Commit and Tag**:
   ```bash
   git add package.json
   git commit -m "chore: bump version to 1.0.1"
   git tag v1.0.1
   git push origin main --tags
   ```
3. **Automated Publishing**:
   - GitHub Actions will automatically spin up a `windows-latest` runner.
   - It compiles the React app, packages the Electron NSIS installer, and uploads `GMaps-Setup-1.0.1.exe` directly to a newly published GitHub Release!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Command & Conquer, Generals, and Zero Hour are trademarks or registered trademarks of Electronic Arts Inc. C&C Labs is the property of its respective owners.