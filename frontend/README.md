# Frontend — Personal Details Application

Angular single-page application for the full-stack developer assessment. Users can register, log in, submit personal details with a file attachment, manage their profile, change their password, and download generated PDF/DOCX documents.

---

## Live URLs

| Environment | URL |
|-------------|-----|
| **Production app** | https://user-profile-management-pink.vercel.app |
| **Production API** | https://fullstack-api-w2x9.onrender.com/api |
| **Local** | http://localhost:4200 |

> **Note:** The backend on Render free tier may take 30–60 seconds to respond on the first request after idle time.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Angular 21 (standalone components) |
| UI | Angular Material |
| Forms | Reactive Forms |
| HTTP | HttpClient (Fetch API) + JWT interceptor |
| State | Angular Signals |
| Notifications | ngx-toastr |
| Styling | SCSS |
| Language | TypeScript 5.9 |

---

## Project Structure

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
│   │   │   └── profile-page/          # Profile, edit, password, downloads
│   │   ├── services/
│   │   │   ├── auth.service.ts        # Auth API + session
│   │   │   └── profile.service.ts     # Profile CRUD + downloads
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # Requires login
│   │   │   └── profile.guard.ts       # Form vs profile routing
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts     # Bearer token on requests
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── environments/
│   │   ├── environment.ts             # Development
│   │   └── environment.prod.ts        # Production
│   └── styles.scss
├── vercel.json                        # SPA routing for Vercel
├── angular.json
└── package.json
```

---

## Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/form` | Authenticated | Personal details form (first-time users) |
| `/profile` | Authenticated | View/edit profile, password, downloads |
| `/` | — | Redirects to `/login` |

### Route guards

| Guard | Route | Behavior |
|-------|-------|----------|
| `authGuard` | `/form`, `/profile` | Redirects to `/login` if not authenticated |
| `noProfileGuard` | `/form` | Redirects to `/profile` if profile already exists |
| `hasProfileGuard` | `/profile` | Redirects to `/form` if no profile exists |

### Login flow

1. User logs in → backend returns `hasProfile: true | false`
2. `hasProfile: false` → navigate to `/form` (no profile GET request)
3. `hasProfile: true` → navigate to `/profile` → single `GET /api/profile`

### Profile page tabs

1. **Profile Details** — view and edit profile + attachment
2. **Download Documents** — PDF or DOCX download
3. **Change Password** — update account password

All feature routes are lazy-loaded.

---

## Key Features

- JWT authentication with `localStorage` session
- Automatic `Authorization: Bearer` header via interceptor
- Reactive form validation (email, 10-digit mobile, passwords)
- File upload (JPG, PNG, PDF — max 5 MB) via `FormData`
- Smart routing based on `hasProfile` from login (no redundant API calls)
- In-memory profile cache — profile GET runs at most once per session
- PDF and DOCX document downloads from backend
- Toast notifications for success and error states

---

## Run Locally

### Prerequisites

- Node.js 18+
- npm 9+
- Backend running on port 5000 (see [backend README](../backend/README.md))

### Step 1 — Start the backend

```bash
cd backend
npm install
cp .env.example .env   # configure MONGO_URI, JWT_SECRET, etc.
npm run dev
```

Backend: **http://localhost:5000**

### Step 2 — Start the frontend

```bash
cd frontend
npm install
npm start
```

Frontend: **http://localhost:4200**

Development API URL is set in `src/environments/environment.ts`:

```ts
apiUrl: 'http://localhost:5000/api'
```

No changes needed if the backend uses port 5000 and `CLIENT_ORIGIN=http://localhost:4200`.

### Step 3 — Test the flow

1. Register a new account at `/register`
2. Log in → redirected to `/form`
3. Submit personal details with an attachment
4. View profile, edit details, change password
5. Download PDF and DOCX from the profile page

### Production build (local)

```bash
npm run build
```

Output: `dist/frontend/browser/`

---

## Environment Configuration

| File | `production` | `apiUrl` |
|------|--------------|----------|
| `environment.ts` | `false` | `http://localhost:5000/api` |
| `environment.prod.ts` | `true` | `https://fullstack-api-w2x9.onrender.com/api` |

The backend must allow the frontend origin via `CLIENT_ORIGIN` (local: `http://localhost:4200`, production: your Vercel URL).

---

## Production Deployment (Vercel)

1. Connect the GitHub repo to [Vercel](https://vercel.com).
2. Import the project with these settings:

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Angular |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/frontend/browser` |

3. Ensure `environment.prod.ts` points to your live backend API URL before deploying.
4. `vercel.json` is included for Angular SPA routing (direct URLs like `/profile` work on refresh).

After deploy, set the backend `CLIENT_ORIGIN` on Render to your Vercel URL.

---

## API Integration Summary

| Action | Method | Endpoint |
|--------|--------|----------|
| Register | POST | `/api/auth/register` |
| Login | POST | `/api/auth/login` |
| Save profile | POST | `/api/profile/save` |
| Get profile | GET | `/api/profile` |
| Update profile | PUT | `/api/profile/update` |
| Change password | PUT | `/api/auth/change-password` |
| Download document | GET | `/api/documents/pdf` or `/docx` |

Full API documentation: [backend README](../backend/README.md)

---

## Related Links

| Resource | URL |
|----------|-----|
| GitHub repository | https://github.com/ketulporania/full-stack-assesment |
| Live backend API | https://fullstack-api-w2x9.onrender.com/api |
| Backend README | [../backend/README.md](../backend/README.md) |
