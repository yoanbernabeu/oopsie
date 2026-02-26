# Oopsie - Product Requirements Document (PRD)

> **Version:** 1.0
> **Date:** 2026-02-21
> **Author:** Yoan Bernabeu
> **Repository:** github.com/yoanbernabeu/oopsie
> **License:** AGPLv3

---

## 1. Vision & Philosophy

**Oopsie is a user-initiated bug reporting tool.** Unlike Sentry, LogRocket, or BugSnag that continuously stream data to external servers, Oopsie only sends information when the user explicitly decides to report a problem. Nothing leaves the browser until the user clicks "Report a bug."

**Core principle:** The user decides when to send their information, and only when they encounter errors.

### 1.1 Target Audience

- Solo developers / indie hackers
- Early-stage startups
- Small development teams
- **Not designed for:** large enterprises or high-scale infrastructure

### 1.2 Differentiators

| Feature | Sentry / LogRocket | Oopsie |
|---|---|---|
| Data collection | Continuous, automatic | User-initiated only |
| Data leaves the browser | Always | Only on explicit user action |
| Hosting | SaaS (mostly) | 100% self-hosted |
| User consent | Implicit | Explicit (GDPR checkbox) |
| Complexity | High | Simple, focused |

---

## 2. Architecture Overview

### 2.1 Monorepo Structure

```
/oopsie
├── server/          → PHP Symfony + API Platform + FrankenPHP
├── sdk/             → Vanilla JS/TS SDK
├── dashboard/       → React/Next.js SPA
├── docs/            → Astro + Tailwind documentation site
├── .github/
│   └── workflows/   → GitHub Actions (path-filtered)
├── LICENSE          → AGPLv3
└── README.md
```

### 2.2 Tech Stack

| Component | Technology |
|---|---|
| Server | PHP 8.5+ / Symfony 8 / API Platform |
| Web Server | FrankenPHP |
| Database | PostgreSQL |
| File Storage | Flysystem (local filesystem or S3) |
| Authentication | JWT (lexik/jwt-authentication-bundle) |
| SDK | Vanilla JavaScript / TypeScript |
| Dashboard | React / Next.js / shadcn/ui / Tailwind CSS |
| Documentation | Astro / Tailwind CSS (custom theme) |
| CI/CD | GitHub Actions |
| Deployment | Docker / Docker Compose |

### 2.3 Docker Compose Services

| Service | Description |
|---|---|
| `frankenphp` | Symfony API server |
| `postgres` | PostgreSQL database |
| `dashboard` | Next.js application |

---

## 3. Server (Symfony + API Platform)

### 3.1 API Design

- RESTful API built with API Platform
- Versioned endpoints: `/api/v1/...`
- Automatic OpenAPI documentation
- CORS protection (configured per project)
- Rate limiting on report ingestion endpoints

### 3.2 Authentication & Users

- Email / password authentication
- JWT tokens via API Platform + LexikJWTAuthenticationBundle
- Mono-organization per instance (no multi-tenancy)
- All users have admin privileges (V1)
- Roles/permissions system planned for V2

### 3.3 Data Model

#### Users
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | string | Unique, used for login |
| password | string | Hashed |
| name | string | Display name |
| created_at | datetime | Account creation date |

#### Projects
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | string | Project name |
| api_key | string | Unique public API key |
| allowed_domains | json | Array of allowed domains (`["*.example.com"]`), `["*"]` for open bar |
| webhook_url | string | Nullable, webhook endpoint for notifications |
| retention_days | integer | Data retention in days |
| created_at | datetime | Creation date |

#### Reports
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| project_id | UUID | Foreign key to project |
| group_id | UUID | Nullable, for duplicate grouping |
| status | enum | `new`, `in_progress`, `resolved`, `closed` |
| assigned_to | UUID | Nullable, foreign key to user |
| message | text | User's bug description |
| category | string | Bug category (UI, crash, performance, other) |
| severity | string | User-perceived severity |
| reporter_email | string | Nullable, reporter's email |
| user_context | json | Injected user data (user ID, role, plan, etc.) |
| custom_metadata | json | Developer-defined custom metadata |
| device_info | json | User agent, screen resolution, viewport, language, timezone, connection |
| page_url | string | URL where the report was submitted |
| timeline | json | Array of chronological events (last 5 minutes) |
| console_errors | json | Captured console errors with stack traces |
| network_failures | json | Failed network requests with full details |
| consent_given | boolean | GDPR consent flag |
| created_at | datetime | Report submission date |

