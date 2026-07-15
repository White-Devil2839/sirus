<div align="center">

# ✦ SIRUS

### From raw meetings to signed, compliance-ready reports.

**SIRUS turns works-council recordings and transcripts into audited, signature-ready
minutes** — a real AI pipeline (Deepgram + Groq LLM), a live compliance dashboard,
a grounded multilingual assistant, and a page-flip report deliverable in the exact
corporate design system. Built on the MERN stack.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white" />
  <img alt="Node" src="https://img.shields.io/badge/Node-20+-5FA04E?logo=nodedotjs&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-8-16B364?logo=mongodb&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/Tests-19_passing-16B364" />
</p>

</div>

---

## Why SIRUS exists

Statutory meetings (CSE, Betriebsrat, works councils) legally require minutes that are
complete, attributable, and compliant — and today they cost hours of manual writing with
compliance gaps nobody notices until an audit. SIRUS ingests the meeting (audio **or**
transcript) and produces the official record: structured minutes in the corporate blue
design system, a clause-by-clause compliance audit, speaker analytics, and an assistant
that answers questions about the report in the client's language.

**The AI is real.** Deepgram Nova-2 performs diarized transcription; a Groq-hosted
Llama-3.3-70B model produces a validated JSON "report model" that the server renders
deterministically into the design system — zero LLM layout drift. Every number on the
dashboard traces back to that model. Without API keys, the app runs in an honest,
clearly-labeled demo mode on seeded data.

## ✨ Signature experiences

| | |
|---|---|
| **Real AI pipeline** | Audio → Deepgram diarization → Groq LLM → validated JSON → deterministic blue-design report. Tier (Essential / Scope / Premium) controls generation depth. |
| **Six jurisdictions** | 🇫🇷 🇩🇪 🇪🇸 🇮🇹 🇬🇧 🇨🇭 — each with its own bodies (CSE, Betriebsrat, Comité de Empresa, RSU, ICE Works Council…) and legal framework for citations (Code du travail, BetrVG, ICE Regs…). Config-driven: a new country is one object. |
| **Ask SIRUS** | A grounded assistant on every delivered report — answers in the report's language, cites the actual findings and articles, refers out-of-scope questions to a human. |
| **Compliance DNA** | A six-trait SVG fingerprint (compliance · documentation · decisiveness · participation · risk shield · completeness) derived entirely from the audit — never invented. |
| **Intelligence Graph** (`/map`) | Every report as a living dataflow graph — 13 nodes (transcript → extraction → signals → deliverables) hydrated from the report's **actual extraction JSON**, with pan/zoom, click-to-inspect drawer, replay animation and tier-aware "not in tier" states. Works logged-out on the sample library, deep-linkable via `?m=`. |
| **Live product demo** | The landing page embeds the real Report Analyzer running on real seeded data — visitors filter risks and switch tabs before ever signing up. |
| **Three themes** | Paper · Dusk · Nocturne — CSS-variable theming; one `data-theme` attribute re-skins the app with zero re-render. The report deliverable stays print-true. |
| **⌘K command palette** | Fuzzy search across pages, live meetings, actions and themes; `?` opens the shortcut guide. |
| **Never a spinner** | Generation walks the real pipeline stages on screen; reports open in a page-flip e-book viewer with **PDF + DOCX export** and a narrated summary (speech synthesis). |

## 📸 Screenshots

| | |
|---|---|
| **Homepage** — hero, live demo, sample library | ![Home](docs/screenshots/01-home.png) |
| **Report Analyzer** — compliance dashboard | ![Analyzer](docs/screenshots/04-report-analyzer.png) |
| **Generated minutes** — blue-design e-book viewer | ![Report](docs/screenshots/05-blue-report.png) |
| **Admin** — intake, transcript editor, workflow | ![Admin](docs/screenshots/06-admin-detail.png) |

## 🔑 Demo accounts

Seeded with `npm run seed` (password `password123` for all):

| Role | Email | Shows |
|---|---|---|
| **Client 🇫🇷** | `client@sirus.app` | Delivered + locked + awaiting CSE requests, Ask SIRUS |
| **Client 🇩🇪** | `klaus@dmw.de` | Delivered German Betriebsrat report (BetrVG citations) |
| **Client 🇬🇧** | `amelia@albion.co.uk` | UK works council request in editing |
| **Admin** | `admin@sirus.app` | Folder-per-client intake across all three companies |

## 🚀 Run it locally

**Prerequisites:** Node 20+, MongoDB (local `mongod` or a free Atlas cluster).

```bash
# 1) Server
cd server
cp .env.example .env       # set MONGODB_URI; add GROQ_API_KEY + DEEPGRAM_API_KEY for live AI
npm install
npm run seed               # demo users + 3-region sample data
npm run dev                # → http://localhost:5050

# 2) Client (new terminal)
cd client
npm install
npm run dev                # → http://localhost:5173
```

