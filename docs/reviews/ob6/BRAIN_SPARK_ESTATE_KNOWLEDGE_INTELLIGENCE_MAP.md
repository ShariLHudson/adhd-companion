# BRAIN SPARK ESTATE™ — Knowledge Intelligence Map
## What Spark knows, who owns it, what kind of truth it is, and whether One Brain can use it

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Taken at | OB-6 ending SHA `e5c53e73` (branch `ob6/unified-knowledge-access`, from `2dca87e4`) |
| Companion report | `BRAIN_SPARK_ESTATE_OB6_RETURN_REPORT.md` |

**How to read this map**

- **Truth type** is *derived* from each source's own status, provenance and time fields. No new field was stored.
  - CURRENT (authoritative) · HISTORICAL (superseded or retired) · TENTATIVE (hypothesis, not settled) · PLANNED (future / work in progress) · RESEARCH (evidence) · MEMORY (context) · SPECIALIST (opinion / deliberation) · SAMPLE (demo / seed) · UNKNOWN.
- **One Brain** means: can One Brain's KNOW read it and answer in conversation?
  - ✅ yes · ◐ partly · ✖ no.
- **Specialists** means: do the Board, Chamber, Strategy, Research and Create receive it through their authorized context (`consumeAuthorizedSituation` → `retrieveRelevantSituation`)?
- **Return** means: can its content come back into the main conversation?
- **Action** is the recommendation: KEEP (right as is) · CONNECT (connect next) · CONVERGE (duplicate to fold in) · DEFER (later, with a reason) · MISSING (proven absent).
- **Local only:** everything below lives in the browser unless marked **(Supabase)**. Durable Supabase copies exist only for Create workspaces, Saved Spark and billing. The Evidence Vault durable copy is flag-OFF.

---

## 1. Business and member truth

