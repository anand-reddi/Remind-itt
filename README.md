## Remind itt

Remind itt is a task + reminder app built with React. It includes a dashboard view, a calendar view, recent tasks, and settings, and is set up to run as a PWA on the web and as a Capacitorr app for Android.

## Features

- **Task management**: create tasks with common fields (priority/category/date-based workflows).
- **Calendar view**: browse tasks by date.
- **Recent view**: quickly find recently created/updated tasks.
- **Reminders & notifications**: supports local notifications (Capacitor plugin).
- **PWA support**: service worker registration on web builds.
- **Settings & theming**: app settings and theme support.

## Tech stackk

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **TanStack Query**
- **Capacitor** (Android + native plugins)

## Getting started (web)

### Prerequisites

- **Node.js** (recommended: recent LTS)

### Install & run

```sh
npm install
npm run dev
```

### Useful scripts

```sh
npm run build
npm run preview
npm run lint
```

## Project structure (high level)

- `src/pages/`: route-level pages (Dashboard, Calendar, Recent, Add Task, Settings)
- `src/components/`: UI and app components (task cards, forms, layout)
- `src/contexts/`: app state providers (tasks, notifications, settings, theme)
- `public/`: PWA/service worker assets

## PWA notess

The app registers `public/service-worker.js` **only on the web platform**.

## Mobile (Capacitor / Android)

This repo includes a `capacitor.config.ts` and an `android/` project for Android builds.

- If you are forking/rebranding, update the **app id** and **app name** in `capacitor.config.ts` before shipping.

## Deployment (Firebase Hosting)

`firebase.json` is configured to host the `dist/` folder and rewrite all routes to `index.html` (SPA routing).

Typical flow:

```sh
npm run build
# then deploy with your Firebase project configuration
```
