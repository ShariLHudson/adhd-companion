# Spark Estate: Global Companion Architecture
## Reconciling the proposed architecture with the existing code

**This is an audit only.** Nothing in the codebase was implemented, refactored, merged or deployed. No schemas or member-facing UI were touched.

| | |
|---|---|
| **Repository audited** | `ShariLHudson/adhd-business-companion-vs3`. The attached repo, `adhd-companion`, contains only Fable 01. |
| **Branch** | `main`, which is production per `VERCEL.md`. HEAD `7e2efec6` (2026-09-23). |
| **Branch-only work** | Fetched read-only and compared file by file (see §0). |
| **Method** | Six parallel read-only tracers covered: runtime and turn ownership; memory and continuity; execution, pending and reminders; domain authorities; unmerged branches; and a duplication sweep. Their key claims were spot-checked against the code by hand. |
| **What "wired" means** | The module is imported on the production path from `app/**`. |
| **Limits** | No code was executed. The case traces follow the regexes and the order of the code. Places where live behavior needs confirming are marked **(needs runtime confirmation)**. |

> **Shorthand used below**
> - `CPC` = `app/companion/CompanionPageClient.tsx`
> - `LS` = `localStorage`
> - `SS` = `sessionStorage`

---

## 0. First finding: much of the "existing global work" is not in production

The research brief treats several systems as already established. On `main`, they are not.

| Concept the research assumed exists | Where it actually is | On `main`? | What it is |
|---|---|---|---|
| **Runtime Intelligence Contract V1** (`lib/runtimeIntelligenceContract/v1.ts`, `docs/product/RUNTIME_INTELLIGENCE_CONTRACT_V1.md`) | `cursor/atomic-0a-p0-05-production-enforcement-39cc` and `cursor/atomic-2-proven-capability-registry-39cc` (2026-09-15) | **No** | A manifest plus tests. It fixes the order of the turn: session → continuity → active work → kernel → `frictionlessActionLayer` → **`routeEstateIntelligence` as the sole owner of place/capability** → specialist → `companion-chat` delivery (which "does not route"). |
| **Production routing-ownership enforcement** (Atomic 0A) | same branches | **No** | `main` still wraps the routing self-check in `NODE_ENV !== "production"`, so it never runs in production (`routeEstateIntelligence.ts` ~437). |
| **Proven Capability Registry V1** (`lib/provenCapabilityRegistry/*`) | `cursor/atomic-2-proven-capability-registry-39cc` | **No** | 45 records across 6 proof tiers (21 `proven_live`, 8 `proven_partial`, 8 `wired_routing_only`, 3 `documented_only`, 3 `placeholder`, 2 `contradicted`), plus `isRuntimeInvocable()`. **Nothing calls it at runtime, even on its own branch.** |
| **Executable Intent round 1** (`lib/memberIntent/executableRequest.ts`, `capabilityObject.ts`) | `executable-intent/round-1-remember-precedence` (2026-09-25; **based on current `main`**) | **No** | Real runtime code. It handles `act`/`talk_about`/`none` stance, ordered `actions[]`, "every part executed or named as not done", confirm → execute with a 3-turn / 10-minute expiry, and a read-back check after each write. Scope: rhythm and reminder only. |
| **BU canonical write contract and transaction** (G-1.1 through G-1.4a) | `atomic/g1-4-canonical-authority-closure` (2026-09-24; fresh base) | **No** | Real runtime code. One confirmation authorizes N intents; writes are idempotent; the `committed \| nothing_written \| partially_written` result is honest; the write gate is split into gated and ungated entries. |
| **Claire "person before process"** (C-5, C-5.1–5.4, `claireSharedContext.ts`) | `atomic/claire-c5-person-before-process` (contained in g1-4) | **No** | The route now returns `memberReflection`/`memberQuestion` (on `main` they are dropped); the roadmap no longer overrides the model's question; Claire reads the Conversation Gate's context read-only. |
| **Explicit "Research this" runs sourced research** (3D-1) and **Research → Claire return** (3D-3) | `atomic-3d1…`, `atomic-3d3…` (2026-09-16; about 10 days stale) | **No** | Real code. `main` has **three separate** explicit-research detectors (`conversationGate/conversationalTurnContract.ts:114`, `businessProfileFounder/claireResearchRequestRouting.ts:8`, `shariAnswerFirst/questionVersusAction.ts:133`). |
| **Cross-Estate inquiry handoffs** (3C-3) | `atomic-3c3…` | **No** | On `main`, `stageConversationResearch` has **no production callers**. 3C-1 and 3C-2 (`resolveActiveInquiry`, `researchInquiryId`) *did* land. |
| **Main-conversation continuity** (pending-question ownership, parked topics, durable transcript into model context, answer-before-detour) | `claude/main-conversation-continuity` (2026-09-04; **about 3 weeks stale**; its `CPC` differs from `main` by about 3,086 lines) | **No** | Real code plus about 17 tests. It would have to be re-applied by hand rather than merged. |
| **Board no-advice contract** | `atomic/board-bc-6-no-advice-contract` | **No** | — |
| **ADHD specialized agent** (Intervention Engine, Memory Data Contract, Daily/Return Lifecycle, Proactive gating) | `cursor/shari-adhd-specialized-agent-e985` (2026-08-14; separate old history) | **No** | Docs plus `lib/shariAdhdAgent/*`. Only the docs can be salvaged. |

**Merged into `main`:**
- Conversation Gate (`lib/conversationGate/`, atomic-4)
- Turn Contract reconcile (atomic-7-p1)
- Continuity Read Model (`lib/workContinuity/`, atomic-7a), which is **merged but unwired**
- Research consumption (6b3a)
- Conversation Continuity Tier 1
- Timer notification preference
- LMC-1b
- Strategy Chamber action routing and continuity, in substance
- `PHASE_7_RUNTIME_DIFFERENTIATED_MINDS.md`

> **Implication:** the smallest "global foundation" starts by **landing or retiring about six existing branches**. That comes before anything new is designed. §12–13 are built on this.

---

## 1. Executive summary

### What already exists (more than the research assumed)

- **One conversation surface with one LLM route for main chat.** `app/api/companion-chat/route.ts` sits behind a single send function, `handleSend` in `CPC` (lines 16542–25284). Chamber, Strategy, Momentum, Avatar coach and the hospitality rooms all run through this same route. This is "one Spark outside" at the surface level.
- **A shared, authorized context-read seam** that most rooms already use:
  - `retrieveRelevantSituation` → `gateRelevantSituationForConversation` (Conversation Gate) → `consumeAuthorizedSituation`, with per-role policies for board, chamber, create, research and strategy.
  - This is the real seed of a Member Operating Context. It does not need to be built.
- **A conversation spine plus an ownership precedence model.** `lib/conversationSession` holds the spine; ownership precedence is in `ownership/OWNERSHIP_INVENTORY.md`.
- **A conversation Boundary** (`conversationBoundary.ts` via `conversationBoundaryInputs.ts`) that decides answer-pending, interrupt, switch and return-to-suspended.
- **Active Work Context** (`lib/activeWorkContext`) with establish, suspend and resume.
- **Canonical stores for several domains:**
  - Business Understanding (`businessEstateProfile.mutateBusinessUnderstandingStore` + `readProvider`)
  - Decision Ledger (`decisionLedger.recordDecision`)
  - Evidence Bank (`evidenceBankStore`)
  - Research Library (`researchLibrary/persistence`)
  - Events (`eventRecordStore`)
  - Projects (`companionProjectsStore`)
  - Plan My Day (`planMyDay/planDayItems`)
  - Reminders (`reminderStore`)
  - Rhythms (`rhythms/*`)
