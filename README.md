# Oopsie

**User-initiated bug reporting tool.** Unlike Sentry or LogRocket, data only leaves the browser when the user explicitly clicks "Report a bug."

## Key Features

- **User-initiated** — Nothing leaves the browser without explicit user consent
- **Self-hosted** — Your data stays on your infrastructure
- **Rich context** — Automatic 5-minute rolling buffer with clicks, navigation, console errors, and network failures
- **GDPR-friendly** — Consent required before any data transmission
- **Simple** — Docker Compose deployment, setup wizard, and clean dashboard

## Monorepo Structure

| Directory | Description | Tech |
|-----------|-------------|------|
| `server/` | API server | PHP 8.4 / Symfony 7 / API Platform / FrankenPHP |
| `sdk/` | Browser SDK | Vanilla TypeScript / tsup |
| `dashboard/` | Admin dashboard | Next.js / Tailwind / shadcn/ui |
| `docs/` | Documentation site | Astro / Tailwind |

## Quick Start

```bash
git clone https://github.com/yoanbernabeu/oopsie.git
cd oopsie
cp .env.example .env
docker compose up -d
```

Then open http://localhost:3000 and follow the setup wizard.

### Services

| Service | URL | Description |
|---------|-----|-------------|
| Dashboard | http://localhost:3000 | Admin dashboard |
| API | http://localhost:8080 | REST API (OpenAPI docs at `/api/v1/docs`) |
| PostgreSQL | localhost:5432 | Database (internal) |

## SDK Usage

```javascript
import Oopsie from '@oopsie/sdk';

Oopsie.init({
  serverUrl: 'https://oopsie.example.com',
  apiKey: 'your_project_api_key',
});
```

## Development

```bash
# Server
cd server && composer install && symfony serve

# SDK
cd sdk && npm install && npm run dev

# Dashboard
cd dashboard && npm install && npm run dev

# Docs
cd docs && npm install && npm run dev
```

## Documentation

Visit [oopsie.yoandev.co](https://oopsie.yoandev.co) for full documentation.

## Contributing

See the [Contributing guide](docs/src/pages/docs/contributing.astro) for development setup and guidelines.

## License

[AGPLv3](LICENSE)
