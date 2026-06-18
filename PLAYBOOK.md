# BioHaqr — Full Build Playbook

Complete record of architecture, decisions, and implementation.
Last updated: 2026-06-17.

---

## What This App Is

A personal biohacking tracker. Users log legal supplements, peptides, and TRT; upload bloodwork; connect wearable devices (Whoop/Oura); and view correlations between their stack and their own biomarkers over time. A Knowledge Engine explains mechanisms and cites published literature — it does **not** generate personalized dosing recommendations.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, API routes, file-based routing |
| Language | TypeScript (strict) | Type safety across DB schema and API |
| Auth | Supabase Auth | Row-Level Security, OAuth, session cookies |
| Database | Supabase (Postgres) | Hosted Postgres with RLS |
| ORM | Prisma 7 | Type-safe queries; uses `PrismaPg` + `Pool` adapter for Postgres |
| Styles | Tailwind CSS | Utility-first; dark theme throughout |
| Document parsing | Hosted model API | PDF bloodwork extraction + Knowledge Engine |
| Charts | Recharts | `ComposedChart` for biomarker timeline with log overlays |
| Encryption | Node.js `crypto` (AES-256-GCM) | Wearable OAuth tokens at rest |

---

## Project Structure

```
BioHaqr/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx              — Nav header + auth gate for all dashboard pages
│   │   ├── page.tsx                — Stack Log (main feed)
│   │   ├── log/new/page.tsx        — Log entry form (redesigned compound picker)
│   │   ├── bloodwork/
│   │   │   ├── page.tsx            — Upload PDF
│   │   │   └── confirm/page.tsx    — Review parsed rows before saving
│   │   ├── biomarkers/page.tsx     — Snapshot (panel tabs) + Trends (line chart)
│   │   └── correlations/page.tsx   — Timeline + Before/After comparison
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts   — Supabase OAuth callback handler
│   │   │   └── signout/route.ts    — POST to sign out
│   │   ├── log-entries/
│   │   │   ├── route.ts            — POST: create log entry
│   │   │   └── [id]/route.ts       — DELETE: delete log entry (auth-checked)
│   │   ├── compounds/route.ts      — GET: search/filter; POST: user-added compound
│   │   ├── bloodwork/
│   │   │   ├── upload/route.ts     — Multipart PDF → parse → return rows
│   │   │   └── confirm/route.ts    — POST confirmed rows → Biomarker table
│   │   ├── correlations/
│   │   │   └── before-after/route.ts — Before/after averages + confound detection
│   │   └── whoop/
│   │       ├── connect/route.ts    — Generate OAuth state, redirect to Whoop
│   │       ├── callback/route.ts   — Exchange code, encrypt tokens, save connection
│   │       └── sync/route.ts       — Decrypt tokens, refresh if expired, fetch 30d data
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── middleware.ts               — Supabase session refresh on every request
│
├── components/
│   ├── biomarkers/
│   │   ├── BiomarkerChart.tsx      — Line chart for Trends tab
│   │   ├── SnapshotTable.tsx       — Panel tabs + range bar per marker
│   │   └── RangeBar.tsx            — Red→green gradient bar with value indicator
│   ├── bloodwork/
│   │   ├── UploadForm.tsx          — PDF picker + upload; stores parsed rows in sessionStorage
│   │   └── ConfirmationTable.tsx   — Editable rows; reads sessionStorage; POST to confirm
│   ├── correlations/
│   │   ├── TimelineChart.tsx       — ComposedChart: biomarker line + amber log markers
│   │   ├── BeforeAfterComparison.tsx — Client component: compound/biomarker selectors + N slider
│   │   └── CompoundOverlapCaveat.tsx — Amber warning box when confounds detected
│   ├── log/
│   │   ├── LogEntryForm.tsx        — Two-step: compound picker → details form
│   │   └── LogEntryList.tsx        — Grouped by day, hover-to-delete
│   └── wearable/
│       ├── WhoopConnectButton.tsx
│       └── SyncButton.tsx
│
├── lib/
│   ├── db/
│   │   ├── client.ts               — Prisma client singleton (PrismaPg + Pool)
│   │   └── queries.ts              — All DB access functions (no raw SQL)
│   ├── biomarkers/
│   │   ├── panels.ts               — Static lookup: biomarker name → panel (CMP/CBC/etc.)
│   │   └── ranges.ts               — Reference ranges + getRangeStatus() for color coding
│   ├── knowledge-engine/
│   │   └── bloodwork.ts            — ONLY place that calls the model API; PDF → biomarker rows
│   ├── supabase/
│   │   ├── client.ts               — Browser Supabase client
│   │   └── server.ts               — Server Supabase client (getAll/setAll cookie pattern)
│   └── wearable/
│       ├── encryption.ts           — AES-256-GCM encrypt/decrypt for OAuth tokens
│       └── whoop.ts                — Pure functions: buildAuthUrl, exchangeCode, fetchRecovery
│
├── prisma/
│   ├── schema.prisma               — Source of truth for data model
│   ├── seed.ts                     — 51 compounds seeded (30 supp, 15 peptide, 6 TRT)
│   └── prisma.config.ts            — defineConfig with PrismaPg adapter
│
├── PLAYBOOK.md                     — This file
└── .env.local                      — Secrets (never committed)
```

