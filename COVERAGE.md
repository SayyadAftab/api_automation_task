# Restful Booker API Automation — Strict Contract Testing

This suite uses **strict contract assertions**. Tests **FAIL** when actual API behavior does not match documented/contract expectations.

There is **no** known-fail, skip, or expected-failure suppression.

## Assertion policy

- Exact HTTP status codes only (no `oneOf`, no ranges)
- Response body validation where contract defines it
- Content-Type validation where applicable
- Rich failure messages with expected vs actual
- API defects remain **FAILED** — not hidden

## Run tests

```bash
cd restful-booker-api-automation
npm install
npm test
```

A red suite may indicate **API behavior/defect (C)** or **test expectation review needed (B)** — not automatic pass-by-weakening.
