# Frontend — Personal Details Application

## 1. Project Overview

Angular single-page application built for the full-stack assessment. Users can register, log in, submit personal details with a file attachment, view and edit their profile, change their password, and download generated documents (PDF/DOCX).

The app communicates with a Node.js/Express backend via REST API and JWT authentication. New users are guided to a personal-details form; returning users with a saved profile land directly on the profile page.

---

## 2. Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Angular 21 (standalone components) |
| UI | Angular Material |
| Forms | Reactive Forms |
| HTTP | Angular HttpClient (Fetch API) |
| State | Angular Signals |
| Notifications | ngx-toastr |
| Styling | SCSS |
| Language | TypeScript 5.9 |

---

## 3. Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/                 # Login page
│   │   │   └── register/              # Registration page
│   │   ├── form/
│   │   │   └── personal-details/      # First-time profile form
│   │   ├── profile/
│   │   │   └── profile-page/          # Profile view, edit, password, downloads
│   │   ├── services/
│   │   │   ├── auth.service.ts        # Auth API + session state
│   │   │   └── profile.service.ts     # Profile CRUD + document downloads
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # Protects authenticated routes
│   │   │   └── profile.guard.ts       # Redirects if profile already exists
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts     # Attaches Bearer token to requests
│   │   ├── core/
│   │   │   └── preload.strategy.ts    # Lazy-route preloading
│   │   ├── app.routes.ts              # Route definitions
│   │   ├── app.config.ts              # App providers
│   │   └── app.component.ts           # Root shell (router-outlet)
│   ├── environments/
│   │   ├── environment.ts             # Development config
│   │   └── environment.prod.ts        # Production config
│   ├── main.ts                        # App bootstrap
│   └── styles.scss                    # Global styles
├── angular.json
└── package.json
```

---

## 4. Pages & Routes

| Route | Access | Page | Description |
|-------|--------|------|-------------|
| `/login` | Public | Login | Sign in with username and password |
| `/register` | Public | Register | Create a new account |
| `/form` | Authenticated | Personal Details | Submit profile (first-time users only) |
| `/profile` | Authenticated | Profile | View/edit profile, change password, download documents |
| `/` | — | — | Redirects to `/login` |
| `/**` | — | — | Unknown paths redirect to `/login` |

**Route guards**

- `authGuard` — blocks unauthenticated access; redirects to `/login`
- `noProfileGuard` — on `/form`, redirects to `/profile` if a profile already exists

**Login redirect logic**

- No profile saved → `/form`
- Profile exists → `/profile`

**Profile page tabs**

1. **Profile Details** — view data and attachment; edit profile
2. **Change Password** — update password
3. **Download Documents** — download PDF and DOCX

All page components are lazy-loaded.

---

## 5. Key Features

- **JWT authentication** — token and user stored in `localStorage`; automatic logout clears session
- **HTTP interceptor** — adds `Authorization: Bearer <token>` to every API request
- **Reactive form validation** — required fields, email format, 10-digit mobile, password rules
- **File upload** — JPG, PNG, or PDF up to 5 MB via `FormData` (multipart)
- **Smart routing** — guards control access; returning users skip the form
- **Document downloads** — PDF and DOCX generated from profile data on the backend
- **Toast notifications** — success and error feedback on all actions
- **Lazy loading** — smaller initial bundle; routes load on demand

---

## 6. How to Run Locally

**Prerequisites:** Node.js 18+, npm 9+, backend running on port 5000

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start the backend (separate terminal)
cd ../backend
npm install
npm run dev

# 3. Start the frontend
cd ../frontend
npm start
```

Open **http://localhost:4200** in your browser.

**Production build**

```bash
npm run build
```

Output is written to `dist/frontend/`.

---

## 7. Environment Config

API URL is configured in environment files:

| File | `production` | `apiUrl` |
|------|--------------|----------|
| `src/environments/environment.ts` | `false` | `http://localhost:5000/api` |
| `src/environments/environment.prod.ts` | `true` | Update before deploying |

**Development** — no changes needed if the backend runs on port 5000.

**Production** — set `apiUrl` in `environment.prod.ts` to your deployed backend URL (e.g. `https://your-api.onrender.com/api`) before running `npm run build`.

The backend must allow the frontend origin via `CLIENT_ORIGIN` in its `.env` file.

---

## 8. Live App URL

| Environment | URL |
|-------------|-----|
| Local | http://localhost:4200 |
| Production | _Not deployed yet — update this section after deployment_ |

When deployed, add the live frontend URL here (e.g. Vercel, Netlify, or Render static site).
