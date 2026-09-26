# SPARK ESTATE™ — GLOBAL FOUNDATION RECONCILIATION
## Authoritative Architecture and Convergence Plan

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| `main` / production branch | `7e2efec6144c5f1872aa1062b8802cb75c2cd2cf` (2026-09-23). `VERCEL.md` names `main` as the only production branch. |
| Date of reconciliation | 2026-09-26 |
| Mode | Read-only. No code changed, nothing merged, nothing deployed, `main` untouched. |
| Method | 644 remote branches fetched (history since 2026-08-20). Ancestry, `git cherry` and `git merge-tree` checks were run on every branch that matters. Six parallel code investigations covered: routing/ownership; pending/acceptance/execution; context/continuity/memory; business truth/LMC/research/handoffs; Board runtimes; proactive/notification/guards. The author then re-checked the key claims (§21). |

> **Note on the "attached audit".** No audit file was attached to this request. The audit branch named by the executable-intent Round-1 report (`audit/global-executable-intent`) was never pushed. Its claims are therefore revalidated from three sources: (a) the claims quoted by the Round-1 return report (`docs/reviews/global-executable-intent-round-1.md` on `executable-intent/round-1-remember-precedence`, citing audit §4, §9, §10 and §17.5); (b) the 23 focus areas listed in the request; (c) the master audit already on `main` (`docs/architecture/MASTER_AUDIT_FINDINGS_MATRIX.md`, findings MA-01…MA-42), which covers the same ground. If the attached audit makes claims not covered here, send it and §3 will be extended.

---

## 1. Executive finding

1. **`main` has not moved since the audit.** `main` = `7e2efec6` = the audit baseline = production. Every newer piece of work (Board R3F-5B, Claire C-4/C-5.x, canonical writes G-1.x, LMC S0/S0b, executable intent) is **branch-only**. So every audit claim about `main` is still true in production unless a specific branch fixes it, and none of those fixes has landed.

2. **There are three live development stacks. They touch disjoint files and merge together cleanly.**
   - **Board:** `atomic/board-r3f5b-conversation-continuity` (59 ahead / 5 behind).
   - **Claire + Canonical Truth + LMC:** `atomic/lmc-s0b-founder-seed-isolation` (28 ahead / 5 behind; contains `g1-1`, `c4`, `c5.1–c5.4a`, `g1-4`, `lmc-s0`).
   - **Executable intent:** `executable-intent/round-1-remember-precedence` (4 ahead / 0 behind).

   Verified: the pairwise merges and the three-way combined merge all produce no conflicts (§21). `main` also merges into each without conflicts.

3. **The root cause of the piecemeal fixing is structural, and it is the same everywhere.** Spark has no single turn pipeline.
   - `handleSend` in `app/companion/CompanionPageClient.tsx` (31,810 lines) runs about 8,700 lines. More than 40 responders in it can end the turn before the model is called.
   - Seven components each decide who owns a turn.
   - There are about 147 classifiers and routers, all regex, keyword or score based.
   - There are about 40 yes/no vocabularies and about 20 pending stores.
   - There are three separate execute-then-verify paths.
   - The chat model has **no tools and no model-based understanding** on the live path.

   Each newer vertical has rebuilt understanding, pending state, acceptance and verification **for itself**: Board (move classifier, model signal extractor), Claire (model-led move, leak guard) and Remember (stance classifier, pending record). These are good implementations, but each is local. That is why fixing one behavior surfaces another competing mechanism.

4. **Spark does not need a new architecture. It needs one pipeline that its existing parts plug into.** Almost every foundation role already has a sound candidate in the repository (§5). Only two things are genuinely missing:
   - **(a) domain-neutral, model-assisted turn interpretation.** It can be built by generalizing the Board's model-first/deterministic-fallback extractor pattern on the shared `invokeStructuredLlm` seam.
   - **(b) background delivery infrastructure** (push, service worker or cron). Nothing like it exists.

5. **Recommendation: GO**, with the order in §14. First land the three current stacks behind their existing gates. Then build the single turn pipeline in *shadow mode* before any behavior change.

---

## 2. Current repository and branch truth

### 2.1 Baseline

| Fact | Evidence |
|---|---|
| `main` SHA | `7e2efec6`, "fix(drift-glass): bubbles back through the sand…" (2026-09-23 13:36 −0500) |
| Production relationship | `VERCEL.md`: Production Branch = `main` on `adhd-business-companion-vs3`. Feature branches build Preview only. |
| Last 5 commits on `main` | 4 drift-glass fixes and 1 Chamber card hotfix (`f48361bd`), plus two LMC reverts (`830474ea`, `bd824a69`, 2026-09-22) |
| Branches | 644 remote heads; 150 fully contained in `main` |

### 2.2 Active, current branch stacks (not merged)

| Stack tip | Ahead / behind `main` | Contains | Scope (files) | Status |
|---|---|---|---|---|
| `atomic/board-r3f5b-conversation-continuity` (`ced219af`, 2026-09-25) | 59 / 5 | `atomic/board-room-convergence-2026-09-22`, which merged `board-ctx-1`, `board-converge-1`, BBC-1/2, SITUATION-SHAPE-1, SI-BU-READ, R1, R2, R2.1, J1, J1c, BC-P0, BC-6; then R3A–R3F-5 and all R3F-5B rounds (semantic understanding R1/R2, conversational-move understanding, question reasoning, session lifecycle, dynamic reasoning) | 211 files, +32.5k | **Current Board authority candidate.** Branch-only. |
| `atomic/lmc-s0b-founder-seed-isolation` (`1c4d776e`, 2026-09-24) | 28 / 5 | G-0.2, G-1.1…G-1.4a canonical truth; Claire C-A, C-B, C-B.1, C-5, C-4, C-5.1, C-5.2, C-5.3, C-5.4, C-5.4a; LMC S0, S0b | 54 files, +11.8k | **Current business-truth/Claire authority candidate.** Branch-only. |
| `executable-intent/round-1-remember-precedence` (`c047cc72`, 2026-09-25) | 4 / 0 | Rounds 1a/1b/1c and the return report | 17 files, +2.4k; **0 files under `app/`** | Branch-only. Kill switch `NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE`. |
| `claude/youthful-knuth-677ce1` | 19 / 0 | Sensorium "Autumn Drift" | Not foundation-relevant | Out of scope |

Overlap: 0 files shared between the Board and Claire stacks, and 0 shared between executable intent and either stack. `git merge-tree` reports a clean three-way combination.

### 2.3 Branch classification (foundation-relevant)

| Class | Branches |
|---|---|
| **Already merged** (ancestor of `main` or patch-equivalent) | `cursor/atomic-7a-continuity-read-model-92a7`, `cognitive-return-f106`, `interruption-return-identity-f106`, `part-a-transcript-trust-92a7`, execution-foundation `0a–0d` (content on `main`), `atomic-3c1`, `atomic-3c2` (via research-3c1/3c2 harvest), `cursor/atomic-6b1…6b4-*-consumption`, the LMC production/host/member-managed/ripple branches, `board-atomic-0…5-c393` (patch-equivalent), `reconcile/board-v4b-production-2026-09-15`, `board-visual-production-b103`, `board-practice-*`, `board-claire-member-friction-18df`, `chamber-c1-expertise-live-wiring`, `bu-s1-chamber-c2-convergence`, the `events-*` 2026-09-21/22 convergence set, `cursor/g1-clear-request-advisory-fallback-9fb3`, `p0-attention-inspection-f7b4` (effectively) |
| **Branch-only and current** | the three stacks in §2.2; `atomic-3c3`, `3c4`, `3d1`, `3d2`, `3d3` (Research handoff chain, 140 behind, needs rebase); `convergence/strategies-s1…s5b` (140 behind); `convergence/c1-canonical-truth-foundation` (VTS `lbmBoundary` only) |
| **Superseded** | `atomic/claire-c5-person-before-process` (re-applied as `3c9aa711` in C-4); `atomic/board-bc-6-no-advice-contract`, `atomic/board-bc-p0-provenance-boundary` (R3F-5B carries the J1c versions); `atomic/board-r3f-member-in-deliberation` (sibling of R3F-1, conflicts); `cursor/board-final-integration-b103` (322 behind, wide conflicts); `cursor/board-atomic-5a-c393`, `board-gather-handoff-040b` (dev-runtime lineage); `cursor/atomic-3a-bu-shared-intelligence-8b6e`, `si-bu-read-8a02` (BU-S1 landed the same collector); `cursor/lmc-live-wiring-recovery-9fb3` (**reverted by design**: it gave the Board a writer); `cursor/strategy-p0-p1-shared-authority-0dbe` (inside s5b) |
| **Stale** (no merge-base with the rewritten `main` history, or 300+ behind) | all `cursor/*-3718`, `-c67d`, `-e7a5`, `-7b92`, `-b624`, `-974c`, `-b02b` Board/Strategy branches; `cursor/lmc-1c/2/2a`; `cursor/leu-*-d9a6`; `claude/main-conversation-continuity` (587 behind); `cursor/parked-topic-*-3fb8`, `main-conversation-last-assistant-spine-3fb8` (655 behind); `cursor/later-v1-*`; `cursor/desktop-notifications-toggle-fix-684f`; `cursor/pending-parameter-continuation-red-test-a055`; `feat/active-work-context`, `fix/active-work-adhd-handling`, `fix/conversation-context-recovery` (content already on `main`); `cursor/evidence-vault-v1-f27e`, `feat/evidence-vault-durable-save` (content already on `main`) |
| **Conflicting with current work** | `cursor/board-v2-founder-demo-bridge-fc8f` / `bd-fc8f` (conflicts with R3F-5B in the intake, `contextAssembly`, `firstPassRequest`; adds a parallel BU-facts path); `atomic/board-r3f-member-in-deliberation`; `cursor/board-final-integration-b103` |
| **Salvage, not merge** | `claude/main-conversation-continuity` (parked topics survive the tab; one reader for "what Spark last said"; send the spine transcript); `desktop-notifications-toggle-fix-684f` (`desktopNotificationControl.ts`); `convergence/c1` (`lbmBoundary.ts`); `docs/atomic-a0-canonical-business-truth-authority` (rulings never committed); `pending-parameter-…-a055` (design only); the inquiry-aim idea in `board-v2-founder-demo-bridge` |

