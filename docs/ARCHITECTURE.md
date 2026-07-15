# Architecture

## Principles

1. **The LLM returns data, not markup.** The single load-bearing decision. A Zod schema
   defines the "report model"; the model must produce it (one repair retry); a pure
   function renders the corporate design system from it. The report, the dashboard, the
   Compliance DNA and the assistant all read the same JSON — they can never disagree,
   and the deliverable can never drift from the design template.
2. **Honest AI.** Live generation is labeled with the model that produced it; the
   offline path is labeled `demo-seed` and the admin UI shows a demo banner. Findings
   are derived from the transcript — sections the data can't support are omitted, not
   invented.
3. **Config over code.** Jurisdictions (bodies + legal framework + language), tiers,
   and themes are data. Adding country #7 or theme #4 is one object, no pipeline edits.
4. **The deliverable is sacred.** The blue report (`.sirus-report`) is namespaced,
   un-themed, and print-true. App theming never touches it.

## Client

React 18 + Vite. State: TanStack Query for server state (30s stale, polling where a
status can change), React context for auth/theme/toasts. Styling: Tailwind with
**CSS-variable surface tokens** (`--paper/--card/--ink/--muted/--line` as RGB channels)
so `data-theme` on `<html>` re-skins everything without re-rendering; a pre-paint inline
script prevents theme flash. Editorial layer: Clash Display + Instrument Serif italics,
drifting halos, scroll reveals, marquee, staged pipeline animations.

Key components:

- `EbookViewer` — splits generated HTML on `.page` boundaries; keyboard paging; PDF via
  the design system's print CSS; DOCX via a Word-compatible HTML blob.
- `ReportAnalyzer` — the compliance dashboard (donut, metric bars, risk cards,
  filterable findings) fed by `findings` JSON.
- `ComplianceDNA` — six-trait radar derived deterministically from findings +
  extraction (votes, engagement, metrics).
- `CommandPalette` / `ShortcutsOverlay` — ⌘K fuzzy navigation over pages, live
  requests, actions and themes.
- `AskSirus` — chat panel; history + grounded context handled server-side.

## Server

Express 4 with an **app/entrypoint split**: `createApp()` builds the fully-configured
app with no port binding, so supertest drives the real stack in-process; `index.js`
connects Mongo and listens.

Middleware order: trust proxy → helmet (strict CSP) → CORS (pinned origin) → JSON body
limit → mongo-sanitize → morgan → tiered rate limits (300/min API, 30/min auth, 20/min
AI endpoints) → routes → JSON 404 → error envelope.

Services:

- `llm/` — Groq client (JSON mode for extraction, chat mode for the assistant),
  region-aware prompts, Zod schema, pipeline with repair retry. Free-tier budget is
  respected by capping transcript characters (`LLM_MAX_TRANSCRIPT_CHARS`).
- `transcribe/deepgram.js` — Nova-2 pre-recorded API: diarize + utterances + smart
  format, language pinned to the request with an auto-detect retry; formats output as
  `[Intervenant N]` turns to match document uploads.
- `render/htmlRenderer.js` — JSON → design-system HTML. All user/model text is
  HTML-escaped (covered by tests).
- `report.js` — `finalizeReport` (derive counts, render), `trimToTier`.

## The report — one shape, many views

`Report.extraction` (the validated JSON) is the source of truth. Views: blue-design
HTML (client viewer + admin editor), `findings` (dashboard + landing live demo),
`speakerAnalysis` (preview pattern), DNA traits (derived client-side), assistant
grounding (trimmed server-side). The admin Document Editor edits the rendered HTML;
locking freezes it; dispatch flips visibility to the client.

## Realtime & progress

Generation is a single HTTP call; the UI walks the real pipeline stages client-side
("never watch a spinner") and TanStack Query polls status where it can change. A
socket layer was considered and deliberately deferred: the longest operation (~10s)
doesn't justify the infrastructure yet — the seam is `requests.js`.

## Trade-offs (honest)

- Groq's free tier caps tokens/minute, so long transcripts are truncated to a
  configurable budget before extraction; the full text is preserved for the admin.
- DOCX export is Word-compatible HTML, not OOXML — fine for the deliverable checkbox,
  would be replaced by a real docx library in production.
- The Document Editor uses contentEditable + execCommand: adequate for the format-and-
  fix pass the proposal describes, not a full word processor.
