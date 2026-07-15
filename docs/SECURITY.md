# Security

Meeting recordings and transcripts are personal, often sensitive data. Measures in
place, in defense-in-depth order:

## Transport & headers
- **helmet** with a strict CSP (`default-src 'none'`, `frame-ancestors 'none'`) — the
  API serves JSON only and says so.
- CORS pinned to the configured client origin (no wildcard in production).
- `trust proxy` for correct client IPs behind Render/Vercel.

## Input & abuse
- **Tiered rate limits**: 300/min per IP on `/api`, 30/min on `/api/auth`
  (credential-stuffing), 20/min on the AI endpoints (cost abuse).
- `express-mongo-sanitize` strips `$`/`.` operator injection from all input.
- JSON body capped at 4 MB; uploads capped at 100 MB with an allowlist of MIME types
  and extensions (documents + audio/video only); files are processed in memory and
  never written to disk.
- Zod validation on the environment; report extractions are Zod-validated before use.

## AuthN / AuthZ
- Passwords bcrypt-hashed (cost 10); hashes are never serialized to clients.
- JWT bearer auth (7-day expiry). **Production refuses to boot** with a missing, short,
  or default `JWT_SECRET` (zod refine at startup).
- Ownership is enforced on every request route — covered by cross-user isolation tests.
- Role gates: generation, editing, locking, dispatch and cross-client visibility are
  admin-only. Clients can only delete their own *undelivered* requests; delivered
  reports are immutable audit records for them.
- Session expiry: a 401 on any authenticated call clears the client session app-wide.

## AI-specific
- API keys (Groq, Deepgram) live in server env only — never in the client bundle.
- The assistant receives a **trimmed, structured context** (findings + metadata), not
  raw transcripts, and is instructed to refuse out-of-scope questions.
- All model output is HTML-escaped by the renderer before it can reach a browser
  (verified by test) — a prompt-injected `<script>` renders as text.

## Known gaps (honest)
- No refresh-token rotation or logout-side token revocation (JWTs live 7 days).
- No per-account lockout beyond IP rate limiting.
- No encryption-at-rest beyond what the database provides (use Atlas encryption).
- Error reporting hook (Sentry) is stubbed in the client ErrorBoundary, not wired.