- **An execution foundation** (`lib/executionFoundation`) with idempotency keys, a readiness and duplicate gate, a run store, and a verify step. **Only the Board uses it.**
- **A notification load manager** (`rhythms/loadManager.ts`) with quiet hours, a daily cap, level settings and dedupe. **It covers reminders and rhythms only.**
- **Observable-only pattern infrastructure:**
  - `planMyDay/planBehaviorLearning` (defer and snooze events)
  - `recoveryAttention/evidence` (3 defers in 7 days)
  - `rhythms/patternObservation`
  - `patternAwareness` saved patterns, which the member can pause and delete
- **Server durability exists but is narrow.** Supabase `companion_creation_workspaces` and `companion_member_records` (saved_spark on; saved_work, evidence_vault and work_body behind flags that are off), both scoped with RLS by `user_id`.

### What is actually missing (with repo evidence)

1. **No continuity across sessions for the conversation itself.**
   - The transcript is kept in the browser only and is never reloaded into main chat (`CPC:3898`).
   - The first opening of each calendar day **deliberately deletes** the transcript, the Estate digest, open loops and the "last activity" cue (`CPC:4453-4460` → `resetActiveConversation`).
   - The Estate Memory digest is kept in `sessionStorage`, so it is lost when the tab closes.
2. **No execution from chat for tasks, plan items or project items.** Main chat can write a reminder, a rhythm (after confirming) and an attention hold. It **cannot** add to Plan My Day or to a project, and it has no compound (multi-part) execution.
3. **No reference resolution for named past work.** Nothing resolves "my proposal", "that idea" or "the Spark project" to a stored object.
4. **No single turn owner.** Three modules each call themselves "authoritative". The actual winner is whichever of about 175 early `return`s in `handleSend` fires first.
5. **No global attention governance.** Quiet hours cover rhythms only. Time-block alerts, arrival, recovery, cards, celebrations and 13 proactive "intelligence" engines each have their own rules. Reminders fire only while a tab is open: there is no service worker, push or cron.
6. **No cross-device continuity** except Create workspaces and saved sparks. General `localStorage` keys are not namespaced by user, so **a second account on the same browser inherits the first account's memory.**
7. **No global No-Advice guard.** It exists only in `decision-analyze` and the Board, and several prompts contradict it (`project-brain`, Strategy "One recommended next step", `certifiedConversation` advisory mode).
8. **Guardrails against psychological inference are unwired, and inference is actively prompted.**
   - `companionPrompt.ts:83` tells the model to "Assume friction … executive dysfunction" and to ask "What might the real problem be?"
   - Pattern modules label members from text regexes: perfectionism, avoidance, shame and impostor loops.
   - `ecosystem/clinicalLanguageGuard.ts` has **no production importer**.

### The core diagnosis

Spark does not lack systems. It has **too many partial ones, and they are wired in the wrong place.**
- Routing, ownership, context assembly and persistence all live in one 31,810-line React component.
- The server is a stateless prompt concatenator that receives about 30 free-text "hint" fields.
- Every behavior that should be global (pending/yes, resume, recents, preferences, proactive offers, greetings, celebrations, reference resolution) has **somewhere between 6 and about 20 independent implementations.**

---

## 2. Global capability matrix

Legend: **E** = exists · **P** = partial · **D** = duplicated · **M** = missing · **WL** = wrong layer · **L** = legacy/conflicting.

| # | Responsibility | Verdict | Evidence (key files) |
|---|---|---|---|
| **1** | **Member operating context** ("what's happening now") | **P, D, WL** | <ul><li>**Seed that exists:** `relevantSituation/retrieveRelevantSituation.ts` → `conversationGate/gateRelevantSituationForConversation.ts:229` → `authorizedEstateConsumption/consumeAuthorizedSituation.ts`. Also `activeWorkContext/*` (`spark:active-work-context:v1`), `conversationContinuity/ownerStore.ts` (SS), `conversationStabilization/activeTopicStore.ts` (SS), `dailyContextEngine`.</li><li>**Wrong layer:** assembled on the client as about 30 prompt strings (`route.ts:211-300`; `CPC:23721-24230`).</li><li>**Duplicated:** four "what am I working on" stores: Active Work, Active Workspace Registry, Continuity Manifest, LastActivity/RecentWork.</li><li>**Gaps:** Plan My Day items and current focus are **not** in the chat prompt. `retrieveRelevantSituation` runs twice per turn.</li></ul> |
| **2** | **Continuity** ("what happened before") | **P, D, L** | <ul><li>**Wired:** `companionLedContinue.ts`, `continuityManifest.ts` (header says "on this device"), `welcomeHome/resolveWelcomeActiveWork.ts`, `arrivalIntelligence/*`, `estateMemory/*` (SS), `activeWorkContext`.</li><li>**Unwired:** `workContinuity/composeWorkContinuity.ts` (the merged atomic-7a read model), `cognitiveReturn/*`, `postLoginContinue.ts`, `creationContinuity/welcomeBackBridge.ts`, `board/delivery/resumeCoherence/*`.</li><li>**Conflicting:** the New Day reset (`resetActiveConversation.ts:113-180`) contradicts "Continue where you left off".</li><li>**Duplicated:** about 9 regex detectors for "continue / left off" that disagree with each other.</li></ul> |
| **3** | **Working-memory support** (ideas, concerns, pending choices, loops) | **P, D** | <ul><li>Clear My Mind / brain dump (`brainDump*`, `thinkingSpace`)</li><li>`attentionObligation` ("hold this until Friday"), **wired**</li><li>Estate "open loops": these are **emotion labels**, not unfinished work (`estateMemoryContinuity.ts:136-146`)</li><li>`thinkingSpace/thoughtOperations.ts:56` `reminderAt`: **never fires**</li><li>Clear My Mind's "Saved as a reminder" creates no reminder (`brainDumpRouting.ts:131-143`)</li></ul> |
| **4** | **Typed memory** | **P, D, WL** | <ul><li>**Facts:** `companion-prefs-v1`, `companion-phase1-onboarding-v1`, `companion-discovery-v2` (+ legacy v1), Supabase `user_metadata` (welcome, language).</li><li>**Business:** `companion-business-profile-v1`, **declared three times** (`companionStore.ts:1252`, `profile/businessEstateProfile.ts:212`, `profile/businessEstateResearch.ts:346`).</li><li>**Episodic:** three transcripts (`companion-conversation-v1`, spine `companion-conversation-session-v1`, SS digest).</li><li>**Preferences:** 31 modules and about 45 keys.</li><li>**Patterns:** `phase2ProgressiveDiscovery`, `patternAwareness`, `planBehaviorLearning`.</li><li>**Commitments:** `decisionLedger`, `attentionObligation`.</li><li>**Permissions:** `estate.approved:*`.</li><li>**Intervention outcomes:** `companionInterventionLearning.ts:86-87`, `closedLoopLearning.ts`.</li><li>**Dead:** `companionMemory.ts`, `sparkCompanionMemory` (types only).</li><li>**Not member memory** (Founder Studio samples): `institutionalMemory`, `executiveMemoryTheater`, `intelligenceGraph`, `lib/spark`.</li></ul> |
| **5** | **Companion / intervention policy** | **P, D, WL, L** | <ul><li>**Answer-first:** `shariAnswerFirst/*` (`decideShariResponse`, `turnAuthority`, `cognitivePipeline`) is the most complete, with about 11 parallel "answer first" gates.</li><li>**Proactive:** 13 proactive engine/store pairs, arbitrated by hand-written boolean chains (`CPC:20608-20770`).</li><li>**Policy:** `interventionPolicy.ts` (hard-coded flags), `companionGovernor` + `companionTurnArbiter`.</li><li>**Specs not on `main`:** Intervention Engine and Proactive gating exist only on the old ADHD-agent branch.</li></ul> |
| **6** | **Executable intent** | **P, M, WL** | <ul><li>All client-side regex; the LLM route has **no tools** or structured output.</li><li>Writes from chat: reminder (no confirmation, no dedupe), rhythm (confirmation), attention hold.</li><li>**Missing:** task, plan item, project item, compound request, reference resolution, idempotency (except the Board).</li><li>`strategyChamberActionRouting.resolveStrategyChamberAction` (add-to-plan / make-project) has **no callers**. `universalWorkEngine` launchers are test-only except `launchFromCreate`.</li><li>The Round 1 fix exists only on a branch.</li></ul> |
| **7** | **Follow-through** | **P, D** | <ul><li>Board decision → commitment → project, with verification (`executionFoundation`, Board only).</li><li>`decisionLedger`, `companionOutcomeThread` (reused by Strategy), `workThreadOutcomeReturn`.</li><li>**Missing:** no general "what was done / what remains" receipt after a turn. `sparkCertaintyBeforeCompletion/` is types only.</li></ul> |
| **8** | **Pattern awareness** | **P, L** | <ul><li>**Observable, wired:** `planBehaviorLearning.ts:74`, `recoveryAttention/evidence.ts:36`, `rhythms/adaptive.ts:78`, `rhythms/patternObservation.ts`.</li><li>**Inferential (conflicts with the brief):** `activation/activationSignals.ts:93`, `momentum-intelligence/momentumSignals.ts:208`, `recovery-intelligence/recoverySignals.ts:112`, `memory/reflection/patternSignals.ts:19` (shown in the Memory Library), `loop-intelligence/types.ts:5`, `adhdMultiTurnPatterns.ts`, `companionPrompt.ts:83`.</li><li>`clinicalLanguageGuard.ts` is **unwired**.</li><li>`saveSparkSuggestedPattern` has **no callers**.</li><li>There is no learned time-of-day preference.</li></ul> |
| **9** | **Member control** | **P, D** | <ul><li>`SettingsPanel.tsx` (desktop notifications, time-block alerts).</li><li>`rhythms/prefs.ts` quiet hours, edited in `PlanMyDayRhythmsArea.tsx`. The Settings section only points there.</li><li>`SparkWorksWithMePanel.tsx`: pause and delete patterns.</li><li>`MemoryLibraryPage.tsx`: view and export only, **no delete**.</li><li>There is **no global proactivity or automation switch**; 30 files have per-engine "dismissed today" logic.</li></ul> |
| **10** | **Notification / attention governance** | **P, D, WL** | <ul><li>One foreground `setInterval` (`CPC:8344-8445`). Time blocks **bypass quiet hours**. Reminders and rhythms go through `rhythms/loadManager.ts:157-290`.</li><li>Arrival, recovery (48h suppression), celebrations (their own quiet flag) and cards each follow separate rules.</li><li>`reminderAlerts.collectDueReminderAlerts` is **dead**.</li><li>There is no service worker, push or cron, so **nothing fires while the tab is closed**.</li></ul> |

