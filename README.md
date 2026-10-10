# ShreeMadhav Overseas Solutions — Website & Back Office

Public website and admin panel for **ShreeMadhav Overseas Solutions Private Limited**, Chandigarh, India.

```
React (Vite) frontend  ──►  REST API (/api)  ──►  Node.js / Express  ──►  MySQL
```

| Part | Folder | Stack |
| --- | --- | --- |
| Public website + admin panel | `frontend/` | React 19, React Router 7, Vite, Tailwind CSS v4 (public site) and plain CSS with design tokens (admin) |
| REST API | `backend/` | Node.js 20+, Express 5, mysql2, Zod, JWT (HTTP-only cookie), Multer |
| Database | `backend/database/schema.sql` | MySQL 8.0+ or MariaDB 10.4+ |

Further reading: [API reference](docs/API.md) · [Deployment guide](docs/DEPLOYMENT.md)

---

## What is included

**Public website** — seven pages in the same structure as the reference design:
Home (`/`), About (`/about`), Services (`/services`), Process (`/process`), Why Us (`/why-us`),
Requirements (`/requirements`) and Contact (`/contact`), plus Apply Now (`/apply`), job detail pages
(`/requirements/<job>`), Privacy Policy, Terms & Conditions and a 404 page. Overseas Education and International
Opportunities are sections of Services; current openings are a section of Requirements. Earlier URLs
(`/overseas-education`, `/international-opportunities`, `/careers`, `/careers/<job>`) redirect to their new places.

- **Apply Now:** five-step form with per-step validation, file type/size checks, upload progress, a session-saved
  draft, links that pre-fill a job/sector/opportunity, and a printable confirmation showing the application ID
  (`SMOS-2026-00001`).
- **Language selector:** English, हिन्दी and ਪੰਜਾਬੀ. Fully keyboard-accessible, remembered per browser, and also
  switches service descriptions coming from the database. Fonts for Devanagari/Gurmukhi load only when needed.
- **SEO:** per-page titles, descriptions, canonical URLs, Open Graph and Twitter tags, Organization / Breadcrumb /
  Service / JobPosting structured data, and `robots.txt` + `sitemap.xml` generated at build time.

**Admin panel** (`/admin`, English) — Dashboard (KPIs, 30-day trend, pipeline, recent activity), Applications
(search, status tabs, filters, sorting, pagination), Application detail (profile, documents, status changes, internal
notes, activity history), Documents, Enquiries, Services (with Hindi/Punjabi translations), Job openings, Settings
(contact details, social links, team accounts and roles) and Profile (details, password, sign out everywhere).

**Roles:** `super_admin` (everything, including team and deleting applications), `admin` (manage content and
applications), `viewer` (read-only).

---

## Local development

### Prerequisites

- Node.js 20 or newer
- MySQL 8.0+ or MariaDB 10.4+ running locally

### Quick start (from the project root)

```bash
npm install          # installs both backend and frontend
npm run setup        # creates the database, seeds services, creates the first admin (needs backend/.env, see below)
npm run dev          # API on :5000 and website on :5173, together
```

| Root command | Does |
| --- | --- |
| `npm run dev` | Backend and frontend together (Ctrl+C stops both) |
| `npm run dev:backend` / `npm run dev:frontend` | One of them only |
| `npm run build` | Production build of the frontend |
| `npm start` | Backend in production mode |

The sections below describe each part separately.

**Troubleshooting:** if the website shows "could not reach the server" and the `[api]` log says
`Waiting for MySQL at 127.0.0.1:3306`, the database server is not running. On this machine the project database
lives in XAMPP's MariaDB on port 3306 (start it from the XAMPP Control Panel); the separate MySQL80 Windows service
listens on port 3309 and does not hold this database. The API waits about 30 seconds for the database before giving up.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

- `DB_USER`, `DB_PASSWORD`, `DB_NAME` for your MySQL server
- `JWT_SECRET` — generate one with
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` for the first administrator (at least 10 characters, with a letter and a number)

Then create the database, seed the service catalogue and the first administrator:

```bash
npm run setup        # = db:migrate + db:seed + admin:create
npm run dev          # API on http://localhost:5000 (restarts on file changes)
```

After the administrator exists, remove `ADMIN_PASSWORD` from `.env`. Running `npm run admin:create` again with a
new password resets it.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # optional in development
npm run dev            # http://localhost:5173 — /api is proxied to the backend
```

Admin panel: <http://localhost:5173/admin>.

### Useful scripts

| Where | Command | Purpose |
| --- | --- | --- |
| backend | `npm run db:migrate` | Create the database / apply `schema.sql` (idempotent) |
| backend | `npm run db:seed` | Add the default services in three languages (never overwrites edits) |
| backend | `npm run admin:create` | Create a super administrator or reset their password |
| frontend | `npm run build` | Production build into `frontend/dist` |
| frontend | `npm run preview` | Serve the production build locally |

---

## Project structure