Limitation: branches with no merge-base were judged by content and `git cherry`, not ancestry.

---

## 3. Audit claims revalidated

Categories: **STILL TRUE** (true on `main`/production today) · **PARTIALLY TRUE** · **ALREADY FIXED** (on `main`) · **FIXED ON BRANCH ONLY** (a sub-type of partially true: still true in production) · **SUPERSEDED** · **NO LONGER APPLICABLE** · **NEEDS RUNTIME VERIFICATION**.

| # | Claim (audit / MA ID) | Verdict | Current evidence |
|---|---|---|---|
| 1 | Turn ownership is fragmented; the gate opens too late (MA-04) | **STILL TRUE** | `handleSend` starts at `CompanionPageClient.tsx:16542`. The Boundary decision is computed at :16588, but more than 40 short-circuit responders follow it (hard Create exit :16886, estate nav :17070, work recognition :17398, explicit capability :17847, pending choice :18281, frictionless continuation :18804, …). Seven ownership deciders: Boundary, `turnAuthority`, `primaryTurnClassifier`, `routeConversationTurn` continuity gate, the ownership spine (:19663), `pendingAcceptanceAuthority`, `activeTopic`/`intentWorkflow`. MA-04 Phase 2b (early consult) was **deliberately deferred** (`MA01_MA04_OWNERSHIP_GATE_DESIGN.md:310-330`). |
| 2 | Parallel routers decide by chain order (MA-03) | **STILL TRUE, worse** | About 147 exported classifier/router functions in 131 files; about 10 estate/navigation resolvers; about 10 dead. |
| 3 | No semantic understanding; keyword/regex recognition (MA-12, MA-13) | **STILL TRUE on `main`; PARTIALLY FIXED on branches, locally** | No model-based classifier on the live chat path. The Board's `modelMaterialSignalExtractor.ts` (model-first, deterministic fallback) is Board-only and branch-only. Claire C-5.3's `claireModelLedConversation.ts` is Claire-only and branch-only. `lib/semanticIntentResolver` is keyword and knowledge-base signals despite its name. |
| 4 | Answer-first / person-before-process | **PARTIALLY TRUE** | `lib/shariAnswerFirst/*` runs globally (:16634–16708), but it only *suppresses* opens (`answerFirstPreferChat`); it does not compose the answer. Claire C-5…C-5.4a is a separate, Claire-local implementation (0 files in `shariAnswerFirst`). |
| 5 | No member operating context object | **STILL TRUE** | `app/api/companion-chat/route.ts:211-352` joins about 30 separate prompt strings. `intentHint` is merged from about 15 builders (`CompanionPageClient.tsx:23784-23830`). Shared Intelligence (`retrieveRelevantSituation.ts:778`) exists but is one field among 30. |
| 6 | Business identity fragmented across 5+ stores (MA-09) | **STILL TRUE on `main`; FIXED ON BRANCH ONLY for the Claire write path** | Four channels in `companion-business-profile-v1` (FactRecords, legacy sections/approval, flat BusinessProfile, avatars) plus VTS `businessCanvas`. The key is declared twice (`businessEstateProfile.ts:212`, `companionStore.ts:1252`). G-1.1–G-1.4a on `lmc-s0b` give Claire one canonical transaction and FactRecord precedence. Legacy writers remain as ratcheted exceptions. |
| 7 | LMC is a projection | **ALREADY TRUE on `main`** | `lib/lmc/contracts.ts:1-14`: "Nothing here stores anything". The writer-carrying convergence was reverted (`830474ea`). |
| 8 | Conversation continuity is fragile; two transcripts | **STILL TRUE** | Spine `companion-conversation-session-v1` plus legacy `companion-conversation-v1`, both written. About 25 `clearConversation()` sites clear only the legacy key. The view is not restored on reload (`:2850`, `:3897-3901`). |
| 9 | Session continuity / New Day | **STILL TRUE, and it conflicts with Founder Decision 2** | New Day runs **automatically** on first open of the day and after an absence (`:4452-4461` → `runSharedNewDay.ts:76` → `resetActiveConversation`). It wipes the spine and legacy transcript, estate digest, ActiveTopic, suspension, owner and `lastActivity`. `clearLastActivity` runs before the welcome card is built, so "continue our conversation" is lost. |
| 10 | Cross-device continuity absent (audit §17.5) | **STILL TRUE** | No conversation table or domain in Supabase. Transcript, Active Work, business profile and Rhythms are localStorage only. Topic, owner and estate memory are sessionStorage only. |
| 11 | Reference resolution absent | **STILL TRUE** | No general resolver. Fragments only: `activeWorkContext/routingEnrichment.ts:43` ("this/that/it"), `resumePreviousWork(hint)`, `visualFocus/.../referentSignals.ts`, Board `entityReferenceResolver` (branch). No people store. |
| 12 | "Awaiting answer" is tracked in 5+ places; pending questions are unowned (MA-01, MA-05, MA-06) | **STILL TRUE** | About 20 conversational pending stores (`companion-frictionless-pending-v1`, `spark:pending-choice:v1`, `spark:pending-remember-create:v1`, collection, win-save, transition, active-task, recovery, strategy handoff, menu ×4, decision-ledger `pendingConfirmation`) plus about 6 page refs. |
| 13 | Acceptance vocabulary fragmented (MA-11, "~40 vocabularies") | **STILL TRUE** (one retired on branch) | About 40–45 real interpreters. The canonical `isBareShortAcceptanceText` / `isPureConfirmationDecline` live in `conversationConfirmationGate.ts:262/196`. Near-duplicates: `GENERIC_ACCEPTANCE_RE` ≈ `COMMITMENT_AFFIRMATIVE_RE`; at least 5 decline regexes; `isActionAcceptance` defined twice. Only the Remember owner's vocabulary is retired (executable-intent branch). |
| 14 | Executable intent: direct requests are not executed | **STILL TRUE on `main`; FIXED ON BRANCH ONLY for Rhythm/Reminder** | The Round-1 branch executes Rhythm/Reminder with read-back. `CapabilityObject = rhythm\|reminder\|calendar` (`capabilityObject.ts:13`) is hard-scoped. |
| 15 | Rhythm owner unreachable from live chat | **STILL TRUE on `main`** | The page always passes `blockSecondaryResponders: true` (`primaryTurnClassifier.ts:151`), and `resolveFrictionlessForPrimaryTurn` (`frictionlessActionLayer.ts:1646`) nulls most categories. **Most of the ~66 `try*Flow` branches are unreachable** (NEEDS RUNTIME VERIFICATION branch by branch). |
| 16 | Compound requests: the first matcher claims the whole turn | **STILL TRUE** | No general decomposition. `RequestedAction[]` exists only on the executable-intent branch, and only for Remember. |
| 17 | Model replies can claim actions they did not take (audit §4, §9; G7) | **STILL TRUE** | No tool calling anywhere except `research-live` (`web_search`). Truth is guaranteed only for owner-produced replies. |
| 18 | Execution verification | **PARTIALLY TRUE** | Three separate execute-then-verify paths: Execution Foundation (`verifyProjectExecution.ts`, Board→Project only); G-1.3 re-read (branch); Remember re-read (branch). No shared receipt; no undo except the 45-second Create-local `postCreateUndo.ts`. `approvalEngine.ts` is dead code. |
| 19 | No calendar write; no push/background notifications (audit §10) | **STILL TRUE** | No service worker, PushManager, `vercel.json` crons or `supabase/functions`. The only delivery loop is a 30-second `setInterval` while the tab is open (`:8344-8446`). |
| 20 | Research routing misfires ("need you" → Study Hall) | **STILL TRUE** | `estateCapabilityRegistry/consult.ts:46-49` word-overlap fallback. 13 explicit-research detectors (two same-named `isExplicitResearchRequest` with different regexes). |
| 21 | Claire cannot actually hand off to Research | **STILL TRUE on `main`** | 3D-2/3D-3 are branch-only and 140 behind. |
| 22 | Handoffs have no common contract | **STILL TRUE** | About 14 handoff families, about 85 `*Handoff*` types. Board `BoardSharedHandoff` is the richest live shape. |
| 23 | Proactive intelligence ungoverned | **STILL TRUE** | 12 phase observers run every turn (`:21566-21626`), each with its own localStorage cooldown and no shared budget. The intended governor `loadManager.shouldDeliverOptionalPrompt` is **called only from tests**. |
| 24 | Notification governance | **PARTIALLY TRUE** | The load manager governs Reminders/Rhythms (quiet hours, cap, level). Time-block alerts bypass it (`:8364-8406`). There are 3 quiet-hours systems and 2 desktop-notification toggles (the fix is branch-only). |
| 25 | Observable-pattern rule / unsupported psychological interpretation | **STILL TRUE (live violation)** | `phase3AdaptiveRelationship.ts:76-82, 285, 298` tags "launch avoidance"/"visibility avoidance" by regex and tells the member "I'm noticing a pattern: …". `buildCompanionLearningObservations` (:415) produces "You often gain momentum after launch avoidance." The guards (`personalAwareness.isObservationSafe`, `HCV_CLINICAL_TONE` with 4 phrases) do not cover this path. |
| 26 | No-Advice enforcement | **PARTIALLY TRUE** | On `main`: prompt-only, Listen/Talk-It-Through mode only. On the Board branch: BC-6 validators in synthesis, presentation and brief (runtime). The `subjectBrief/noAdviceGuard.ts` is used only in tests. Regex lists are duplicated 3–4 times. No global guard. |
| 27 | Model-route consistency | **STILL TRUE (risk)** | `gpt-4o-mini` is hardcoded about 29 times with raw `fetch`. Board and Claire use `invokeStructuredLlm` / `claireReasoningServer`. The main chat uses its own path. There are 7 other callers of `/api/companion-chat`. |
| 28 | Monolith orchestrator (MA-20) | **STILL TRUE, worse** | 31,810 lines (the audit said ~15–22k). |
| 29 | Board: multiple runtimes; legacy live | **STILL TRUE on `main`** | With the flag off (the default), the live UI runs the template legacy-twelve discussion (`BoardDirectorDiscussionIntake.tsx:254`). With the flag on, `main` calls a server-only LLM from the browser and fails. R3F-5B fixes this with a server route (`app/api/board/deliberate`). |
| 30 | Board sessions are not durable across devices | **STILL TRUE (including the branch)** | Board sessions are localStorage only on R3F-5B. |
| 31 | Memory inspect/correct/remove | **PARTIALLY TRUE** | Evidence Vault has edit and delete; its durable mode is off by default. The Memory Library is view/export only. Model-facing memory (estate memory, session memory, relationship memory) has no member UI. |
| 32 | Dead governor code / built-not-wired (MA-23…27) | **STILL TRUE** | Plus: `cognitiveReturn` and `pertinentQuestionMove` are merged but unwired; `approvalEngine` is dead. |
| 33 | Login persistence critical (MA-34), build failing (MA-35) | **NEEDS RUNTIME VERIFICATION** | Outside this scope. The Round-1 report shows 353 pre-existing `tsc` errors and 499 pre-existing test failures. |

