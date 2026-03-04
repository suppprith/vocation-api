# Phase 1 — Authentication API

> User registration, login, and session management.  
> **Base URL:** `http://localhost:3000`

---

## Overview

| Method | Endpoint           | Auth | Description        |
| ------ | ------------------ | ---- | ------------------ |
| `POST` | `/api/auth/signup` | No   | Create account     |
| `POST` | `/api/auth/login`  | No   | Sign in            |
| `POST` | `/api/auth/logout` | Yes  | Invalidate session |
| `GET`  | `/api/auth/me`     | Yes  | Get current user   |

**Auth header format:** `Authorization: Bearer <token>`

---

## Error Format

All errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

---

## Endpoints

### `POST /api/auth/signup`

Create a new user account.

**Request:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePass123"
}
```

| Field      | Type   | Validation                    |
| ---------- | ------ | ----------------------------- |
| `name`     | string | Required, max 100 chars       |
| `email`    | string | Required, valid email, unique |
| `password` | string | Required, min 6 chars         |

**Response `201`:**

```json
{
  "user": {
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatar": null,
    "onboardingComplete": false,
    "roles": ["job_seeker"],
    "createdAt": "2026-03-04T...",
    "updatedAt": "2026-03-04T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:** `400` validation failed · `409` email already registered

---

### `POST /api/auth/login`

Sign in with existing credentials.

**Request:**

```json
{
  "email": "jane@example.com",
  "password": "securePass123"
}
```

**Response `200`:**

```json
{
  "user": {
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatar": null,
    "onboardingComplete": true,
    "roles": ["job_seeker"],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:** `401` invalid email or password

---

### `POST /api/auth/logout`

Invalidate session (stateless — client discards token).

**Auth:** Required

**Request:** No body.

**Response `200`:**

```json
{ "success": true }
```

---

### `GET /api/auth/me`

Get the currently authenticated user.

**Auth:** Required

**Response `200`:**

```json
{
  "user": {
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatar": null,
    "onboardingComplete": true,
    "roles": ["job_seeker"],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:** `401` token missing, invalid, or expired

---

## Implementation Details

- **Password hashing:** bcrypt with cost factor 12
- **JWT payload:** `{ sub, email, roles, iat, exp }`
- **Token expiry:** configurable via `JWT_EXPIRES_IN` env var (default `1h`)
- **Security:** `passwordHash` is never returned in any API response
