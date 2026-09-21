# Restful Booker API Automation

Playwright + TypeScript API automation framework for the [Restful Booker API](https://restful-booker.herokuapp.com). Uses Playwright's `APIRequestContext` (no browser UI) with a layered design: clients, builders, validators, and data-driven tests.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
cd restful-booker-api-automation
npm install
cp .env.example .env
```

Fill in all values in `.env` before running tests (do not commit `.env`):

| Variable | Description |
|----------|-------------|
| `BASE_URL` | API base URL |
| `API_USERNAME` | Valid auth username |
| `API_PASSWORD` | Valid auth password |
| `API_INVALID_USERNAME` | Invalid username for negative auth tests |
| `API_INVALID_PASSWORD` | Invalid password for negative auth tests |

For GitHub Actions, add the same keys as repository secrets. The workflow creates a `.env` file from those secrets at runtime.

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

# Override config for one run (edit .env or set env vars before running)
npx playwright test --config=playwright.config.ts
```

## Project structure

```
restful-booker-api-automation/
├── playwright.config.ts          # Playwright runner config
├── tsconfig.json                 # TypeScript config
├── src/
│   ├── config/env.ts             # Loads .env and exposes config
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
| **Fixtures** | Inject `authClient`, `bookingClient`, `pingClient`, and worker-scoped `authToken` (one login per worker) |
| **Clients** | HTTP calls via Playwright `request` context |
| **Builders** | Serialize booking payloads (JSON, XML, URL-encoded) |
| **Validators** | Strict status, content-type, and body assertions |
| **Tests** | Specs grouped by API area |

## Test execution order

Playwright runs tests in ordered **projects** with `fullyParallel: true` and `workers: 2`:

| Project | Specs | Runs after |
|---------|-------|------------|
| `ping` | Health check | — |
| `auth` | Token creation | `ping` passes |
| `booking-public` | Create, get, get IDs | `ping` passes |
| `booking-protected` | Update, patch, delete | `auth` passes |

If **ping** fails, all other projects are skipped. If **auth** fails, only `booking-protected` is skipped; create/get tests still run.

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
