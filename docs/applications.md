# Phase 4 — Applications Module API

> Application lifecycle management for job seekers.  
> **Base URL:** `http://localhost:3000`  
> **All endpoints require:** `Authorization: Bearer <token>` + `job_seeker` role

---

## Overview

| Method   | Endpoint                       | Description                               |
| -------- | ------------------------------ | ----------------------------------------- |
| `POST`   | `/api/applications`            | Apply to / save a job                     |
| `GET`    | `/api/applications`            | List applications (filterable, paginated) |
| `GET`    | `/api/applications/tracker`    | Kanban-style grouped view                 |
| `GET`    | `/api/applications/:id`        | Single application + job details          |
| `PATCH`  | `/api/applications/:id/status` | Update status with transition rules       |
| `DELETE` | `/api/applications/:id`        | Withdraw / delete                         |

---

## Status Transitions

```
saved → applied → interviewing → offer
                 ↘ rejected
       applied → rejected
```

- `offer` and `rejected` are **terminal** — no transitions out
- Invalid transitions return `400 INVALID_STATUS_TRANSITION`
- Every transition is recorded in `statusHistory[]`

---

## Endpoints

### `POST /api/applications`

**Request:**

```json
{
  "jobId": "65e6...",
  "status": "saved",
  "notes": "Looks interesting"
}
```

| Field    | Type   | Required | Notes                                    |
| -------- | ------ | -------- | ---------------------------------------- |
| `jobId`  | string | ✅       | Must be a valid, active job              |
| `status` | string | ❌       | Default: `saved`. One of: saved, applied |
| `notes`  | string | ❌       | Optional notes                           |

**Response `201`:** Full application object

**Errors:** `404` job not found · `409` duplicate application

---

### `GET /api/applications`

**Query Parameters:** `status`, `page` (default 1), `limit` (default 20, max 100)

**Response `200`:**

```json
{
  "applications": [
    {
      "id": "...",
      "status": "applied",
      "notes": null,
      "appliedAt": "2026-03-07T...",
      "statusHistory": [
        { "from": null, "to": "saved", "changedAt": "..." },
        { "from": "saved", "to": "applied", "changedAt": "..." }
      ],
      "job": {
        "id": "...",
        "title": "Senior Frontend Engineer",
        "company": "Vercel",
        "location": "San Francisco, CA",
        "workArrangement": "remote",
        "salaryRange": "$180k – $250k"
      }
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### `GET /api/applications/tracker`

Returns applications grouped by status for a Kanban board.

**Response `200`:**

```json
{
  "tracker": {
    "saved": [
      /* applications */
    ],
    "applied": [
      /* applications */
    ],
    "interviewing": [],
    "offer": [],
    "rejected": []
  }
}
```

---

### `GET /api/applications/:id`

**Response `200`:** `{ "application": { ... } }` with populated job details

**Errors:** `404` not found

---

### `PATCH /api/applications/:id/status`

**Request:**

```json
{ "status": "interviewing", "notes": "Phone screen scheduled" }
```

**Response `200`:** Updated application with new `statusHistory` entry appended

**Errors:** `400` invalid transition · `404` not found

---

### `DELETE /api/applications/:id`

**Response `200`:** `{ "success": true }`

**Errors:** `404` not found
