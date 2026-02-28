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
curl -fsSL https://raw.githubusercontent.com/yoanbernabeu/oopsie/main/compose.yml -o compose.yml
curl -fsSL https://raw.githubusercontent.com/yoanbernabeu/oopsie/main/Caddyfile -o Caddyfile
docker compose up -d
```

Then open http://app.localhost and follow the setup wizard.

> Images are hosted on GitHub Container Registry: `ghcr.io/yoanbernabeu/oopsie-server` and `ghcr.io/yoanbernabeu/oopsie-dashboard`.

### Services

| Service | URL | Description |
|---------|-----|-------------|
| Caddy | :80 / :443 | Reverse proxy with automatic HTTPS |
| Dashboard | http://app.localhost | Admin dashboard |
| API | http://api.localhost | REST API (OpenAPI docs at `/api/v1/docs`) |
| PostgreSQL | internal | Database |

### Production

Create a `.env` file with your domains:

```env
API_DOMAIN=https://api.oopsie.example.com
DASHBOARD_DOMAIN=https://app.oopsie.example.com
NEXT_PUBLIC_API_URL=https://api.oopsie.example.com/api/v1
```

Caddy handles TLS certificates automatically via Let's Encrypt.

## SDK Usage

```javascript
import Oopsie from 'oopsie-sdk';

Oopsie.init({
  serverUrl: 'https://oopsie.example.com',
  apiKey: 'your_project_api_key',
});
```

## Development

```bash
make install  # Install all dependencies
make dev      # Start all dev services (Symfony CLI + Next.js + Astro)
```

Or start services individually:

```bash
make dev-server     # Server only (needs `make db` first)
make dev-dashboard  # Dashboard only (needs server running)
make dev-docs       # Docs only
make dev-sdk        # SDK in watch mode
```

## Documentation

Visit [yoanbernabeu.github.io/oopsie](https://yoanbernabeu.github.io/oopsie/) for full documentation.

## Contributing

See the [Contributing guide](docs/src/pages/docs/contributing.astro) for development setup and guidelines.

## License

[AGPLv3](LICENSE)
