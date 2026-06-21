# Backend — Personal Details API

## 1. Project Overview

Node.js/Express REST API for the full-stack assessment. It handles user registration and authentication (JWT), personal profile CRUD with file attachments, password changes, and document generation (PDF/DOCX).

Data is stored in MongoDB via Mongoose. Protected routes require a valid Bearer token. Uploaded files are saved to the `uploads/` directory and served statically at `/uploads`.

---

## 2. Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Authentication | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| File Upload | Multer |
| Documents | PDFKit (PDF), docx (DOCX) |
| Security | CORS, express-rate-limit, helmet-style headers |
| Dev Tools | nodemon, mongodb-memory-server (optional) |

---

## 3. Folder Structure

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
│   ├── uploadMiddleware.js      # Multer file upload config
│   └── rateLimiter.js           # API and auth rate limits
├── models/
│   ├── User.js                  # User schema
│   └── PersonalDetails.js       # Profile schema
├── routes/
│   ├── authRoutes.js            # /api/auth/*
│   ├── profileRoutes.js         # /api/profile/*
│   └── documentRoutes.js        # /api/documents/*
├── uploads/                     # Stored file attachments (created at runtime)
├── server.js                    # App entry point
├── .env                         # Environment variables (not committed)
└── package.json
```

---

## 4. Environment Variables (.env)

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_super_secret_key
CLIENT_ORIGIN=http://localhost:4200
BCRYPT_ROUNDS=10
USE_MEMORY_DB=false
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `5000`) |
| `MONGO_URI` | Yes* | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `CLIENT_ORIGIN` | No | Allowed frontend origin for CORS (default: `http://localhost:4200`) |
| `BCRYPT_ROUNDS` | No | Password hashing rounds (default: `10`) |
| `USE_MEMORY_DB` | No | Set to `true` to use in-memory MongoDB for local dev (no Atlas needed) |

\* Not required when `USE_MEMORY_DB=true`.

**Important:** Never commit `.env` to version control. Use strong, unique values for `JWT_SECRET` and database credentials in production.

---

## 5. How to Run Locally

**Prerequisites:** Node.js 18+, npm 9+, MongoDB (Atlas or local) — or set `USE_MEMORY_DB=true`

```bash
cd backend
npm install
```

Create `.env` with the variables above, then:

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server runs at **http://localhost:5000**.

Ensure the Angular frontend is running at `http://localhost:4200` and that `CLIENT_ORIGIN` matches.

**Optional — in-memory database (no MongoDB install):**

```env
USE_MEMORY_DB=true
```

---

## 6. API Endpoints Table

Base URL: `http://localhost:5000/api`

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive JWT token |
| PUT | `/auth/change-password` | Yes | Change password |

**Register body (JSON):**
```json
{ "username": "john", "email": "john@example.com", "password": "secret123" }
```

**Login body (JSON):**
```json
{ "username": "john", "password": "secret123" }
```

**Login response:** `{ "token": "...", "user": { "id", "username", "email" } }`

Protected routes require header: `Authorization: Bearer <token>`

---

### Profile — `/api/profile`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profile/save` | Yes | Create/save personal details + attachment |
| GET | `/profile` | Yes | Get current user's profile |
| PUT | `/profile/update` | Yes | Update profile (attachment optional) |

**Save/update body (multipart/form-data):**

| Field | Required (save) | Type |
|-------|-----------------|------|
| `full_name` | Yes | string |
| `date_of_birth` | Yes | ISO date string |
| `email` | Yes | string |
| `phone_number` | Yes | string |
| `address` | Yes | string |
| `attachment` | Yes (save only) | file |

**Responses:**
- `GET /profile` → `404` if no profile exists yet (expected for new users)
- `POST /profile/save` → `201` on success

---

### Documents — `/api/documents`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/documents/:type` | Yes | Download profile as PDF or DOCX (`type` = `pdf` or `docx`) |

Returns `404` if profile does not exist.

---

### Static Files

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/uploads/:filename` | No | Serve uploaded attachment files |

---

## 7. File Upload Rules

| Rule | Value |
|------|-------|
| Field name | `attachment` |
| Allowed types | JPG (`image/jpeg`), PNG (`image/png`), PDF (`application/pdf`) |
| Max file size | 5 MB |
| Max files per request | 1 |
| Storage | `backend/uploads/` |
| Filename format | `{timestamp}_{originalName}` |

**Validation errors:**
- Missing attachment on save → `400` — "Attachment is required"
- Invalid type → `400` — "Invalid file type. Only JPG, PNG, and PDF are allowed."
- File too large → `400` — "File too large. Maximum size is 5MB."

On profile **update**, the attachment is optional; other fields can be updated without re-uploading a file.

---

## 8. Live API URL

| Environment | URL |
|-------------|-----|
| Local | http://localhost:5000/api |
| Production | _Not deployed yet — update this section after deployment_ |

When deployed (e.g. Render, Railway, AWS), add the live API base URL here and set `CLIENT_ORIGIN` to your frontend URL in the hosting provider's environment settings.