| Source / store | Owner (authority) | Truth type | Runtime consumers | One Brain | Specialists | Return | Current / history | Duplicates / conflicts | Action |
|---|---|---|---|---|---|---|---|---|---|
| **Business Understanding FactRecords**. `companion-business-profile-v1` → `estate.understanding.facts` | Claire's canonical writer (`canonicalWriteTransaction`, G-0.2) | CONFIRMED → CURRENT; HYPOTHESIS / NEEDS-REVIEW → TENTATIVE; superseded → HISTORICAL | Situation façade (BU collector); Board, Chamber, Create, Strategy and Research contexts; LMC; Claire | ✅ current, history and reason (OB-6) | ✅ current only | ✅ KNOW answer and labelled gate block | ✅ `supersedesId` / `supersededById` / `validFrom` / `validTo` / `changeReason` — **now passed through** (were dropped) | Legacy mirror (row 3); relationship memory; estate-memory profile slice | **KEEP (canonical)** — connected |
| **BU offers** (`understanding.offers`) | Same | CURRENT; `lifecycle: retired` → HISTORICAL | Same | ✅; retired offers **excluded from current** (OB-6) | ✅ | ✅ | ◐ lifecycle only. **Offers are updated in place**, so the earlier offer text is not kept | — | **DEFER**: offer history needs the writer to supersede, not overwrite |
| **Offer ↔ person edges** (value proposition, economics) | Same | CURRENT | Same | ✅ | ✅ | ✅ | ✅ temporal fields; current-only read | `edge.economics` prose (e.g. "$149 per seat") can disagree with the structured price fact | **CONVERGE** (later): derive economics text from the price fact |
| **BU provenance log** (`understanding.provenanceLog`) | Canonical writer | HISTORICAL audit trail | Tests only (`getBusinessUnderstandingProvenanceLog`) | ✖ | ✖ | ✖ | Full log with reasons | — | **KEEP**. The reason KNOW needs is on the fact itself (`changeReason`), so the log is not needed for "why" |
| **Legacy flat business profile** (same key, top-level `role / sells / goals / tone / idealClient`) → `businessContextSummary()` | Legacy (declared a derived mirror) | Status-less prose | **Main-chat `businessContext` on every turn**; Templates, Snippets, `contentAudience` | ◐ Sent to the model **unlabelled**. KNOW never answers from it | ✖ | ◐ Unlabelled | ✖ None | **Conflicts with BU.** Written directly by `phase1Onboarding`, `companionDiscovery` and `contentAudience`, bypassing the envelope | **CONVERGE** (next): derive the chat business block from BU, or label it background. The OB-6 gate now states that labelled current truth wins |
| **Ideal client avatars**. `companion-ideal-clients-v1` | Avatar Builder (Claire reads and writes the same store) | CURRENT (member-entered) | BU persons; Claire; `businessContextSummary` | ✅ ("What do we know about my ideal client?") | ✅ as persons | ✅ | ◐ Current only; no version history. A retired person is excluded | Also in legacy prose | **KEEP** — connected |
| **Living Model Canvas**, a projection over BU (`projectLivingModelCanvas`) with no store of its own | LMC (Claire's surface) | Per item: CONFIRMED → CURRENT, others TENTATIVE | LMC UI; Board LMC overlay | ✅ ("What does my business model say?"; KNOW projects it from the same BU snapshot, OB-6) | ◐ Board overlay | ✅ | ✅ `describeLmcItem` history now receives the real `changeReason` | None (pure projection) | **KEEP** — connected |
| **Decision Ledger**. `companion-decision-ledger-v1` | Ledger (origin-gated: only member-authored entries are decisions) | CURRENT decision; superseded → HISTORICAL; non-member origin → RESEARCH / ASSUMPTION | Façade (project-scoped, certified Board, **and now any member decision** when scoped); `decisionLedgerHint`; cognitive return; Board authority | ✅ | ✅ Board ledger | ✅ | ✅ `supersedes` / `supersededBy`; ✖ **no reason field** | — | **KEEP.** Reason is **MISSING** (see report §15-E) |
| **Projects**. `companion-projects-v1` + items | Projects / Project Homes | CURRENT work; next step PLANNED | Façade (**active project only**); `projectContextHint`; Project Homes; OB-5 next step | ◐ Active or named project only | ◐ | ✅ OB-5 next step | ✖ | `recent-work` / `last-activity` keys | **CONNECT** (next): a scoped read of named non-active projects |
| **Active Work context**. `spark:active-work-context:v1` | Continuity | MEMORY / context (current + suspended) | Façade; `activeWorkContextLine` | ✅ | ✅ | ✅ | Suspended list | — | **KEEP** |
| **Rhythms / reminders / attention holds / day state** | Remember owner / Plan My Day | CURRENT schedule; PLANNED | `dailyContextHint` (model); OB-4 receipts | ◐ Receipts and "that Rhythm" only; not in the façade | ✖ | ◐ Through `dailyContextHint` | Rhythm history store exists | Attention-obligation cadence duplicates the Rhythm cadence (OB-5) | **CONNECT** (later): façade collector for "what do I have every Monday?" |
| **Create / Current Focus**. `spark.runtimeCreationRecords.v1` **(Supabase `companion_creation_workspaces`)** | Create | CURRENT draft / work | Create hints; `createAuthorizedContext` | ◐ Through Create's own hints | ✅ Create | ✅ in Create | Durable | — | **KEEP** |

## 2. Owner results (the five formerly partial returns, plus Board and Research)

| Source / store | Owner | Truth type | Runtime consumers | One Brain | Specialists | Return | Current / history | Duplicates / conflicts | Action |
|---|---|---|---|---|---|---|---|---|---|
| **Events records**. `companion-events-intelligence-v1` (active id in session) | Events Intelligence | PLANNED / work state; `runtimeState: CANCELED` → HISTORICAL | Events UI; Projects bridge | ✅ ("What event am I working on?", OB-6 façade collector) | ✅ Through the façade, on word overlap | ✅ | Runtime state and lifecycle phase | `eventsIntelligenceHintForChat` is an orphan; the Q&A transcript is a separate store | **KEEP** — connected. **CONVERGE** the orphan hint later |
| **Strategy work items**. `spark:strategy-work-items:v1` | Strategy Chamber | Exploring → TENTATIVE; chosen and confirmed → CURRENT | StrategiesPanel; `strategyAuthorizedContext` | ✅ ("What strategy did we settle on?", read through the Chamber's own store, OB-6) | ◐ Strategy only | ✅ | Status and version | The façade's boundary forbids importing the Chamber, so KNOW reads it directly | **KEEP** — connected |
| **Strategic memory**. `spark:strategy-decision-memory:v1` | Strategy Chamber | Decided (`userConfirmed`) → CURRENT, else TENTATIVE | Strategy UI | ✅ (fallback) | ✖ | ✅ | Revisions | — | **KEEP** |
| **Strategy conclusion**. Outcome thread `companion-outcome-thread-v1` | Strategy continuity | SPECIALIST (the Chamber's advice) | `strategyContinuityHintForChat` | ✅ (fallback, labelled advice) | ✖ | ✅ | — | — | **KEEP** |
| **Visual focus maps**. `companion-visual-focus-maps-v1` | Visual Thinking Studio | MEMORY (working material); archived → HISTORICAL | VTS UI | ✅ ("What did we map out?", OB-6 façade collector) | ✅ Through the façade, on word overlap | ✅ | Lifecycle status | — | **KEEP** — connected, and now **receives the conversation** |
| **Board discussions**. `spark.board.director-discussions.v1` | Board | SPECIALIST (the Board's view); the member's settled decision → CURRENT | Façade (handoff items, plus the Board view when scoped); OB-5 return | ✅ ("What did the Board say?", labelled advice, not a decision) | The Board itself | ✅ | Synthesis generations | Legacy `companion-board-discussions-v1` | **KEEP**; **DEFER** retiring the legacy store |
| **Research library collections** | Research Library | RESEARCH: sourced / interpretation / member-provided, with freshness | Façade research collector; research return | ✅ ("What did Research find?", labelled by its own evidence basis) | ✅ | ✅ | Retrieval and publication dates | — | **KEEP** |
| **Research observations** | Research | RESEARCH (raw) | Research internals only | ✖ By design ("Decision Ledger must not reference") | ✖ | ✖ | Capped at 80 and evictable | — | **KEEP** |
| **Evidence Bank**. `companion-evidence-bank-v1` (Supabase vault flag OFF) | Evidence Vault | MEMORY / evidence | Façade (max 1, on word overlap) | ◐ | ◐ | ◐ | — | — | **KEEP**. **DEFER** semantic recall (§5) |

## 3. Conversation and continuity

| Source | Owner | Truth type | One Brain | Return | Duplicates | Action |
|---|---|---|---|---|---|---|
| Conversation spine. `companion-conversation-session-v1`: receipt, pending reply, stage | One Brain (OB-3 / OB-4) | MEMORY. The receipt is "what Spark just did" | ✅ (binding, correction) | ✅ | The transcript is stored twice (`companion-conversation-v1` and the spine) | **KEEP**; **DEFER** transcript de-duplication |
| Active topic (sessionStorage) | Stabilization gate | MEMORY | ◐ Fed by the model, so empty without it | ◐ | — | **KEEP** |
| Relationship memory, plus phase-1 onboarding and phase-2 discovery | Relationship engine | MEMORY (learning about the member) | ◐ Prose inside `businessContext` | ◐ | A second copy of business type and goal | **DEFER** |
| Estate memory (sessionStorage) | Estate | MEMORY | ◐ `estateMemoryHint` | ◐ | A third copy of business identity | **DEFER** |

## 4. Estate self-knowledge and specialists

| Source | Owner | One Brain | What One Brain can now answer | Duplicates | Action |
|---|---|---|---|---|---|
| Canon live rooms (`getCanonLiveRooms`) | Canon knowledge base | ✅ | "Where does my business model live?" | Deprecated `estateRoomRegistry` | **KEEP** |
| Capability projection and adapter table (`lib/oneBrainCapability`) | OB-5 read path over existing registries | ✅ | "What can you help me with?", "What can't you do yet?", "What does X do?" | — | **KEEP** |
| Executable availability map (`memberIntent/executableRequest`) | Remember owner | ✅ Read-only accessor (OB-6) | "Can you update my calendar?" gets an honest "not yet" | — | **KEEP** |
| Board Directors: `DIRECTOR_IDENTITIES` (seven live) + the topic selector (`detectMaterialSignals` → `inferMaterialDimensions` → `DOMAIN_TO_DIRECTOR`) | Board | ✅ | "Who on my Board knows about pricing?" → Sofia Ramirez, with her own "bring her when…" line. **Also added to the model's self-knowledge** | Legacy twelve; advisory 18; founder 7; workspace 4; `AdvisorType` 8; Estate experts 15 | **KEEP**; **CONVERGE** the rosters later (no shared advisor registry) |
| Chamber of Momentum: `CHAMBER_MEMBERS` + `resolveExpertiseCategory` | Chamber | ✅ | "…and in the Chamber: Finance Intelligence" | `chamberExpertRegistry` (flag-gated) | **KEEP** |
| Strategy types (`STRATEGY_TYPES`, `matchStrategyTypesFromText`) | Strategy Chamber | ✅ | "The Strategy Chamber can work through it as Pricing Strategy" | — | **KEEP** |
| Specialist prompts and configs: Board first-pass reasoning protocols and synthesis (inline TS); Chamber member prompt; Claire system prompt; founder advisor prompt | Owners | ✖ Content is not retrievable; "who knows what" is | — | Chamber knowledge packs are **document paths only** (not read at runtime); `collaborationProfiles` escalation is metadata only | **KEEP** (§15-C) |
| GPT / persona configuration files | — | — | None exist (all prompts are inline TS). The Momentum Institute curriculum is the only runtime-read `.md` | — | — |

## 5. Sample / demo

| Source | Owner | Truth type | One Brain | Action |
|---|---|---|---|---|
| `bp2bWriteSeed` (test / founder-proof only) and `demoSeed` (no production caller) | Founder proof, tests | SAMPLE | ✖ **Cannot be told apart at read time.** Both write CONFIRMED facts into the member's store, and there is no per-fact sample flag. Isolation is enforced only by an importer allowlist in tests | **MISSING**: a per-fact sample marker (§15-E). Members cannot reach either seed today |

---

## Truth precedence (deterministic, applied by One Brain; never decided by the model)

1. **Time outranks status.** A superseded or retired version is never answered as current, whatever its status was.
2. For "what is true now": **CURRENT (member-confirmed fact / member decision) > PLANNED > MEMORY > RESEARCH > SPECIALIST (Board / Chamber view) > TENTATIVE > UNKNOWN**. HISTORICAL and SAMPLE never answer "now".
3. The history lens shows earlier versions **marked "no longer current"**, together with what replaced them (their own supersession chain).
4. A reason is given **only if one was recorded** (the member's own words at the time); otherwise Spark says there is none and asks.
5. Research, the Board's view and tentative strategy are always labelled as such. They are never merged into member truth.
6. The chat model receives the same labels, plus the fixed precedence rule, in the gated context block.
