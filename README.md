# ELT — Hackathon Hello World Pipeline

> A greenfield TypeScript monorepo demonstrating the full ELT development lifecycle: code → test → deploy → document.

## Architecture

```
elt-monorepo/
├── packages/
│   └── api/          # Hono Lambda API
│       └── src/
│           ├── index.ts          # Handler (GET /hello, GET /health)
│           └── __tests__/        # Vitest unit tests
├── sst.config.ts     # SST v3 infrastructure (Lambda + Function URL)
├── scripts/
│   └── deploy.sh     # Deploy + verify script
└── .github/
    └── workflows/
        └── ci.yml    # GitHub Actions: lint, typecheck, test
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22, TypeScript 5 |
| Framework | Hono (ultra-fast web framework) |
| Infrastructure | SST v3, AWS Lambda, Function URL |
| Package Manager | pnpm (workspaces) |
| Testing | Vitest |
| CI | GitHub Actions |

## AWS Account

- **Account ID:** 108405836063
- **Region:** us-east-1
- **Stage:** production

## API Endpoints

### `GET /hello`
```json
{
  "message": "Hello from ELT!",
  "timestamp": "2026-04-14T19:00:00.000Z",
  "version": "1.0.0"
}
```

### `GET /health`
```json
{
  "status": "ok"
}
```

## Local Development

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm test

# Typecheck
pnpm typecheck
```

## Deploy

```bash
export AWS_PROFILE=elt-dev
pnpm sst deploy --stage production

# Or use the deploy script (deploys + verifies)
bash scripts/deploy.sh
```

## Sprint

**Sprint 1 — Hello World** (April 14–28, 2026)

| Ticket | Summary |
|--------|---------|
| ELT-1 | Initialize monorepo with TypeScript, pnpm, and project structure |
| ELT-5 | Create Hello World Lambda API |
| ELT-2 | Deploy infrastructure to AWS with SST |
| ELT-3 | Write unit and E2E tests |
| ELT-6 | Create Confluence documentation |

---

Built with ❤️ by the ELT Hackathon team.