---

## 3. Current runtime map (as it runs today)

```
Member types in main chat
  │  ChatInputBar / WelcomeHomeFrostedChatPanel (render only)
  ▼
CPC.handleSend (CompanionPageClient.tsx:16542–25284, ~8,700 lines, ~175 early returns)
  │  ── ALL of this runs IN THE BROWSER ──
  ├─ 16573  resolveCreationTurnEnvelope                      (lib/createIntent)
  ├─ 16585  Boundary: resolveTurnBoundaryDecision            (conversationBoundaryInputs → conversationBoundary)  "sole ownership authority"
  ├─ 16612  spine append                                      (lib/conversationSession)
  ├─ 16634  runShariCognitivePipeline / decideConversationTurnAuthority (lib/shariAnswerFirst)  "authoritative"
  ├─ 16755  processActiveTopicOnUserTurn                     (conversationStabilization)
  ├─ 17062–17187  Business Estate / Board / Chamber invite consumption
  ├─ 17242  routeConversationTurn                            (conversationRouter)  "authoritative arbiter" → navigate & RETURN
  ├─ 17305  Active Work establish/reference (records only)
  ├─ 17398  Work Recognition (ON by default, though comment says OFF)
  ├─ 17747  classifyPrimaryConversationTurn (+ sparkCompanion decision engine)
  ├─ 17847  detectUniversalCapabilityRequest  → may OPEN a room & RETURN (e.g. "plan my day")
  ├─ 18120–18281  Create consent / reminder intake / pending choice
  ├─ 20132  estate kernel classifyCompanionIntent/executeCompanionIntent
  ├─ 20525  intentStabilizer.resolveIntent (legacy)
  ├─ 20559  companionGovernor → companionTurnArbiter
  ├─ 21183  resolveIntentRouting (also at 18452)
  ├─ 21221  evaluateEstateConversationTurn (estateIntelligence keyword registry)
  ├─ 21434  frictionlessActionLayer.resolveFrictionlessAction (5,592 lines; ~60 try* flows;
  │           inside: routeEstateIntelligence ← estateCapabilityRegistry + estateBrain/capabilityRegistry)
  ├─ 21755/21889  resolvePendingAcceptance
  ├─ 22128  artifact commands (add-to-project → opens Create picker only)
  ├─ 22604–22890  tool & workspace offers → local reply & RETURN (no LLM; ignores answer-first flags)
  └─ 23721–24230  build request body: ~60 *HintForChat blocks merged into intentHint,
                  businessContext, gatedSituationPromptBlock, activeWorkContextLine (referential turns only),
                  strategy/chamberAuthorizedPromptBlock, dayState, …
  ▼
POST /api/companion-chat (route.ts) — stateless, no auth, no user id, no tools
  │  buildCompanionSystemPrompt + appended hints → OpenAI gpt-4o-mini (stream by default)
  │  stream path: applyShariVoiceLayer only; enforceHumanConversation / enforceRelationshipResponse = non-stream only
  │  NOTE: systemPromptOverride (route.ts:139-168) lets a caller replace the whole system prompt
  ▼
Client post-processing
  finalizeMemberFacingAssistantText → certifyCompanionDelivery → processConversationTurn (CIE)
  (may REPLACE text the member already watched stream) → optional second "repair" call (~24590)
  ▼
Persistence (browser only)
  saveConversation (LS companion-conversation-v1) + spine dual-write (LS companion-conversation-session-v1)
  estateMemory digest (SS) · activeWorkContext (LS) · outcome thread (LS) · pending choice/menus (SS)
  ▼
Next turn / next visit: transcript NOT reloaded into main chat; New Day deletes it.
```

**Rooms that have their own model route (and therefore bypass the global conversation layers):**

