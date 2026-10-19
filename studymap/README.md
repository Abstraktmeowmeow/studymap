# StudyMap — free, collaborative mind mapping

A student-friendly MindMeister-inspired mind mapping web app, built with React, React Flow, Firebase Google Authentication, Cloud Firestore, and Firebase Hosting. Open source; you control your own data and deployment. It is an independent app and is not affiliated with MindMeister.

## Features

- No app-imposed cap on number of mind maps; real limits come from your Firebase quotas.
- Google sign-in; real-time synced topics between editors (Firestore listeners).
- Create parent/child topics, drag to reposition, edit text, notes and topic colours.
- HTTPS image URL embedded in topics (external images, not uploads).
- Folder grouping for owned maps, mobile-responsive editor, zoom and pan.
- Sharing by secret invite link (Google sign-in required); new invitees receive editor access. Do not share links publicly.
- In-session undo/redo for topics (best effort: concurrent teammate updates may supersede them).
- Export JSON or SVG; import JSON or indented outlines (Markdown/text).
- MindMeister migration: store source link and import copied outline/export data. **A share link alone cannot automatically retrieve a complete map in this version.** This avoids bypassing owner permissions, paywalls and cross-origin restrictions.

## What this version does not have

It does **not** have automatic one-click URL cloning from MindMeister, rich-text image uploads, collaborator cursors, offline mode, PDF export, history across sessions, simultaneous conflict-free text editing, or map deletion. Concurrent edits to the same topic are last-write-wins. The page initially fits the full map; it supports zooming/panning and large maps subject to browser performance.

## Run locally

1. Install Node.js LTS (Node 20+), Git, and create a [Firebase project](https://console.firebase.google.com/).
2. In Firebase console: **Authentication → Sign-in method → Google → Enable**, choose support email.
3. Under **Build → Firestore Database**, create a database; pick a nearby region and choose production mode (security rules below must be deployed).
4. In Project settings, register a **Web app** and copy the configuration values. Copy `.env.example` to `.env` and fill the five `VITE_` values (some projects do not need storage bucket).
5. Go to Authentication → Settings → Authorized domains. Add `localhost` and your actual Firebase Hosting domain if missing.
6. Install and start:

```bash
npm install
npm run dev
```

7. Install Firebase CLI and authenticate:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

8. Visit http://localhost:5173 and sign in.

## Deploy online for free within quotas

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

The CLI prints your `https://YOUR-PROJECT.web.app` URL. In Firebase Authentication authorized domains, ensure `YOUR-PROJECT.web.app` and any custom domain are added. The app uses HTML5 URL routing with Firebase Hosting SPA rewrites.

The Firebase Spark tier requires no payment card to start, but quotas ARE finite. As of late 2026 Cloud Firestore free tier includes approximately 20K writes/day, 50K reads/day, and 1 GiB storage (subject to Google's changes). Heavy multi-user live editing can exhaust quotas; the service can stop working until the quota resets. Watch Firebase usage. Do not describe the hosting or storage as infinite.

## Upload this folder to GitHub

Create a new empty GitHub repository (e.g. `studymap`) under your GitHub account, then in the extracted directory run:

```bash
git init
git add .
git commit -m "Initial StudyMap app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/studymap.git
git push -u origin main
```

The `.env` file is excluded from git. Firebase web config is not a secret; server credentials or service-account JSON must **never** be committed. Avoid publicizing invite links.

## Share and migrate maps

To invite a friend: open a map → Share → copy invitation link → friend signs in with Google → friend joins and can edit. Only an owner can create invites. Owners can revoke a link manually by deleting the corresponding document in Firestore `invites/{token}`; already-joined collaborators must also have their `maps/{mapId}/members/{uid}` document deleted to revoke ongoing access, and their personal map index will display a stale entry until removed. For production teams, add a dedicated permissions UI and revocation workflow.

To migrate from MindMeister: open the map in MindMeister's **Outline** view; where you have permission, copy the outline or obtain an authorized export file. In StudyMap, open a map → Import → paste the hierarchical outline (indent child topics with spaces) or upload a StudyMap JSON file. Include the original URL for attribution. A pasted URL *by itself* is not a usable export and is not processed by the server.

## Security model

The supplied `firestore.rules` enforce sign-in, members-only map/node reads, editors-only topic edits, owner-only map metadata edits/invitations, and users-only personal folders/index reads. Invitations use unguessable tokens; being sent an invite means the recipient can join, so treat them as passwords. All Firestore requests are checked server-side. There are limits on text and image URLs. External images may still expose your IP address to their host; only use trusted HTTPS links. Google sign-in is independent from MindMeister authorization.

## Tech and data layout

- `src/main.jsx` — UI, canvas, editor, migrations, exports
- `src/data.js` — Firestore CRUD and sharing
- `src/import.js` — outline/JSON import parsers
- `src/firebase.js` — Firebase SDK setup
- `src/style.css` — design/mobile layout
- `firestore.rules` — backend access control
- `firebase.json` — rules and static site hosting config

Firestore documents: `maps/{mapId}` (metadata), `maps/{mapId}/members/{uid}` (permissions), `maps/{mapId}/nodes/{nodeId}` (topics), `invites/{randomToken}` (map invitation), `users/{uid}/mapIndex/{mapId}` (dashboard index), `users/{uid}/folders/{folderId}` (folders). Data is never shared with MindMeister.

## Caveats / roadmap

For a large public rollout: add rate limiting and App Check, secure server-side invitations/email invites, backup and restore, safe cascading deletion, image uploads with Storage rules and quotas, collaborative CRDT document text, undo event log, more comprehensive SVG/text wrapping, and CI tests. Google authentication popup behavior varies in in-app browsers (redirect fallback is included for popup-blocked cases).
