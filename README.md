# Employee Task & Work Report App

A full‑stack **task management & work‑reporting** application built for the Fidar Imex React Native Internship assignment (Project 05).

Managers and employees can create, assign, track and comment on tasks, move them across a **To Do → In Progress → Completed** workflow, filter/search them, and see live team stats and monthly reports on a dashboard.

> **Tech stack:** React Native (Expo) · Node.js + Express · MongoDB (Mongoose) · JWT authentication · REST API

---

## 📱 Screenshots

| Login | Dashboard | Tasks + Filters | Task Detail | Create/Edit |
|-------|-----------|------------------|-------------|-------------|
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Tasks](docs/screenshots/tasks.png) | ![Detail](docs/screenshots/detail.png) | ![Form](docs/screenshots/form.png) |

_(Add your screenshots to `docs/screenshots/`. On a running app: take them from Expo Go or the installed APK.)_

---

## ✨ Features (mapped to the assignment)

**Project 05 – Employee Task & Work Report App**
- ✅ Create and assign tasks
- ✅ Status workflow: **To Do / In Progress / Completed**
- ✅ Priority (Low / Medium / High) and due dates
- ✅ **Comments and attachments** — text comments plus image attachments on each task
- ✅ **Daily work updates** — post an update that surfaces to the manager as a 🔔 notification on the dashboard
- ✅ **Monthly employee reports** — manager-only tab with per-employee assigned / completed / in-progress / overdue counts

**Mandatory requirements**
- ✅ React Native mobile application (Expo)
- ✅ Node.js backend (Express) with REST APIs
- ✅ Database integration (MongoDB + Mongoose)
- ✅ Login & authentication (JWT + bcrypt, session persisted on device)
- ✅ Dashboard with live stats
- ✅ Full CRUD operations on tasks
- ✅ Search + filter (by title, status, priority)
- ✅ Loading & error handling on every screen (spinners, retry, friendly messages)
- ✅ Clean, responsive UI
- ✅ Git/GitHub repository + README
- ✅ APK build instructions (EAS)

---

## 🗂 Project structure

```
fidar/
├── backend/                 # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── config/db.js      # Mongoose connection
│   │   ├── models/           # User, Task (Mongoose schemas)
│   │   ├── middleware/       # auth (JWT), error handling
│   │   ├── routes/           # auth, users, tasks, reports
│   │   ├── seed.js           # demo users + tasks
│   │   └── server.js         # app entry
│   ├── .env.example
│   └── package.json
│
└── mobile/                  # React Native (Expo) app
    ├── src/
    │   ├── api/              # axios client + service wrappers
    │   ├── components/       # Button, Input, Chip, Badge, TaskItem, ...
    │   ├── context/          # AuthContext (login/register/logout)
    │   ├── navigation/       # RootNavigator + bottom tabs
    │   ├── screens/          # Login, Register, Dashboard, Tasks, TaskForm, TaskDetail, Profile
    │   ├── utils/            # date helpers
    │   ├── config.js         # default backend URL
    │   └── theme.js          # colors / spacing tokens
    ├── App.js
    ├── app.json
    └── eas.json             # APK build profile
```

---

## 🏗 Architecture

```
 React Native (Expo)            Node.js + Express             MongoDB
 ┌────────────────────┐  HTTPS  ┌────────────────────┐        ┌──────────┐
 │  Screens            │ ──────▶ │  Routes             │        │ users    │
 │  AuthContext (JWT)  │  REST   │  JWT auth middleware│ ─────▶ │ tasks    │
 │  axios client       │ ◀────── │  Mongoose models    │        └──────────┘
 └────────────────────┘  JSON   └────────────────────┘
```

- The mobile app stores the **JWT** and user in `AsyncStorage`; an axios interceptor attaches `Authorization: Bearer <token>` to every request.
- All `/api/tasks`, `/api/users` and `/api/reports` routes are protected by the `auth` middleware.
- The dashboard/report numbers are computed with **MongoDB aggregation** (`$group`) plus `countDocuments`.

---

## ✅ Prerequisites

- **Node.js** ≥ 18 (tested on v24)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or a MongoDB Atlas URI)
- **Expo Go** app on your phone (Android/iOS) — for the fastest way to run it
- (For a real APK) a free **Expo account** + `eas-cli`

---

## 🚀 Backend setup