---

## Data Model

```prisma
// All user auth is via Supabase; User table is implicit in Supabase Auth.

enum CompoundCategory { supplement  peptide  trt }

model CompoundLibrary {
  id               String           @id @default(cuid())
  name             String           @unique
  category         CompoundCategory
  subcategory      String?          // e.g. "performance", "sleep", "long-ester"
  mechanismSummary String
  halfLifeHours    Float?           // TRT only — drives future half-life graph
  popularityRank   Int?             // Lower = more popular; null = user-added
  isUserAdded      Boolean          @default(false)
  citations        Citation[]
  logEntries       LogEntry[]
  communityNotes   CommunityNote[]
}

model Citation {
  id         String          @id @default(cuid())
  compoundId String
  compound   CompoundLibrary @relation(...)
  text       String          // Full citation text
  url        String?
}

model LogEntry {
  id         String          @id @default(cuid())
  userId     String          // Supabase auth UID
  compoundId String
  compound   CompoundLibrary @relation(...)
  amount     Float           // User-reported dose
  unit       String          // mg, g, mcg, IU, ml, etc.
  timestamp  DateTime        @default(now())
  note       String?
}

model Biomarker {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "Glucose", "LDL", "HRV RMSSD", etc.
  value     Float
  unit      String
  date      DateTime
  source    String   // "bloodwork" | "whoop"
  @@unique([userId, type, date, source])
}

model WearableConnection {
  id                    String    @id @default(cuid())
  userId                String
  provider              String    // "whoop"
  encryptedAccessToken  String    // AES-256-GCM: iv:authTag:ciphertext
  encryptedRefreshToken String
  tokenExpiresAt        DateTime
  lastSyncedAt          DateTime?
  @@unique([userId, provider])
}

model CommunityNote {
  id         String          @id @default(cuid())
  compoundId String
  compound   CompoundLibrary @relation(...)
  text       String
  sourceUrl  String?
  verified   Boolean         @default(false)  // Never set to true; not editable
}
```

---

## Seeded Compound Library (51 total)

### Supplements (30) — sorted by popularityRank
1. Creatine Monohydrate · performance
2. Magnesium Glycinate · sleep
3. Vitamin D3 · longevity
4. Omega-3 (EPA/DHA) · cardiovascular
5. Ashwagandha (KSM-66) · adaptogen
6. L-Theanine · cognitive
7. Zinc (Bisglycinate) · hormonal
8. Berberine · metabolic
9. NMN (Nicotinamide Mononucleotide) · longevity
10. Alpha-GPC · cognitive
11. Lion's Mane Mushroom · cognitive
12. Melatonin · sleep
13. CoQ10 (Ubiquinol) · cardiovascular
14. Taurine · cardiovascular
15. Glycine · sleep
16. Rhodiola Rosea · adaptogen
17. Apigenin · sleep
18. Resveratrol · longevity
19. Quercetin · longevity
20. Beta-Alanine · performance
21. Citrulline Malate · performance
22. Phosphatidylserine · cognitive
23. Bacopa Monnieri · cognitive
24. Metformin · metabolic *(off-label longevity use)*
25. NR (Nicotinamide Riboside) · longevity
26. Spermidine · longevity
27. Vitamin K2 (MK-7) · cardiovascular
28. Alpha-Lipoic Acid (ALA) · metabolic
29. Collagen Peptides · recovery
30. EGCG (Green Tea Extract) · longevity

