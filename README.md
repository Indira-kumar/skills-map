# skillsmap

Evidence-based skill tracker for solopreneurs. Don't rate yourself, prove it.

Export snapshots monthly. Compare over time. Share your proof.

[![License: CC BY-NC 4.0](https://img.shields.io/badge/license-CC%20BY--NC%204.0-blue.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

---

## What is skillsmap?

A yardstick to measure your progress as a solopreneur across four core pillars:

| Pillar | What it covers |
|--------|----------------|
| **Think** | Validation, Strategy, Design |
| **Build** | UI/Frontend, Backend, DevOps |
| **Sell** | Marketing, Sales, Growth |
| **Sustain** | Finance, Operations, Learning |

Each pillar is broken down into branches, and each branch contains concrete **evidence items** you can check off. There are no subjective 1-to-5 ratings. You either did it or you didn't.

---

## Screenshots

### Dashboard

<!-- Replace with your own screenshot -->
<img width="820" height="699" alt="image" src="https://github.com/user-attachments/assets/5bf40275-6d39-4f7f-a676-16f41d5fa145" />


### Radar Chart

<!-- Replace with your own screenshot -->
<img width="459" height="428" alt="image" src="https://github.com/user-attachments/assets/2522e067-0715-4d3e-bac8-11b2f4660e0f" />

### Gaps View

<!-- Replace with your own screenshot -->
<img width="805" height="491" alt="image" src="https://github.com/user-attachments/assets/18a30df1-e15a-4a20-83b0-b65e0c05e1d3" />

### Results

<!-- Replace with your own screenshot -->
<img width="807" height="652" alt="image" src="https://github.com/user-attachments/assets/6847b6fc-a338-4da3-83a0-e1f57b80dcd9" />

### Snapshot Comparison

<!-- Replace with your own screenshot -->
<img width="710" height="693" alt="image" src="https://github.com/user-attachments/assets/204d4694-f3e3-4b58-80d5-90db458a6000" />


---

## Features

### Evidence-Based Tracking

Instead of rating yourself on a scale, you check off real accomplishments. Each skill branch contains a list of evidence items (for example, "Deployed a CI/CD pipeline" under DevOps). Your overall progress percentage is calculated from the number of items you've completed out of the total.

### Four Skill Pillars

Your skills are organized into four pillars: **Think**, **Build**, **Sell**, and **Sustain**. Each pillar contains multiple branches, and each branch contains multiple evidence items. You can expand or collapse any pillar or branch to focus on what matters.

### Stats Overview

At the top of the app, stat cards show your overall "Proven" percentage and a per-pillar breakdown. This gives you a quick snapshot of where you stand without scrolling through every item.

### Views

The app has four view tabs you can switch between:

- **Skill Map**: The main checklist view. Every pillar, branch, and evidence item is listed here. Check items off as you complete them. You can expand or collapse sections to focus on specific areas.
- **Gaps**: Shows your weakest skill branches, the ones with the lowest completion percentage. Use this to figure out where to invest your time next.
- **Radar**: A radar chart that plots your progress across all pillars and branches. Useful for spotting imbalances at a glance.
- **Compare**: Upload two previously exported snapshots (JSON files) side by side to see what changed between them. The app highlights newly completed items and calculates the difference in completion percentages.

---

## Toolbar Buttons

The toolbar sits below the header and gives you quick access to core actions:

| Button | What it does |
|--------|-------------|
| **Export** | Downloads your current progress as a JSON snapshot file. The filename includes the date so you can track snapshots over time. |
| **Load** | Opens a file picker to load a previously exported JSON snapshot. This restores all your checked items and notes from that snapshot. |
| **Share URL** | Generates a compressed URL containing your current progress. You can send this link to anyone and they can view your skill map in their browser. |
| **Notes** | Toggles a text area where you can write personal notes, goals, or reflections. Notes are saved with your snapshot when you export. |
| **Expand All** | Expands every pillar and branch so you can see all evidence items at once. |
| **Collapse** | Collapses all pillars and branches back to the top-level summary view. |
| **Reset** | Clears all your checked items and resets your progress to zero. Use with caution. |

---

## How It Works

1. **Check off evidence items** as you accomplish them. Your progress is saved automatically in your browser's localStorage.
2. **Export a snapshot** at the end of each month (or whenever you want) using the Export button. This gives you a dated JSON file.
3. **Compare snapshots** later by switching to the Compare view and uploading two snapshot files. The app shows you exactly what changed.
4. **Share your progress** by generating a URL with the Share URL button. Anyone with the link can view your skill map.
5. **Add notes** to capture what you're working on, goals for the month, or reflections on your progress.

---

## Getting Started

```bash
git clone https://github.com/Indira-kumar/skills-map.git
cd skills-map
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI rendering |
| Vite 6 | Build tool and dev server |
| CSS-in-JS (inline styles) | Styling with no external framework |
| localStorage | Client-side data persistence |

There is no backend. No accounts. All data stays in your browser.

---

## Project Structure

```
skills-map/
├── src/
│   ├── SkillsMap.jsx          # Main app component (all UI and logic)
│   ├── skillsmap.config.json  # Skill tree definition (pillars, branches, items)
│   ├── questions/             # Evidence items organized per pillar
│   └── main.jsx               # Entry point
├── screenshots/               # Your screenshots go here
├── index.html
├── vite.config.js
├── package.json
└── LICENSE
```

---

## License

This project is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).

You are free to share and adapt this work for **non-commercial** purposes, with attribution.

Copyright (c) 2026 Indira Kumar.

---

**GitHub**: [github.com/Indira-kumar/skills-map](https://github.com/Indira-kumar/skills-map)
