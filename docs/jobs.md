# Phase 3 — Jobs Module API

> Search, filtering, and personalized discovery of job postings.  
> **Base URL:** `http://localhost:3000`  
> **All endpoints require:** `Authorization: Bearer <token>` + `job_seeker` role

---

## Overview

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| `GET`  | `/api/jobs`             | Paginated search & filter      |
| `GET`  | `/api/jobs/recommended` | Top N matched jobs for user    |
| `GET`  | `/api/jobs/matches`     | All jobs sorted by match score |
| `GET`  | `/api/jobs/map`         | Jobs with geo-coordinates      |
| `GET`  | `/api/jobs/:id`         | Single job detail              |

---

## Matching Engine

Whenever a user requests jobs, the system calculates a personalized `matchScore` (0–100) and `matchReason` on the fly.

**Scoring Weights:**

- **30%**: Skill overlap
- **15%**: Role relevance (`targetRoles` vs job title)
- **10%**: Industry match
- **10%**: Work arrangement alignment
- **10%**: Salary range fit
- **10%**: Passion alignment (user's passions vs job industry)
- **5%**: Employment type match
- **5%**: Company size match
- **5%**: Work style (neutral default for now)

---

## Endpoints

### `GET /api/jobs`

Search and filter jobs. By default, returns the newest jobs first, with personalized `matchScore`s appended.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Keyword search across title, company, description, and skills |
| `industry` | string | Exact filter by industry |
| `workArrangement`| string | Exact filter (e.g. `remote`, `hybrid`) |
| `companySize` | string | Exact filter (e.g. `startup`, `enterprise`) |
| `employmentType`| string | Exact filter (e.g. `full-time`) |
| `page` | number | Default: 1 |
| `limit` | number | Default: 20, Max: 100 |

**Response `200`:**

```json
{
  "jobs": [
    {
      "id": "65e6...",
      "title": "Senior Frontend Engineer",
      "company": "Vercel",
      "companyLogo": null,
      "description": "...",
      "location": "San Francisco, CA",
      "coordinates": { "lat": 37.7749, "lng": -122.4194 },
      "workArrangement": "remote",
      "employmentType": "full-time",
      "companySize": "medium",
      "industry": "Technology",
      "skills": ["React", "TypeScript", "Next.js"],
      "salaryRange": "$180k – $250k",
      "applyUrl": "https://vercel.com/careers",
      "matchScore": 85,
      "matchReason": "Strong overlap with your React, TypeScript skills. Matches your work arrangement preference.",
      "postedDate": "2026-03-01T00:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### `GET /api/jobs/recommended`

Get the top N highest-scoring jobs for the active user.

**Query Parameters:**

- `limit` (number, default: 4, max: 20)

**Response `200`:**

```json
{
  "jobs": [
    /* Same job object format as above, sorted by matchScore DESC */
  ]
}
```

---

### `GET /api/jobs/matches`

Browse all active jobs, strictly sorted from highest `matchScore` to lowest. Supports pagination.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response `200`:**

```json
{
  "jobs": [
    /* Sorted by matchScore DESC */
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### `GET /api/jobs/map`

Fetch jobs that have valid geo-coordinates. Optionally filter by a bounding box.

**Query Parameters:**

- `bounds` (string): Format: `swLat,swLng,neLat,neLng` (e.g. `37.0,-123.0,38.0,-122.0`)

**Response `200`:**

```json
{
  "jobs": [
    {
      "id": "65e6...",
      "title": "Product Designer",
      "company": "Figma",
      "coordinates": { "lat": 40.7128, "lng": -74.006 },
      "matchScore": 72,
      "...": "..."
    }
  ]
}
```

---

### `GET /api/jobs/:id`

Fetch a single job by its MongoDB ObjectId. Includes personalized `matchScore`.

**Response `200`:**

```json
{
  "job": {
    "id": "65e6...",
    "title": "Data Scientist",
    "company": "Spotify",
    "matchScore": 92,
    "matchReason": "Aligns with your preferred industries. Salary range aligns with your expectations.",
    "...": "..."
  }
}
```

**Errors:**

- `404` NOT_FOUND (Invalid ID or job does not exist/is inactive)