### Peptides (15)
1. BPC-157 · tissue repair
2. TB-500 (Thymosin Beta-4) · tissue repair
3. GHK-Cu (Copper Peptide) · anti-aging
4. Semax · cognitive
5. Selank · cognitive
6. Epithalon (Epitalon) · anti-aging
7. Ipamorelin · growth hormone
8. CJC-1295 · growth hormone
9. PT-141 (Bremelanotide) · sexual health
10. DSIP (Delta Sleep-Inducing Peptide) · sleep
11. KPV · gut health
12. SS-31 (Elamipretide) · mitochondrial
13. MOTS-c · mitochondrial
14. Humanin · mitochondrial
15. 5-Amino-1MQ · metabolic

### TRT Esters (6) — with halfLifeHours
| Ester | subcategory | halfLifeHours |
|---|---|---|
| Testosterone Cypionate | long-ester | 192h (~8 days) |
| Testosterone Enanthate | long-ester | 108h (~4.5 days) |
| Testosterone Propionate | short-ester | 19.5h |
| Testosterone Undecanoate (Injectable) | ultra-long-ester | 814h (~34 days) |
| Testosterone Suspension | ester-free | 24h |
| Testosterone Cream (Transdermal) | transdermal | 12h |

**AAS (trenbolone, nandrolone, stanozolol, oxandrolone) and HGH are permanently out of scope.**

---

## Key Features Built

### 1. Auth (Supabase)
- Email/password signup + login
- Session cookies managed via `@supabase/ssr` `getAll`/`setAll` pattern
- Middleware refreshes session on every request
- All dashboard routes redirect to `/login` if no session
- Sign-out via POST (prevents CSRF)

### 2. Stack Log
- `GET /dashboard` — server component; fetches all log entries sorted desc by timestamp
- Entries grouped by calendar day with full written-out date separator
- Hover on any entry → Delete button appears; `DELETE /api/log-entries/[id]` verifies ownership before deleting
- `GET /dashboard/log/new` — redesigned compound picker

### 3. Compound Picker (Log Entry Form)
Two-step flow:
- **Step 1**: Category tabs (Supplement / Peptide / TRT) → live search → scrollable list sorted by popularityRank → "Add something not listed" inline form
- **Step 2**: Back button, selected compound header, amount/unit/datetime-local/note
- Custom compound creation: `POST /api/compounds` → `isUserAdded: true`, no citations required

### 4. Bloodwork Upload
- Drag/drop or click PDF picker (max 10MB)
- `POST /api/bloodwork/upload`: multipart → optional Supabase Storage upload (soft-fail if bucket missing) → `parsePDF()` → returns parsed rows
- Parsed rows stored in `sessionStorage` (never written to DB until user confirms)
- Confirmation table: editable name/value/unit/date per row; remove individual rows; then `POST /api/bloodwork/confirm` writes to Biomarker table
- Model API with `document` content block (native PDF); extraction rules take only numeric values, skips qualitative results (">1000", "Reactive"), returns clean JSON array

### 5. Biomarkers View
**Snapshot tab** (default):
- Date chips select which test date to view
- Panel tabs (CMP / CBC / Lipid Panel / Thyroid / Hormones / Metabolic / Vitamins & Minerals / Wearable / Other) — only panels with data are shown
- Each marker row: name | colored value | unit | red→green range bar with status badge
- Range data from `lib/biomarkers/ranges.ts`: 70+ markers with normalLow/normalHigh/optimalLow/optimalHigh/displayMin/displayMax
- Status: Optimal (dark green) → Normal (light green) → Borderline (orange) → Out of range (red) → No reference (—)

**Trends tab**:
- Type chips to select a single marker
- Recharts line chart of that marker over time