#### Report Attachments
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| report_id | UUID | Foreign key to report |
| filename | string | Original filename |
| filepath | string | Storage path |
| size | integer | File size in bytes |
| mime_type | string | File MIME type |

#### Report Comments
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| report_id | UUID | Foreign key to report |
| user_id | UUID | Foreign key to user (author) |
| content | text | Comment body |
| created_at | datetime | Comment date |

### 3.4 API Endpoints

#### Authentication
- `POST /api/v1/auth/login` — Obtain JWT token
- `POST /api/v1/auth/refresh` — Refresh JWT token

#### Users (admin)
- `GET /api/v1/users` — List users
- `POST /api/v1/users` — Create user
- `GET /api/v1/users/{id}` — Get user
- `PUT /api/v1/users/{id}` — Update user
- `DELETE /api/v1/users/{id}` — Delete user

#### Projects
- `GET /api/v1/projects` — List projects
- `POST /api/v1/projects` — Create project
- `GET /api/v1/projects/{id}` — Get project details
- `PUT /api/v1/projects/{id}` — Update project
- `DELETE /api/v1/projects/{id}` — Delete project
- `POST /api/v1/projects/{id}/regenerate-key` — Regenerate API key
- `GET /api/v1/projects/{id}/snippet` — Get integration snippet code

#### Reports (public endpoint, API key auth)
- `POST /api/v1/reports` — Submit a bug report (SDK → Server)

#### Reports (dashboard, JWT auth)
- `GET /api/v1/reports` — List/search/filter reports
- `GET /api/v1/reports/{id}` — Get full report details with timeline
- `PUT /api/v1/reports/{id}` — Update report (status, assignment)
- `DELETE /api/v1/reports/{id}` — Delete report
- `POST /api/v1/reports/{id}/comments` — Add internal comment
- `GET /api/v1/reports/{id}/comments` — List comments

#### Settings (dashboard, JWT auth)
- `GET /api/v1/settings` — Get instance settings
- `PUT /api/v1/settings` — Update instance settings (retention, etc.)

#### System
- `GET /api/v1/version` — Check current and latest version

### 3.5 Report Ingestion Endpoint

`POST /api/v1/reports`

**Authentication:** API key in header (`X-Oopsie-Key: <api_key>`)

**Security:**
- Domain/origin validation against project's `allowed_domains`
- Rate limiting (configurable per project)
- Payload size validation
- Standard Symfony input validation

**Behavior:**
- Validate API key and match to project
- Validate origin/referer against allowed domains
- Validate and sanitize incoming data
- Store report and attachments
- Trigger webhook notification if configured
- Attempt duplicate detection and grouping

### 3.6 Duplicate Detection & Grouping

Reports are automatically grouped when they share similar characteristics:
- Same page URL
- Same console error message/stack trace
- Same project

Grouped reports show the count of affected users and the full list of individual reports.

### 3.7 Webhook Notifications

When a new report is received, if the project has a configured webhook URL, a `POST` request is sent with:

```json
{
  "event": "report.created",
  "project": {
    "id": "...",
    "name": "..."
  },
  "report": {
    "id": "...",
    "message": "...",
    "category": "...",
    "severity": "...",
    "page_url": "...",
    "reporter_email": "...",
    "created_at": "..."
  },
  "dashboard_url": "https://oopsie.example.com/reports/..."
}
```

### 3.8 Data Retention

- Configurable retention period per project (in days)
- Automated purge via Symfony Command (scheduled with cron or Symfony Scheduler)
- Deletes reports, associated attachments (filesystem + database), and comments
- Default retention: 90 days

### 3.9 File Storage

