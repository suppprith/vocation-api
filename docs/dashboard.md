# Phase 5 — Dashboard API

> Aggregated stats and insights for the job seeker dashboard.  
> **Base URL:** `http://localhost:3000`  
> **Requires:** `Authorization: Bearer <token>` + `job_seeker` role

---

## `GET /api/dashboard`

Single endpoint returning all dashboard data in one call.

**Response `200`:**

```json
{
  "stats": {
    "totalApplications": 8,
    "statusCounts": {
      "saved": 2,
      "applied": 3,
      "interviewing": 2,
      "offer": 1,
      "rejected": 0
    },
    "totalActiveJobs": 45
  },
  "profileCompletion": {
    "percentage": 75,
    "sections": {
      "resumeData": true,
      "workStyle": true,
      "careerPreferences": true,
      "portfolioLinks": false
    }
  },
  "recentApplications": [
    {
      "id": "...",
      "status": "interviewing",
      "appliedAt": "2026-03-07T...",
      "updatedAt": "2026-03-07T...",
      "job": {
        "id": "...",
        "title": "Senior Frontend Engineer",
        "company": "Vercel",
        "companyLogo": null
      }
    }
  ],
  "recommendedJobs": [
    {
      "id": "...",
      "title": "Full Stack Developer",
      "company": "Shopify",
      "companyLogo": null,
      "location": "Ottawa, Canada",
      "workArrangement": "remote",
      "matchScore": 92,
      "matchReason": "Strong overlap with your React, TypeScript skills.",
      "salaryRange": "$150k – $210k"
    }
  ]
}
```

### Response Fields

| Field                          | Description                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `stats.totalApplications`      | Total applications by this user                                                |
| `stats.statusCounts`           | Breakdown by status (saved/applied/interviewing/offer/rejected)                |
| `stats.totalActiveJobs`        | Total active jobs in the platform                                              |
| `profileCompletion.percentage` | 0–100% based on 4 profile sections                                             |
| `profileCompletion.sections`   | Boolean per section (resumeData, workStyle, careerPreferences, portfolioLinks) |
| `recentApplications`           | Last 5 applications with basic job info                                        |
| `recommendedJobs`              | Top 4 jobs by match score                                                      |