### 6. Whoop Integration
- `GET /api/whoop/connect`: generates PKCE state token in cookie, redirects to Whoop OAuth
- `GET /api/whoop/callback`: validates state, exchanges code, encrypts access + refresh tokens with AES-256-GCM, upserts `WearableConnection`
- `POST /api/whoop/sync`: decrypts tokens, refreshes if within 5 min of expiry, fetches 30 days of recovery data from Whoop v1 API, writes 3 Biomarkers per entry (HRV RMSSD, Resting Heart Rate, Recovery Score)
- Token storage format: `iv:authTag:ciphertext` (hex-encoded, all in one field)
- **Status**: OAuth shape is correct; requires real `WHOOP_CLIENT_ID` / `WHOOP_CLIENT_SECRET` from developer.whoop.com to activate

### 7. Correlation Dashboard
**Timeline panel**:
- Biomarker type chips → fetch all values for that type over time
- Recharts `ComposedChart`: `Line` for values + `ReferenceLine` per date that has a log entry (amber dashed)
- Hover tooltip shows biomarker value AND any compounds logged that day

**Before/After panel**:
- Compound selector (from compounds with at least one log entry) + biomarker selector + N-day window slider (7–90, step 7)
- Finds earliest log entry for compound as anchor date T
- Fetches biomarker averages in [T-N, T] (before) and [T, T+N] (after)
- `getOtherCompoundsInWindow()` → detects confounds (other compounds logged in same window)
- **Confound caveat** rendered above numbers in amber border box — named compounds in brackets, dynamically worded for 1 vs. many confounds
- No delta, no arrows, no directional judgment — plain n=1 averages only

---

## API Routes Summary

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/callback` | — | Supabase OAuth callback |
| POST | `/api/auth/signout` | ✓ | Sign out |
| GET | `/api/compounds` | ✓ | Search/filter compounds |
| POST | `/api/compounds` | ✓ | Create user-added compound |
| POST | `/api/log-entries` | ✓ | Create log entry |
| DELETE | `/api/log-entries/[id]` | ✓ | Delete own log entry |
| POST | `/api/bloodwork/upload` | ✓ | Parse PDF |
| POST | `/api/bloodwork/confirm` | ✓ | Save confirmed biomarker rows |
| GET | `/api/correlations/before-after` | ✓ | Before/after averages + confounds |
| GET | `/api/whoop/connect` | ✓ | Start Whoop OAuth |
| GET | `/api/whoop/callback` | ✓ | Complete Whoop OAuth |
| POST | `/api/whoop/sync` | ✓ | Sync 30 days of Whoop data |

---

## Environment Variables

```bash
# .env.local — never committed

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-side only
DATABASE_URL=postgresql://...      # direct Postgres URL for Prisma

# Model API
ANTHROPIC_API_KEY=sk-ant-...

# Whoop OAuth
WHOOP_CLIENT_ID=...
WHOOP_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Wearable token encryption (64 hex chars = 32 bytes = AES-256 key)
WEARABLE_ENCRYPTION_KEY=<64 hex chars>
```

---

## Key Architectural Decisions

### Prisma 7 with PrismaPg adapter
Prisma 7 dropped the `url` field in `datasource db`; connection is configured in `prisma.config.ts` via `defineConfig` with `PrismaPg` + `Pool`. Use `prisma db push` (not `migrate dev`) — the interactive terminal prompt in `migrate dev` fails in non-TTY environments.

### Supabase SSR cookie pattern
`@supabase/ssr` v0.12 requires `getAll` / `setAll` cookie handlers (not individual `get`/`set`/`remove`). Creating the server client the old way silently fails to persist sessions.

### sessionStorage for unconfirmed parse data
Bloodwork rows from the parser are stored in `sessionStorage` and never written to the DB until the user clicks Save on the confirmation screen. This prevents auto-saving bad OCR data.

### Predefined biomarker→panel mapping
`lib/biomarkers/panels.ts` uses a static lookup rather than re-parsing the extraction output within panel context. Different labs format the same test differently; a static map gives consistent panel assignment regardless of source formatting.

### No generated dose recommendations
The Knowledge Engine (`lib/knowledge-engine/`) is the only place in the codebase that calls the model API. Its extraction and response rules explicitly prohibit directive recommendations. No other file may call that API directly.

### Soft-fail on Supabase Storage
The `bloodwork-uploads` bucket is for archival only; if it doesn't exist the upload route logs a warning and continues. Parsing works from the in-memory PDF buffer — the bucket is not required for any core functionality.

---

## Hard Boundaries

- **Never** generate a personalized dose, frequency, or protocol recommendation
- **AAS** (trenbolone, nandrolone, stanozolol, oxandrolone) and **HGH** are permanently out of scope — do not add to library or schema
- **General pharmaceuticals** out of scope for now; longevity/off-label compounds (berberine, metformin, rapamycin, NMN) live in the `supplement` category
- **TRT** (ester-based testosterone) is in scope — track dose, ester type, half-life
- No affiliate links or seller referrals
- Never log raw bloodwork/wearable values to console or error trackers in non-dev environments
- `CommunityNote.verified` is always `false`; the field is not editable

---

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npx prisma db push   # Apply schema changes (use instead of migrate dev)
npx tsx prisma/seed.ts  # Seed compound library
```