- Abstracted via **Flysystem** (league/flysystem-bundle)
- Two adapters supported:
  - **Local filesystem** (default, Docker volume)
  - **S3-compatible** (AWS S3, Scaleway, DigitalOcean Spaces, etc.)
- Configuration via environment variables:
  ```
  STORAGE_ADAPTER=local        # or "s3"
  STORAGE_LOCAL_PATH=/data/attachments
  STORAGE_S3_BUCKET=oopsie-attachments
  STORAGE_S3_REGION=eu-west-1
  STORAGE_S3_KEY=...
  STORAGE_S3_SECRET=...
  STORAGE_S3_ENDPOINT=...      # for S3-compatible services
  ```
- Max file size: **10 MB** per attachment
- Multiple attachments per report

### 3.10 Configuration

| Scope | Method | Examples |
|---|---|---|
| Infrastructure | Environment variables | Database URL, S3 credentials, JWT secret, app secret |
| Functional | Dashboard UI (stored in DB) | Retention period, webhook URLs, allowed domains, rate limits |

### 3.11 Setup Wizard

On first launch (no users in database):
1. Create the first admin account (email + password)
2. Configure instance name
3. Create the first project
4. Display the SDK integration snippet
5. Redirect to the dashboard

### 3.12 Version Check

- Background check against GitHub releases API
- Notification banner in dashboard when a new version is available
- No auto-update (self-hosted, user-controlled)

### 3.13 Database Migrations

- Doctrine Migrations for all schema changes
- Migrations run automatically on container startup (`doctrine:migrations:migrate --no-interaction`)

---

## 4. SDK (Vanilla JavaScript/TypeScript)

### 4.1 Distribution

- **npm:** `@oopsie/sdk` (check availability, fallback: `oopsie-sdk`)
- **CDN:** hosted script tag
- **Semver** versioning

### 4.2 Loading

- Fully **asynchronous** loading — zero impact on host application performance
- Lightweight bundle (no strict limit, but aim for minimal footprint)
- One SDK instance per page = one project

### 4.3 Initialization

```javascript
// npm
import Oopsie from '@oopsie/sdk';

Oopsie.init({
  serverUrl: 'https://oopsie.example.com',
  apiKey: 'project_api_key_here',
  // Optional configuration
  widget: {
    enabled: true,          // true = floating widget, false = headless mode
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    color: '#6366f1',       // primary color
    theme: 'light',         // light or dark
    text: 'Report a bug',   // button text
    icon: true,             // show icon
  },
  user: {                   // optional user context injection
    id: 'user_123',
    email: 'user@example.com',
    name: 'John Doe',
    plan: 'pro',
  },
  metadata: {               // optional custom metadata
    appVersion: '2.1.0',
    environment: 'production',
  },
  labels: {                 // optional i18n overrides
    title: 'Report a bug',
    messagePlaceholder: 'Describe what happened...',
    submit: 'Send report',
    cancel: 'Cancel',
    consent: 'I agree to send my browsing data for bug analysis',
    // ... all labels are overridable
  },
  sanitize: {               // optional custom sanitization rules
    headers: ['Authorization', 'Cookie', 'X-Custom-Token'],
    bodyKeys: ['password', 'token', 'secret', 'creditCard'],
  },
  bufferDuration: 5 * 60 * 1000, // 5 minutes in ms (default)
});
```

```html
<!-- CDN -->
<script src="https://unpkg.com/oopsie-sdk"></script>
<script>
  Oopsie.init({
    serverUrl: 'https://oopsie.example.com',
    apiKey: 'project_api_key_here',
    // same options as above
  });
</script>
```

### 4.4 Headless Mode API

```javascript
// Programmatic control when widget is disabled
Oopsie.open();    // Open the report form
Oopsie.close();   // Close the report form
```

### 4.5 Background Tracking (Rolling Buffer)

The SDK silently records events in a **5-minute rolling buffer** stored in browser memory (not persisted to disk). **Nothing is sent to the server** during this phase.

#### Tracked Events

