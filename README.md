# Weavr Connect

**Pastoral follow-up tool for tracking visitors through the connection journey.**

Weavr Connect helps church staff manage the complete visitor-to-member pipeline. Track people from their first visit through salvation, baptism, next steps, small groups, and serving teams — all the way to fully connected.

## Features

- **6-Stage Pipeline** — First Visit → Salvation → Baptism → Next Steps → BGroup → ATeam → Fully Connected
- **Monday Morning List** — Priority-ranked follow-up queue based on engagement scoring
- **Work Mode** — Step through assigned contacts one at a time with full action bar
- **Smart Follow-Up Scheduler** — Stage-specific timing suggestions with calendar picker
- **Milestone Tracking** — Date saved, date baptized, next steps attendance, BGroup/ATeam join dates
- **Plug-In Status** — Independent BGroup and ATeam toggle cards, decoupled from linear timeline
- **Fully Connected Completion** — Ceremonial button when both BGroup and ATeam are active
- **Contact Actions** — Copy-ready text/email templates per stage with SMS and email integration
- **Bulk Messaging** — Personalized stage-specific messages for batch outreach
- **Quick Entry** — Rapid-fire connection card entry with running session list
- **Reports Dashboard** — Customizable widgets: KPIs, engagement distribution, stage velocity, drop-off analysis, team performance, weekly summary
- **Automation Rules** — Configurable triggers and actions for follow-up workflows
- **Assigned Cards** — View and work contacts by team member in grid or Work Mode
- **Customizable Forms** — Full field builder with text, dropdown, and checkbox types
- **Text & Email Templates** — Per-stage message templates with placeholder support
- **Check-In Types** — Customizable check-in options with colors
- **Light/Dark Mode** — Four color schemes (Purple, Teal, Rose, Emerald)
- **CSV Import/Export** — Bulk data management
- **Persistent Storage** — All data saved locally via localStorage

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/weavr-connect.git
cd weavr-connect
npm install
```

### Run locally

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

### Build for production

```bash
npm run build
```

Output goes to the `dist/` folder. Deploy to any static hosting (Netlify, Vercel, GitHub Pages, etc).

## Project Structure

```
weavr-connect/
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite build configuration
├── public/
│   └── favicon.svg     # App icon
└── src/
    ├── main.jsx        # React entry point
    ├── storage.js      # localStorage adapter (polyfills window.storage)
    └── App.jsx         # Complete application (single-file React component)
```

## Architecture

The entire app is a single React component (`App.jsx`) with no external UI dependencies. Styling is inline with CSS variables for theming. Data persists via localStorage with the following keys:

| Key | Contents |
|-----|----------|
| `ce5-people` | All person records |
| `ce5-tpl` | Text message templates |
| `ce5-teams` | Team member definitions |
| `ce5-rules` | Automation rules |
| `ce5-config` | Settings (theme, colorway, check-in types, form fields, email templates) |

## Connection Pipeline

```
First Visit → Salvation → Baptism → Next Steps
                                        ↓
                              ┌─────────┴─────────┐
                              ↓                   ↓
                           BGroup              ATeam
                              ↓                   ↓
                              └─────────┬─────────┘
                                        ↓
                               ⭐ Fully Connected
```

BGroup and ATeam are independent — a person can join either or both in any order. The "Fully Connected" status requires both.

## Roadmap

- [ ] Planning Center Online integration (OAuth2 + REST API)
- [ ] Logo/branding customization
- [ ] Push notification reminders
- [ ] Multi-user support with role-based access
- [ ] Mobile-optimized responsive layout

## License

MIT