| Room | Route | Notes |
|---|---|---|
| Claire | `/api/claire-reasoning` | own `SYSTEM_PROMPT`, no `humanConversation` |
| Research | `/api/research-live` | |
| Projects | `/api/project-brain` | "deciding what to do NOW" |
| Visual Thinking / Decision | `/api/decision-analyze` | |
| Create | `/api/generate`, `/refine`, `/create-draft-review`, `/remix`, `/email-generator` | |
| Talk It Out | `companion-chat` via `systemPromptOverride` | replaces the whole system prompt |
| Board V2 | `invokeStructuredLlm` called from a `"use client"` component (`BoardDirectorDiscussionIntake.tsx:234`) | uses a server-only key, so it **cannot work in production as written**. V1 is deterministic templates. |
| Plan My Day, Clear My Mind, Events, VTS | none | deterministic; no model call |

**Capability and agent registries consulted at runtime:**
- `estateCapabilityRegistry` and `estateBrain/capabilityRegistry` (via `routeEstateIntelligence`)
- `estateIntelligence/estateRegistry` + `registrations/rooms.ts` (keyword offers)
- `companionCapabilityRegistry` (prompt hints)
- `estate/estateRoomRegistry`

That is **four or five overlapping registries.** Test-only: `companionCpcConvergence/turnOwnership.ts`, `postKernelTurnRouting.ts`. There is **no agent registry** for main chat; `specializedIntelligence/registry.ts` (22 intelligences) supplies descriptive text only.

---

## 4. Memory / context map

Everything is per device and not synced unless the "Medium" column says otherwise.

| Kind | Source | Medium | In the main-chat prompt? | Overlap |
|---|---|---|---|---|
| Member facts | `companionStore` prefs; `phase1Onboarding`; `companionDiscovery` v2 (+ legacy v1); Supabase `user_metadata` | LS; Supabase (welcome, language only) | Yes (`userName`, tone, relationship profile, discovery) | Two relationship channels (`relationshipMemoryContextForChat` and `phase1RelationshipProfileForChat`) |
| Business facts | `businessEstateProfile` / BU `readProvider`; legacy `saveBusinessProfile` (`phase1Onboarding`, `companionDiscovery`) | LS `companion-business-profile-v1` | **Two paths:** legacy `businessContextSummary()` every turn, plus BU items through the Gate on token overlap | **Ambiguous authority.** Key declared three times. |
| Persons / avatars | `companion-ideal-clients-v1` | LS | Yes | Read by BU as well |
| Current work | `activeWorkContext`; `activeWorkspaceRegistry`; `continuityManifest`; `companion-last-activity-v1` / `recent-work-v1` (written by **two** modules) | LS | Active Work only on "referential" turns; the others feed the home UI only | Four stores |
| Create work | `creationDurable` | **Supabase `companion_creation_workspaces` (synced)** | Only while Create is open; otherwise "a saved Create draft exists" with no title | — |
| Episodes | transcript LS; spine LS; `estateMemory` digest **SS**; `companion-outcome-thread-v1` LS | LS/SS | Live transcript array; digest hint; outcome thread | Three transcripts |
| Preferences | 31 modules, about 45 keys; tone in about 9 places; audio in about 9; quiet hours in 3 | LS | Tone and support style yes | Heavy |
| Patterns | `phase2ProgressiveDiscovery`, `patternAwareness` (`spark:saved-patterns:v1`), `planBehaviorLearning`, `closedLoopLearning`, `rhythms/patternObservation` | LS | Phase-2 and saved patterns yes | Inferential and observable patterns are mixed together |
| Commitments | `decisionLedger` (`companion-decision-ledger-v1`); `attentionObligation`; Strategy decision memory (bypasses the ledger); `decision-intelligence`; three Board stores; legacy `boardroom-decision` / `compass-decision` | LS | Ledger yes | **Ambiguous authority** |
| Pending | about 16 stores (§7) | React state / SS / LS | A few, as hints | Heavy |
| Permissions | `estate.approved:*`, `approvalGate.ts`; BU `confirmationContract.outcomePermitsCanonicalWrite` | LS | Through the Gate | Spec 112 permission is "not fully wired" (branch-only contract) |
| Intervention outcomes | `companionInterventionLearning` user/ecosystem; `closedLoopLearning` | LS | Indirectly, through adaptive hints | — |
| Evidence / meaning | `evidenceBankStore` (`companion-evidence-bank-v1`); `durableRecords` evidence_vault (**flag off**) | LS (server path exists but is off) | Through the Gate | Reasonably clean |
| Plan My Day | `planMyDay/planDayItems` `companion-plan-my-day-items-v1:<userId>` (the **only** user-namespaced local key); `day-designer` store | LS | **No** | Two plan stores |
| Reminders / rhythms | `companion-reminders-v1` (not user-scoped); `rhythms/store` (two keys after migration) | LS | Through `dailyContext` | — |

---

## 5. Continuity map

| Question | What answers it today | Status |
|---|---|---|
| **"What were we doing?"** | `companionLedContinue.resolveCompanionContinue` (home Continue cue); `welcomeHome/resolveWelcomeActiveWork`; `arrivalIntelligence` (return state); `estateMemory` digest (**tab lifetime only**); `activeWorkContext` pointer | Works for home cards on the same device. **Not answerable in chat after a new day.** |
| **"What remains unfinished?"** | `continuityManifest` (11 local keys); `resumeWorkEligibility`; `workContinuity` / `cognitiveReturn` | The merged read models (`workContinuity`, `cognitiveReturn`) are **unwired**. "Open loops" are emotion labels. |
| **"What should happen next?"** | The active project's member-authored `nextAction` (`projectContext/projectContextHint.ts:78`); the Gate's `nextMeaningfulMove` (`retrieveRelevantSituation.ts:240`) | Only when Active Work is linked to a project. Otherwise nothing. |

---

## 6. Execution map

**Direct actions, as it works today:**

```
utterance → first matching client detector in handleSend
  ├─ reminder: reminderIntelligence.resolveReminderTurn → finalizeDraft → reminderStore.saveReminder (LS)
  │            no confirm, no dedupe, throws on persist failure, reply built from returned object (no read-back)
  ├─ rhythm:   frictionlessActionLayer → savePendingRememberCreate → "yes" → createRhythmFromContent (LS)
  ├─ hold:     buildAttentionHoldDecision → attentionObligation (LS)
  ├─ "add this to X project": savedArtifact.parseAddToProjectRequest → opens Create picker (no write)
  ├─ plan item / task: NO main-chat writer (addQuickPlanItem, saveTodayPlanItems, saveProjectItem never imported by CPC)
  └─ Board decision → project: executionFoundation (idempotency key, readinessGate duplicate check, run store, verifyProjectExecution) — Board UI only
```

**Compound actions:** not supported.
- `intentStabilizer.isMultiIntent` pushes multi-intent messages to chat-only (`conversationGating.ts:34,57`).
- Because the first detector wins, at most one domain acts per message.

**Date parsing:** there is no library. Three hand-written weekday resolvers disagree with each other (`reminderIntelligence.resolveRelativeDay`, `attentionObligation/conversation.ts:31`, `recoveryAttention/resolveRecoveryAction.ts:88`). The reminder parser doesn't recognize a bare "Friday" (`reminderIntelligence.ts:52-53`).

**Authorization:** `pendingAcceptanceAuthority` covers opens and Create consent only. None of its `PendingAcceptanceKind` values is a domain write. The BU write authorization that is canonical, idempotent and honest about partial writes is **branch-only** (G-1.4).

---

## 7. Duplication / piecemeal map (ranked)