---

## What's Next — Prioritized Build Order

*Revised 2026-06-17 after competitive review. See Strategy & Architecture Decisions below for rationale.*

| Priority | Feature | Notes |
|---|---|---|
| **1 — Next** | GLP-1 agonist seed entries | Semaglutide, tirzepatide, retatrutide, liraglutide added to schema under `peptide` / `glp1_agonist`. Mechanism content to be sourced from Tier 1/2 only. |
| **2** | Knowledge base detail page | `/dashboard/compound/[id]` — displays `mechanismSummary`, citations, CommunityNotes. Populate content with verified sourcing before shipping the chatbot. |
| **3** | Knowledge Engine chat UI | Grounded Q&A on mechanism and documented side effects from the cited library only. Requires explicit guardrails tested across multi-turn conversations. Separate design step before implementation. |
| **4** | Interaction checker | Schema: `CompoundEnzymeProfile`, `CompoundInteraction`. Candidate generation deterministic/DB-driven. Human-verified citations gate what's shown. Generated text used only as a draft for human review — never to decide if an interaction exists. Full spec in `interaction-checker-spec.md`. |
| **Deprioritized** | TRT half-life curve | Regimen already ships PK curves for every compound. No longer a differentiator. `halfLifeHours` field stays on the schema for future use. |
| **Infra** | Whoop real credentials | WHOOP_CLIENT_ID + WHOOP_CLIENT_SECRET from developer.whoop.com; redirect URI = `$NEXT_PUBLIC_APP_URL/api/whoop/callback` |
| **Infra** | Supabase Storage bucket | Create `bloodwork-uploads` in Supabase dashboard → enable RLS → owner read/write policy. Currently soft-fails — parsing works without it. |
| **Later** | Oura integration | Mirror of Whoop OAuth flow; Oura v2 API: HRV, RHR, sleep scores |
| **Later** | Sex/age-adjusted ranges | Add `sex` + `age` to user profile; adjust `lib/biomarkers/ranges.ts` reference ranges accordingly |
| **Later** | Panel range disclaimer | Footnote on SnapshotTable: "Ranges are general adult reference values — consult your physician for interpretation" |

---

## Strategy & Architecture Decisions (2026-06-17)

### Competitive Landscape (research confirmed)

| Product | Relevant capability | Implication |
|---|---|---|
| **Regimen** | Free tier: lab/biomarker overlay on dose timeline, PK curve per compound, automated pattern-correlation engine, Apple Health + Google Health Connect sync | Half-life curve and basic bloods+wearable correlation are **no longer differentiating** — deprioritized |
| **PeptIQ** | Chat assistant, no cited sources | Gap to beat: our Knowledge Engine must surface real citations, not just assertions |
| **PepTracker**, **Smart Peptide Tracker**, **Shotsy** | Reviewed; none do enzyme/mechanism-based interaction checking | **Interaction checker is uncontested** in this product category |

### Decision: Interaction checker over half-life curve

The half-life curve was on the backlog as the next feature. After the competitive review, Regimen already ships PK curves. The interaction checker — enzymatic and pharmacodynamic — has no equivalent in any reviewed competitor.