| Event Type | Data Captured |
|---|---|
| **Page Navigation** | URL, timestamp, referrer. Detects both classic navigations and SPA routing (`pushState`, `replaceState`, `popstate`) |
| **Clicks** | Target element (CSS selector), page coordinates, timestamp |
| **Console Errors** | Error message, full stack trace, source file, line number |
| **Network Failures** | URL, HTTP method, status code, request headers (sanitized), response headers, response body (sanitized), duration, timestamp |

#### Buffer Management

- Rolling window: oldest events are dropped as new ones arrive
- Configurable duration (default: 5 minutes)
- Stored in memory only — cleared on page close
- Zero network activity during buffering

### 4.6 Automatic Data Sanitization

**Default rules (always active):**
- Headers: `Authorization`, `Cookie`, `Set-Cookie`, `X-API-Key`
- Body keys: `password`, `passwd`, `secret`, `token`, `access_token`, `refresh_token`, `creditCard`, `credit_card`, `ssn`, `social_security`

Sanitized values are replaced with `[REDACTED]`.

Developer can extend or customize rules via `sanitize` config option.

### 4.7 Auto-Collected Metadata

Collected automatically at report submission time:
- User Agent (browser, version, OS)
- Current page URL
- Screen resolution and viewport size
- Browser language
- Timezone
- Connection type (if available via Navigator API)
- Online/offline status

### 4.8 Report Form

Displayed as a modal overlay (widget mode) or triggered programmatically (headless mode).

**Fields:**

| Field | Type | Required |
|---|---|---|
| Message | textarea | Yes |
| Category | select (UI, Crash, Performance, Other) | Yes |
| Severity | select (Low, Medium, High, Critical) | Yes |
| Email | email input | No |
| Attachments | file input (multiple, max 10MB/file) | No |
| Consent checkbox | checkbox | Yes |

### 4.9 Report Submission

On submit:
1. Validate form fields
2. Freeze the current rolling buffer (last 5 minutes of events)
3. Collect auto-metadata (user agent, screen, etc.)
4. Merge developer-injected user context and custom metadata
5. Send everything to `POST /api/v1/reports` with API key header
6. On success: show confirmation, clear buffer
7. On failure: **store report in localStorage**, retry automatically later (exponential backoff)

### 4.10 Retry Mechanism

- Failed reports are serialized and stored in `localStorage`
- On next page load or SDK init, pending reports are retried
- Exponential backoff: 1s, 2s, 4s, 8s... up to 5 minutes max interval
- Reports are dropped after 24 hours of failed retries

---

## 5. Dashboard (React / Next.js)

### 5.1 Tech Stack

- **Next.js** (React framework)
- **shadcn/ui** (component library)
- **Tailwind CSS** (styling)
- **JWT authentication** (against Symfony API)
- **Responsive** design (mobile + desktop)

### 5.2 Pages & Features

#### Authentication
- Login page (email + password)
- JWT token management (storage, refresh, expiration)

#### Setup Wizard (first launch)
1. Create first admin account
2. Name the instance
3. Create first project
4. Show integration snippet
5. Redirect to dashboard

#### Dashboard Home
- Overview of all projects
- Recent reports across all projects
- Quick stats (new reports today, unresolved reports, etc.)

#### Project Management
- List all projects
- Create / edit / delete projects
- Configure per project:
  - Name
  - Allowed domains (with wildcard `*` option)
  - Webhook URL
  - Retention period
  - Rate limiting
- **Integration page** with copy-paste snippet:
  - Tabs: npm / CDN
  - Pre-filled with project API key and server URL
  - Configuration examples (widget mode, headless mode, customization options)
- Regenerate API key

#### Report List
- Filterable and searchable list of reports
- **Filters:**
  - Project
  - Status (new, in progress, resolved, closed)
  - Date range
  - Assigned to
  - Browser / OS
  - Page URL
  - Category / Severity
- **Full-text search** (PostgreSQL tsvector) across messages and error content
- Grouped reports with affected user count
- Sortable columns
- Pagination

#### Report Detail
- Full report information
- **Timeline view:** chronological display of all events from the 5-minute buffer
  - Navigation events with URLs
  - Click events with element selectors
  - Console errors with expandable stack traces
  - Network failures with request/response details
- User context and custom metadata
- Device information
- Attached files (viewable/downloadable)
- Status management (change status)
- Assignment (assign to team member)
- Internal comments thread