> **Free AI keys:** Groq (console.groq.com, free tier) powers report generation and the
> assistant; Deepgram (console.deepgram.com, $200 signup credit) powers audio
> transcription. Without keys, generation returns realistic seeded reports and audio
> uploads are politely declined — the whole product remains demoable.

## 🧠 How the AI pipeline works

The single most important design decision: **the LLM returns data, not markup.**

```
audio ──▶ Deepgram (diarize, language) ──▶ [Intervenant N] transcript ─┐
transcript upload (.docx/.pdf/.txt) ───────────────────────────────────┤
                                                                       ▼
                     Groq LLM ──▶ JSON "report model" ──▶ Zod validate (+1 repair retry)
                                          │
              ┌───────────────────────────┼──────────────────────────────┐
              ▼                           ▼                              ▼
   htmlRenderer.js → blue-design   findings → Report Analyzer     Compliance DNA ·
   multi-page HTML (e-book)        dashboard + instant preview    Ask SIRUS grounding
```

- `server/src/services/llm/` — `client.js` (Groq chat + JSON modes), `prompts.js`
  (tier-aware system prompt grounded in the **region's legal framework**), `schema.js`
  (Zod report model), `pipeline.js` (generate → parse → validate → one repair retry).
- `server/src/services/render/htmlRenderer.js` — a pure function mapping JSON to the
  exact design-system classes (`.page`, `.kv-table`, `.speaker`, `.alert`, `.vote-*`).
  The report matches the corporate template regardless of what the model wrote.
- `server/src/services/transcribe/deepgram.js` — Nova-2 with diarization + smart
  formatting; auto-retries with language detection if the pinned language hears nothing.

## 🗺️ Feature map (vs. the product proposal)

| Proposal section | Status |
|---|---|
| Homepage sample library (§18) · live builder preview (§3, §6) | ✅ Built |
| Registration hard-gate (§1) · metadata step with live summary (§2–3) | ✅ Built |
| Upload: audio/video **via Deepgram** + documents (§4, §14) | ✅ Built (live) |
| Instant 3-pattern preview (§5, §16) | ✅ Built |
| Quotation → tiers (§5–6) · folder-per-client intake (§13) | ✅ Built |
| Tier-specific AI generation (§15) · Document Editor + lock + dispatch (§15) | ✅ Built |
| Report Analyzer dashboard (§16) · blue-design minutes | ✅ Built |
| Multi-region compliance config (§8) | ✅ Built — six jurisdictions |
| Text assistant grounded in the report (§17) | ✅ Built (Ask SIRUS) |
| Voice-mode assistant (§17) · CRM (§20) · PPT export · Broadcast | 🔶 Labeled stubs |

## 🛡 Engineering

- **Security:** helmet (strict CSP), tiered rate limits, mongo-sanitize, CORS pinned to
  the client origin, bcrypt, JWT, zod-validated env that **refuses to boot in production
  with a weak secret**. See [docs/SECURITY.md](docs/SECURITY.md).
- **Tests:** 19 vitest tests — supertest against the real app with an in-memory MongoDB
  (auth, cross-user ownership isolation, the full upload→generate→lock→dispatch
  lifecycle, renderer XSS-escaping, tier trimming). See [docs/TESTING.md](docs/TESTING.md).
- **Resilience:** app/server split for testability, consistent JSON error envelope,
  client error boundary, session-expiry auto-logout, request timeouts.
- **Deploy:** `server/render.yaml` blueprint + `client/vercel.json` SPA rewrites + CI
  workflow. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 📁 Project structure

```
sirus/
├── client/                          # React + Vite front-end
│   └── src/
│       ├── report/reportStyles.css  # blue design system (print-true, un-themed)
│       ├── lib/                     # api · auth · theme · toast · queryClient
│       ├── components/              # EbookViewer · ReportAnalyzer · ComplianceDNA ·
│       │                            # CommandPalette · PipelineProgress · Charts · ui kit
│       └── features/                # home · auth · create · preview · quote · client · admin
├── server/
│   ├── src/
│   │   ├── app.js / index.js        # testable app factory / HTTP entrypoint
│   │   ├── models/                  # User · MeetingRequest · Report · SampleReport
│   │   ├── routes/                  # auth · samples · requests (+ask) · reports
│   │   ├── services/                # llm · render · transcribe · parse · report
│   │   └── seed/                    # transcript + FR/DE/UK sample data + seed script
│   └── test/                        # vitest + supertest + mongodb-memory-server
└── docs/                            # screenshots + ARCHITECTURE/TESTING/SECURITY/DEPLOYMENT
```
