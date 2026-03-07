# Phase 7 — Employer Job Postings API

> Create and manage job postings as an employer.  
> **Base URL:** `http://localhost:3000`  
> **All endpoints require:** `Authorization: Bearer <token>` + `employer` role

---

## Overview

| Method   | Endpoint                        | Description                  |
| -------- | ------------------------------- | ---------------------------- |
| `POST`   | `/api/employer/jobs`            | Create a job posting (draft) |
| `GET`    | `/api/employer/jobs`            | List employer's postings     |
| `GET`    | `/api/employer/jobs/:id`        | Single posting detail        |
| `PUT`    | `/api/employer/jobs/:id`        | Update posting               |
| `PATCH`  | `/api/employer/jobs/:id/status` | Change posting status        |
| `DELETE` | `/api/employer/jobs/:id`        | Delete posting               |

## Posting Status Lifecycle

```
draft → active → paused → active (re-activate)
                → closed (terminal)
```

- Only **active** postings are visible to job seekers
- **closed** is terminal — no transitions out
- Company name and logo are auto-filled from the employer's company profile

---

## Endpoints

### `POST /api/employer/jobs`

Creates a new posting in **draft** status (not visible to seekers).

> **Prerequisite:** Employer must have a company profile (`POST /api/company`) first.

**Request:**

```json
{
  "title": "Senior Frontend Engineer",
  "description": "Build amazing UIs...",
  "location": "San Francisco, CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "workArrangement": "remote",
  "employmentType": "full-time",
  "companySize": "medium",
  "industry": "Technology",
  "skills": ["React", "TypeScript", "Next.js"],
  "salaryRange": "$180k – $250k",
  "salaryMin": 180000,
  "salaryMax": 250000,
  "applyUrl": "https://example.com/apply"
}
```

**Response `201`:** `{ "jobPosting": { ... } }`

---

### `GET /api/employer/jobs`

**Query:** `status` (draft/active/paused/closed), `page`, `limit`

**Response `200`:** `{ "jobPostings": [...], "total", "page", "limit", "totalPages" }`

---

### `PUT /api/employer/jobs/:id`

Partial update — any field from the create schema.

---

### `PATCH /api/employer/jobs/:id/status`

**Request:** `{ "status": "active" }`

**Transitions:**

- `draft → active`
- `active → paused | closed`
- `paused → active | closed`
- `closed → (none, terminal)`

**Errors:** `400` invalid transition

---

### `DELETE /api/employer/jobs/:id`

**Response `200`:** `{ "success": true }`