---

## 4. Current runtime architecture (what actually runs on `main`)

```
Browser: CompanionPageClient.handleSend (≈8,700 lines)
 ├─ up-front decisions, no reply: Create envelope → Boundary (S4) → Answer-First pipeline
 │                            → Create relationship → turnAuthority → activeTopic/intentWorkflow
 ├─ 40+ ordered SHORT-CIRCUIT responders (regex): boardroom seed, avatar, Create exit, strategy,
 │    business nav, routeConversationTurn, work recognition, continuity gate, primaryTurnClassifier
 │    (sets blockSecondaryResponders=true on every turn), My Day, explicit capability, reminder,
 │    pending choice, Create fast path, frictionless "yes", hard nav, feature nav, ownership spine,
 │    win-save, companion intent, estate guide, intentStabilizer, handoffs, frictionless actions,
 │    stress/tool/artifact/recovery/workspace offers …
 ├─ 12 phase observers → prompt hints (no shared budget)
 ├─ ~15 hint builders → intentHint ; ~30 context strings
 └─ fetch /api/companion-chat → gpt-4o-mini (no tools) → server guard chain (5 stages)
      → client finalizeMemberFacingAssistantText (≈30 call sites) → spine + legacy transcript (localStorage)
Background: none (a 30-second interval only while the tab is open)
```

**The branch architecture adds, per vertical:**
- **Board:** server route, persistent session, model extractor, regex move classifier, No-Advice validators.
- **Claire:** model-led move, canonical write transaction, leak guard.
- **Remember:** stance classifier, `RequestedAction[]`, read-back verification.

These are three well-built islands with no shared spine.

---

## 5. Authoritative-system matrix

Legend for **Action** (the Phase-6 vocabulary): REUSE · EXTEND · WRAP · MIGRATE · RETIRE · NEW.

