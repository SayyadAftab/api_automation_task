# Restful Booker API Automation

Playwright + TypeScript API automation framework for the [Restful Booker API](https://restful-booker.herokuapp.com). Uses Playwright's `APIRequestContext` (no browser UI) with a layered design: clients, builders, validators, and data-driven tests.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
cd restful-booker-api-automation
npm install
```

Optional environment overrides:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://restful-booker.herokuapp.com` | API base URL |
| `API_USERNAME` | `admin` | Auth username |
| `API_PASSWORD` | `password123` | Auth password |

Create a local `.env` file only if you need custom values (do not commit it).

## Run tests (npm scripts)

```bash
npm test                 # Full suite (~36 tests)
npm run test:ping        # Ping / health check
npm run test:auth        # Auth tests
npm run test:booking     # Booking CRUD tests
npm run test:report      # Run tests + open HTML report
npm run typecheck        # TypeScript validation
```

## Run tests (npx playwright)

Use these when you want to call Playwright directly without npm scripts:

```bash
# Full suite
npx playwright test

# Run by folder
npx playwright test tests/ping
npx playwright test tests/auth
npx playwright test tests/booking

# Run a single spec file
npx playwright test tests/booking/booking-create.spec.ts

# Run tests matching a title pattern
npx playwright test -g "create booking using JSON"

# HTML report (generate only, no auto-open)
npx playwright test --reporter=html

# HTML report + open in browser
npx playwright test --reporter=html
npx playwright show-report

# List all tests without running
npx playwright test --list

# Debug a failing test
npx playwright test tests/auth/auth.spec.ts --debug

# Override base URL for one run
npx playwright test --config=playwright.config.ts
# (set BASE_URL env var before running, e.g. on Windows PowerShell)
# $env:BASE_URL="https://restful-booker.herokuapp.com"; npx playwright test
```

## Project structure

```
restful-booker-api-automation/
├── playwright.config.ts          # Playwright runner config
├── tsconfig.json                 # TypeScript config
├── src/
│   ├── config/env.ts             # Base URL and credentials
│   ├── fixtures/api.fixture.ts   # Shared clients + authToken fixture
│   ├── clients/                  # HTTP clients (auth, booking, ping)
│   ├── builders/                 # JSON / XML / form body builders
│   ├── types/                    # TypeScript interfaces and enums
│   ├── validators/               # Contract and booking assertions
│   └── test-data/                # Payloads and negative test cases
├── tests/
│   ├── ping/                     # Health check
│   ├── auth/                     # Token creation
│   └── booking/                  # Create, read, update, delete
└── Restful-Booker-API.postman_collection.json
```

## Architecture

| Layer | Role |
|-------|------|
| **Fixtures** | Inject `authClient`, `bookingClient`, `pingClient`, and `authToken` |
| **Clients** | HTTP calls via Playwright `request` context |
| **Builders** | Serialize booking payloads (JSON, XML, URL-encoded) |
| **Validators** | Strict status, content-type, and body assertions |
| **Tests** | Specs grouped by API area |

## Contract testing policy

See [COVERAGE.md](./COVERAGE.md) for details. Summary:

- Exact HTTP status codes only
- Response body validation where the contract defines it
- Rich failure messages with expected vs actual
- No skips or known-fail suppression

## Do not push to GitHub

These are local or generated artifacts (listed in `.gitignore`):

| Path | Created by |
|------|------------|
| `node_modules/` | `npm install` |
| `playwright-report/` | Test HTML report |
| `test-results/` | Playwright run artifacts |
| `dist/` | TypeScript compile output |
| `.env` | Local env overrides |
| `*.log` | Log files |

## API coverage

- **Ping** — `GET /ping`
- **Auth** — `POST /auth`
- **Booking** — create, list/filter IDs, get, update (PUT), patch, delete
- **Formats** — JSON, XML, URL-encoded request bodies
- **Auth modes** — Cookie token and Basic Auth for protected endpoints
