# Phase 2 — Onboarding, Resume Upload & User Profile API

> Resume upload, onboarding completion, and full profile management.  
> **Base URL:** `http://localhost:3000`  
> **All endpoints require:** `Authorization: Bearer <token>` + `job_seeker` role

---

## Overview

| Method | Endpoint                          | Description                     |
| ------ | --------------------------------- | ------------------------------- |
| `POST` | `/api/resume/upload`              | Upload & parse resume file      |
| `POST` | `/api/onboarding/complete`        | Mark onboarding done            |
| `GET`  | `/api/profile`                    | Get full profile (all sections) |
| `PUT`  | `/api/profile/resume`             | Upsert resume data              |
| `PUT`  | `/api/profile/work-style`         | Upsert work style & passions    |
| `PUT`  | `/api/profile/career-preferences` | Upsert career preferences       |
| `PUT`  | `/api/profile/portfolio-links`    | Upsert portfolio URLs           |

---

## Endpoints

### `POST /api/resume/upload`

Upload a resume file for parsing.

**Request:** `Content-Type: multipart/form-data`

| Field  | Type | Constraints                                |
| ------ | ---- | ------------------------------------------ |
| `file` | File | `.pdf`, `.doc`, `.docx`, `.txt` — max 10MB |

**Response `200`:**

```json
{
  "skills": [],
  "education": [],
  "experience": [],
  "rawText": "Resume uploaded: 1709553600_resume.pdf. Parsing not yet implemented."
}
```

> **Note:** Parsing currently returns a placeholder. The file is stored locally in `uploads/resumes/` and the URL saved to the user's ResumeData record.

**Errors:** `400` no file / unsupported type · `413` file exceeds 10MB

---

### `POST /api/onboarding/complete`

Mark onboarding as finished. Call after all profile sections are saved.

**Request:** No body.

**Response `200`:**

```json
{
  "user": {
    "id": "...",
    "onboardingComplete": true
  }
}
```

---

### `GET /api/profile`

Retrieve the full profile. Returns `null` for any section not yet completed.

**Response `200`:**

```json
{
  "resumeData": {
    "skills": ["React", "TypeScript"],
    "education": [
      {
        "institution": "MIT",
        "degree": "B.S.",
        "field": "Computer Science",
        "year": "2024"
      }
    ],
    "experience": [
      {
        "company": "Acme",
        "role": "Engineer",
        "duration": "2 years",
        "description": "..."
      }
    ],
    "resumeFileUrl": "/uploads/resumes/1709553600_resume.pdf"
  },
  "holisticProfile": {
    "workStyle": { "collaboration": 4, "structure": 3, "riskTolerance": 2 },
    "passions": ["Technology", "Gaming"]
  },
  "careerPreferences": {
    "targetRoles": ["Frontend Engineer"],
    "preferredIndustries": ["Technology"],
    "workArrangement": ["remote"],
    "employmentType": ["full-time"],
    "companySize": ["startup"],
    "salaryMin": 150000,
    "salaryMax": 250000,
    "willingToRelocate": false,
    "availableToStart": "Immediately"
  },
  "portfolioLinks": {
    "linkedin": "https://linkedin.com/in/janedoe",
    "github": "https://github.com/janedoe",
    "portfolio": null,
    "design": null,
    "blog": null,
    "other": null
  }
}
```

---

### `PUT /api/profile/resume`

Create or update resume data.

**Request:**

```json
{
  "skills": ["React", "TypeScript", "Node.js"],
  "education": [
    {
      "institution": "MIT",
      "degree": "B.S.",
      "field": "Computer Science",
      "year": "2024"
    }
  ],
  "experience": [
    {
      "company": "Acme",
      "role": "Engineer",
      "duration": "2 years",
      "description": "Built apps."
    }
  ]
}
```

| Field                                            | Validation                 |
| ------------------------------------------------ | -------------------------- |
| `skills[]`                                       | Array of non-empty strings |
| `education[].institution/degree/field/year`      | All required strings       |
| `experience[].company/role/duration/description` | All required strings       |

**Response `200`:** `{ "success": true }`

---

### `PUT /api/profile/work-style`

Save work-style preferences and passions.

**Request:**

```json
{
  "workStyle": {
    "collaboration": 4,
    "structure": 3,
    "riskTolerance": 2
  },
  "passions": ["Technology", "Gaming", "Design"]
}
```

| Field                                         | Validation                            |
| --------------------------------------------- | ------------------------------------- |
| `collaboration`, `structure`, `riskTolerance` | Integer, 1–5                          |
| `passions[]`                                  | Must be from allowed list (see below) |

<details>
<summary>Allowed passions (20 values)</summary>

Gaming, Writing, Hiking, Design, Technology, Education, Music, Sports, Photography, Cooking, Travel, Art, Science, Finance, Health & Wellness, Social Impact, Film & Media, Robotics, Environment, Fashion

</details>

**Response `200`:** `{ "success": true }`

---

### `PUT /api/profile/career-preferences`

Save career preferences.

**Request:**

```json
{
  "targetRoles": ["Frontend Engineer"],
  "preferredIndustries": ["Technology", "SaaS"],
  "workArrangement": ["remote", "hybrid"],
  "employmentType": ["full-time"],
  "companySize": ["startup", "medium"],
  "salaryMin": 150000,
  "salaryMax": 250000,
  "willingToRelocate": false,
  "availableToStart": "Immediately"
}
```

| Field                   | Allowed Values                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workArrangement[]`     | `remote`, `hybrid`, `onsite`                                                                                                                                                       |
| `employmentType[]`      | `full-time`, `contract`, `internship`, `part-time`                                                                                                                                 |
| `companySize[]`         | `startup`, `small`, `medium`, `large`, `enterprise`                                                                                                                                |
| `preferredIndustries[]` | Technology, Healthcare, Finance, Education, Entertainment, E-commerce, Manufacturing, Consulting, Media, Gaming, Cybersecurity, AI & Machine Learning, Climate Tech, SaaS, Fintech |
| `salaryMin/Max`         | Integer ≥ 0, `salaryMax ≥ salaryMin`                                                                                                                                               |

**Response `200`:** `{ "success": true }`

---

### `PUT /api/profile/portfolio-links`

Save portfolio and social links. All fields are optional.

**Request:**

```json
{
  "linkedin": "https://linkedin.com/in/janedoe",
  "github": "https://github.com/janedoe",
  "portfolio": "https://janedoe.dev",
  "design": null,
  "blog": null,
  "other": null
}
```

| Field      | Validation                              |
| ---------- | --------------------------------------- |
| All fields | Optional, must be valid URL if provided |

**Response `200`:** `{ "success": true }`

---

## Onboarding Flow

The frontend onboarding has 5 steps. Here's the mapping:

| Step | Name        | API Call                                              |
| ---- | ----------- | ----------------------------------------------------- |
| 0    | Resume      | `POST /api/resume/upload` → `PUT /api/profile/resume` |
| 1    | Work Style  | _(saved with step 2)_                                 |
| 2    | Passions    | `PUT /api/profile/work-style` (includes step 1 data)  |
| 3    | Preferences | `PUT /api/profile/career-preferences`                 |
| 4    | Portfolio   | `PUT /api/profile/portfolio-links`                    |
| —    | Complete    | `POST /api/onboarding/complete`                       |