1. **Intent classification and routing.**
   - About 98 classifier or router modules; at least 20 are wired in `handleSend`.
   - Three modules each call themselves "authoritative".
   - There are two different `resolveTurnPriority` functions.
   - `resolveIntentRouting` and `decideShariResponse` each run twice per turn, and `retrieveRelevantSituation` runs twice per turn.
   - There are four or five capability registries, each with its own keyword lists.
2. **Yes/no interpretation.**
   - 44 files have their own yes regex, 80 have their own decline literals, and there are about 20 `is*Affirmation` / `is*Acceptance` functions. `isActionAcceptance` is defined twice.
   - Only 12 files import the canonical `pendingAcceptanceAuthority.ts:29`.
   - Vocabularies conflict: "correct" and "right" versus "great" and "take me there".
   - Expiry conflicts: 2 turns, 3 turns, the session's lifetime, or no expiry at all.
   - `explicitCompanionActions` acts on a bare "yes" by regex-matching the assistant's text, which violates the acceptance authority's own rule.
3. **Resume / continue / recents.**
   - 162 resume/continue exporters.
   - At least six stores claim global authority: `companionStore` last-activity, `continuityManifest`, `activeWorkspaceRegistry`, `activeWorkContext`, `estateMemory`, `projectContinuityStore`.
   - Room-local resume exists in Chamber, Strategy (×4), Talk It Out, Events, Create (×3), VTS and Board. Four resume stacks are dead.
4. **Proactive offers and nudges.**
   - 13 parallel engine/store pairs: activation, loop, decision, relationship, opportunity, environment, future-shari, momentum, business-os, chief-of-staff, predictive-support, cognitive-load, recovery.
   - Also phase3–6 offer recorders, `autonomousPreparation`, `ecosystem/checkInEngine`, `interventionPolicy`, `conversationIntervention`, `companionGovernor` and `lib/governor`.
5. **Pending offer / question.** About 18 offer registries, about 10 pending-question trackers, and about 20 `*Offer` React states in `CPC`. The Boundary's `"scheduling"` pending kind is never produced.
6. **Arrival greetings and daily opening.** About 20 composers (`dailyOpening`, `welcomeHome`, `arrivalGreetingIntelligence`, `arrivalIntelligence`, `welcomePresenceIntelligence`, `greetingIntelligence`, `shariVoiceBible`, `homeWelcome`, `estateArrivalExperience`, `claireArrival`, …).
7. **Member preferences.** 31 modules and about 45 keys. Tone lives in about 9 places, audio in about 9, and quiet hours in 3. The desktop-notification permission is requested in two components.
8. **Wins and celebration.** 12 storage keys and about 14 engines; 4 celebration UI components are dead.
9. **Handoffs.** 85 exported `*Handoff*` types, each with its own transport and key. The two best designs, Board V2 `SharedHandoff` and the `creationWorkspace/destination` contract, are not used across rooms.
10. **Recovery.** Two acknowledged parallel systems (`recoveryAttention`, the canonical one, and `recovery-intelligence`, the legacy one), plus `previousDay`, `carryForward`, `autonomousPreparation` re-entry, `restartRecovery`, `talkItOut/reentry`, and the unwired `cognitiveReturn`.

**Close runners-up:**
- **Answer-first:** about 11 gates. Chamber, Claire, `shariAnswerFirst`, `humanConversation`, `certifiedConversation`, `conversationGate` and others each restate "person first".
- **Conversation summaries:** about 20 summarizers, each local to one room, and no global one.
- **Reference resolution:** about 7 separate resolvers.
- **Rescheduling:** separate snooze logic for plan items, reminders, rhythms, time blocks and ecosystem actions.

**Stale headers that mislead engineers:**
- `conversationBoundary.ts:2` says "UNWIRED", but it has 9 production importers.
- `conversationSuspension.ts` says "UNWIRED", but it has 3.
- `CPC:17359` says Work Recognition is "default OFF", but it is on.

---

## 8. The three case traces

These come from reading the regexes and the order of the code. None was run live.

### Case A: "I was working on my proposal yesterday. Where did I leave off?"

- **What context exists:**
  - On the first turn of a new day, the transcript holds only this message, because New Day wiped yesterday's.
  - `estateMemoryHintForChat` injects **"FRESH CONVERSATION THREAD … Do not continue prior chat topics, drafts, or unfinished workflows unless they bring them up again"** (`estateMemoryHint.ts:56-60`, verified). The member *did* bring it up, but there is nothing behind it.
  - Profile, business summary, relationship, patterns and ledger hints do get into the prompt.
- **What survived:**
  - In local storage: Active Work pointer, projects, ledger, and Create workspaces (also on the server if the member is signed in).
  - The Active Workspace Registry and Supabase creation rows hold the proposal's **title**, but only the Welcome Home card reads them.
- **Can Spark identify the work?** No.
  - `candidateWorkFromTurn` needs "I'm / I need to create…", so "I was" misses.
  - `isReferentialTurn` doesn't include "where did I…".
  - The Gate's sources exclude Create drafts, Saved Work, the registry and LastActivity (`retrieveRelevantSituation.ts:778-805`).
  - There is no resolver that looks up work by name or recency.
- **Continuity:**
  - "Where did I leave off" matches none of the roughly 9 continue detectors; they key on "left off / where was I / continue where".
  - The home Continue cue was cleared by New Day.
- **What fails:** Spark will most likely say it doesn't have that, invent details, or ask the member to reconstruct. On another device, even the Continue card is empty unless the proposal was a signed-in Create workspace.

### Case B: "Put this idea in the Spark project, remind me Friday to look at it, and add testing it with Kerry to Plan My Day tomorrow."

- **Turn owner:** `detectUniversalCapabilityRequest` (`CPC:17847`) matches the `plan-my-day` rule `/\b(?:plan my day|…)\b/i`. That rule is flagged `nounStrong`, so it needs no verb (verified at `detectUniversalCapabilityRequest.ts:136-139`).
- **Most likely outcome:** Spark opens the Plan My Day room ("Let's open Plan My Day."), and **nothing is written in any domain.** This holds unless a sticky owner such as an active Chamber is locking routing **(needs runtime confirmation)**.
- **Even if each part were reached on its own:**

  | Part | What would happen |
  |---|---|
  | **"Put this idea in the Spark project"** | Fails. `ADD_TO_PROJECT_RE` needs "add this/it to … project" and misses the verb "put". Even when it matches, it only opens the Create picker for the *current Create artifact*. There is no resolver for "this idea", and no chat path writes a project item. |
  | **"Remind me Friday to look at it"** | Wrong result. A bare "Friday" isn't parsed. In the compound sentence, "tomorrow" from the Plan My Day clause is picked up instead. The title becomes the whole sentence. The follow-up time question can save the reminder for **today**. There is no confirmation, no dedupe, and "it" stays literal. |
  | **"Add testing it with Kerry to Plan My Day tomorrow"** | Fails. There is no chat writer. `addQuickPlanItem` has no date parameter; future dates live in a separate deferred store. "Kerry" isn't resolved to a person. |

- **Compound intent:** not supported (see §6).
- **Missing-information behavior:** only reminders have slot filling. Nothing asks "which project?" or "what idea?".
- **Verification:** none across the parts, and no receipt of what was done and what wasn't.
- **The fix exists but covers only part of this:** Executable Intent round 1 (branch) gives honest compound handling for **reminder and rhythm only**. It names the other parts as "not done" rather than doing them.

### Case C: "I know what I need to do. I just can't get started."

