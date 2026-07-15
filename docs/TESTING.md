# Testing

```bash
cd server
npm test          # 19 tests, ~5s
npm run test:watch
```

## Approach

Integration tests drive the **real Express app** (via the `createApp()` factory) with
supertest against a **real in-memory MongoDB** (`mongodb-memory-server`) — the true
persistence and middleware path, not mocks. The test setup forces empty AI keys before
the app config loads, so generation exercises the offline demo path and the suite needs
no network or secrets.

## What is covered (`server/test/`)

**`api.test.js` — platform & lifecycle**
- Health endpoint + helmet security headers (`nosniff`, strict CSP) + JSON 404s
- Capability probe reports AI off in test mode
- Auth: signup (safe user, no hash leak), duplicate email 409, bad credentials 401,
  auth-gated listing
- **Cross-user ownership isolation**: Bob cannot list, read, or delete Alice's requests
- Region-config acceptance (German `BR` body persists — no hard-coded French enum)
- **The full pipeline**: create → upload transcript file → client forbidden from
  generating → admin generates (report HTML pages + findings score, status
  `in-editing`) → client blocked pre-dispatch → lock → dispatch → client reads
- Deletion rules: owners delete drafts; delivered work is protected (403)
- Audio uploads degrade gracefully (503 with a helpful message) without Deepgram

**`report.test.js` — the AI contract**
- Zod report model fills safe defaults and accepts the full seeded extraction
- The deterministic renderer emits every design-system component
- **XSS**: model/user text is HTML-escaped in the rendered report
- `finalizeReport` derives dashboard counts from the arrays
- Tier trimming: Essential strips attendance, votes, speaker analysis

## What is deliberately not covered

Live Groq/Deepgram calls (external, non-deterministic, cost money) — their client code
is exercised up to the fetch boundary by the graceful-degradation tests. Browser E2E is
covered manually via scripted headless-Chrome screenshot verification during
development; a Playwright smoke suite is the natural next step.