**Two distinct mechanism types the checker must handle:**
- **Metabolic/enzymatic** — CYP450 inhibition/induction, aromatase, 5-alpha-reductase. Relevant to TRT esters and some supplements (e.g., berberine's mild CYP2D6 inhibition).
- **Pharmacodynamic overlap** — additive or antagonistic effects at the receptor/pathway level. Relevant to most peptides, which are not CYP-metabolized.

**Schema additions (not yet implemented):**
- `CompoundEnzymeProfile` — maps compound → enzyme → effect (inhibitor/inducer/substrate) + tier + citation
- `CompoundInteraction` — maps compound pair → mechanism type + severity + description + citations

**Implementation constraint:** Candidate-generation must be deterministic and database-driven. Human-verified citations gate what is shown to users. Generated text is used only as a draft for reviewer approval — it never decides whether an interaction exists. Full spec written to `interaction-checker-spec.md` (not yet committed).

### Decision: Knowledge base content before interaction checker

`mechanismSummary` and `citations` already exist on `CompoundLibrary`. Populating that content thoroughly first is the right order because:
1. The interaction checker's sourcing work (reading primary literature per compound) is the same research pass — doing it twice would be wasted effort.
2. The detail page UI (step 2) ships useful value independently, before the checker is built.
3. Content quality in `mechanismSummary` directly feeds the chatbot's grounding material.

### Decision: Sourcing discipline

Three tiers, strictly enforced:

| Tier | Source | Role |
|---|---|---|
| **1** | Official drug labels (FDA, EMA) | Authoritative for approved compounds; always cite if available |
| **2** | Primary peer-reviewed literature via PubMed | Direct citations; not secondary write-ups or reviews of reviews |
| **3** | Aggregators (DrugBank, Examine, etc.) | Used as a map to locate Tier 1/2 sources — **never cited directly** |

A domain practitioner's claim (blog post, podcast, forum) is a hypothesis to verify against Tier 1/2, never citation-ready content on its own. This rule was established after catching an inaccurate claim about **Dihexa's** research record before it could have entered the library — the claim was plausible-sounding but not supported by the primary literature it cited.

### Decision: Chatbot approved in concept; design step required before implementation

**Approved use case:** Grounded Q&A on mechanism and documented side effects drawn from the cited library. Not dosing.

**Required guardrails (must be designed and tested before shipping):**
- Descriptive language only, never directive ("this compound has been associated with X in studies" not "take X for Y")
- Explicit constraints against multi-turn drift toward dosing-shaped follow-ups
- Tested across multi-turn conversations, not just single questions — the risk is that a benign opening question leads to increasingly specific follow-ups
- "Harm reduction" framing was explicitly rejected as a basis for anything beyond the interaction checker's existing descriptive flagging

This is a **separate design step** before any implementation work begins.

### Decision: GLP-1 agonists added to scope

**Compounds:** Semaglutide, tirzepatide, retatrutide, liraglutide.

**Category:** `peptide`, subcategory `glp1_agonist`.

**Justification:** Consistent with the existing metformin/rapamycin precedent — off-label pharmaceutical use is in scope under the `supplement` category (or `peptide` when the compound is structurally peptidic). GLP-1 agonists are increasingly used in longevity/body-composition contexts.

**Flagged for the content stage:**
- More titration-sensitive than most of the existing library — nausea, gastroparesis, and pancreatitis risk are dose-dependent
- FDA boxed warning on semaglutide/liraglutide: thyroid C-cell tumor signal in rodent studies (clinical significance in humans unknown but must be documented)
- The interaction checker will need CYP-independent gastric-emptying interaction logic (GLP-1 agonists slow gastric emptying, affecting absorption timing of co-administered oral drugs)

**Status:** Schema-only seed entry added; mechanism content not yet sourced or committed.

### Current Build Order

1. GLP-1 structural seed entries → schema + placeholder `mechanismSummary`, no content shipped until Tier 1/2 sourcing is complete
2. Knowledge base detail page UI (`/dashboard/compound/[id]`) → `mechanismSummary`, citations, CommunityNotes
3. Chatbot with guardrails → separate design step, then implementation
4. Interaction checker → `CompoundEnzymeProfile` + `CompoundInteraction` schema, deterministic candidate-gen, human-verified citations