- **Runtime:** main-chat `handleSend`.
- **Rules that fire:**
  1. **Answer-first** matches `can'?t get` as **troubleshooting** (`decideShariResponse.ts:97`, verified). That has one good effect and one bad one:
     - Good: `answerFirstPreferChat = true`, so the kernel is forced to chat and navigation is blocked.
     - Bad: it injects "list likely causes simplest-first, give concrete checks" (`chatHint.ts:46`, `professionalRoles.ts:140`). That is the wrong register for an activation moment.
  2. **Discovery:** `FOCUS_DISCOVERY_RE` matches, but the signal pre-answers the discovery question, so no question is posted.
  3. **Emotion and obstacle:** `detectEmotionalState` returns "stuck" and `detectObstacle` returns `activation_barrier`. The server adds an "EMOTIONAL READ … Likely obstacle" block.
  4. **Tool card:** a **Focus Session** card is likely (`companionToolSuggestions.ts:32`), with "acknowledge in 1–2 sentences".
  5. **High risk of a room offer instead of a reply:**
     - The Momentum Builder registration scores "can't get started" +16 (verified at `registrations/rooms.ts:86`), "get started" +10 and "stuck" +8, for about 34 against a "high" threshold of 18.
     - The workspace-offer block (`CPC:22786-22890`) posts a **local "Open Momentum" reply with no model call**.
     - That block's guard, `blockAutoWorkspace` (`CPC:20948`), depends on `shouldStayInConversation`/`multiIntent`, **not on the answer-first flags** (verified). This is the hole in "respond to the person before advancing the process" **(needs runtime confirmation)**.
- **Does Spark respond conversationally first?** Only if the governor suppresses the offer, or the member is not on Welcome Home / frosted chat. Person-before-process is enforced at the **prompt level** (`companionPrompt.ts:348` "PRESENCE BEFORE STRATEGY"), not structurally on this path.
- **What context the model gets:** the turn isn't "referential", so **Active Work is not injected**. **Today's Plan My Day items and current focus are never injected.** So "what I need to do" is unknown to Spark unless it appears in the recent transcript.
- **Can it offer execution help?** Yes, but only as a Focus or Momentum tool card or room. It cannot say "you were going to X — want to start with just the first two minutes of it?"
- **Brittleness:** most patterns use an ASCII `'?`, so a phone keyboard's curly `can’t` defeats most of them.

---

## 9. Return across time and devices

| Item | Leave the conversation (New Chat / open a workspace) | Move to another Estate area | Close the browser | Return the same day | Return days later | Different device |
|---|---|---|---|---|---|---|
| Conversation transcript | Cleared | Kept in memory; the digest carries it | LS copy survives but **is not reloaded** | Not reloaded; one-line cue only | **Deleted** by New Day | **None** |
| Estate digest / "open loops" | Cleared | Kept (SS) | **Lost** | Lost if the tab closed | Lost | None |
| Active work pointer | Suspended | Kept | Kept | Kept | Kept, **with no staleness check** | None |
| Selected entities / owner / topic / pending choice | Cleared | Mostly kept | Lost (SS) | Lost | Lost | None |
| Unfinished questions / pending offers | Lost (React state) | Lost | Lost | Lost | Lost | None |
| Plan My Day | Kept | Kept | Kept | Kept | Archived to deferred on New Day | None |
| Commitments (ledger) | Kept | Kept | Kept | Kept | Kept | None |
| Create workspaces | Kept | Kept | Kept | Kept | Kept | **Survive** (Supabase, if signed in) |
| Projects / Saved Work | Kept | Kept | Kept | Kept | Kept | None (the `saved_work` flag is off) |
| Navigation state | Refs only | — | Lost | Lost | Lost | None |
| Summaries (LastActivity) | Kept | Kept | Kept | Kept | **Cleared** by New Day | None |
| Reminders | Kept | Kept | Kept, but **do not fire while closed** | Missed ones fire on reopen | Missed ones fire on reopen | None |

**Shared-browser leak:** general LS keys are not namespaced by user. Only Create caches are cleared when the member switches (`creationDurable/authenticatedBootHydration.ts:87`).

---

## 10. Global gaps (evidence-backed only)

| Gap | Evidence |
|---|---|
| **G1.** The conversation transcript has no durable, user-scoped home, and the New Day policy deletes continuity. | `CPC:3898`, `CPC:4453-4460`, `resetActiveConversation.ts:113-180`, SS `estateMemoryStore.ts` |
| **G2.** No retrieval over the member's own work by name or recency in chat. The Gate excludes Create, Saved Work, the registry and LastActivity. | `retrieveRelevantSituation.ts:778-805` |
| **G3.** Turn ownership is decided by the order of the code, not by one arbiter. The branch-only runtime contract that would name one is not on `main`. | `handleSend`; three "authoritative" headers; §0 |
| **G4.** No executable path from chat for plan items and project items; no compound execution; no shared date or referent resolution. | §6, §8B |
| **G5.** No single pending and acceptance state. About 16 stores and about 20 yes-functions conflict. | §7.2, §7.5 |
| **G6.** No global attention governor. Quiet hours cover rhythms only; there is no background delivery. | `CPC:8344-8445`, `rhythms/loadManager.ts`, no service worker, push or cron |
| **G7.** Global guards are skipped on the default streaming path and on every room with its own model route (No-Advice, `humanConversation`, relationship enforcement). | `route.ts:439` vs `519-584`; `claire-reasoning`, `project-brain`, `research-live`, `decision-analyze` |
| **G8.** Psychological inference is prompted and stored; the clinical-language guard is unwired. | `companionPrompt.ts:83`; `patternSignals.ts:19`; `clinicalLanguageGuard.ts` has 0 importers |
| **G9.** Member memory control has no delete or forget, and no global proactivity switch. | `MemoryLibraryPage.tsx`; 30 "dismissed today" files |
| **G10.** Plan My Day and current focus are not in the chat context. | `dailyContextEngine/buildDailyContext.ts` |
| **G11.** Security and hygiene. `companion-chat` has no auth, and `systemPromptOverride` accepts any system prompt. Board V2 calls OpenAI from client code. | `route.ts:139-168`; `BoardDirectorDiscussionIntake.tsx:234` |

---

## 11. Reuse / extend / retire

