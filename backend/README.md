# Backend — Personal Details API

REST API for the full-stack developer assessment. Handles user authentication, personal profile management with file uploads, and PDF/DOCX document generation.

---

## Live URLs

| Environment | URL |
|-------------|-----|
| **Production API** | https://fullstack-api-w2x9.onrender.com/api |
| **Health check** | https://fullstack-api-w2x9.onrender.com/api |
| **Local** | http://localhost:5000/api |

> **Note:** The production API runs on [Render](https://render.com) (free tier). The first request after idle time may take 30–60 seconds (cold start).

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| File upload | Multer |
| Documents | PDFKit (PDF), docx (DOCX) |
| Security | CORS, express-rate-limit, compression |

---

## Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection + index sync
├── controllers/
│   ├── authController.js        # Register, login, change password
│   ├── profileController.js     # Save, get, update profile
│   └── documentController.js    # Generate PDF and DOCX
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   ├── uploadMiddleware.js      # Multer upload config
│   └── rateLimiter.js           # Rate limiting
├── models/
│   ├── User.js
│   └── PersonalDetails.js
├── routes/
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   └── documentRoutes.js
├── uploads/                     # Uploaded files (runtime, gitignored)
├── server.js                    # Entry point
├── .env.example                 # Environment template (safe to commit)
└── package.json
```

---

## Run Locally

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas cluster **or** `USE_MEMORY_DB=true` for local dev without Atlas

### Step 1 — Install dependencies

```bash
cd backend
npm install
```

### Step 2 — Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_ORIGIN=http://localhost:4200
BCRYPT_ROUNDS=10
USE_MEMORY_DB=false
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes* | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `CLIENT_ORIGIN` | No | Frontend URL for CORS (default: `http://localhost:4200`) |
| `PORT` | No | Server port (default: `5000`) |
| `BCRYPT_ROUNDS` | No | Password hashing rounds (default: `10`) |
| `USE_MEMORY_DB` | No | Set `true` to skip Atlas and use in-memory MongoDB |

\* Not required when `USE_MEMORY_DB=true`.

**Never commit `.env` to Git.**

### Step 3 — Start the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production mode
npm start
```

Server runs at **http://localhost:5000**.

Verify:

```bash
curl http://localhost:5000/api
# {"status":"ok","message":"API is running"}
```

### Step 4 — Run the frontend

In a separate terminal:

```bash
cd ../frontend
npm install
npm start
```

Open **http://localhost:4200** and ensure `CLIENT_ORIGIN=http://localhost:4200` in backend `.env`.

---

## Production Deployment (Render)

1. Connect the GitHub repo to [Render](https://render.com).
2. Create a **Web Service** with:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add environment variables in the Render dashboard (not in Git):

| Variable | Example |
|----------|---------|
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | Strong random secret |
| `CLIENT_ORIGIN` | `https://full-stack-assesment-pink.vercel.app` |
| `BCRYPT_ROUNDS` | `10` |
| `USE_MEMORY_DB` | `false` |

4. Deploy from the `main` branch. Render assigns a public URL and uses its own `PORT` internally.

**CORS:** `CLIENT_ORIGIN` must exactly match the frontend URL (no trailing slash).

---

## API Reference

Base URL: `/api`

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Service status |
| GET | `/api` | No | API status |

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive JWT + `hasProfile` flag |
| PUT | `/auth/change-password` | Yes | Change password |

**Register (JSON):**

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login (JSON):**

```json
{
  "username": "john",
  "password": "secret123"
}
```

**Login response:**

```json
{
  "success": 1,
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": "...", "username": "john", "email": "john@example.com" },
  "hasProfile": false
}
```

The `hasProfile` field tells the frontend whether to route the user to the personal-details form or the profile page — without an extra profile GET for new users.

Protected routes require: `Authorization: Bearer <token>`

### Profile — `/api/profile`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profile/save` | Yes | Create profile + attachment |
| GET | `/profile` | Yes | Get current user's profile |
| PUT | `/profile/update` | Yes | Update profile (attachment optional) |

**Save / update (multipart/form-data):**

| Field | Required (save) | Type |
|-------|-----------------|------|
| `full_name` | Yes | string |
| `date_of_birth` | Yes | ISO date string |
| `email` | Yes | string |
| `phone_number` | Yes | string |
| `address` | Yes | string |
| `attachment` | Yes (save only) | JPG, PNG, or PDF (max 5 MB) |

- `GET /profile` → `404` if no profile exists (called only when the user is known to have a profile)
- `POST /profile/save` → `201` with profile data on success

### Documents — `/api/documents`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/documents/:type` | Yes | Download PDF or DOCX (`type` = `pdf` \| `docx`) |

### Static files

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/uploads/:filename` | No | Serve uploaded attachments |

---

## File Upload Rules

| Rule | Value |
|------|-------|
| Field name | `attachment` |
| Allowed types | JPG, PNG, PDF |
| Max size | 5 MB |
| Max files | 1 per request |
| Storage | `backend/uploads/` |

---

## Related Links

| Resource | URL |
|----------|-----|
| GitHub repository | https://github.com/ketulporania/full-stack-assesment |
| Live frontend | https://user-profile-management-pink.vercel.app |
| Frontend README | [../frontend/README.md](../frontend/README.md) |
