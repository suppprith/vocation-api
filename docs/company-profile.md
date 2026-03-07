# Phase 6 — Employer Company Profile API

> Company profile management for employer users.  
> **Base URL:** `http://localhost:3000`  
> **All endpoints require:** `Authorization: Bearer <token>` + `employer` role

---

## Endpoints

### `POST /api/company`

Create a new company profile.

**Request:**

```json
{
  "companyName": "Acme Inc",
  "industry": "Technology",
  "companySize": "medium",
  "description": "We build awesome tools.",
  "logoUrl": null,
  "websiteUrl": "https://acme.com",
  "location": "San Francisco, CA",
  "foundedYear": 2018,
  "employeeCount": 120,
  "benefits": ["Health Insurance", "Stock Options", "Remote Work"],
  "techStack": ["React", "Node.js", "PostgreSQL"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/company/acme",
    "twitter": "https://twitter.com/acme",
    "github": "https://github.com/acme"
  }
}
```

**Response `201`:** `{ "companyProfile": { ... } }`

**Errors:** `409` profile already exists

---

### `GET /api/company`

Get the current employer's company profile.

**Response `200`:** `{ "companyProfile": { ... } }`

**Errors:** `404` no profile found

---

### `PUT /api/company`

Update the company profile. Same body format as POST.

**Response `200`:** `{ "companyProfile": { ... } }`

**Errors:** `404` no profile found

---

## Enums

| Field         | Allowed Values                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `industry`    | Technology, Healthcare, Finance, Education, Entertainment, E-commerce, Manufacturing, Consulting, Media, Gaming, Cybersecurity, AI & Machine Learning, Climate Tech, SaaS, Fintech |
| `companySize` | startup, small, medium, large, enterprise                                                                                                                                          |