| Existing system | Recommendation | Why |
|---|---|---|
| `relevantSituation` + `conversationGate` + `authorizedEstateConsumption` | **Wrap / globalize** | This is already the Member Operating Context seam. Add sources (Create/registry, LastActivity, Plan My Day today, current focus) and consumer roles (events, projects, VTS, claire). Do not build a Context Bus. |
| `conversationSession` spine + `ownership/*` | **Extend** | Make it the one transcript. Retire `companion-conversation-v1` as a parallel store. It is the natural thing to make durable, per G1. |
| `conversationBoundary` / `conversationBoundaryInputs` | **Extend** | It already models answer-pending, interrupt and return. Feed it the pending kinds it lacks, such as scheduling and remember-confirm. |
| `pendingAcceptanceAuthority` | **Wrap / globalize** | Canonical yes/no. Migrate the room copies to it. |
| `activeWorkContext` | **Reuse as-is**, then add a staleness rule | Its pointer, suspend and resume work. It lacks age handling. |
| `workContinuity` / `cognitiveReturn` | **Wire (reuse)** | Merged (atomic-7a) but unwired. This is the "what's unfinished / next" composer. |
| `companionLedContinue`, `continuityManifest`, `welcomeHome/resolveWelcomeActiveWork`, `arrivalIntelligence` | **Leave domain-specific (home)** for now, **migrate later** onto the composer above | They work for home cards. |
| `estateMemory` digest | **Migrate** | SS is the wrong medium for "one continuous conversation". Its "open loops" should become real unfinished items or be renamed. |
| `companionMemory.ts`, `postLoginContinue.ts`, `reminderAlerts.collectDueReminderAlerts`, `sparkCompanionMemory`, dead greeting/celebration components | **Retire** | Dead or unwired. They confuse the "what exists" question. |
| `frictionlessActionLayer` | **Extend** (short term), **migrate** (long term) | The branch contract names it the hub, and Executable Intent round 1 plugs into it. |
| `routeEstateIntelligence` + `estateCapabilityRegistry` + `estateBrain/capabilityRegistry` | **Extend.** Land the Proven Capability Registry as the invoke gate. | Consolidate four or five registries behind one proven catalog. |
| `estateIntelligence` keyword registry (room offers) | **Wrap** behind the answer-first check | This is the source of the Case C room-offer hijack. |
| `executionFoundation` | **Wrap / globalize** | Idempotency, readiness and verify already exist. Use them for chat writes, not only the Board. |
| `decisionLedger` | **Reuse as-is** (canonical commitments) | Route Strategy decision memory and `decision-intelligence` into it. |
| `reminderStore` / `rhythms` / `loadManager` | **Extend** | `loadManager` is the natural seed for global attention governance: route time blocks, arrival, recovery and celebrations through it. |
| `planMyDay/planDayItems` | **Reuse**; add a dated chat writer | It is the canonical plan store. |
| `companionProjectsStore` | **Reuse**; remove its duplicate LastActivity writes | Canonical for projects. |
| `durableRecords` + `creationDurable` | **Extend** | Server durability with RLS already exists; the domains are just flag-off. No new tables are needed for the first steps. |
| `shariAnswerFirst` | **Reuse as the answer-first authority** | Retire the parallel gates over time. Fix the troubleshooting misclassification. |
| `humanConversation` / `certifiedConversation` | **Extend** to the streaming path and room routes | Global guards must be global. |
| `lib/boardroom` (live), `lib/board` legacy, `lib/board/reconstructed` (V2, flag off) | **Leave domain-specific**; decide the Board's future, **retire** the loser | Three Board runtimes. |
| `chamberIntelligence` / `chamberExpertise` / `chamber/knowledge` | **Leave domain-specific**; consolidate | Three expertise systems. |
| Board V2 `SharedHandoff` / `creationWorkspace/destination` | **Wrap / globalize** as the one handoff envelope | Best existing designs; currently 85 handoff types. |
| `recoveryAttention` (canonical) vs `recovery-intelligence` (legacy, offers off) | **Retire later:** `recovery-intelligence` | Its own README calls them parallel. |
| `patternAwareness`, `planBehaviorLearning`, `rhythms/patternObservation`, `recoveryAttention/evidence` | **Reuse as the observable-pattern foundation** | These are behavior-based, not psychological. |
| Inferential pattern modules (`activationSignals`, `momentumSignals`, `recoverySignals`, `memory/reflection/patternSignals`, `loop-intelligence`) + `companionPrompt.ts:83` | **Retire later / rewrite** | They conflict with "no unsupported psychological inference". |
| `clinicalLanguageGuard.ts` | **Wire** | It exists and is unused. |
| **Branch:** Runtime Intelligence Contract + Proven Capability Registry | **Land** (low conflict) | Contract and tests only. |
| **Branch:** Atomic 0A production self-check | **Land** (medium conflict) | A small runtime change. |
| **Branch:** Executable Intent round 1 | **Land** (low conflict; based on current `main`) | Real, tested, has a kill switch. |
| **Branch:** G-1.4 / C-5 canonical write and Claire person-before-process | **Land** (low–medium) | Real, tested, fresh base. |
| **Branch:** 3C-3 / 3D-1 / 3D-3 research | **Rebase, then land** | About 10 days stale; removes 3 duplicate research detectors. |
| **Branch:** `claude/main-conversation-continuity` | **Re-implement on `main`** using its tests as the specification | About 3 weeks stale; `CPC` conflict. |
| **Branch:** shari-adhd-specialized-agent | **Salvage the docs only** (Intervention Engine, Memory Data Contract, Lifecycle) | Separate old history. |
| **Branches:** phase-7 runtime minds, strategy-chamber runtime | **Close** (already on `main` in substance) | Only the Strategy certification tests are worth porting. |

---

## 12. Minimum global foundation

The goal is ONE SPARK OUTSIDE, SPECIALIZED INTELLIGENCE UNDERNEATH, reached from what already exists. Each item below is a seam that already exists and is being extended. No new service, no Context Bus, no Memory Service, no Companion Agent, no Notification Engine.

1. **One turn contract, enforced.** Land the Runtime Intelligence Contract and Atomic 0A, and make the Boundary plus `routeEstateIntelligence` the named owners. Every terminal `return` in `handleSend` that sends a local reply or opens a room must check the answer-first decision first.
2. **One context seam.** The Conversation Gate becomes the only path from member state into the prompt. Add the missing sources: Create/registry titles, LastActivity, Plan My Day today, current focus, and the branch's `claireSharedContext` read. Retire `businessContextSummary()` in favor of the BU snapshot.
3. **One durable conversation.** Keep the spine as the single transcript. Store it through the existing `durableRecords` pattern (Supabase, RLS). Replace New Day *deletion* with New Day *suspension*: nothing is deleted, the thread is closed, and it can be resumed.
4. **One continuity composer.** Wire the already-merged `workContinuity` / `cognitiveReturn` so chat can answer "where did I leave off", fed by the Gate's sources.
5. **One pending/acceptance authority.** `pendingAcceptanceAuthority` plus Boundary pending kinds, including scheduling, remember and write-confirm. Rooms adopt it gradually.
6. **One execution path.** Land Executable Intent round 1, extend its `CapabilityObject` to `plan_item` and `project_item`, and put all chat writes through `executionFoundation` (idempotency, verify, honest receipt). Capabilities are gated by the Proven Capability Registry. BU writes go through the landed G-1.4 transaction.
7. **One attention governor.** `rhythms/loadManager` becomes the gate for every proactive surface: reminders, rhythms, time blocks, arrival, recovery, celebrations, and the 13 offer engines.
8. **Global guards everywhere.** Apply `humanConversation`, No-Advice and the clinical-language guard on the streaming path and on each room's model route, through one shared post-processor.

---

## 13. Proposed atomic sequence

Ordered by dependency. **Not implemented.** Each item is one atomic.