```bash
cd backend
cp .env.example .env          # then edit values if needed
npm install
npm run seed                  # creates demo users + sample tasks
npm start                     # API on http://localhost:4000
```

`.env` values:

| Key | Example | Purpose |
|-----|---------|---------|
| `PORT` | `4000` | API port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/task_report` | database |
| `JWT_SECRET` | `change_me` | token signing secret |
| `JWT_EXPIRES_IN` | `7d` | token lifetime |

**Demo logins (after seeding):**
- Manager — `manager@fidar.com` / `password123`
- Employee — `dhruv@fidar.com` / `password123`
- Employee — `aisha@fidar.com` / `password123`

---

## 📲 Mobile setup

```bash
cd mobile
npm install
npx expo start               # scan the QR with Expo Go
```

**Important — point the app at your backend:**
On a real phone you cannot use `localhost` (that means the phone itself). Use your computer's **LAN IP**:

1. Default is set in `src/config.js` (`DEFAULT_API_URL`). Change it to `http://<YOUR_PC_IP>:4000`, **or**
2. Change it live from the app: **Login screen → ⚙️ Server settings → Backend URL**.

> Find your PC IP: `hostname -I` (Linux) / `ipconfig` (Windows) / `ifconfig` (macOS). The phone and PC must be on the **same Wi‑Fi**.

Run in a browser instead (no phone needed):
```bash
npx expo start --web
```

---

## 📦 Build an APK (Expo EAS)

No Android SDK required — EAS builds in the cloud.

```bash
cd mobile
npm install -g eas-cli        # or use: npx eas-cli@latest
eas login                     # sign in / create a free Expo account
eas build:configure           # (eas.json is already included)
eas build -p android --profile preview
```

When the build finishes, EAS prints a URL to **download the `.apk`**.

> The installed APK still needs to reach your backend. For a demo, run the backend on your PC and set the **Backend URL** in the app's Server settings to your PC's LAN IP (same Wi‑Fi). For a build that works anywhere, deploy the backend (e.g. Render) with a MongoDB Atlas database and use that URL.

---

## 🔌 API reference

Base URL: `http://<host>:4000`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | – | Register `{ name, email, password, role }` → `{ token, user }` |
| `POST` | `/api/auth/login` | – | Login `{ email, password }` → `{ token, user }` |
| `GET`  | `/api/auth/me` | ✅ | Current user |
| `GET`  | `/api/users` | ✅ | List users (for assignment) |
| `GET`  | `/api/tasks` | ✅ | List tasks. Query: `search`, `status`, `priority`, `assignedTo` |
| `GET`  | `/api/tasks/:id` | ✅ | Single task |
| `POST` | `/api/tasks` | ✅ | Create task |
| `PATCH`| `/api/tasks/:id` | ✅ | Update task |
| `DELETE`| `/api/tasks/:id` | ✅ | Delete task |
| `POST` | `/api/tasks/:id/comments` | ✅ | Add comment / daily update `{ text, isUpdate }` |
| `POST` | `/api/tasks/:id/attachments` | ✅ | Attach an image `{ name, dataUrl }` |
| `DELETE`| `/api/tasks/:id/attachments/:attId` | ✅ | Remove an attachment |
| `GET`  | `/api/reports/summary` | ✅ | Counts by status/priority + overdue |
| `GET`  | `/api/reports/monthly` | ✅ | Created vs completed for a month |
| `GET`  | `/api/reports/employees` | ✅ (manager) | Per-employee monthly report |
| `GET`  | `/api/reports/activity` | ✅ | Recent daily work updates (feed) |

Protected routes require header: `Authorization: Bearer <token>`.

Example:
```bash
# login and call a protected route
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"manager@fidar.com","password":"password123"}' | jq -r .token)

curl -s http://localhost:4000/api/tasks -H "Authorization: Bearer $TOKEN"
```

---

## 🧠 Notes & decisions

- **Denormalised names** (`assignedToName`, `authorName`) are stored on tasks/comments so the app renders lists without extra population queries — simple and fast for an MVP.
- **Overdue** = due date before today **and** not `Completed`.
- **Auth persistence**: on launch the app restores the saved token, so you stay logged in.
- This is an **MVP** built within the assignment's time box — production hardening (refresh tokens, pagination, role-based route guards, tests) is intentionally out of scope.

---

## 📄 License

MIT — built for the Fidar Imex Private Limited internship assignment.