| # | Responsibility | Authoritative candidate & location | Status | Why it wins | What competes | Retire (after migration) | Must extend | Depends on |
|---|---|---|---|---|---|---|---|---|
| 1 | Turn ownership | **Conversation Boundary (S4)**: `lib/conversationBoundary.ts`, `conversationBoundaryInputs.ts:243`, plus the ownership spine `lib/conversationSession/ownership/*` | Live, but consulted too late | Already declared sole authority by the Founder design doc; pure, explainable, tested; already has an "is-this-an-answer" contract | `turnAuthority`, `primaryTurnClassifier`, `routeConversationTurn` gate, `resolveConversationOwnership` (as a decider), `activeTopic`/`intentWorkflow` deciders, the 7 executable-intent step-aside lines | Turn-deciding roles of the 6 competitors (they become clients) | Consume Turn Interpretation (#2) as evidence; run first in `handleSend` (MA-04 Phase 2b); output one owner for the turn | #2, #12 |
| 2 | Intent / meaning understanding | **NEW by generalization: Turn Interpretation**, built on `lib/internalAgent/invokeStructuredLlm.ts` with the R3F-5B `modelMaterialSignalExtractor` pattern (model-first, schema validation, evidence grounding, deterministic fallback, trace) | Pattern exists (Board-only, branch) | Only proven model-plus-fallback pattern in the repo; shared seam declared "not Board-local" | ~147 regex classifiers; Claire `claireModelLedConversation`; Remember `executableRequest` stance; `outputExecutionPosture` | The duplicate turn-type families over time (§6) | Domain-neutral schema: stance, conversational move, requested actions + slots, references, observable affect, confidence. The existing regex classifiers become the **fallback** | `invokeStructuredLlm`, an authenticated server route |
| 3 | Capability selection | **Execution Foundation capability manifest** `lib/executionFoundation/capabilityManifest.ts` (executable capabilities) + `lib/estateCapabilityRegistry/catalog.ts` (destinations) | Live; manifest has 1 entry | Manifest already carries permission class, side-effect class and verification rule | `estateBrain/capabilityRegistry`, `companionCapabilityRegistry` (not page-called), universalAccess list, `CapabilityObject`/`AVAILABILITY` (branch) | `companionCapabilityRegistry`; `consult.ts` word-overlap fallback; `AVAILABILITY` map | Register Rhythm, Reminder, BU write, Project, navigation, Research, Create; per-capability slot schema | #2 |
| 4 | Conversation Boundary | Same as #1 | Live | — | — | — | Accept model evidence; stale header ("PURE, UNWIRED") must be corrected | #2 |
| 5 | Answer-first / person-before-process | **`lib/shariAnswerFirst/*`** (global position in the turn) + **Claire C-5.x logic** as the substance model | Global (regex); Claire branch | Only globally wired mechanism; Claire's version is the better behavior | Claire `claireMemberRequest`, `claireModelLedConversation` (parallel) | Claire-local duplicates, once generalized | Become a **pipeline rule**: an interpretation that asks something is answered before any process advances; Claire's substance-preservation (`answerPreservation.ts`) applies to all owners | #1, #2 |
| 6 | Member Operating Context | **Shared Intelligence** `lib/relevantSituation/retrieveRelevantSituation.ts:778` + `conversationGate/gateRelevantSituationForConversation.ts` + `authorizedEstateConsumption/*` policies | Live (one field of 30) | Already provenance-aware, used by Board, Chamber, Strategy, Create, Research | ~30 prompt fields, ~15 hint builders, `executiveOS/contextComposer`, `governor/contexts`, `contextPackager` | Unused context builders; hint builders folded into collectors | One assembled, typed context sent to the model; Active Work, pending, preferences as collectors | #7, #10 |
| 7 | Business Understanding | **FactRecords `estate.understanding` + G-1.3 canonical write transaction** (`lmc-s0b`: `canonicalWriteContract.ts`, `canonicalWriteTransaction.ts`, `readProvider.ts`) | Branch-only | Single transaction, re-read verified, idempotent, FactRecord precedence, G-0.2 mechanical guard | Legacy sections/approval, flat BusinessProfile, avatars, VTS `businessCanvas`, `companion-business-os-v1`, phase4/phase7 stores | Direct legacy writers (ratchet to 0); duplicate key constant | Route every business-truth write through G-1.3 as an Execution capability; VTS via `lbmBoundary` (salvage c1) | Land `lmc-s0b` |
| 8 | Conversation transcript | **Spine** `companion-conversation-session-v1` via `transcriptAuthority.ts` | Live, co-written with legacy | Already declared authority (`SPINE_CONTRACT.md`) | Legacy `companion-conversation-v1` | Legacy key (after the Chamber-resume reader migrates) | Durable server copy (#28); single clear path | #28 |
| 9 | Continuity | **Active Work Context** `lib/activeWorkContext/*` (primary + suspended stack) with Boundary-driven suspend/resume (`conversationBoundaryApplyActiveWork.ts`) | Live | Already reaches the model; already suspends/resumes; survives New Day | ActiveTopic (sessionStorage), suspension store, owner store, estate active task, `companionLedContinue`/`continuityManifest`, unwired `cognitiveReturn`/`workContinuity` | Make ActiveTopic/suspension projections; pick one resume read model | Parked-topic records (salvage `claude/main-conversation-continuity`); daily opening reads Active Work | #8, #28 |
| 10 | Active Work | Same as #9 | Live | — | estate `activeTaskLock` | Duplicated "current work" pointers | — | — |
| 11 | Reference resolution | **Turn Interpretation `references[]`** resolved against Operating Context (Active Work, suspended stack, recent spine turns, FactRecord persons/offers) | Fragments only | The model is needed for open-ended language; the context supplies candidates; deterministic code validates ids | `routingEnrichment` "this/that", `resumePreviousWork(hint)`, Board `entityReferenceResolver` | Local ad-hoc pronoun matching | Resolved references carry ids plus confidence; low confidence → clarify | #2, #6 |
| 12 | Pending question / pending action | **Spine `expectedReply`** (`conversationSession/ownership/types.ts`) + `pendingAcceptanceAuthority.ts` expiry rules | Live, not the read authority | Already the declared awaiting-state authority (MA-05 plan) | About 20 pending stores | Owner-private pending stores, one owner at a time | Record the executable-intent provenance (phase, turn, time, requested actions) in the spine | #1 |
| 13 | Acceptance / yes-no | **`conversationConfirmationGate.ts`** canonical predicates (`isBareShortAcceptanceText`, `isPureConfirmationDecline`, `isShortAcceptanceOfArmedOwner`) + Turn Interpretation "move" for modified acceptance | Live | Already canonical; Round 1 proves migration works | About 40 vocabularies | Private vocabularies, migrated owner by owner | "Yes, but…", "just the first one", deferrals (Round 1 supplement) become global | #12, #2 |
| 14 | Executable intent | **`lib/memberIntent/executableRequest.ts`** (stance + `RequestedAction[]`), generalized | Branch, Remember-only | Only direct-request→execute implementation with restraint tests | `createIntent/outputExecutionPosture.ts` (second act-vs-discuss classifier) | Remember-only scoping; per-interceptor step-asides | Capability-generic via #3; stance supplied by #2 with its regexes as fallback | #2, #3 |
| 15 | Compound requests | **`RequestedAction[]`** (executable-intent) | Branch | Preserves order; names unsupported parts | `detectCompoundIntent` (overwhelm+task), Chamber co-primary hint | — (those are domain hints) | Execute each supported action through #17; one combined receipt | #14, #17 |
| 16 | Execution authorization | **Execution Foundation readiness gate + `ExecutionAuthorizationReceipt`** (`readinessGate.ts:104`, `authorizationReceipt.ts:45`) | Live (Projects only) | Only real authorization contract; idempotency built in | `approvalEngine.ts` (dead), Claire `outcomePermitsCanonicalWrite`, ad-hoc confirms | `approvalEngine.ts` | Risk policy: low-risk reversible → execute with receipt/undo; ambiguous/compound/destructive/business-truth/high-impact → confirm (Founder Decisions 3, 4) | #3 |
| 17 | Execution | **Execution Foundation run store** (`executionRunStore.ts`) dispatching to domain executors: G-1.3 (BU), `createMemberRhythm` (Rhythm), reminder intake, Project starter | Live (Projects) | Proposed→authorized→executing→verified lifecycle already exists | Inline execution in `frictionlessActionLayer.ts` (5,592 lines), Create-local | Inline side effects in frictionless (migrated one by one) | Domain executors registered by capability | #16 |
| 18 | Execution verification | **`verifyExecutionAgainstManifest`** + domain read-backs (G-1.3 re-read, Rhythm re-read) | Live/branch | Receipts come only from stored state | None global | — | A **truth guard**: any model reply that claims an action must match a receipt (fixes G7) | #17, #25 |
| 19 | Research | **`lib/researchLibrary` + `lib/research`** (sources, observations, epistemic status) + the 3C-3…3D-3 handoff chain (rebase) | Live; chain branch-only | Research owns sources (principle 7); epistemic work exists | 13 detectors; `estate.research`, universal/VT research stores | 12 detectors → "research" capability in #3 | Claire→Research→return via the shared handoff envelope | #3, #20 |
| 20 | Cross-Estate handoffs | **Board `BoardSharedHandoff`** envelope (`board/reconstructed/sharedHandoff/types.ts`) generalized, or the A0 "Situation Travel Contract" if it proves equivalent | Live (Board) | Richest live, provenance-carrying shape | ~14 families, duplicate `conversationHandoff.ts` | Duplicate `shariAnswerFirst/conversationHandoff.ts`; unwired Strategy/Momentum handoff shapes | One envelope: origin, situation ref, provenance, return path; the domain payload stays domain-specific | #6 |
| 21 | Decision / commitment recording | **Decision Ledger** `lib/decisionLedger/*` | Live (Compass, Projects, Board, conversation slice 6) | Most writers already converge here | Commitment engine, `decision-intelligence/decisionStore`, founder DecisionVault, Strategy decision memory, `settledDecisionAuthority` | Parallel decision stores after migration | Commitments as a Ledger kind | #12 |
| 22 | Observable pattern awareness | **`lib/patternAwareness`** (member-approved statements) | Live; the detection engine is intentionally absent | Encodes Founder Decision 6 | `phase3AdaptiveRelationship` inference, `phase2ProgressiveDiscovery`, digitalTwin "You tend to…" | Member-facing inferred labels (phase3 lines 285/298/415) | Observations = counted events plus member confirmation before any interpretation | #25 |
| 23 | Proactive intelligence | **Arrival Intelligence + `inspectMemberAttention`** (ranked, max 3) as the single proactive surface | Live | Already ranks, is read-only, and feeds Plan My Day | 12 phase observers, Spark Cards, Daily Discovery, suggestion engines | Direct-to-prompt phase outputs (they become candidates) | Candidates → governor (#24) → one surface | #24 |
| 24 | Attention / notification governance | **`lib/rhythms/loadManager.ts`** (quiet hours, level, cap, cooldown; `shouldDeliverOptionalPrompt`) | Live for Rhythms/Reminders; the optional-prompt gate is dead | Already has the right controls | Celebration quiet hours, per-phase cooldowns, time-block alerts bypass | Duplicate quiet hours; second desktop toggle (salvage 684f) | Govern **all** proactive producers; global member "proactivity level" (Founder Decision 7) | — |
| 25 | No-Advice | **Extract Board BC-6** (`validateBoardSynthesis.ts:62-98`, `validateBoardPresentationFidelity.ts`) into a shared delivery guard | Board branch | Only enforced implementation | Prompt-only Listen mode rules; HCV `PRESCRIPTIVE` | Duplicated regex lists (3–4 copies) | Mode-aware: Board/Strategy/Chamber = examine, don't decide; companion = options and tradeoffs, the member chooses | #27 |
| 26 | Human conversation guard | **Server `enforceHumanConversation`** (`companion-chat/route.ts:576`) + client `finalizeMemberFacingAssistantText` | Live | Already on every reply | ~34 guard/certify functions; Claire `INTERNAL_LEAK` (branch) | Redundant certifiers (after proof) | One ordered delivery pipeline for all model routes | — |
| 27 | Clinical / unsupported-inference guard | **HCV** (`humanConversationValidator/validate.ts:46`) + `personalAwareness.isObservationSafe` merged | Fragmentary | Already in the delivery path | Prompt-only text | — | Cover phase3/phase2/digitalTwin outputs; forbid "you tend to / avoidance / pattern" claims without member-established evidence | #22 |
| 28 | Cross-device persistence | **`lib/durableRecords` + Supabase `companion_member_records`** (RLS, soft delete) | Live for Saved Spark; flags off for others | A generic durable domain store already exists | localStorage everywhere | — | New **domains** (not tables): conversation spine, active work, pending, board session, rhythms, BU; enable vault/work flags | Founder decision on retention (§17) |
| 29 | Capability registry | Same as #3 | — | — | — | — | — | — |
| 30 | Specialized intelligence registry | **`lib/estateBrain/*Registry`** (expert, knowledge, environment, discovery) + domain registries (Board directors, Chamber members, Events) | Live | Domain experts should stay domain-owned | `estateIntelligence/estateRegistry`, `masterFeatureRegistry`, `sparkFeatureRegistry` (barrel-only) | Barrel-only registries | An index that maps capability → specialist, read by Turn Interpretation | #3 |
| 31 | Board runtime | **R3F-5B reconstructed seven-Director runtime** (`lib/board/reconstructed/*`, `delivery/*`, `app/api/board/deliberate`) | Branch-only | Only server-safe, session-persistent, No-Advice-validated, BU-provenance-aware runtime | Legacy-twelve template (`boardDirectorDiscussion.ts:1009`), `lib/boardroom/generateDiscussion.ts`, dev runtime (b103/5a) | Legacy-twelve and `lib/boardroom` runtime after cutover | Auth on `app/api/board/material-signals` (currently **unauthenticated**); durable session (#28) | Land R3F-5B; flag on in production |

**Founder Decision 8 confirmed:** the reconstructed Board (R3F-5B) is the Board authority. No competing runtime is newer or more complete. v4b is a visual layer, not a runtime.

---

## 6. Duplication kill list

| Duplicate group | Members found | KEEP | MIGRATE INTO | RETIRE (later, after migration) | DO NOT TOUCH YET |
|---|---|---|---|---|---|
| Turn owners / routers | Boundary, turnAuthority, primaryTurnClassifier, routeConversationTurn gate, ownership spine, pendingAcceptanceAuthority, activeTopic/intentWorkflow | Boundary + spine | Boundary (others become evidence providers) | Decider roles of the other five | Their domain logic (Create envelope, answer-first rules) |
| Turn-type classifiers | primaryTurnClassifier, sparkDecisionEngine.classifyIntent, classifyCompanionIntent, classifyCompanionIntentBucket, classifyUserMessage, classifyConversationalMode, intentStabilizer, resolveIntentRouting (56 regex) | Turn Interpretation (model) with these as fallback | Turn Interpretation fallback set | ~10 dead: `routeToTools`, `routeToMode`, `classifyStrategyIntent`, `companionEmotions.detectUserIntent`, `detectTurnIntent`/`detectWorkspaceIntent`, `detectIntentCommand`, `classifyPrimaryConversationTurnWithEngine` | Live ones until shadow data exists |
| Estate/navigation resolvers | ≥10 (routeEstateIntelligence, routeIntentFirstNavigation, detectEstateIntent, resolveEstateNavigationIntent, estateRouter, estateCommandRouter, resolveUserIntent, resolveEstateIntent, locationIntentResolution, experienceRouter, hardNavigation, detectUniversalCapabilityRequest) | `estateCapabilityRegistry` catalog + one navigation capability | Navigation capability (#3) | `consult.ts` word-overlap fallback; redundant resolvers | `hardNavigationCommands` (explicit commands) |
| Capability registries | estateCapabilityRegistry, estateBrain capabilityRegistry, companionCapabilityRegistry, universalAccess list, `CapabilityObject`/`AVAILABILITY` | Execution manifest (actions) + estateCapabilityRegistry (destinations) | Those two | companionCapabilityRegistry, `universalAccessStandard.ts` (0 importers), createRegistry | estateBrain expert/knowledge registries (#30) |
| Yes/no interpreters | ~40–45 | `conversationConfirmationGate` canonical set | Canonical set (per owner) | Private vocabularies; duplicate `isActionAcceptance`; `COMMITMENT_AFFIRMATIVE_RE` | Decision Ledger strict affirmation (keep **strict** as a policy parameter, not a copy) |
| Pending stores | ~20 + 6 page refs | Spine `expectedReply` | Spine | Owner-private stores, one by one | Decision Ledger `pendingConfirmation` (migrate last) |
| Stance (act vs discuss) | `executableRequest` stance, `outputExecutionPosture` | executableRequest stance (as fallback of #2) | Turn Interpretation | `outputExecutionPosture` after Create migrates | — |
| Transcripts | spine, legacy `companion-conversation-v1`, handoff stash, help suspend | Spine | Spine | Legacy key; the ~25 legacy-only `clearConversation()` calls | Help suspend (UI-local) |
| Continuity / current work | Active Work, ActiveTopic, suspension store, owner store, active task lock, estate memory open loops | Active Work | Active Work (others become projections) | Parallel "current work" pointers | Estate memory digest (model hint) |
| Resume systems | companionLedContinue/continuityManifest (live), cognitiveReturn (unwired), workContinuity (unwired), homeResumeItem/resumeWorkSignals, Chamber resume | One resume read model over Active Work + spine | That read model | Unwired `cognitiveReturn`/`workContinuity` **or** fold them in (decide in R5 by test coverage) | Chamber resume until spine is durable |
| Greeting / opening | ≥9 pipelines (global daily opening, welcome-home choices, mid-session return line, first-launch cinematic, first-login gate, arrival living room, WelcomeRoomPanel, estate-journey greeting (computed then discarded), legacy guard) | `resolveGlobalDailyOpening` + Arrival Intelligence | Daily opening | Discarded estate-journey greeting; duplicated first-visit speech | First-login gate (auth-backed); cinematic (visual) |
| Proactive engines | 12 phase observers, Arrival, Daily Discovery, Spark Cards, suggestion engines, dead check-in/smart-suggestions | Arrival + attention inspection as surface; phase modules as **candidate producers** | Governor (#24) | Dead engines (`checkInEngine`, `rhythms/smartSuggestions`) | Phase module content |
| Notification rules | loadManager, celebration quiet hours, per-phase cooldowns, time-block alerts, 2 desktop toggles | loadManager | loadManager | Duplicate quiet hours; second toggle | Sound preferences |
| "Hold for later" | brain-dump `schedulingIntent`, plan defer/snooze, AttentionObligation, Later V1 (branch) | AttentionObligation as the overlay + plan defer as the store | — | Do **not** land Later V1 as a fourth concept | — |
| Memory stores | estate memory, session memory, relationship memory, Memory Library, Evidence Vault, founder DecisionVault, memoryEngine (unwired) | Evidence Vault (member meaning), FactRecords (business truth), Decision Ledger (decisions), durable member records | Those | `sparkCoreIntelligence/memoryEngine` (unwired) | Founder studio stores |
| Business-truth stores | FactRecords, sections/approval, flat profile, avatars, VTS canvas, business-os, phase4/7 | FactRecords via G-1.3 | FactRecords | Legacy writers (ratchet); duplicate key constant | Persons (avatars) until G-1.2f person contract lands |
| Board runtimes | lib/boardroom, legacy-twelve, reconstructed-seven (R3F-5B), dev runtime (branch) | R3F-5B | — | legacy-twelve, `lib/boardroom/generateDiscussion.ts`, dev runtime | v4b visual layer |
| Handoff types | ~14 families | Board shared-handoff envelope (generalized) | Envelope | Duplicate `conversationHandoff.ts`; unwired shapes | Domain payloads |
| Research detectors | 13 (+1 on 3D-1) | Research capability in the manifest, detected by Turn Interpretation | — | 12 detectors | `research-live` web search executor |
| Decision stores | Ledger, commitment engine, decisionStore, DecisionVault, Strategy decision memory, settledDecisionAuthority | Decision Ledger | Ledger | Parallel stores | `settledDecisionAuthority` (reads Ledger; keep as reader) |
| Psychological/pattern detectors | 3× `detectEmotionalState`, overwhelmPatternEngine, struggleSignals, mentalLoadSignals, adhdMultiTurnPatterns, classifyRecoveryNeed, phase3 avoidance tags | `companionEmotions.detectEmotionalState` (live) as the fallback; the model's "observable affect" field | Turn Interpretation | 2 duplicate `detectEmotionalState`; member-facing inferred labels | Recovery routing (domain) |
| Output guards | ~34 functions; Claire leak guard; Board BC-6 | One ordered delivery pipeline (server `enforceHumanConversation` + client `finalizeMemberFacingAssistantText`) with plug-in guards | Pipeline | Redundant certifiers after proof | Board fidelity validators (domain) |

Nothing is deleted in this round.

---

## 7. Systems to land (in this order, each behind its existing gate)

1. **`atomic/lmc-s0b-founder-seed-isolation`** (G-1.x canonical truth, Claire C-4/C-5.x, LMC S0/S0b). This is the business-truth foundation, and the Founder-seed route is gated.
2. **`executable-intent/round-1-remember-precedence`** (kill switch; 0 `app/` files). It proves the owner/execute/verify pattern the foundation generalizes.
3. **`atomic/board-r3f5b-conversation-continuity`**. It needs the V2 flag on in production, a server OpenAI key, and **an auth fix for `app/api/board/material-signals` before landing**.

Each needs: an update from `main` (5 behind; verified conflict-free), its own suite, a full-suite delta vs `main` (0 new failures), and a Founder test on Preview.

## 8. Systems to rebase

- `atomic-3c3` → `3c4` → `3d1` → `3d2` → `3d3` (Claire↔Research handoff). They touch `CompanionPageClient.tsx`, so rebase *after* R2 (§14) and route through the pipeline rather than new page branches. 3D-1's 14th research detector must become the Research capability instead.
- `convergence/strategies-s1…s5b` (140 behind). Review against Shared Intelligence consumption first; land only what isn't already on `main`.
- `convergence/c1-canonical-truth-foundation`: only the VTS `lbmBoundary.ts` and C-1.6 parts.

## 9. Systems to salvage (take ideas or code, never merge the branch)

- `claude/main-conversation-continuity`: parked-topic records and restore, topic outliving the tab, the single "what Spark last said" reader, sending the spine transcript. It is newer than the 3fb8 variants; pick this one.
- `cursor/desktop-notifications-toggle-fix-684f`: `desktopNotificationControl.ts`, `sparkDesktopNotification.ts`.
- `docs/atomic-a0-canonical-business-truth-authority`: the binding rulings (FactRecords sole CORE; sections legacy; LMC projection). Commit them as an ADR when G-1.x lands.
- `cursor/pending-parameter-continuation-red-test-a055`: the "pending parameter" design, as a spine `expectedReply` slot.
- `cursor/board-v2-founder-demo-bridge-fc8f`: only the inquiry-aim idea.
- Board `classifyMemberBoardResponse` move regexes and the `requiresBoardSynthesis`/`isUngroundedGenericGap` question-reasoning rules: generalize them into the Turn Interpretation fallback and the question-quality guard.

## 10. Systems to retire (after their consumers migrate; not in this round)

`lib/ecosystem/automation/approvalEngine.ts` (dead) · `companionCapabilityRegistry` · the ~10 dead classifiers in §6 · `estateCapabilityRegistry/consult.ts` word-overlap fallback · legacy transcript key · the ~40 private yes/no vocabularies · 12 of the 13 research detectors · 2 duplicate `detectEmotionalState` · `shariAnswerFirst/conversationHandoff.ts` duplicate · legacy-twelve Board + `lib/boardroom/generateDiscussion.ts` · unreachable `try*Flow` branches in frictionless (after runtime verification) · member-facing inferred-pattern text in `phase3AdaptiveRelationship` / `phase2ProgressiveDiscovery` / digitalTwin · the discarded estate-journey greeting · the duplicate business-profile key constant.

## 11. Systems that must remain domain-specific

- **Board:** Director deliberation, cross-examination, synthesis, BC-6 fidelity validators (domain rules plus the shared guard), BC-P0 provenance, Board session lifecycle.
- **Claire:** the BU interview and the member-confirmation contract (`confirmationContract.ts`); the G-1.3 transaction is the executor, and Claire is a client.
- **Create:** discovery, drafting, lifecycle, `postCreateUndo`.
- **Chamber:** expert activation and response cards.
- **Research:** sourcing, epistemic status, observations, `research-live`.
- **Rhythm scheduling**, Reminder intake, Events, VTS canvas, Strategy reasoning, Evidence Vault content.

These keep their **domain execution and safeguards**. They stop deciding **turn ownership, acceptance, pending state and verification** on their own. This is the client model Boundary S1 already describes.

---

## 12. Minimum global foundation

```
MEMBER TURN
 │
 ▼
[F1] TURN INTERPRETATION   (NEW-by-generalization)
     model-first via invokeStructuredLlm, validated schema, grounded evidence,
     deterministic fallback = existing regex classifiers; never decides ownership
     → { stance, move, requestedActions[], references[], observableAffect, confidence }
 │
 ▼
[F2] BOUNDARY + SPINE = SOLE TURN OWNER  (EXTEND)
     inputs: F1 + spine expectedReply (the only pending authority)
            + canonical acceptance predicates + Active Work
     output: exactly one owner for the turn (existing domains become clients)
 │
 ▼
[F3] OPERATING CONTEXT  (EXTEND Shared Intelligence; WRAP hint builders)
     one typed context: situation, BU facts (CONFIRMED only), active/suspended work,
     pending, decisions, preferences, resolved references
 │
 ├──► CONVERSE: model reply; answer-first rule (F2 policy)
 ├──► ACT: [F4] CAPABILITY MANIFEST (EXTEND Execution Foundation)
 │          → [F5] AUTHORIZE (readiness gate + risk policy: receipt+undo vs confirm)
 │          → EXECUTE (domain executors: G-1.3, Rhythm, Reminder, Project, Create, Research)
 │          → VERIFY (read-back) → RECEIPT (+ undo where reversible)
 ├──► HAND OFF: one handoff envelope (EXTEND Board shared handoff)
 ▼
[F6] DELIVERY PIPELINE  (WRAP existing guards into one ordered chain)
     human-conversation · No-Advice (from BC-6) · unsupported-inference · truth guard
     (no claimed action without a receipt) · leak guard
 │
 ▼
[F7] REMEMBER  (MIGRATE)  spine transcript + Active Work + Ledger + FactRecords
     → durableRecords domains (cross-device); member inspect/correct/remove
 │
 ▼
[F8] CONTINUE  (EXTEND) New Day = new working day, not a wipe; parked topics resumable
 ║
[F9] ATTENTION GOVERNOR (EXTEND loadManager) governs every proactive producer
     + global proactivity level; [F10] background delivery (NEW, later)
```

| Component | Action | Proof that NEW is necessary |
|---|---|---|
| F1 Turn Interpretation | **NEW by generalization** (on the existing `invokeStructuredLlm` + extractor pattern) | Every model-based understanding module found is scoped to one vertical: Board extractor (Board domain enum, `BoardSituationInput`), Claire model-led move (Claire BP-2a only), `semanticIntentResolver` (keyword, despite its name). ~147 classifiers were inspected; none is model-based on the live path. No domain-neutral equivalent exists. |
| F2 Boundary + spine | EXTEND | — |
| F3 Operating context | EXTEND + WRAP | — |
| F4 Capability manifest | EXTEND | — |
| F5 Authorize/execute/verify | EXTEND (Execution Foundation) + WRAP (G-1.3, Rhythm) | Undo: EXTEND (the `postCreateUndo` pattern generalized) |
| F6 Delivery pipeline | WRAP | — |
| F7 Durable memory | MIGRATE onto `durableRecords` domains | — (no new table) |
| F8 Continuity | EXTEND Active Work + salvage parked topics | — |
| F9 Attention governor | EXTEND loadManager | — |
| F10 Background delivery | **NEW** (later) | No service worker, push, cron or edge function exists (verified). |

**Safety law (unchanged):** the model *interprets*. Deterministic code *owns*: turn owner, permissions, pending state, execution, verification, receipts, No-Advice and clinical guards. If the model fails or is invalid, the turn runs the deterministic fallback, and the result is traced, as the Board R2 extractor already does.

---

## 13. Architecture probes: 24 unfamiliar member requests

For each request: what happens on `main` today, the general capability that is missing, and the foundation component that answers it. No scenario-specific rule is proposed.

| # | Member says | Today on `main` (from code) | Missing general capability | Handled by |
|---|---|---|---|---|
| 1 | "Can you sort out the thing from Tuesday?" | Regex responders see no keyword; the model sees no reference candidates; generic reply | Reference resolution against durable history | F1 `references[]` + F3 candidates + F7 durable spine; low confidence → one clarifying question |
| 2 | "No — I meant the workshop, not the webinar." | A correction is treated as a new message; Boundary may classify it as a switch | Conversational-move understanding (correction) | F1 `move=correction` (Board regexes as fallback) → F2 keeps owner, updates the slot |
| 3 | "Wait, what do you mean by 'positioning'?" (after Spark asked something) | MA-17: the clarification can kill the pending offer | Clarification ≠ answer | F1 `move=clarification`; F2 keeps `expectedReply` armed; answer-first |
| 4 | "I don't even know where to start with taxes this year." | May fire emotional routing (MA-19) or Create; answer-first may suppress opens only | Person-before-process + help request | F1 `stance=share`, `move=help_request`, observable affect; F2 answer-first policy; the offer comes after the answer |
| 5 | "Block Thursday afternoon for writing and tell Dana I'm offline." | Calendar mention → "I'll open your calendar" (navigates away) | Compound request with unsupported parts | F1 `requestedActions[]` → F4 availability → F5 executes the supported part with a receipt; names the unsupported parts |
| 6 | "Delete the Monday rhythm." | No owner; the model may claim it did it (G7) | Destructive action + truth | F4 `side_effect=destructive` → F5 confirm → verify → receipt; F6 truth guard |
| 7 | "Actually make that every other week." (after creating a Rhythm) | Only on the executable-intent branch, and only within 3 turns / no reload (G8) | Modify the last executed action; durable receipts | F2 spine carries the last receipt; F5 update; F7 durability |
| 8 | "Remind me when Sarah replies." | Reminder intake asks for a time; no event trigger | Honest capability boundary | F4 `availability=not_available` → named honestly; no fake reminder |
| 9 | "Should I raise my prices or add a cheaper tier?" | Decision matchers may claim it; the model may advise | No-Advice: options and tradeoffs, the member decides | F1 decision-type request → offer Board (capability) or examine in chat; F6 No-Advice guard (shared BC-6) |
| 10 | "Let's run this by the Board." | Opens the Board; on `main` the legacy template runs | Handoff with situation + context | F4 Board capability → handoff envelope → R3F-5B session |
| 11 | "What did the Board say about hiring last week?" | Board sessions are localStorage only; the chat doesn't read them | Cross-Estate recall | F3 collector for Board synthesis (as `prior_board_synthesis`, BC-P0 provenance) |
| 12 | "Find me three competitors doing retreats in Portugal." | 13 detectors; may go to Study Hall navigation, not a research run | Research as an executable capability | F4 Research capability → `research-live` executor → sources owned by Research → receipt |
| 13 | "Draft the email to my VA about the new SOP." | Create interview may start ("What would you like this to accomplish?") | Enough-context creation; reference to "the new SOP" | F1 references + F3 context → Create capability with slots pre-filled; ask only for what is missing |
| 14 | "My business partner is Leah, she handles sales." | Nothing stored unless inside the Claire BP-2a prototype | Business-truth extraction from conversation → confirmation | F1 detects a proposed fact → F5 `business_truth` risk class → member confirms → G-1.3 transaction |
| 15 | "That's not right, we stopped doing coaching in June." | Legacy approved fields can resurface (fixed only on branch, G-1.4) | Correct/retire business truth with history | G-1.3 `correct`/`retire` via F5; LMC re-projects |
| 16 | "I'm so behind and I hate this." | Relief/environment menu may null the practical ask; phase3 may later say "I'm noticing a pattern…" | Observable affect, no psychological label | F1 observable affect; F6 unsupported-inference guard; F9 governs follow-up offers |
| 17 | "Stop suggesting things for today." | No single control; 12 observers keep firing | Global proactivity control | F9 member level → governor suppresses all producers |
| 18 | "Hang on, my kid just walked in—" then 40 min later "ok where were we" | Suspension store is session-only; view not restored on reload | Interruption + return | F2 `interrupt_and_suspend` → F8 parked topic (durable) → return restores |
| 19 | (Returns after 5 days) "hi" | Auto New Day wipes the transcript, topic and `lastActivity`; "continue" option lost | Non-destructive New Day; resume offer | F8: New Day starts a working day, keeps parked work; opening reads Active Work |
| 20 | Same conversation on the phone after starting it on desktop | Nothing syncs | Cross-device continuity | F7 durable spine + Active Work + pending in `companion_member_records` |
| 21 | "Plan tomorrow around the launch prep and the dentist at 2." | Plan My Day routing; the model may promise calendar entries | Planning with existing work + honest scope | F1 actions → F4 Plan capability (+ calendar not available named) → receipt |
| 22 | "Turn the brainstorm we did into a project." | Project creation exists (Board→Project manifest only) | Reference + execution with a manifest | F1 reference → F4 Project capability (already in the manifest) → F5 |
| 23 | "Invite the planning committee to the gala and send them the agenda." | Events handles entry/creation; invites/sends are not a capability | Compound + external sends (high impact) | F4 marks `send` as unavailable or high-risk → confirm; names what isn't possible |
| 24 | "Yes, but only the first two." (after Spark offered 4 things) | Ordinal parsing may navigate (MA-14); acceptance may be lost | Modified acceptance over a list | F1 `move=modified_acceptance` + selection → F2 spine `expectedReply` (menu) → F5 |
| 25 | "Forget what I told you about my revenue." | No member-facing memory removal for model memory | Inspect/correct/remove memory | F5 `retire` on FactRecord (G-1.3) + F7 memory surface; F3 stops including it |
| 26 | "Can you add things to my calendar?" (a capability question) | Calendar navigation may fire | Talk-about vs act | F1 `stance=talk_about` (executable-intent restraint regexes as fallback) → answer only |

**Gaps these probes exposed** (all covered by the foundation, none scenario-specific): durable reference candidates (1, 11, 20); a move taxonomy wider than yes/no (2, 3, 24); capability availability as data (5, 8, 23); a truth guard on model replies (6, 21); a single proactivity governor (16, 17); non-destructive days (19); memory control (25).

**Residual risk (NEEDS RUNTIME VERIFICATION):** model interpretation quality on real member language, and latency per turn. Shadow mode (R1) exists to measure this before any behavior depends on it.

---

## 14. Final convergence sequence

Each round is a meaningful convergence, not a symptom patch. Every round ships behind a kill switch, with a full-suite delta of 0 new failures, `tsc` delta 0, and a Founder test on Preview.

### R0: Land the current foundations (no new architecture)
- **Purpose:** stop branch drift. Put canonical truth, the Claire behavior fixes, executable-intent Round 1 and the R3F-5B Board into production.
- **Existing systems changed:** `main` receives `lmc-s0b` → `executable-intent/round-1` → `board-r3f5b` (merge commits; update each from `main` first).
- **Reused:** all three stacks as-is. One addition: auth on `app/api/board/material-signals/route.ts` (mirror `deliberate` lines 39-53).
- **Duplication eliminated:** Board runtime becomes one (set the V2 flag on in production; legacy-twelve retained for rollback only). The Remember private vocabulary is gone. Claire's canonical write path becomes one transaction.
- **Dependencies:** none. Verified conflict-free three-way.
- **Tests:** each stack's suites; full suite vs `main`; `canonicalWriterBoundary.test.ts`; `executableIntent.round1.test.ts`; Board R-series.
- **Founder test:** Claire BU conversation with a correction; the ASEA transcript; a Board Convene → Director question → member answer → Continue/Start New.
- **Regression risk:** medium (the Board flag flip; legacy writers).
- **Rollback boundary:** one merge commit per stack; `NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE=0`; `NEXT_PUBLIC_BOARD_DELIBERATION_V2` off.
- **Must not change:** Board BC-6/BC-P0 behavior; G-0.2 ratchet; `CompanionPageClient.tsx` (none of the three stacks edits it for turn logic).

### R1: Turn Interpretation in shadow mode
- **Purpose:** build F1 and measure it against today's deciders without changing any behavior.
- **Existing systems changed:** `lib/internalAgent/invokeStructuredLlm.ts` (reuse); a new `lib/turnInterpretation/` generalizing `modelMaterialSignalExtractor.ts`; one authenticated server route; one fire-and-forget call in `handleSend` that records the interpretation next to the existing decisions in the page turn log.
- **Reused:** extractor validation/fallback pattern; `executableRequest` stance regexes, Board move regexes, `companionEmotions.detectEmotionalState` as the fallback.
- **Duplication eliminated:** none yet. This round produces the evidence for R2.
- **Dependencies:** R0 (Board extractor on `main`).
- **Tests:** schema validation; the 26 probes in §13 plus the Founder regression lists as fixtures with injected fake models; fallback-on-failure; no-behavior-change assertion.
- **Founder test:** none member-visible. The Founder reviews a shadow report of disagreements.
- **Regression risk:** low. **Rollback:** a flag that disables the call.
- **Must not change:** any reply, route or write.

### R2: One turn owner and one pending/acceptance authority
- **Purpose:** F2. Boundary + spine decide every turn; every awaiting state is the spine's `expectedReply`; acceptance uses the canonical predicates; model evidence enters from R1 (behind a flag).
- **Existing systems changed:** `conversationBoundary*.ts`, `conversationSession/ownership/*`, `pendingAcceptanceAuthority.ts`, `conversationConfirmationGate.ts`; `handleSend` gains **one** early ownership consult (MA-04 Phase 2b, previously deferred). The seven executable-intent step-aside lines collapse into one Boundary claim.
- **Reused:** Round-1 active-request provenance (phase/turn/time); `isShortAcceptanceOfArmedOwner`.
- **Duplication eliminated:** 6 competing deciders become clients. Pending stores migrate to the spine, starting with frictionless, pending choice, Remember and Create consent (the high-traffic four). Their private yes/no vocabularies retire.
- **Dependencies:** R1 data showing interpretation quality; R0.
- **Tests:** MA-01/04/05/11/14/17/18 matrices (design doc A–J); the ASEA replay; clarification-keeps-offer; stale "yes" never revives; modified acceptance.
- **Founder test:** offer → clarification → "yes, but…" → interruption → return.
- **Regression risk:** **high** (the hot path). Land as small guarded commits, following the D3 template.
- **Rollback boundary:** a flag per migrated owner.
- **Must not change:** domain execution inside owners; Create interview mechanics; Decision Ledger strictness.

### R3: One capability manifest and one execution pipeline (receipts, undo, compound, truth)
- **Purpose:** F4 + F5 + truth guard. Generalize executable intent from Remember to every registered capability.
- **Existing systems changed:** `executionFoundation/capabilityManifest.ts` (add Rhythm, Reminder, BU write via G-1.3, Project, Navigation, Research, Create-open); `readinessGate.ts` gains the risk policy (Founder Decisions 3/4); `executionRunStore` gains undo for reversible classes; `executableRequest.ts` becomes capability-generic; frictionless inline side effects move behind executors, one at a time.
- **Reused:** Execution Foundation, G-1.3, `createMemberRhythm`, reminder intake, `postCreateUndo` pattern, `RequestedAction[]`.
- **Duplication eliminated:** 3 execute/verify paths → 1; `approvalEngine` retired; `CapabilityObject`/`AVAILABILITY` → manifest; `outputExecutionPosture` folded into stance.
- **Dependencies:** R2.
- **Tests:** per-capability execute/verify/fail/duplicate; compound with partial availability; receipt-backed truth guard (a model reply claiming an action without a receipt is corrected); undo.
- **Founder test:** the ASEA request, "Delete the Monday rhythm", "Block Thursday … tell Dana", "Turn the brainstorm into a project".
- **Regression risk:** medium-high. **Rollback:** a flag per capability.
- **Must not change:** G-1.3 semantics; Rhythm scheduling semantics; Board→Project flow.

### R4: One Member Operating Context
- **Purpose:** F3. One typed context assembled by Shared Intelligence and sent to every model route (main chat, Claire, Board context, Chamber, Strategy).
- **Existing systems changed:** `retrieveRelevantSituation.ts` (collectors for Active Work, pending, preferences, Board synthesis); `app/api/companion-chat/route.ts` accepts one context object (the 30 fields are wrapped first, then retired); Claire `claireSharedContext.ts` and Board `businessUnderstandingContext.ts` read the same façade.
- **Reused:** `authorizedEstateConsumption` policies; BC-P0 provenance classes; CONFIRMED-only facts.
- **Duplication eliminated:** ~15 hint builders → collectors; 4 unused context composers retired; the hardcoded model name moves to one config.
- **Dependencies:** R0 (BU), R2 (pending).
- **Tests:** context snapshot tests; provenance (no `prior_board_synthesis` treated as truth); token budget.
- **Founder test:** probes 1, 11, 13.
- **Regression risk:** medium. **Rollback:** fall back to the field-by-field path.
- **Must not change:** consumption policies' permissions.

### R5: Durable, non-destructive continuity (cross-device)
- **Purpose:** F7 + F8.
- **Existing systems changed:** spine becomes the only transcript (legacy key retired; the ~25 legacy-only clears fixed); `runSharedNewDay` becomes non-destructive (a new working day; prior topics parked, not wiped; the `lastActivity` ordering bug fixed); parked topics salvaged from `claude/main-conversation-continuity`; `durableRecords` gains `conversation`, `active_work`, `pending`, `board_session`, `rhythm` domains; Evidence Vault/Saved Work durable flags on; one resume read model.
- **Reused:** `companion_member_records` (RLS, soft delete), Active Work, Boundary suspend/resume.
- **Duplication eliminated:** 2 transcripts → 1; ActiveTopic/suspension become projections; resume systems → 1; greeting pipelines trimmed to daily opening + arrival.
- **Dependencies:** R2; the Founder decision on retention (§17).
- **Tests:** reload, close browser, second device, New Day, 5-day absence, member delete.
- **Founder test:** probes 18, 19, 20.
- **Regression risk:** medium (data migration). **Rollback:** durable flags per domain; localStorage remains the cache.
- **Must not change:** Board BC-P0 (prior sessions come back as prior synthesis, not truth).

### R6: One delivery pipeline (No-Advice, unsupported inference, truth, leak)
- **Purpose:** F6.
- **Existing systems changed:** extract BC-6 regexes into a shared guard; extend HCV clinical coverage + `isObservationSafe`; route phase2/phase3/digitalTwin member-facing text through it; move the Claire `INTERNAL_LEAK` guard into the shared pipeline; every model route uses the same ordered chain.
- **Duplication eliminated:** 3–4 No-Advice copies → 1; redundant certifiers retired after proof; phase3 "avoidance" labels removed from member-facing output (Founder Decision 6).
- **Dependencies:** R4 (context carries member-established interpretations).
- **Tests:** guard corpus; Board fidelity suites unchanged; no "I'm noticing a pattern: launch avoidance".
- **Founder test:** probes 9, 16.
- **Regression risk:** low-medium. **Rollback:** per-guard flag.

### R7: Attention governor and global proactivity control
- **Purpose:** F9.
- **Existing systems changed:** `loadManager.shouldDeliverOptionalPrompt` governs the 12 phase observers, Arrival, Daily Discovery and Spark Cards; time-block alerts pass through it; one desktop toggle (salvage 684f); one quiet-hours source; a member "Spark involvement" level extends `RhythmPrefs.notificationLevel` to a global preference.
- **Duplication eliminated:** per-phase cooldowns → one budget; 3 quiet-hours systems → 1; 2 toggles → 1.
- **Dependencies:** R6. **Founder test:** probe 17 + a normal day at each level.
- **Regression risk:** low. **Rollback:** a governor flag.

### R8: Research and handoffs on the pipeline
- **Purpose:** Research as a capability; one handoff envelope.
- **Existing systems changed:** rebase 3C-3…3D-3 onto R2/R3 (Claire → Research handoff via the envelope); 13 detectors → Research capability; generalize `BoardSharedHandoff` into the envelope (or adopt the A0 Situation Travel Contract if equivalent; compare in the round).
- **Dependencies:** R3, R4. **Founder test:** probes 10, 12.
- **Regression risk:** medium.

### R9 (later): Background delivery
- **Purpose:** F10. Service worker + push (or scheduled server job) governed by R7 preferences.
- **NEW:** no equivalent exists. **Dependencies:** R5 (durable rhythms/reminders), R7.

---

## 15. Dependencies

```
R0 ─► R1 ─► R2 ─► R3 ─► R8
             │     └──► R6? (the truth guard needs R3 receipts)
             ├──► R4 ─► R6 ─► R7 ─► R9
             └──► R5 ─────────────► R9
```

Hard prerequisites: G-1.x (R0) before any BU-write capability (R3); the R1 shadow data before model evidence influences ownership (R2); durable records (R5) before background delivery (R9).

## 16. Risks

1. **Hot-path regression in R2.** The 8,700-line `handleSend` is the riskiest code in the product. Mitigation: D3-style guarded commits, one owner per commit, per-owner flags.
2. **Model latency/cost per turn (R1+).** One extra structured call per turn (gpt-4o-mini class). Mitigation: shadow first; the deterministic fast path stays for high-confidence cases; parallelize with context retrieval. **NEEDS RUNTIME VERIFICATION.**
3. **Model misinterpretation.** Mitigation: interpretation is evidence, never authority; schema plus grounding validation; fallback; low confidence → clarify.
4. **Pre-existing test debt** (~499 failing tests, ~353 `tsc` errors on `main`). "0 new failures" deltas are the only practical gate. Some regressions will hide in the noise.
5. **Board production flag flip.** The reconstructed runtime needs the server key and route auth; the extractor is tested only with fake invokers. **NEEDS RUNTIME VERIFICATION** with a live model on Preview.
6. **Data migration (R5).** Moving localStorage state to Supabase domains; legacy business writers still exist. Mitigation: dual-read, durable flags per domain.
7. **Unauthenticated `app/api/board/material-signals`** (branch) is a cost-abuse surface. Fix before R0 lands the Board.
8. **Reachability claims.** "Most `try*Flow` branches are unreachable" is a static reading. **NEEDS RUNTIME VERIFICATION** before any retirement.
9. **Shallow history.** Branches without a merge-base were classified by content; a few "stale" verdicts could hide unique ideas. The salvage list mitigates this.

## 17. Founder decisions still genuinely required

Only product decisions that repository evidence cannot answer:

1. **Conversation retention for cross-device continuity.** How long Spark keeps server-side transcripts, and whether members can delete a whole conversation or a single message. This is needed before R5.
2. **Per-turn model interpretation budget.** Is a small added latency on every turn acceptable, or should interpretation run only when the deterministic path is unsure? (Recommendation: tiered. Decide after the R1 shadow report.)
3. **The risk-policy table** (implements Decisions 3/4). Approve which capability classes are "low-risk reversible" (execute + receipt + undo) versus "confirm first", and the undo window length.
4. **Default proactivity level** for new members (Decision 7 sets the control; the default is a product choice).
5. **Board production cutover.** Approve turning the reconstructed Board on for all members and keeping legacy-twelve only as a rollback path.

**Conflict to surface, not a decision:** the automatic New Day currently **destroys** conversation continuity every day. This contradicts Founder Decision 2. R5 fixes it; no new decision is needed.

## 18. What NOT to build

- Another router, classifier, registry, pending store or yes/no vocabulary (every one would be number 148, 21 or 41).
- A second context composer, memory store or business-truth layer. That includes landing the LEU claim substrate or Later V1 as new concepts.
- A second ownership gate or a new "resolver" beside the Boundary.
- Keyword patches for Founder sentences (e.g. "ASEA", "need you").
- Board-local or Claire-local versions of global concepts (moves, acceptance, answer-first, leak guards) from now on. Generalize the existing ones instead.
- Unrestricted model judgment over permissions, execution or truth.
- Background push before durable storage and the attention governor exist.

## 19. What NOT to merge

`cursor/board-v2-founder-demo-bridge-fc8f`, `bd-fc8f`, `atomic/board-r3f-member-in-deliberation`, `cursor/board-final-integration-b103`, `cursor/board-atomic-5a-c393`, `board-gather-handoff-040b`, all stale Board/Strategy lineages (`-3718`, `-c67d`, `-e7a5`, `-7b92`, `-b624`, `-974c`, `-b02b`), `atomic/board-bc-6-no-advice-contract` and `bc-p0-provenance-boundary` (non-J1c), `atomic/claire-c5-person-before-process`, `cursor/lmc-live-wiring-recovery-9fb3` (reverted by design), `cursor/atomic-3a-bu-shared-intelligence-8b6e`, `si-bu-read-8a02`, `cursor/leu-*-d9a6`, `cursor/later-v1-*`, `cursor/pending-parameter-continuation-red-test-a055`, `claude/main-conversation-continuity` and the `3fb8` parked-topic branches (salvage only), `cursor/x`.

## 20. Recommended FIRST implementation round

**R0: Land the current foundations**, in this order: `lmc-s0b` → `executable-intent/round-1` → `board-r3f5b` (with the `material-signals` auth fix). It creates no new architecture and eliminates three sources of drift. Every later round builds on it.

The first *new-architecture* round is **R1: Turn Interpretation in shadow mode**. It is behavior-neutral and produces the evidence that R2 (the hot-path ownership convergence) needs.

---

## 21. Evidence that the solution was challenged and rechecked

| Challenge | What was checked | Result / revision |
|---|---|---|
| "Maybe `main` has moved and the audit is stale." | `git rev-parse origin/main`; last commits | `main` = audit baseline. **All newer work is branch-only.** §3 distinguishes "fixed on branch only" from "fixed". |
| "Would landing one stack regress another?" | File overlap between stacks; `git merge-tree` pairwise + combined three-way; `main` into each | 0 shared files; all merges clean. |
| "Is there a newer Board runtime than R3F-5B?" | All Board branches: ancestry, `git cherry`, `merge-tree` | None newer; three conflict and are superseded; v4b is visual only. |
| "Does a model-based semantic layer already exist that I'm about to duplicate?" | `invokeStructuredLlm` callers on `main`, Board, Claire and executable-intent tips; `semanticIntentResolver`; Claire `claireReasoningServer`; `pertinentQuestionMove` | Only Board (7 callers, all Board) and Claire (BP-2a) use models; `pertinentQuestionMove` is unwired. **Revised F1 from "NEW" to "NEW by generalization"** of the Board extractor pattern, reusing existing regexes as the fallback. |
| "Is tool calling hidden somewhere?" | grep for `tools:`/`tool_choice` in `app/api`, `lib` | Only `research-live` `web_search`. Confirmed. |
| "Is the Boundary really the right owner, or dead code?" | `conversationBoundary.ts` header vs call site `CompanionPageClient.tsx:16588` | Header says "PURE, UNWIRED" but it **is** wired: a stale comment. It is the correct candidate and is Founder-approved as the sole authority (design doc :310-330). Added "fix stale header" to extensions. |
| "Does the plan create a parallel execution system?" | Execution Foundation vs G-1.3 vs Remember | **Revised:** G-1.3 and Remember become *domain executors* under Execution Foundation. No new executor. `approvalEngine` confirmed dead (0 external importers). |
| "Does the plan add a registry?" | Four capability catalogs found | **Revised:** no new registry. The Execution manifest is extended for actions; `estateCapabilityRegistry` stays for destinations. |
| "Does it add a memory store?" | `durableRecords` domains, Supabase schemas | **Revised:** cross-device uses new *domains* in the existing `companion_member_records`, not new tables. |
| "Would the plan regress Claire/LMC work?" | LMC projection contract; the revert `830474ea`; G-0.2 writer boundary | The plan keeps the LMC read-only and gives no writer to Board, Chamber, LMC or Strategy (G-0.2 unchanged). |
| "Would it regress newer Board work?" | BC-P0 provenance; BC-6; session lifecycle | R4 consumes Board synthesis only as `prior_board_synthesis`; R6 extracts BC-6 without changing Board validators; R5 makes Board sessions durable without changing lifecycle semantics. |
| "Does it handle arbitrary language, or just our examples?" | 26 probes (§13), 20+ outside the Founder test corpus | The gaps map to general capabilities (references, moves, availability, truth, governance, durability). None needed a scenario rule. Interpretation quality stays **NEEDS RUNTIME VERIFICATION** (R1 shadow exists for this). |
| "Hidden runtime callers?" | `attentionObligation` (only via frictionless :1182); `resolveEstateIntelligenceRoute` (hint only at :23607); `approvalEngine` (none); `shouldDeliverOptionalPrompt` (tests only) | Incorporated into §3/§6. |
| "Duplicate authorities remaining in the plan?" | Answer-first (shariAnswerFirst vs Claire) | **Revised:** answer-first becomes a pipeline policy in F2. Claire's behavior generalizes into it rather than being kept as a second mechanism. |
| "Is Founder Decision 2 compatible with code?" | New Day trigger path | **Direct conflict found:** automatic daily wipe. Surfaced in §17 as a conflict; fixed in R5. |
| "Security side effects of landing?" | New routes on R3F-5B | `material-signals` has no auth. Added as an R0 precondition. |

No material unresolved architectural contradiction remains after this pass. The remaining uncertainty is runtime behavior, labeled throughout: model interpretation quality and latency, live Board extractor behavior, and frictionless branch reachability.

---

## 22. Final recommendation

**GO**, with these conditions:

- Begin with **R0** (land the three verified conflict-free stacks behind their existing kill switches, plus the `material-signals` auth fix).
- Then **R1** in shadow mode.
- Do not start R2 until the R1 shadow report shows the interpretation quality and latency on real turns, and the Founder has answered §17.2.
- Every later round follows the D3 template: one authority owns, the others supplement; guarded commits; 0 new test failures; a Founder test on Preview; no scenario keyword patches.

*Self-check (all answered YES after revision):*
- Reconciled against today's repository.
- Branches inspected (644).
- No duplicate of an existing Spark system proposed (F1 generalizes; F10 is proven absent).
- Newer Board, LMC and Claire work preserved and landed first.
- Competing authorities identified.
- Designed for open-ended language, with deterministic safety preserved.
- Reduces systems rather than adding them.
- Every recommendation cites repository evidence.
- Code truth is kept separate from product decisions.
- The sequence is dependency-correct.
- The plan removes the root cause of piecemeal fixes: there will be one owner per turn, one pending authority, one execution pipeline and one context.