| # | Atomic | Existing seam changed | Reuses | Duplication eliminated | Proof required | Regression risk | Must NOT change |
|---|---|---|---|---|---|---|---|
| **A1** | **Truth reset: land the contract and registry** | Add `lib/runtimeIntelligenceContract`, `lib/provenCapabilityRegistry` from branch atomic-2; update stale headers (`conversationBoundary.ts:2`, `conversationSuspension.ts`, `CPC:17359`) | Branch code as-is | Removes the contradictory "authoritative" and "UNWIRED" claims | Governance tests green; every manifest path exists on `main` | Very low (no runtime change) | Any runtime behavior |
| **A2** | **Enforce routing ownership in production** (Atomic 0A) | Remove the `NODE_ENV` guard in `routeEstateIntelligence.ts` and `frictionlessActionLayer.ts` | `routingOwnershipContract` | — | `routingOwnership.production.test.ts`; production smoke test on the preview | Low–medium (self-check could throw) | Routing results |
| **A3** | **Answer-first closes every terminal path** | `CPC` workspace-offer block (22786–22890) and the other local-reply returns consult `answerFirstPreferChat` / `BlockImmediateOpen`; fix `decideShariResponse.ts:97` treating "can't get started" as troubleshooting; normalize curly apostrophes | `shariAnswerFirst` | Makes `shariAnswerFirst` the answer-first owner above about 11 parallel gates | Case C replay: the model responds first and any room is only offered; plus the existing answer-first suites | Medium (offer frequency drops) | Explicit navigation verbs ("open Momentum") |
| **A4** | **Executable Intent round 1** | Merge branch `executable-intent/round-1-remember-precedence` | `frictionlessActionLayer`, `reminderIntelligence`, `rhythms`, `remindersVsRhythms` pending | Reminder-vs-rhythm confirm asymmetry; misattributed "yes" | Branch tests plus `executableIntent.round1.test.ts`; kill switch verified | Low (fresh base) | Existing reminder intake UX |
| **A5** | **Canonical BU write + Claire person-before-process** | Merge `atomic/g1-4-canonical-authority-closure` | `p6WriteExecutor`, `confirmationContract`, `conversationGate` | `{okCount, failCount}` partial-success reporting; Claire's private context | Branch suites (`canonicalWriteTransaction`, C-5.x) | Low–medium | LMC projection contracts |
| **A6** | **Research unification** | Rebase 3C-3, 3D-1 and 3D-3 onto `main` | `researchLibrary`, `resolveActiveInquiry` | Three explicit-research detectors become one | 3D suites; Claire → Research → Claire round trip | Medium (stale base) | Research Library storage keys |
| **A7** | **Gate sources for continuity** | `retrieveRelevantSituation.ts:778-805` gains Create/registry titles, LastActivity and Plan My Day today (read-only); fix the `companionProjectsStore` duplicate LastActivity writer | Existing stores | Home-only knowledge becomes chat knowledge | Case A replay: the model receives "Proposal: <title>, last edited <date>" | Low–medium (prompt size; the gate already caps at 4) | Store schemas |
| **A8** | **Wire the continuity composer** | Import `workContinuity` / `cognitiveReturn` into the Gate and into the continue detectors; collapse the roughly 9 "left off" regexes into one predicate | Merged atomic-7a | About 9 continue detectors | "Where did I leave off / what was I doing / pick up" all resolve the same way | Medium | Home Continue card behavior |
| **A9** | **Durable, user-scoped spine** | `conversationSession` store persisted via the `durableRecords` pattern; namespace LS keys by user; clear on account switch | `durableRecords` repository, RLS | Three transcripts become one; fixes the shared-browser leak | Cross-device replay; account-switch test | Medium–high (data) | Supabase schema *(if a new domain row type needs a schema change, stop and ask; see Q1)* |
| **A10** | **New Day suspends instead of deleting** | `resetActiveConversation` archives the thread and keeps the continuity cue; `estateMemory` moves from SS to LS/durable | Spine, `conversationSuspension` | Removes the conflict between "Continue" and New Day | Case A next-day replay | Medium (a founder product decision; see Q2) | Daily opening card |
| **A11** | **Plan and project writers for chat** | Extend `CapabilityObject` with `plan_item` and `project_item`; route through `executionFoundation`; add a date parameter to `addQuickPlanItem` / deferred store; one shared date resolver replacing three | `executionFoundation`, `planDayItems`, `companionProjectsStore`, the A4 pending | Three weekday resolvers; Board-only idempotency | Case B replay: three actions, each executed or named, with a receipt read back from storage | Medium | Plan My Day UI flows |
| **A12** | **One acceptance authority** | Room yes-regexes migrate to `pendingAcceptanceAuthority`; `explicitCompanionActions` stops acting on assistant text alone | `pendingAcceptanceAuthority`, Boundary | About 20 yes-functions and about 16 pending stores (incrementally) | Yes/no conformance suite across rooms | Medium–high (broad) | Room-specific clarification semantics (Board) |
| **A13** | **Global attention governor** | `rhythms/loadManager.filterDeliverables` gates time blocks, arrival, recovery, celebrations and the offer engines; one "Spark may reach out" preference | `loadManager`, `rhythms/prefs` | Three quiet-hours implementations; 30 "dismissed today" copies (incrementally) | Quiet-hours test across all surfaces | Medium | Reminder delivery timing |
| **A14** | **Global guards on every model path** | One shared post-processor for the stream path and the room routes (`claire-reasoning`, `project-brain`, `research-live`, `decision-analyze`); wire `clinicalLanguageGuard`; remove the psychological-inference lines in `companionPrompt.ts:83` | `humanConversation`, `decision-analyze` recommendation filter, Board fidelity validator | Per-room No-Advice copies | No-advice and clinical-language suite on all routes | Medium (voice changes) | Room personas |
| **A15** | **Security hygiene** | Auth on `companion-chat`; restrict `systemPromptOverride` to server-known Talk It Out prompts; move Board V2 model calls server-side | Supabase auth, `internalAgent` | — | Unauthenticated request rejected; Talk It Out still works | Low–medium | Talk It Out behavior |

**Later (not part of the foundation):**
- Migrate the 13 proactive engines behind A13.
- Consolidate the 3 Board runtimes and the 3 Chamber expertise systems.
- One handoff envelope, starting from Board V2 `SharedHandoff`.
- Memory delete/forget UI.
- Retire the dead modules listed in §11.

---

## 14. Questions for the founder

These are product decisions the code cannot answer.

1. **Server-side conversation memory.** May Spark store the conversation transcript and continuity on the server, per member, so it survives closing the browser and switching devices? That is needed for Case A across days and devices, and it may need a new record type in the existing `companion_member_records` table. Your brief currently forbids schema changes.
2. **What "New Day" means.** Today a new calendar day *deletes* yesterday's conversation and the "continue" cue. Should a new day instead *close the thread quietly but keep it resumable*, with Spark raising it only if the member does?
3. **Confirmation for chat actions.** Reminders currently save immediately; rhythms ask first. For chat-created reminders, plan items and project items, which do you want: confirm every time, confirm only compound requests, or act and then show an undo receipt?
4. **Background delivery.** Should reminders reach the member when Spark isn't open (browser push, email or SMS)? Or is "in-app when open, plus catch-up on return" the intended ADHD-safe behavior?
5. **Psychological language.** Several modules and the core prompt tell Spark to infer things like "avoidance", "perfectionism", "executive dysfunction", "impostor loop". Should these be removed entirely and replaced with observable-only patterns such as "moved 3 times this week"?
6. **Proactive default.** Should there be one member-level setting ("Spark may reach out: never / gently / actively") that governs all 13 proactive engines, reminders, arrivals and celebrations? If so, what is the default for a new member?
7. **The Board's future.** Three Board runtimes exist: `boardroom` (live), legacy `board`, and V2 `reconstructed` (off, and unable to run as written). Which one is the Board?
8. **Order of landing branches.** Several of your own workstreams are finished on branches but not in production. Approve landing them in the §13 order (A1 → A6) before any new global work?
9. **Memory the member can see and delete.** Should members be able to view and delete what Spark remembers about them (facts, patterns, commitments) from one place? The Memory Library is currently view and export only.

---

*Prepared from read-only inspection of `adhd-business-companion-vs3@7e2efec6` plus fetched branch refs. No code was executed, and nothing in that repository was changed.*
