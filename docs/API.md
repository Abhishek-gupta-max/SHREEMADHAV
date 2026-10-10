# API reference

Base URL: `/api`. JSON in and out, except `POST /api/applications` (multipart) and document downloads (files).

## Response format

Success:

```json
{ "success": true, "message": "OK", "data": { }, "meta": { } }
```

Failure:

```json
{
  "success": false,
  "message": "Please correct the highlighted fields.",
  "errorCode": "VALIDATION_ERROR",
  "errors": { "email": "Enter a valid email address" }
}
```

`errors` (field → message) is present for validation failures. `meta` is present on paginated lists:
`{ page, limit, total, totalPages }`.

| Status | errorCode | When |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Malformed request |
| 401 | `UNAUTHORIZED` | Not signed in / session expired |
| 403 | `FORBIDDEN` | Role not allowed, or cross-origin write blocked |
| 404 | `NOT_FOUND` | Unknown route or record |
| 409 | `CONFLICT` | Duplicate unique value |
| 413 | `PAYLOAD_TOO_LARGE` | File over the size limit |
| 422 | `VALIDATION_ERROR` | Invalid fields (see `errors`) |
| 429 | `TOO_MANY_REQUESTS` | Rate limit reached |
| 500 | `INTERNAL_ERROR` | Unexpected server error (details logged, not returned) |

Authentication uses an HTTP-only session cookie set by `POST /api/auth/login`. Browsers send it automatically
(`credentials: 'include'`).

---

## Public endpoints

### `GET /api/health`
Liveness check.

### `POST /api/applications`
`multipart/form-data`. Rate limited (5 per hour per IP in production).

| Field | Rules |
| --- | --- |
| `fullName` | 3–150 chars |
| `email` | valid email |
| `phone` | 7–15 digits; `+`, spaces, `-`, `()` allowed |
| `dateOfBirth` | `YYYY-MM-DD`, age 16–70 |
| `gender` | `male` · `female` · `other` · `prefer_not_to_say` |
| `city`, `state`, `country` | 2–100 chars |
| `qualification` | `secondary` · `higher_secondary` · `diploma` · `bachelors` · `masters` · `doctorate` · `professional_certification` · `other` |
| `experience` | `fresher` · `0-1` · `1-3` · `3-5` · `5-10` · `10+` |
| `profession` | 2–150 chars |
| `preferredOpportunity` | `study_abroad` · `overseas_employment` · `professional_placement` · `not_sure` |
| `preferredCountry` | 2–100 chars |
| `preferredSector` | `healthcare` · `hospitality` · `construction_engineering` · `information_technology` · `manufacturing` · `logistics_transport` · `agriculture` · `retail_sales` · `education` · `finance_accounting` · `other` |
| `preferredPosition` | 2–150 chars |
| `message` | optional, ≤ 2000 chars |
| `consent` | `true` (required) |
| `language` | `en` · `hi` · `pa` (optional) |
| `jobId` | optional, id of a **published** opening |
| `cv` | file, required — PDF/DOC/DOCX, ≤ 5 MB |
| `documents` | files, optional, up to 4 — PDF/DOC/DOCX/JPG/PNG, ≤ 5 MB each |

`201`:

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": { "applicationId": "SMOS-2026-00001" },
  "applicationId": "SMOS-2026-00001"
}
```

### `POST /api/contact`
JSON: `fullName`, `email`, `phone?`, `enquiryType` (`general` · `education` · `opportunities` · `employer` ·
`application`), `subject` (3–200), `message` (10–3000). Rate limited. → `201`.

### `GET /api/services?lang=en|hi|pa`
Active services in the requested language (falls back to English per service).

### `GET /api/jobs` · `GET /api/jobs/:slug`
Published job openings.

### `GET /api/settings`
Public contact details and social links (`null` when not set).

---

## Authentication — `/api/auth`

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/login` | — | `{ email, password }` → sets session cookie, returns `{ admin }` |
| POST | `/logout` | optional | Clears the cookie |
| POST | `/logout-all` | ✓ | Revokes every session of the account |
| GET | `/session` | optional | `{ admin }` or `{ admin: null }` |
| GET | `/me` | ✓ | `{ admin }` (401 when signed out) |
| PATCH | `/profile` | ✓ | `{ name, email }` |
| PATCH | `/password` | ✓ | `{ currentPassword, newPassword }`; other sessions are signed out |

---

## Admin — `/api/admin` (all require a session)

Roles: **V** viewer (read), **A** admin, **S** super admin. Write routes need A or S unless marked S.

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| GET | `/dashboard` | V | KPIs, 30-day trend, top countries/sectors, recent applications & activity |
| GET | `/applications` | V | `q, status, preferredCountry, preferredSector, opportunity, from, to, sort, order, page, limit`; `meta.statusCounts` |
| GET | `/applications/filters` | V | Distinct countries/sectors present in data |
| GET | `/applications/:id` | V | `{ application, documents, notes, activity }` |
| PATCH | `/applications/:id` | A | `{ status, note? }` — logged in activity history |
| DELETE | `/applications/:id` | **S** | Deletes the record and its files |
| POST | `/applications/:id/notes` | A | `{ body }` |
| GET | `/applications/:id/documents/:documentId` | V | Streams the file; `?inline=1` to view in the browser |
| GET | `/documents` | V | `q, docType, page, limit` |
| GET | `/enquiries` | V | `q, status, enquiryType, page, limit` |
| GET / PATCH / DELETE | `/enquiries/:id` | V / A / A | PATCH `{ status }` |
| GET / POST | `/services` | V / A | POST body below |
| GET / PUT / DELETE | `/services/:id` | V / A / A | |
| GET / POST | `/jobs` | V / A | `{ title, country?, location?, sector?, employmentType, summary, requirements?, status }` |
| GET / PUT / DELETE | `/jobs/:id` | V / A / A | |
| GET / PUT | `/settings` | V / A | Keys: `contact_phone, contact_whatsapp, contact_email, office_address, office_hours, map_url, social_*` |
| GET / POST | `/team` | **S** | POST `{ name, email, password, role }` |
| PATCH | `/team/:id` | **S** | `{ role, isActive }` |

Service body:

```json
{
  "slug": "documentation-support",
  "icon": "file-check",
  "sortOrder": 50,
  "isFeatured": false,
  "isActive": true,
  "translations": {
    "en": { "title": "Documentation Support", "summary": "…", "body": "…" },
    "hi": { "title": "…", "summary": "…" }
  }
}
```

---

## Database

Defined in `backend/database/schema.sql`:

| Table | Purpose |
| --- | --- |
| `admins` | Staff accounts (bcrypt hash, role, active flag, token version for session revocation) |
| `applications` | Candidate applications, unique `reference_no`, status, indexed by status/date/country/sector |
| `application_documents` | Uploaded files (FK → applications, cascade delete) |
| `admin_notes` | Internal notes (FK → applications, FK → admins) |
| `contact_enquiries` | Contact-form messages and their handling status |
| `services` / `service_translations` | Website services and their copy per language |
| `job_openings` | Openings for the Careers page |
| `site_settings` | Contact details and social links |
| `activity_logs` | Audit trail of submissions and staff actions |
| `reference_counters` | Atomic per-year counter for `SMOS-YYYY-NNNNN` IDs |

All timestamps are stored in UTC and displayed in India Standard Time.