```
backend/
  server.js                 Entry point (starts HTTP server, graceful shutdown)
  database/schema.sql       Tables, keys, indexes and constraints
  scripts/                  migrate, seed, create-admin
  uploads/                  Private document storage (never served publicly)
  src/
    app.js                  Express app: Helmet, CORS, rate limits, routes, errors
    config/                 env loading, MySQL pool, domain constants
    routes/                 public, auth and admin routers
    controllers/            Request handlers
    models/                 SQL data access (parameterised queries only)
    services/               Business logic: submissions, files, tokens, audit log
    middleware/             auth/roles, validation, uploads, rate limiting, CSRF origin guard, errors
    validators/             Zod schemas
    utils/                  response envelope, errors, sanitising, pagination

frontend/
  index.html                Default meta tags + Organization structured data
  build/seo-files.js        Generates robots.txt and sitemap.xml at build time
  public/                   images (WebP, two widths), brand mark, favicon
  src/
    pages/                  One folder per page (Home, About, Services, Process, WhyUs, Requirements,
                            Contact, Apply, Legal, NotFound, Admin/*)
    components/site         Public layout pieces: NoticeBar, SiteNavbar (+ mobile drawer), SiteHeader,
                            SiteFooter, CompanyBadge, Blocks (HeroBanner, CtaCard, FactCards, …), ui.js
    components/common       Button, Icon, Logo, Seo, LanguageSelector, StateMessage, …
    components/forms        Accessible fields and the file drop zone
    components/admin        Admin UI kit, breadcrumbs, trend chart
    layouts/                PublicLayout, AdminLayout
    routes/                 Route table (lazy-loaded pages), ProtectedRoute
    context/                Language, Auth, Toasts, Site settings
    services/               API client and endpoint wrappers
    hooks/ utils/ constants/
    i18n/locales/           en.js (source), hi.js, pa.js; site.<lang>.js hold the seven-page copy
    styles/                 tokens.css, base.css (shared), site.css (public site: Tailwind + theme), admin.css
```

---

## Content and branding

- **Logo:** the official ShreeMadhav emblem is in `frontend/public/brand/` (`logo-256.webp/png` for the site,
  `logo-1024.png` master, favicons, Apple touch icon and app icons); the original upload is kept in
  `frontend/src/assets/brand/logo-original.jpg`. On navy backgrounds the emblem is shown on a white badge so its navy
  parts stay visible. To update it, replace those files keeping the same names.
- **Design and colours:** the public site follows the reference layout. Its colours are mapped to the ShreeMadhav
  logo palette in one place — the `--color-brand-*`, `--color-navy-*` and `--color-gold-*` values at the top of
  `frontend/src/styles/site.css`.
- **Statutory details:** CIN, incorporation date and registered office (from the Certificate of Incorporation) are in
  `frontend/src/constants/site.js` and appear in the footer, the About fact sheet, the Contact page, the legal pages
  and the Organization structured data. PAN and TAN are intentionally not published.
- **Contact details & social links:** entered in **Admin → Settings**. Empty fields are hidden on the site; nothing
  is invented.
- **Services:** edited in **Admin → Services** (English required, Hindi/Punjabi optional).
- **Job openings:** published from **Admin → Openings** and listed under *Current Openings* on the Requirements page.
  Until one is published, that section invites visitors to register their profile.
- **Website copy:** `frontend/src/i18n/locales/{en,hi,pa}.js` and `site.{en,hi,pa}.js`. Keep the three files' keys in step; missing keys fall
  back to English. Have the Hindi and Punjabi copy reviewed by a native speaker before launch.
- **Legal pages:** `frontend/src/pages/Legal/`. They are written to describe what the website actually does and
  should be reviewed by the company's legal adviser before launch.
- **Photography:** from Unsplash (free to use under the Unsplash License), stored locally as optimised WebP at
  800px and 1600px. Replace with the company's own photography where possible, keeping the file names.

---

## Security summary

- Passwords hashed with bcrypt (12 rounds); constant-time responses for unknown emails.
- Sessions are signed JWTs in an `HttpOnly`, `SameSite=Strict` cookie (`Secure` in production), scoped to `/api`.
  Changing a password, deactivating an account or "sign out everywhere" revokes existing sessions.
- Every admin endpoint requires authentication; write operations require an editing role; deletion of
  applications and team management require a super administrator.
- State-changing requests from other origins are rejected (CSRF defence in addition to SameSite).
- Helmet security headers with a strict Content-Security-Policy; CORS limited to configured origins.
- Rate limits on the whole API, sign-in, applications and contact messages; honeypot fields on public forms.
- All input validated with Zod and normalised (HTML tags and control characters stripped); SQL is always
  parameterised.
- Uploads: type detected from file content (not the name or browser), extension must match, 5 MB per file, CV +
  up to 4 documents, random file names, stored outside any public folder and streamed only to signed-in staff.
- Internal errors are logged server-side; clients receive generic messages without stack traces.
- Secrets live only in `backend/.env`. Nothing secret is shipped to the browser (`VITE_*` values are public).