#### User Management
- List all users
- Create / edit / delete users
- All users are admins (V1)

#### Settings
- Instance name
- Default retention period
- Version check / update notification
- Future: roles configuration

### 5.3 Update Notification

- Banner at the top of the dashboard when a new version is detected
- Links to GitHub releases / changelog
- Non-intrusive, dismissable

---

## 6. Documentation Site (Astro)

### 6.1 Tech Stack

- **Astro** (static site generator)
- **Tailwind CSS** (custom theme, no Starlight)
- Design inspired by top-tier documentation sites (Stripe, Vercel, Tailwind CSS docs)

### 6.2 Content Structure

- **Home:** product pitch, key features, quick start
- **Getting Started:**
  - Self-hosting guide (Docker Compose)
  - Setup wizard walkthrough
  - Creating your first project
- **SDK:**
  - Installation (npm + CDN)
  - Configuration reference
  - Widget customization
  - Headless mode
  - User context injection
  - Custom metadata
  - Sanitization rules
  - Labels / i18n
- **Server:**
  - API reference (auto-generated from OpenAPI)
  - Configuration (environment variables)
  - Webhooks
  - Data retention
  - Storage (local vs S3)
- **Dashboard:**
  - User guide
  - Report management
  - Project configuration
- **Contributing:** contribution guidelines
- **Changelog:** links to GitHub releases

---

## 7. Branding

### 7.1 Name

**Oopsie** — playful, memorable, and directly evokes the moment when something goes wrong. The name is approachable and non-intimidating, matching the target audience of indie developers and small teams.

### 7.2 Logo

Text-based logo: **"Oopsie"** in a modern, rounded sans-serif font. Simple and recognizable.

### 7.3 Color Palette (Proposed)

| Role | Color | Hex |
|---|---|---|
| Primary | Indigo | `#6366f1` |
| Primary Dark | Dark Indigo | `#4f46e5` |
| Secondary | Amber | `#f59e0b` |
| Success | Emerald | `#10b981` |
| Warning | Orange | `#f97316` |
| Error | Rose | `#f43f5e` |
| Background | White | `#ffffff` |
| Surface | Slate 50 | `#f8fafc` |
| Text | Slate 900 | `#0f172a` |
| Text Muted | Slate 500 | `#64748b` |

The indigo primary conveys trust and professionalism while remaining modern. The amber secondary adds warmth and approachability, matching the playful "Oopsie" name.

### 7.4 Typography

- **Headings:** Inter (or similar geometric sans-serif)
- **Body:** Inter
- **Code:** JetBrains Mono (or Fira Code)

---

## 8. Infrastructure & Deployment

### 8.1 Docker Compose

```yaml
# Simplified example
services:
  server:
    image: oopsie/server:latest
    # FrankenPHP with Symfony
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://oopsie:secret@postgres:5432/oopsie
      JWT_SECRET_KEY: ...
      JWT_PUBLIC_KEY: ...
      STORAGE_ADAPTER: local
    volumes:
      - attachments:/data/attachments
    depends_on:
      - postgres

  dashboard:
    image: oopsie/dashboard:latest
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: oopsie
      POSTGRES_USER: oopsie
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
  attachments:
```

### 8.2 GitHub Actions

- **Path-filtered workflows:** each project has its own CI pipeline
  - `server/**` → PHP tests, static analysis, Docker build
  - `sdk/**` → JS/TS tests, bundle size check, npm publish
  - `dashboard/**` → JS tests, build check, Docker build
  - `docs/**` → Astro build, deploy
- Automated Docker image builds and pushes on tags
- Unit tests on pull requests

### 8.3 Database Migrations

- Run automatically on container startup
- `php bin/console doctrine:migrations:migrate --no-interaction`
- Migrations are part of the server Docker image

---

## 9. Security

### 9.1 Server Security

- Rate limiting on public endpoints (report submission)
- CORS configuration per project (based on allowed domains)
- Standard Symfony input validation and sanitization
- JWT with proper expiration and refresh flow
- Payload size limits
- Hashed passwords (bcrypt/argon2)
- CSRF protection where applicable

### 9.2 SDK Security

- API keys are public (visible in frontend code) — by design
- Domain restriction prevents unauthorized usage
- Wildcard `*` option for development/testing
- Automatic sanitization of sensitive data in captured network requests
- Data stays in browser memory until explicit user action
- GDPR consent required before any data transmission

### 9.3 Data Privacy

- **No data leaves the browser** without explicit user consent
- Rolling buffer stored in memory only (not persisted)
- Consent checkbox required on every report
- Configurable data retention with automatic purge
- Self-hosted: data stays on the organization's infrastructure

---

## 10. V1 Scope (MVP)

### 10.1 Included in V1

**Server:**
- [x] Symfony + API Platform + FrankenPHP
- [x] JWT authentication (email/password)
- [x] User CRUD (all admins)
- [x] Project CRUD with API key generation
- [x] Report ingestion endpoint with domain validation
- [x] Rate limiting
- [x] Report CRUD with status workflow
- [x] Report assignment and internal comments
- [x] Automatic report grouping (duplicate detection)
- [x] Webhook notifications
- [x] Configurable data retention + automated purge
- [x] File storage via Flysystem (local + S3)
- [x] PostgreSQL full-text search
- [x] Version check against GitHub releases
- [x] Setup wizard
- [x] Database migrations on startup
- [x] Docker Compose deployment

**SDK:**
- [x] Vanilla JS/TS, framework-agnostic
- [x] npm + CDN distribution
- [x] Async loading
- [x] 5-minute rolling buffer (memory only)
- [x] Track: clicks, navigations (classic + SPA), console errors, network failures
- [x] Automatic data sanitization with customizable rules
- [x] Floating widget (customizable: color, position, text, icon, theme)
- [x] Headless mode (`Oopsie.open()` / `Oopsie.close()`)
- [x] Report form: message, category, severity, email, attachments, consent
- [x] User context and custom metadata injection
- [x] Auto-collected device metadata
- [x] i18n via label overrides (English default)
- [x] Retry mechanism (localStorage + exponential backoff)

**Dashboard:**
- [x] React / Next.js / shadcn/ui
- [x] Responsive design
- [x] JWT authentication
- [x] Setup wizard
- [x] Dashboard home with stats
- [x] Project management + snippet generation
- [x] Report list with filters and full-text search
- [x] Report detail with timeline view
- [x] Report status workflow + assignment + comments
- [x] User management
- [x] Instance settings
- [x] Update notification banner

**Documentation:**
- [x] Astro site with custom Tailwind theme
- [x] Getting started guide
- [x] SDK reference
- [x] Server configuration guide

**Infrastructure:**
- [x] Docker Compose (3 services)
- [x] GitHub Actions CI/CD (path-filtered)
- [x] Minimalist READMEs per project

### 10.2 Excluded from V1 (Future Roadmap)

- [ ] Framework-specific SDK wrappers (React, Vue, Svelte, Angular)
- [ ] Automatic screenshot capture (html2canvas)
- [ ] Session replay visualization
- [ ] User roles and permissions (beyond all-admin)
- [ ] Data export (CSV, JSON)
- [ ] Direct integrations (GitHub Issues, Linear, Jira)
- [ ] SDK hooks/callbacks (onBeforeSend, onAfterSend, etc.)
- [ ] Shared TypeScript types package between SDK and dashboard
- [ ] Email notifications
- [ ] SaaS hosted offering
- [ ] Mobile SDK (React Native, Flutter)
- [ ] Browser extension for easier testing
- [ ] API usage analytics and quotas
- [ ] Custom report form fields (defined per project)
- [ ] Report tagging system

---

## 11. Language & Code Standards

- **All code, comments, READMEs, documentation, commit messages, and UI defaults must be in English**
- SDK widget default labels: English (overridable via config)
- Dashboard UI: English
- Documentation site: English

---

## 12. Repository & Links

| Resource | URL |
|---|---|
| GitHub Repository | `github.com/yoanbernabeu/oopsie` |
| Documentation | `oopsie.yoandev.co` (planned) |
| License | AGPLv3 |
