# BRAIN SPARK ESTATE™ — OB-0
## One Brain Full-Loop Convergence Audit

**Type:** Read-only architecture reconciliation. No code, no merge, no deployment, no new layer.
**Subject repository:** `ShariLHudson/adhd-business-companion-vs3`
**Audited trees:**

| Tree | SHA | Why |
|---|---|---|
| `main` | `7e2efec6144c5f1872aa1062b8802cb75c2cd2cf` | What members run today |
| `claude/spark-r0-release-gate-l7edvu` | `0e354024` | The R0 landing candidate. It fast-forwards `main` and adds Stack 1 (Claire / Canonical Truth / LMC), Stack 2 (Executable Intent Round 1) and Stack 3 (Board R3F-5B). Line numbers below refer to this tree unless marked otherwise. |

**Date:** 2026-09-28

**Method.** Five parallel read-only traces, each covering one area:
1. The main `handleSend` pipeline.
2. The specialist rooms.
3. Knowledge and truth.
4. The action chain.
5. An exhaustive inventory of the rules that classify a member's turn.

The load-bearing claims were then re-checked by hand against the source (each re-check is marked **verified**).

**Search note.** No document titled *Final Conversational Intelligence Architecture* exists in the repository on `main` or on the R0 branches. It also does not appear among the 654 remote branch names searched. Its four components (Turn Interpretation, Turn Reading, Turn Obligations, Advancement Gate) are reconciled below as described in the OB-0 brief.

---

## 0. Executive verdict

**Spark Estate does not have one brain yet. It has one declared authority that was never finished, plus about ten components that each describe themselves as the authority.**

1. **The One Brain authority already exists on paper, and it is the right one.**
   - `docs/architecture/CANONICAL_OWNERSHIP_AUTHORITY.md` (ADR, 2026-07-28) names **Boundary (S4)** (`lib/conversationBoundary.ts`) as the single turn-ownership authority.
   - It runs first in `handleSend` (`CompanionPageClient.tsx:16586`) and reads a pure pre-turn snapshot.
   - The ADR's own migration plan was never executed. Specifically, the following are all still open (MA-01/04/05/11):
     - generalizing the snapshot beyond Create,
     - reading the spine's `expectedReply`,
     - demoting the late spine resolver,
     - making fast-path handlers obey Boundary.
   - **Convergence means finishing this ADR and extending Boundary. It does not need a new brain.**

2. **Boundary cannot yet understand what the member is doing with the turn.**
   - Its only output is a *transition*: continue, expand, answer pending, interrupt, switch, return, cancel or unclear (`conversationBoundary.ts:32-40`, **verified**).
   - It has no outcome for:
     - the member asking Spark a question,
     - asking for clarification,
     - "I don't know + help",
     - a correction,
     - modified or partial acceptance,
     - a hypothetical,
     - discuss vs act.
   - Because the parent brain cannot express these moves, **every room re-derives them with its own regex**. That is the root cause of divergence.

3. **The duplication is large and measurable (non-test code):**
   - about **75** "is this a yes" deciders (about 60 of which trigger an action);
   - about **25** decline, about **25** question, about **12** clarification, about **25** "don't know", about **20** correction, about **18** hypothetical and about **25** topic-switch/resume implementations;
   - about **30** emotion classifiers;
   - at least **13** capability registries;
   - about **10** modules whose headers say they are "the" turn authority.
   - Only yes/no has a shared predicate (`lib/conversationConfirmationGate.ts`, `lib/pendingAcceptanceAuthority.ts`), and even that file carries two vocabularies.

4. **Six surfaces run their own member-turn loop outside `handleSend`:**
   - Claire
   - Board intake / meeting
   - Events
   - Strategy Chamber
   - Research
   - VTS wizards

   **Four more run their own step machines inside `handleSend` without consulting Boundary:**
   - Strategy Apply
   - Day Designer
   - Reminder intake
   - Work Recognition / Create entrance

   Only the Board meeting (`boardMemberQuestions.ts:447-521`) and Create's repair module actually **hold** the process when the member asks what Spark meant.

5. **ACT / VERIFY is almost absent from chat.**
   - The model has **no tool calling** (`app/api/companion-chat/route.ts:374-379`), and **no guard compares a reply's action claims against executed actions**.
   - The system prompt tells the model "Spark can prepare calendar events" (`lib/companionPrompt.ts:252`, **verified**).
   - Only **Rhythms** (R0 Stack 2) has the full chain request → slots → execute → read-back → correction, and even there "No, I said Tuesday" is read as a decline (**verified**, see §8).
   - Calendar write does not exist.
   - Events cannot add named speakers.
   - Nothing can answer "What did you just do?".

6. **KNOW is current-only, word-matched and partly legacy.**
   - Canonical Business Understanding has real temporal fields (`supersededById`, `validTo`, `changeReason`).
   - The read path **drops** `changeReason` and `supersedesId` (`readProvider.ts:174-189`, **verified**).
   - Retrieval is token overlap with no temporal intent.
   - A status-less legacy `businessContextSummary()` prose block rides along on every chat turn.
   - Result:
     - "What are we charging now?" → **partially** answerable.
     - "What did we originally plan to charge?" → **not** answerable.
     - "Why did we change the price?" → **not** answerable.

7. **Prerequisite outside this audit.** R0 (Stacks 1-3) is **not on `main`**. The R0 gate report is blocked on Production configuration verification. Every convergence round below assumes R0 lands first, because it contains the canonical-truth authority, the `memberIntent` executable-request stance and the Board move classifier that this plan reuses.

**Verdict:** *Converge by extension, not construction.* Nothing new is required at the brain level:
- Boundary becomes UNDERSTAND + CONTEXT + DECIDE.
- The spine's `expectedReply` becomes the single pending store.
- `memberIntent` + `executionFoundation` become ACT + VERIFY.
- `retrieveRelevantSituation` + canonical BU become KNOW.
- `activeWorkContext` + interruption/return identity become CONTINUE.

**Earliest Founder test of a real One Brain loop:**
- **After OB-2:** the same clarification/hold behaviour across rooms.
- **After OB-4:** the full UNDERSTAND → ACT → VERIFY loop.

---

## 1. One Brain target architecture

```
                                   MEMBER
                                     │  (any surface: main chat, Claire, Board,
                                     │   Events, Strategy, Create, Research,
                                     │   Reminder intake, Day Designer, VTS …)
                                     ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                             ONE SPARK BRAIN                                  ║
║   (= Boundary S4, extended — lib/conversationBoundary*.ts; called by every   ║
║    surface through ONE exported function; no surface-owned interpretation)   ║
║                                                                              ║
║  HEAR ─────── raw text + surface id + pre-turn snapshot                      ║
║               captureBoundaryPreTurnSnapshot (pure, pre-mutation — S4 rule)  ║
║                                                                              ║
║  UNDERSTAND ─ MemberMove  (NEW FIELD on the Boundary decision, not a module) ║
║               ask_spark · clarify · dont_know_help · correct · accept ·      ║
║               accept_modified · accept_partial · decline · defer · answer ·  ║
║               think_aloud · hypothetical · command · pause · resume ·        ║
║               switch · emotional                                             ║
║               + Stance: act | talk_about | none   (from memberIntent)        ║
║               seeded from: conversationConfirmationGate (yes/no),            ║
║               CRCI triggerDetection (repair), Board round3f5c move rules,    ║
║               executableRequest stance rules, turnRecovery (correction)      ║
║                                                                              ║
║  CONTEXT ──── pendingOwnerSnapshot  (ADR step 1: generalize                  ║
║               pendingCreateQuestionSnapshot) reading the spine's             ║
║               ownership.expectedReply (ADR step 2) — the ONE pending store   ║
║               + activeWorkContext pointer + suspended work (existing)        ║
║                                                                              ║
║  KNOW ─────── retrieveRelevantSituation → canonical BU readProvider          ║
║               + TruthLens {current | history | reason}  (field on the query) ║
║               Decision Ledger · Research · Evidence (status-labelled)        ║
║                                                                              ║
║  DECIDE ───── BoundaryDecision = { transition, owner, move, stance,          ║
║               obligation, grant }                                            ║
║               obligation: answer_first | hold_and_explain | act | confirm |  ║
║                           ask_missing_slot | resume | none                   ║
║               grant: may_advance_owner · may_store_as_answer · may_execute   ║
║               (generalizes D3 boundaryGrantsCreateAnswer to every owner)     ║
╚══════════════════════════════╤═══════════════════════════════════════════════╝
                               │ decision (read-only to children)
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ SPECIALIST CHILDREN / CAPABILITIES  (domain content + domain execution only) │
│  Claire(BU write meaning) · Board(Directors) · Chamber(experts) ·           │
│  Strategy(catalog) · Events(foundation Qs) · Projects · Create(blueprints) · │
│  Research(sources) · VTS(structures) · Plan My Day(planner) ·               │
│  Reminders/Rhythms(schedule parsing)                                        │
│  ACT: memberIntent/executableRequest (action + slot extraction)              │
│       → executionFoundation capabilityManifest (the ONE execution manifest)  │
│       → domain adapter (createMemberRhythm, saveReminder, saveProjectItem,   │
│         upsertEventRecord, executeCanonicalWriteTransaction …)              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ VERIFIED RESULT                                                              │
│  VERIFY: read-back → ExecutionReceipt (lib/executionReceipts.ts shape;       │
│          canonicalWriteTransaction plan.verify; rhythm getMemberRhythm)      │
│  UPDATE: domain store / canonical writer (G-0.2 writer boundary)            │
│  LOG:    turnDecisionStore record (finalResponseOwner, actionExecuted,       │
│          receipts[]) — persisted as the member-queryable action history      │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ ONE SPARK BRAIN — ANSWER composition                                        │
│  conversationalTurnContract (prompt job) + child domain content              │
│  → model or local template → certifyCompanionDelivery                       │
│    + receipt-claim guard (no "done/added/scheduled" without a receipt)       │
│  CONTINUE: spine arms expectedReply; activeWorkContext keeps suspended work  │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               ▼
                             MEMBER
```

**What is new?** Four **fields**, one **predicate module** and one **guard**:
- **Fields:**
  - `move`, `stance`, `obligation`, `grant` on the existing Boundary decision
  - `TruthLens` on the existing retrieval query
  - `receipts[]` on the existing turn-decision record
- **Predicate module:** the consolidated move predicates. They live beside Boundary and have only one caller: Boundary.
- **Guard:** a receipt-claim check inside the existing delivery certifier.

Not added: no new router, no new pending store, no new truth store, no new registry, no new runtime.

---

## 2. Complete-loop map

| Stage | What exists | What is authoritative | What is duplicated | What is missing | What can bypass it | Beta risk |
|---|---|---|---|---|---|---|
| **HEAR** | `handleSend` (`CPC:16542`); `captureBoundaryPreTurnSnapshot` (`conversationBoundaryInputs.ts:224`); spine transcript append (`:16613-16626`) | Boundary pre-turn snapshot (S4 invariant, tested) | Rooms with their own inputs capture text separately: Claire `BusinessProfileBp2aPrototype.tsx:1413`, Board textareas, Events `EventsEstateEntrancePanel.tsx:663`, Strategy Chamber, Research | Room text never enters the spine | All room inputs | MEDIUM |
| **UNDERSTAND** | Boundary transition kinds; `classifyQuestionVersusAction`; `decideConversationTurnAuthority`; `classifyPrimaryConversationTurn`; `classifyTurnIntent`; `executableRequest` stance; Board `detectConversationalMove`; CRCI `detectRepairTrigger`; Claire `classifyBusinessUtterance`… | **Nobody.** Boundary is declared but has no move vocabulary | About 75 yes, 25 decline, 25 question, 12 clarification, 25 don't-know, 20 correction, 18 hypothetical, 30 emotion (Audit 1) | A member-move axis on the authority; clarification / ask-Spark outcomes; partial acceptance anywhere | Every room loop; about 40 early returns before the spine resolver | **CRITICAL** |
| **CONTEXT** | Spine `ownership.expectedReply` (`ownership/types.ts:76`); `activeWorkContext`; interruption/return identity (#309); Cognitive Return (#310) | Spine for persistence; `activeWorkContext` for suspended work | At least 20 pending trackers (React refs, 8 localStorage and 8 sessionStorage keys, §Audit 2); Boundary sees pending only for Decision Ledger + Create (`conversationBoundaryInputs.ts:228`); `pendingOffer` is never filled; `recordMainConversationPendingQuestion` has test callers only | One pending snapshot readable by Boundary | Legacy clear at `CPC:16792` drops an armed offer when the member asks "what does that mean?"; model text arms the pending "yes" by regex (`CPC:24409-24485`) | **CRITICAL** |
| **KNOW** | `retrieveRelevantSituation` (`:740`); canonical BU FactRecords with status + temporal fields; `gateRelevantSituationForConversation` status labels; Decision Ledger supersession | Canonical BU + `isLegacyLive` (R0 Stack 1) | Legacy `businessContextSummary()` prose on every turn (`companionStore.ts:1322`); Board and gate label legacy approved fields differently | Temporal/reason lens; `changeReason` on the read path; scenario / retired / seed filtering; durable (Supabase) truth | Legacy prose; model memory of the transcript | HIGH |
| **DECIDE** | `turnAuthority` `allow*` flags; `boundaryClaimedTurn` boolean (read by about 11 sites); router `responsePolicy` (unread); continuity `clarify` (computed, then rejected, `continuityGateConsumptionBoundary.ts:130`); `primaryTurn block*`; governor arbitration | D3 grant (`createTurnRelationship.ts:275`), for Create only | About 7 components decide "who answers / what next" | Explicit obligation (answer-first / hold / act / confirm); a grant for every owner | First-match-wins "yes" ladder of about 20 sites (§Audit 2) | **CRITICAL** |
| **ANSWER / ACT** | Model (no tools); about 180 local reply returns; Rhythm Remember owner; Reminder intake; Hold; Project Coach; Events answers; Board project starter (button); Claire transaction (own surface) | `executionFoundation` (Board starter only); `memberIntent` availability map (Rhythm/Reminder/Calendar) | At least 13 capability registries; direct writers in rooms | Calendar write; project item from chat; event speakers; partial authorization; modified acceptance outside Rhythm | Model text causes actions (`detectAssistantWorkspaceLaunch`, `CPC:24794`); room writers | HIGH |
| **VERIFY** | Rhythm read-back (`frictionlessActionLayer.ts:1716`); `canonicalWriteTransaction` `plan.verify`; Board `executeBoardDecisionProjectStarter` verify + receipt; Create Current Focus durable save | These three patterns | Each has its own receipt shape | Receipts for Reminder / Hold / Project / Events; a reply-vs-receipt guard; an action history | Model claims; "saved" when the durable flag is off; Sheets ack not gated on the link | **CRITICAL** |
| **UPDATE** | Canonical writer boundary G-0.2 (36/36 green); domain localStorage stores | G-0.2 for business truth | Seed/demo writes into the same store as CONFIRMED | Supabase persistence for BU/rhythms/reminders/projects/events; sample flag | Events writes every turn without confirmation | HIGH |
| **CONTINUE** | Boundary return/suspend + `applyConversationBoundaryToActiveWork`; `activeWorkContext`; spine arming; `conversationSuspension`; Work Thread Outcome Return | `activeWorkContext` + interruption/return identity | `workspaceResume`, `matchResumeIntent`, `conversationHandoffRecovery`, the router `RESUME_RE`, … (about 25 resume/switch predicates) | Room surfaces do not register suspended work; the Rhythm active request expires on reload (G8) | Room loops | MEDIUM |

---

## 3. Primary question: why the same sentence is handled differently by room

Every cause below was verified against code. Each is a material cause on its own.

1. **The parent cannot express the member's move.** Boundary has no `ask_spark`, `clarify`, `dont_know_help`, `correct`, `accept_modified`, `accept_partial`, `hypothetical` or `command` outcome (`conversationBoundary.ts:32-40`). Each child therefore decides these moves itself.

2. **Rooms own their own input loops.** Their text never reaches Boundary:
   - Claire (`BusinessProfileBp2aPrototype.tsx:503-741` → `/api/claire-reasoning`)
   - Board intake / meeting (`/api/board/deliberate`)
   - Events (`advanceEventsEntranceUnderstanding`)
   - Strategy Chamber (`applyGuidedJourneyAnswer`)
   - Research (`handleResearchTurn`)
   - VTS wizards

3. **The same sentence meets a different regex in each room.** Example: "I don't know what you mean. Can you explain that before we keep going?"

   | Room | What happens today |
   |---|---|
   | Board meeting | `CLARIFICATION_RE` → question **held open** ✅ |
   | Create builder | CRCI repair → clarifies ✅ |
   | Events | `/\bi don't know\b/` → **`defer`**; question paused; **next question asked** ❌ (`applyEventConversationalAnswer.ts:119-150`, **verified**) |
   | Claire | `isIdkOrUncertain` → **business-uncertainty coaching**, never re-explains her own question ❌. During a pending confirmation the reply is `unrecognized` → decline branch → **candidate discarded** ❌ |
   | Strategy Chamber / Apply | stored as the answer; **advances** ❌ |
   | Day Designer | stored as `mustDoToday`; **plan built** ❌ (`dayMessages.ts:64-91`, **verified**) |
   | Board intake | stored as the member's concern; **advances** ❌ |
   | Reminder intake | re-asks "When would you like me to remind you?" and **never answers**. With a missing event, it **overwrites the title with the text** ❌ |
   | Main chat | Boundary → `unclear`/continue. The legacy confirmation clear (`CPC:16792`) **drops the armed offer**. The model then answers (usually well, but ungoverned) ⚠️ |

4. **Pending binding is decided by a first-match ladder, not by the authority.** About 20 sites can bind a bare "yes" in order (§Audit 2, B-3). Examples that skip Boundary:
   - Board invite (`CPC:17128`, **verified**: `isBareGenericAcceptance` with no `boundaryClaimedTurn` check)
   - Chamber invite (`:17202`)
   - VTS menu (`:18763`)
   - Reminder intake (`:18183`)

5. **The late spine resolver is a second authority.** `resolveConversationOwnership` (`CPC:19663`) runs after about 40 early returns, reads already-mutated stores and never reads the Boundary decision (ADR §Evidence).

6. **Several modules each claim to be "the" authority:**
   - `conversationSession/types.ts:2` ("sole durable conversational authority")
   - `shariAnswerFirst/turnAuthority.ts:1-8` ("one decision owns each turn")
   - `conversationRouter/routeConversationTurn.ts:2` ("authoritative turn arbiter")
   - `turnDecisionStore.ts:1-7` ("immutable turn decision", which starts only at `:17793`, after 15+ returns)
   - the continuity gate (`CPC:17240`)

   The roadmap (`ARCHITECTURE_STABILIZATION_ROADMAP.md` Phase 1) still names the spine as authority and contradicts the later ADR.

7. **Discuss vs act is decided per capability.** `executableRequest` stance (talk_about / act) exists only for Rhythm/Reminder. Create uses `isExploratoryCreation`, Events uses `EVENT_EXPLORATORY_UTTERANCE_RE`, Claire uses `SCENARIO_PATTERNS`, and Board uses `TENTATIVE_RE`. "I'm thinking about adding X" is therefore safe for Rhythms and Create but not uniformly elsewhere.

8. **Frictionless re-decides Create ownership.** The page does not pass `boundaryDecision` into `resolveFrictionlessAction`, so its internal Create gate (`frictionlessActionLayer.ts:2765-2785`) reclassifies. It does this even though its comment says "Honor the single Boundary authority".

9. **The model is both unguarded and causal.**
   - It can claim actions it did not take. The only defence is prompt text, and the prompt contradicts itself on calendar.
   - Its output also *drives* state: workspace launch from "opening…" text (`CPC:24794-24812`), and arming the next turn's "yes" owner (`:24409-24485`).

10. **Knowledge differs by room.** Board treats legacy `estate.approved:*` values as *unconfirmed*, while the chat gate labels the same values *member-established* (`readProvider.ts:103` vs `businessUnderstandingContext.ts`). Claire gets at most 3 subject-filtered items; Chamber and Strategy get policy-filtered blocks; main chat also gets legacy prose.

11. **Persistence differs by surface.** Some pending state lives in React refs (lost on reload), some in sessionStorage (per tab) and some in localStorage (per device). Owners therefore disagree about whether something is pending after a reload or on another device.

---

## 4. Audit 1 — Duplicate brain functions

Legend: **K** keep · **G** generalize · **D** demote to fallback/consumer · **R** retire.

**Target owners:**
- **UB:** the Boundary move axis (UNDERSTAND)
- **CB:** the Boundary context snapshot (CONTEXT)
- **DB:** the Boundary obligation/grant (DECIDE)
- **KW:** the retrieval truth lens (KNOW)
- **AX:** memberIntent + executionFoundation (ACT)
- **VR:** receipts + delivery guard (VERIFY)

### 4.1 Self-declared turn authorities

| File / function | Current owner | Decides | Scope | Verdict | Target | Migration dependency |
|---|---|---|---|---|---|---|
| `lib/conversationBoundary.ts:399 resolveConversationBoundary` + `conversationBoundaryInputs.ts:224/243` | Boundary S4 | Transition kind from the pre-turn snapshot | Global | **K + G** (add move/stance/obligation/grant) | UB / CB / DB | R0 landed; ADR steps 1-2 |
| `conversationSession/ownership/resolveOwnership.ts:90` (+ `claimTurnOwnership`, `adaptLegacyOwnership`) | Spine | Release/transfer/continue the owner, late | Global | **D** → persistence and execution of Boundary's owner (ADR step 4) | CB (store) | OB-3 |
| `shariAnswerFirst/turnAuthority.ts:101 decideConversationTurnAuthority` | Answer-first | Owner + `allow*` flags; no Boundary input | Global | **D** → its answer-first rules become `obligation` values | DB | OB-1/OB-2 |
| `shariAnswerFirst/questionVersusAction.ts:192` | Answer-first | Question vs action (`explicit_creation`) | Global | **G → merge** into the move reader | UB | OB-1 |
| `conversation/primaryTurnClassifier.ts:158` | Page | nav / task / emotion / info + `block*` | Global | **D** to fallback until move parity, then **R** | UB | OB-1 → OB-3 |
| `conversationRouter/routeConversationTurn.ts` + `classifyTurnIntent.ts` | Router | Intent + navigate effect; `responsePolicy` unread | Global | **D** → navigation executor only | AX (navigation) | OB-3 |
| Continuity gate (`resolveContinuityGate.ts`, CPC `:17495-17676`) | Continuity | Sticky owner, destination, invites | Global | **D** → claim input to the Boundary snapshot | CB | OB-3 |
| `conversationStabilization/turnDecisionStore.ts` | Stabilization | Per-turn record (starts late) | Global | **K**; start at HEAR; add `receipts[]`; persist | VR | OB-4 |
| `companionTurnArbiter.ts` / `companionGovernor.ts:139` | Governor | Which offer surfaces (state-based) | Global | **D** → runs only after the DECIDE obligation is `answer_first`/`none` | DB consumer | OB-3 |
| `conversationGate/conversationalTurnContract.ts` | Gate | Prompt "job"; `presenceOnlySupport` reclassifies (`~:139`) | Global | **K** as ANSWER composer; **R** its internal reclassification | DB consumer | OB-2 |
| `frictionlessActionLayer.ts:6017 resolveFrictionlessAction` (+ `resolveFrictionlessForPrimaryTurn :5689`) | Frictionless | About 50 sub-flows; its own Create gate | Global | **D** → capability executor; must receive `boundaryDecision` | AX | OB-3 |

### 4.2 Member-turn judgments (counts from the exhaustive non-test inventory)

| Judgment | Count | Best existing seed (keep/generalize) | Duplicates to demote/retire (representative) | Target |
|---|---|---|---|---|
| Acceptance / yes | ~75 (60 action-binding) | `conversationConfirmationGate.ts:278 isBareShortAcceptanceText`, `:290 isShortAcceptanceOfArmedOwner`; `pendingAcceptanceAuthority.ts:28 GENERIC_ACCEPTANCE_RE` | `isAffirmativeReply.ts:5`, `frictionlessActionLayer.ts:670`, `workRecognitionFallthrough.ts:298` (the same regex three times); two different `isActionAcceptance`; Claire `confirmationContract.ts:18`; Board `classifyMemberResponse.ts:30`, `classifyCommitmentResponse.ts:14`; about 18 Create approval regexes; Estate `activeTaskLock.ts:330`, `estatePlaceNavigation.ts:107` … | UB (`accept`) |
| Decline / defer | ~25 | `conversationConfirmationGate.ts:196 isPureConfirmationDecline`, `:213 isDeclineOrDeferral` | `conversationCommitmentEngine/affirmation.ts:11` = `conversationWorkflowContinuation.ts:106`; Board `EXPLICIT_DECLINE_RE` / `NOT_YET_RE`; Events `eventConversationControl.ts:38`; Claire `REJECT_PATTERNS`; Create ×4 | UB (`decline`, `defer`) |
| Modified / partial acceptance | ~8 | `memberIntent/executableRequest.ts:501 interpretRememberReply` (modified); Claire `confirmationContract.ts:29/41` (partial/modify) | `decisionConfirmationAffirmation.ts:16`; Board `MODIFY_*_RE`; `builderContentSync.ts:28` | UB (`accept_modified`, `accept_partial` + scope) |
| Question to Spark | ~25 generic | `questionVersusAction.ts:192` | `workspaceIntent.ts:115`, `bridgeResponderGuard.ts:63`, `createTurnRelationship.ts:54 DETOUR_QUESTION_RE`, `builderContentSync.ts:54`, Board `extractMemberQuestion`, Chamber `classifyStrategicInput.ts:119`, two different `isKnowledgeQuestion` … | UB (`ask_spark`) |
| Clarification / repair | ~12 | `conversationRepairClarificationIntelligence/triggerDetection.ts:34/50`; Board `classifyMemberBoardResponse.ts:27 CLARIFICATION_RE` | `topicContinuityAnchorIntelligence/clarificationDetection.ts` (11 files); `workspaceIntent.ts:61` (same name); `companionMistakeRecovery.ts:165`; `vagueOfferRepair.ts:21`; `rhythms/fromContent.ts:53` | UB (`clarify`) |
| Don't know (+ help) | ~25 | `activeTopicGate.ts:158 expressesGenuineUncertainty` | Claire `claireAnswerDepth.ts:100`; Board ×2 `DONT_KNOW_RE`; Chamber ×2; Events (via `defer`); VTS `visualBeginnerChoice.ts:12`; Create ×3; Reminder `helpMeChoose.ts:118` | UB (`dont_know_help`, distinct from `clarify`) |
| Correction | ~20 | `shariAnswerFirst/turnRecovery.ts:33/79`; `executableRequest.ts:535 detectSubjectCorrection` | `companionMistakeRecovery.ts:104/148`; `workflowCorrection.ts:9` (over-broad: matches "stop", "i'm not"); Claire ×4; Board `CORRECTION_RE`; Events `applyCorrections`; `pendingChoice/parseSelection.ts:183` | UB (`correct` + target) |
| Hypothetical / think-aloud | ~18 | `executableRequest.ts:130-158` (hypothetical, thinking-aloud, aspiration, negation, past tense, capability question); `creationExecutionEligibility.ts:115 isExploratoryCreation` | Events `EVENT_EXPLORATORY_UTTERANCE_RE`; Claire `SCENARIO_PATTERNS` / `TENTATIVE_PATTERNS`; Board `TENTATIVE_RE`; `settledDecisionAuthority/decisionPosture.ts:15`; `pertinentQuestionEngine/badPatterns.ts:35` | UB (stance) |
| Discuss vs act / command | ~16 | `executableRequest.ts:397 resolveExecutableRequest` stance | Five "explicit create" predicates (`messageClassification.ts:458`, `companionTurnArbiter.ts:72`, `sparkRecognitionEngine/createGate.ts:10`, …); `estateCommandRouter.ts:413`; Chamber `resolveStance` | UB (stance) + AX (action extraction) |
| Topic switch / resume / exit | ~25 | Boundary (`EXPLICIT_CANCEL_RE`, `TEMPORARY_DETOUR_RE`, return); `activeWorkContext` | `exitRules.ts:5`, `activeTopicGate.ts:29`, `topicChangeDetection.ts:6`, router `CANCEL_RE`/`RESUME_RE`, `pendingChoice/resolve.ts:53-56`, `workspaceIntent.ts:72-144`, `matchResumeIntent.ts:102`, `workspaceResume.ts:21`, Board `TOPIC_CHANGE_RE` … | UB / CB (already Boundary's job) |
| Emotion / frustration | ~30 | `adhdEmotionalFrictionIntelligence.ts:47/76`; `conversation/overwhelmNeedClassifier.ts:54`; Boundary `hasEmotionalUrgency` | `detectEmotionalState` (called 3× per turn, two same-name implementations); `turnAuthority.ts:64`; `primaryTurnClassifier.ts:73`; `bridgeResponderGuard.ts:51`; Chamber `isChamberFrictionTurn`; VTS ×2; Estate ×5 … | UB (`emotional` + intensity); domain tone stays in children |
| Help request | ~14 | `chatFastPath/vagueHelpLocal.ts:7` | Three `VAGUE_HELP_RE` copies; Board `detectHelpRequest`; `createSectionDiscovery.ts:313`; `talkItOut/reflectiveEngine.ts:98` | UB (`dont_know_help` / `ask_spark`) |
| Reference resolution | ~11 | `activeWorkContext/routingEnrichment.ts:56 isReferentialTurn`; `mostRecentMeaningWins.ts:175` | VTS `referentSignals.ts`; Create `documentContinuityClassifier.ts:47`; Reminder `REFERENCE_ONLY_RE`; Chamber `PRONOUN_LED_RE` | CB (referent = pending owner / active work / last receipt) |
| Action extraction / capability selection | ~20, over at least 13 registries | `executableRequest.ts:98 detectCapabilities`; `executionFoundation/capabilityManifest.ts` (execution truth) | `companionCapabilityRegistry.ts` (claims a calendar owner that does not exist); `estateBrain/capabilityRegistry.ts`; `estateCapabilityRegistry/*` (word-overlap scorer → Study Hall misroutes); `universalBlueprintInterface/capabilityManifest.ts` (hard-codes `calendar: true`); `resolveExplicitCapabilityIntent.ts`; `sparkSharedCapabilities`; dead `strategyChamberActionRouting.ts` | AX. Navigation-discovery registries **D** (may open rooms; may never claim execution) |
| Current-truth selection | 2 paths + legacy | `retrieveRelevantSituation` + `readProvider` + `isLegacyLive` | `businessContextSummary()` legacy prose; Board's own legacy labelling | KW |
| Process advancement | about 10 room step machines | D3 grant (`createTurnRelationship.ts:275`); Board `heldOpenIds` | Events, Strategy ×2, Day Designer, Board intake, Create entrance, Work Recognition, Reminder, Current Focus | DB (`grant.may_advance_owner`, `may_store_as_answer`) |
| Execution authorization | per capability | Round 1 rule ("bare yes binds only to the previous-turn offer"); Board `buildAuthorizationReceipt` | Reminder/Hold/Project Coach/Events write without it | DB (`grant.may_execute`) + AX |
| Execution verification | 3 patterns | Rhythm read-back; `canonicalWriteTransaction` verify; `executeBoardDecisionProjectStarter` verify | Reminder, Hold, Projects, Events, Sheets have none | VR |
| Reply obligation / answer-first | about 5 | `turnAuthority` answer-first; `conversationalTurnContract`; Claire prompt answer-first rules | `certifyCompanionDelivery` repairs; Chamber `applyChamberUnderstandingGate` (replaces the draft after the model) | DB (`obligation`) |

---

## 5. Audit 2 — Bypass inventory (ranked)

| # | Bypass | Evidence | Can | Risk |
|---|---|---|---|---|
| B-1 | The model reply claims actions with no receipt check. The prompt says Spark "can prepare calendar events". | `route.ts:374-379` (no tools); `companionPrompt.ts:252` (**verified**); `certifyCompanionDelivery.ts:150-170` (research only); `trustContract/scrub.ts` scoped to Create | claim execution | **CRITICAL** |
| B-2 | Events loop: a clarification is stored as `defer` or as the answer; the EventRecord is written every turn without confirmation or read-back. | `applyEventConversationalAnswer.ts:119-150, 296-412` (**verified**) | advance · write truth · ask next | **CRITICAL** |
| B-3 | Model text arms the next turn's "yes" owner by regex (`shouldArmPendingQuestion`), so a later "yes" binds to something Spark only said. | `CPC:24409-24485`; `conversationConfirmationGate.ts:114` | bind pending · execute | **CRITICAL** |
| B-4 | Rhythm correction read as decline: "No, I said Tuesday" → "I've left it as it is." | `conversationConfirmationGate.ts:148`, `frictionlessActionLayer.ts:1986-1993` (**verified**) | wrong answer; loses the correction | HIGH |
| B-5 | A legacy confirmation clear drops the armed offer whenever the text is not yes/no, including a clarification question. | `CPC:16792-16800` | destroy pending | HIGH |
| B-6 | Board/Chamber invite "yes" binds without consulting Boundary. | `CPC:17128` (**verified**), `:17202` | bind · navigate | HIGH |
| B-7 | Claire: a question during a pending confirmation → decline → the candidate is discarded; "I don't know what you mean" → business-uncertainty coaching. | `BusinessProfileBp2aPrototype.tsx:598-607`; `claireConversation.ts:254-265` | advance · drop pending | HIGH |
| B-8 | Step machines advance over any reply: Day Designer, Strategy Apply, Strategy Chamber, Board intake, Create entrance, Work Recognition resumption, Current Focus. | `dayMessages.ts:64-91` (**verified**); `strategyApplyCoach.ts:211-237`; `guidedJourney.ts:134-140`; `boardDirectorDiscussion.ts:629-665`; `entranceUnderstanding.ts:301-337`; `workRecognitionFallthrough.ts:401-449` | advance · store non-answers as answers | HIGH |
| B-9 | Reminder intake writes as soon as slots fill (no confirmation, no read-back), overwrites the event title with member text, and a "yes" to a reminder offer is silently dropped. | `reminderIntelligence.ts:600-604, 653`; `frictionlessActionLayer.ts:1401` | write · lose request | HIGH |
| B-10 | Suspected (from reading the code, not reproduced): a Decision Ledger confirmation "yes" makes Boundary return `answer_pending_question`, so `boundaryClaimedTurn` skips the only consumer. | `CPC:16605-16611`, `:18548` (**verified** code path) | drop the authorized write | HIGH (verify first) |
| B-11 | Model text causes navigation: "opening…" → workspace launch; chat artifact handoff. | `CPC:24794-24930` | navigate | MEDIUM |
| B-12 | `resolveFrictionlessAction` is not given `boundaryDecision`; its internal Create gate re-decides. | `frictionlessActionLayer.ts:2765-2785` | re-own the turn | MEDIUM |
| B-13 | The VTS menu pick skips `boundaryClaimedTurn`. | `CPC:18753-18783` | bind · navigate | MEDIUM |
| B-14 | Attention Hold and Project Coach write immediately, with no confirmation and no read-back. | `attentionObligation/conversation.ts:128-141`; `projectCoachSession.ts:106-146` | write · claim | MEDIUM |
| B-15 | "my calendar" → "I'll open your calendar" (navigates away); a calendar-only request has no owner and falls to the model. | `resolveExplicitCapabilityIntent.ts`; `executableRequest.ts:404-406` | navigate · model claim | MEDIUM |
| B-16 | The Research word-overlap scorer routes "I need you to call Susan" to Study Hall. | `estateCapabilityRegistry/consult.ts` (Round 1 G5) | navigate | MEDIUM |
| B-17 | Create "saved" is announced unconditionally when the durable flag is off; the Sheets ack is not gated on link validation. | `ContentGeneratorPanel.tsx:769-779`; `CPC:15584` | claim | MEDIUM |
| B-18 | The Chamber understanding gate replaces the model draft after generation, with its own help-mode reading. | `certifyConversationDelivery.ts:118-130`; `chamberUnderstandingGate.ts:191-293` | re-interpret after DECIDE | LOW-MEDIUM |
| B-19 | Continuity `route_to_owner` injects a synthetic `primaryTurnDecision`. | `CPC:17572` | re-own | LOW-MEDIUM |
| B-20 | `/api/claire-reasoning` is unauthenticated (P1 security, pre-existing; R0 report §9). | `app/api/claire-reasoning/route.ts` | paid model relay | Security P1 (outside One Brain, but must close before beta) |

---

## 6. Audit 3 — Specialist-child contracts

**The contract every child follows:**
- **Input from One Brain:** `BoundaryDecision { move, stance, obligation, grant, owner, transition }`, `ContextSnapshot { pendingQuestion (role + affordance), activeWork, suspended }`, `KnowSlice` (status-labelled, lens-tagged items the child is authorized for, via `authorizedEstateConsumption` policies that already exist), and member text.
- **Output back to One Brain:** `ChildResult { content (domain answer / next domain question), proposedAction? {capability, slots, missing[]}, receipts[] (only if the grant allowed execution), pendingQuestion? (to arm on the spine), suspendable work handle }`.
- **The child must never independently decide:** the member's move, stance, whether a "yes" binds, whether to advance over a question, whether to execute, whether something happened (without a receipt), current vs historical truth, or topic switch/resume.

| Child | 1. Legitimately belongs to the child | 2. Currently in the child but belongs to One Brain | 3. Extra inputs | 4. Output | 5. Never decides |
|---|---|---|---|---|---|
| **Claire** | BU concept roadmap; write-meaning (ESTABLISH/CORRECT/RETIRE/SCENARIO → never-write kinds, `writeMeaningAuthority.ts:118-150`); candidate + confirmation contract content; canonical write transaction; re-ask contract; Claire's voice | `detectMetaQuestionKind`, `classifyDirectQuestion`, `detectMemberControlKind`, `isIdkOrUncertain`, confirmation-reply parsing (yes/no/partial/modify), her own response-path routing | The pending candidate as the snapshot's `pendingQuestion`; the BU current + history lens | Explanation text or next BU question; write candidate; transaction receipt | Whether "what do you mean?" is a decline; whether "I don't know" is about her question or the business |
| **Board** | The seven Directors, reasoning protocols, cross-exam, synthesis, "one material question", the no-advice contract (BC-6), provenance boundary (BC-P0), Board-decision → project proposal | The round3f5c move classifier (**promote it into the move predicates**; it is the best one in the repo); intake step machine advancing on any text; decision-reply regexes; invite "yes" | Meeting open questions as `pendingQuestion`s; the authorized BU slice | Director turns; held/answered question ids; authorization receipt for the project starter | Whether a member answer is a decision (BC-6 already says no); whether to advance intake over a question |
| **Chamber** | Expert registry, expert prompts, authorized context block | `understandChamberTurn` help-mode reading after generation (it replaces the draft); `isChamberFrictionTurn`; `isChamberUnsurePhrase`; turn lock that blocks other handlers | The move and obligation (answer / teach / explain) given before generation | Expert content | Re-reading the member after DECIDE |
| **Strategy** | Strategy catalog, epistemic tagging of answers (evidence / assumption / concern), plan building, decision record | Guided-journey and Apply step machines that advance on any text; `isWorkflowConceptQuestion`; offer "yes" | `grant.may_store_as_answer` | Next strategy question or teaching content; proposed plan items (as actions) | Advancing over `ask_spark` / `clarify` / `dont_know_help` |
| **Events** | Foundation question sets, adaptive map, event asset registry, Projects bridge, domain slot semantics (dates, headcount, platform), **a future speaker/person slot** | `detectDisposition` (defer/skip/redirect), `classifyFoundationPauseKind`, regex corrections; writes every turn | `grant.may_store_as_answer`, `grant.may_execute`; the active event as `activeWork` (so no restart of intake) | Proposed EventRecord patch + missing slots; receipt after write | "I don't know what you mean" = defer; writing without a grant |
| **Projects** | Store, trash/restore, next-step helpers, project brain content | Project Coach direct writes; `saveProjectWithResult` "persisted" boolean as the receipt | Project identity resolved by CONTEXT (active work / named project) | Receipt from a re-read | Claiming "added" without a read-back |
| **Create** | Catalog, blueprints, discovery questions, revision detection, durable creation record, 45-second undo | `createTurnRelationship` regexes (partly Boundary-gated already, the D3 model); Work Recognition first refusal and entrance understanding (not gated); about 18 approval regexes; five explicit-create predicates | Already consumes Boundary (the template for everyone) | Draft + receipt (durable path) | "Saved" without a receipt; capturing "create a reminder" (Round 1 fixed that for Rhythms only) |
| **Research** | Source honesty, live retrieval decision, finding/observation model, research truthfulness certification | Its own loop (acceptable: research is a model-led domain); routing scorer that steals imperative requests | The KNOW lens (research findings are labelled `research_finding`, never current truth) | Findings with provenance | Being selected by word overlap for non-research commands |
| **VTS** | Visual classifier/lexicon, structures, wizards, learning handoff | Chat menu pick that skips Boundary; recovery of pending from the last assistant text | `pendingQuestion` for the menu | Structure + open-workspace action | Binding a "yes" without a grant |
| **Plan My Day** | Day planner, energy/motivation models, adaptation buckets | Day Designer step machine that advances regardless; `isAdaptMyDayIntent` offer regex | `grant.may_store_as_answer` | Next planner question / plan proposal; receipt for `recordDayPlan` | Storing "what do you mean?" as a must-do |
| **Reminders / Rhythms** | Time, recurrence and cadence parsing, dedup (`findSimilarActiveRhythm`), schedule semantics, stores | Remember owner's stance and reply interpretation (**hand these to the move predicates**; the slot machine stays here); reminder intake loop | Move/stance; the grant | Missing slots; receipt from a re-read | Treating "No, I said Tuesday" as a decline; writing reminders without a read-back |

---

## 7. Audit 4 — Knowledge correctness map

**Authoritative structured truth**
- **Canonical BU FactRecords.** Types are in `lib/profile/businessUnderstanding/types.ts:33-75`:
  - status DRAFT / HYPOTHESIS / RESEARCH-SUPPORTED / NEEDS-REVIEW / CONFIRMED;
  - provenance member_statement / member_approval / research_import / inference / migration / specialist_session;
  - temporal fields `supersedesId`, `supersededById`, `validFrom`, `validTo`, `changeReason`, `confirmedAt`;
  - an append-only `provenanceLog` with reasons.
- Written only through `canonicalWriteTransaction` (`plan.verify` re-read) and guarded by G-0.2.
- **Stored in localStorage only** (`companion-business-profile-v1`).
- **Decision Ledger** (`companion-decision-ledger-v1`): `supersedes` / `supersededBy`; no reason field.

**Conversation-derived information**
- Write-side `TemporalMeaning` (current / historical / future_planned / scenario) and `ReportingSource` (member / third-party / research) exist (`writeMeaningAuthority.ts:15-28`).
- **Historical and planned statements are blocked from being written** (`:127-150`). "We originally planned $99" is therefore never stored as history.

**Historical / superseded truth**
- Present in BU (`includeSuperseded` option, `readProvider.ts:233`) and visible only in LMC UI lenses (`BusinessEstateLivingModel.tsx:30`, `BoardLivingModelOverlay.tsx:24`).
- `changeReason` and `supersedesId` are **dropped** by `factToProjectionFact` (`readProvider.ts:174-189`, **verified**).
- `getBusinessUnderstandingProvenanceLog` has no consumers.
- Offers are **updated in place**, not superseded.

**Research / evidence**
- Research library, append-only observations, evidence bank, and an optional Supabase `evidence_vault` domain behind a flag.
- Retrieved items are labelled `research_finding`, the only type with `freshness`.

**Retrieval**
- `retrieveRelevantSituation` uses token overlap plus a distinctive-value boost, always at `asOf = now`, capped at 12 items.
- `aim` is inert. **No embeddings, vectors or RAG anywhere.**

**Memory / context**
- Session memory, Companion Brain day state, conversation context (sessionStorage) and estate memory.
- None of these is business truth.

**Sample / demo**
- `bp2bWriteSeed.ts` and `demoSeed.ts` write CONFIRMED facts into the **same** store.
- There is no per-fact sample flag; isolation is enforced by an importer allowlist in tests.

**What reaches the chat model**
- The gated situation block, status-labelled (`[member-established]`, `[hypothesis (not settled)]`, …, `gateRelevantSituationForConversation.ts:101-222`).
- The **legacy status-less `businessContextSummary()`** block on every turn (`CPC:23425-23443`).
- Decision Ledger history as "(previously X — superseded)".

### 7.1 The pricing test

| Question | Needs | Today | Why |
|---|---|---|---|
| "What are we charging now?" | Current CONFIRMED price | **Partial.** Found only if tokens overlap. It is summarized as raw `JSON.stringify` (the `quantityFactSummary` helper is unused, `factRecord.ts:35-47`). The legacy `sells:` prose may disagree. Scenario edges and retired offers can leak in as settled truth (`collectBusinessUnderstandingItems.ts:185-218`; offer lifecycle is not filtered, `readProvider.ts:263`, **verified**). | No lens; no dedupe of legacy prose |
| "What did we originally plan to charge?" | Earliest version / planned value | **No** | No read-side historical intent; planned values are never written; the supersession chain is never exposed to chat |
| "Why did we change the price?" | `changeReason` / provenance log | **No** | Reason dropped in projection; provenance log unconsumed; the Ledger has no reason field |

### 7.2 Can historical truth override current truth, or current truth block history?
- **Override:** the R0 `isLegacyLive` fix stops a retired legacy value from resurfacing through retrieval (`r0LegacyTruthResurfacing` test). The legacy prose block is **not** covered and can still contradict current truth.
- **Blocking:** yes. Current-only retrieval makes historical questions unanswerable, so the model improvises from the transcript.

### 7.3 Where RAG / hybrid retrieval could help (and where it must not)
- **Could help (recall only):** long research notes, evidence vault items, past conversation transcripts, and Board/Chamber session artifacts. These are unstructured corpora where token overlap misses paraphrase. Any retrieved item must pass through the existing epistemic labels and the lens. It is **never** labelled `member_established`.
- **Must not replace:** current price, offer, audience or any FactRecord. The answer to "what are we charging now?" is a **structured lookup** (path + `isFactRecordCurrent`), not a semantic neighbour. RAG would *increase* the historical-overrides-current risk, because superseded statements are semantically closer to the question than the current one.
- **Order of work:** lens + reason pass-through + legacy-prose demotion first (OB-6). Then evaluate hybrid recall **empirically** against a labelled question set before adopting it (post-beta).

---

## 8. Audit 5 — Action correctness map

Chain: Request → Understand → Resolve → Slots → Authorize → Execute → Read-back → Update → Continue.

| Capability | Req | Und | Res | Slots | Auth | Exec | Read-back | Update | Continue | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **Rhythm** (R0 Stack 2) | ✅ | ✅ stance | ✅ `executableRequest` | ✅ subject/cadence | ✅ direct = act; offer = previous-turn yes | ✅ `createMemberRhythm` | ✅ `getMemberRhythm` | ✅ | ⚠️ modify/rename ✅; **"No, I said Tuesday" → decline ❌**; expires on reload | **Best in repo** |
| **Reminder** | ✅ | ⚠️ own parser | ✅ | ✅ time/am-pm/event | ❌ writes on fill | ✅ `saveReminder` | ❌ | ✅ | ❌ session cleared; offer "yes" dropped (`:1401`) | Partial |
| **Attention Hold** | ✅ | ⚠️ | ✅ | ⚠️ trigger | ❌ | ✅ | ❌ | ✅ | ❌ | Partial |
| **Calendar** | ✅ recognized | ✅ | ❌ `not_available_from_chat`; calendar-only → no owner | — | — | ❌ no write (only links / .ics from UI; `GOOGLE_SETUP.md` has no calendar scope) | — | — | Named honestly only when paired with a Rhythm/Reminder | **Missing** |
| **Projects** (chat) | ⚠️ Project Coach only when the panel is open | ❌ | ❌ | ❌ | ❌ | ✅ `saveProject*` | ❌ echoes text | ✅ | ❌ | Partial / missing |
| **Board → Project starter** | button | n/a | ✅ manifest | ✅ readiness | ✅ Authorization Receipt | ✅ | ✅ verify + receipt | ✅ run store | ⚠️ not reachable from chat; no undo despite `REVERSIBLE_INTERNAL` | Full, not conversational |
| **Events** | ✅ own panel | ⚠️ regex | ⚠️ | ⚠️ foundation Qs | ❌ writes every turn | ✅ `upsertEventRecord` | ❌ (diagnostic-only verifier) | ✅ + Projects sync | ⚠️ regex corrections for duration/headcount/platform only; **no speakers/person list** | Partial |
| **Plan My Day** | ❌ from chat (Day Designer builds a plan without verify) | — | — | — | ❌ | UI only | ❌ | — | — | Missing from chat |
| **Create** | ✅ | ✅ Boundary-gated (D3) | ✅ | ✅ discovery | ✅ consent | ✅ panel | ⚠️ receipt only when the durable flag is on | ✅ | ✅ park/resume; 45-second undo | Mostly full (UI-executed) |
| **Google Sheet** | ✅ | ⚠️ | ✅ | ✅ intake | ✅ yes | ✅ | ⚠️ link validated but ack not gated | ✅ | ❌ | Partial |
| **Business Profile** (Claire) | ✅ own surface | ✅ | ✅ | ✅ candidate | ✅ confirmation contract | ✅ transaction | ✅ `plan.verify` | ✅ ledger | ⚠️ question → decline defect | Full (separate surface) |

**Action examples A-L against today's code (R0 tree):**

| # | Member | Today | Gap |
|---|---|---|---|
| A | "Add a dentist appointment to my calendar October 8 at 2." | No calendar write. Calendar-only request → owner null → `resolveExplicitCapabilityIntent` may say "I'll open your calendar", or the model answers under a prompt that says Spark "can prepare calendar events" | Capability missing; false-claim risk (B-1, B-15) |
| B | "I'm thinking about adding a dentist appointment." | `executableRequest` stance `talk_about` → no write ✅ (for Rhythm/Reminder vocabulary). The model may still offer | Stance not global |
| C | "Add customer testimonials to my landing-page project." | No chat project capability; Create eligibility may capture "add … landing page" → Create interview/open | Project identity + item capability missing |
| D | "…work on my conference and add Susan and David as speakers." | Events is not a chat capability; the Events panel has no speaker list; text would be merged into whatever section is active | Domain slot + capability + compound handling missing |
| E | "Yes, but make it 4:00." | Rhythm ✅ (`interpretRememberReply`). Everything else ❌ | Move not global |
| F | "Do the first two, not the third." | Missing everywhere (`parseSelection` handles one choice) | Partial authorization missing |
| G | "Don't do it yet. I'm just thinking." | Rhythm/Reminder: negation/deferral clears ✅. Elsewhere, depends on the room | Stance not global |
| H | "No, that's wrong. I said Tuesday." | Rhythm: **read as decline** ❌. Board meeting: correction ✅. Events: regex subset | Correction move not global; decline swallows corrections |
| I | "What did you just do?" | No action history; answered by the model from the transcript | Receipt log missing |
| J | "Go back to what we were doing." | Boundary `return_to_suspended_topic` + `activeWorkContext` + interruption/return identity ✅ (the strongest link today) | Room loops do not register suspended work |
| K | "What are we charging now?" | Partial (§7.1) | Lens, formatting, legacy prose |
| L | "What did we originally plan to charge?" | Not answerable | History lens + planned values |

**Registries.** At least 13 exist (full list in the action trace). Only `executionFoundation/capabilityManifest.ts` ("Execution truth lives here") and `memberIntent` availability actually gate execution, and they do not know about each other. `companionCapabilityRegistry.ts:609-613` claims a calendar owner module that does not exist. `universalBlueprintInterface/capabilityManifest.ts` hard-codes `calendar: true`.

**Undo.** Create (45 seconds), project trash/restore and a few editors. There is no chat-level undo.

---

## 9. Beta-critical gaps

1. **G-U1 — No member-move vocabulary at the authority.** Clarification, ask-Spark, don't-know-help, correction, modified/partial acceptance and hypothetical are decided about 10-75 times each. (Causes 1, 3.)
2. **G-C1 — Pending binding is not owned by Boundary.** There are more than 20 trackers. The model arms "yes" by regex. Invite, VTS and Reminder binds skip Boundary. The legacy clear drops offers on clarification. (Causes 4, 5; B-3, B-5, B-6, B-13.)
3. **G-D1 — Room step machines advance over member questions.** This affects Events, Claire, Strategy ×2, Day Designer, Board intake, Create entrance, Work Recognition and Reminder. (B-2, B-7, B-8, B-9.)
4. **G-V1 — No receipt discipline in replies.** The model can claim actions; there is no action history; the calendar prompt claim; "saved" is ungated. (B-1, B-17; example I.)
5. **G-A1 — The action chain is complete only for Rhythms.** Reminder read-back and authorization, correction-vs-decline, project item, event speakers and partial authorization are missing; calendar needs a Founder decision. (Examples A, C-H.)
6. **G-K1 — Current-only, word-matched knowledge with legacy prose alongside.** No history/reason lens; scenario/retired/seed leakage. (Examples K, L.)
7. **G-P1 — All member truth and pending state are browser-local.** Cross-device state diverges. A false "yes" binding across devices is **low** risk today, because pending state does not travel. The real risks are the opposite:
   - work done on the phone is invisible on the laptop;
   - a stale local pending offer can revive on reopen for owners with no expiry (MA-17/18). Only Round 1 has expiry: 3 turns or 10 minutes.
8. **Precondition:** R0 not landed; Production config unverifiable; `/api/claire-reasoning` unauthenticated.

---

## 10. Reconciling the Final Conversational Intelligence Architecture

| Proposed component | Verdict | Where it lives in One Brain | Reason |
|---|---|---|---|
| **Turn Interpretation** | **KEEP as part of UNDERSTAND, and MERGE WITH EXISTING AUTHORITY** | The `move` + `stance` fields of the Boundary decision, computed by a predicate module that only Boundary calls | A standalone interpreter beside Boundary would be the "early resolver alongside Boundary" that the ADR forbids (ADR §Relationship to MA-04). **Empirically test** any model-assisted reading: start deterministic (consolidating the best existing predicates); allow a model fallback only for `unclear` and only after certification shows a deterministic ceiling |
| **Turn Reading** | **REJECT AS DUPLICATE** (folded into Turn Interpretation) | Same `move` field | Two names for "what is the member doing with this turn" would recreate the two-authorities defect in the design itself |
| **Turn Obligations** | **SIMPLIFY** | The `obligation` field, derived by a table from (`move`, `pendingOwner`, `stance`, capability availability) inside the Boundary decision | Replaces `turnAuthority` `allow*` flags, the router `responsePolicy` (unread) and the continuity `clarify` (rejected). A table, not a module |
| **Advancement Gate** | **MERGE WITH EXISTING AUTHORITY** | The `grant` field (`may_advance_owner`, `may_store_as_answer`, `may_execute`), generalized from D3 `boundaryGrantsCreateAnswer` (`createTurnRelationship.ts:275`) and the Board `heldOpenIds` hold pattern | D3 is already the shipped, certified shape of this gate for Create. A new gate would be a second one |

**Also survives, mapped into the loop:**
- `conversationalTurnContract` → ANSWER composition
- `retrieveRelevantSituation` → KNOW
- `executableRequest` → UNDERSTAND stance + ACT extraction
- `executionFoundation` → ACT/VERIFY contract
- `executionReceipts` → VERIFY
- `activeWorkContext` → CONTINUE

**Rejected or merged:**
- a new "orchestration layer";
- a new pending store (the spine `expectedReply` is reused);
- a new capability registry (`executionFoundation` manifest is extended);
- a RAG truth layer (deferred; recall-only later).

---

## 11. One Brain certification design

**Principle.** *The same fundamental conversational situation must receive the same GLOBAL decision in every applicable Spark Estate area. Domain content may differ. Global meaning may not.*

### 11.1 What is asserted (global fields only)

```
GlobalTurnDecision = {
  move, stance, obligation,
  grant: { may_advance_owner, may_store_as_answer, may_execute },
  bindTarget   // which pending owner a yes/modification/correction applies to, or none
  pendingPreserved // boolean: the pending item survives this turn
  truthLens    // current | history | reason (for knowledge questions)
}
```

Domain text is **not** asserted in the equivalence suite. It is asserted in each child's own tests.

### 11.2 Harness shape
- **Situations.** A fixture defines a situation as a (pending-question shape, active work, member text) triple. The pending shape uses Boundary's existing role/affordance abstraction (no domain words).
- **Area adapters.** Each area supplies a thin adapter that turns its native pending state into that shape and calls the **same** Boundary entry point:
  - main chat
  - Claire
  - Board intake
  - Board meeting
  - Chamber
  - Strategy Chamber
  - Strategy Apply
  - Events
  - Projects
  - Create (builder / entrance / Current Focus / Work Recognition)
  - Research
  - Reminder intake
  - Rhythm owner
  - Day Designer
  - VTS menu
- **Assertion.** For each situation × applicable area: `GlobalTurnDecision` is identical. A baseline run on the current tree records today's divergence as **expected failures**, and each convergence round flips its rows to pass.
- **Paraphrase sets.** Each situation has at least 5 phrasings plus at least 3 **negative controls** (near-miss sentences that must *not* get the move). This prevents overfitting to one phrase; the R0 "no phrase rules" discipline is kept.
- **Action rows** run against fake stores (the Round 1 pattern). They assert: a receipt exists ⇔ the reply claims completion; the reply is composed from the read-back record; an unsupported part is named.
- **Delivery rows** feed model-like replies that claim actions into `certifyCompanionDelivery` and assert that the claim is stripped or rewritten when no receipt exists.

### 11.3 Required scenario families

| Family | Situations (examples) | Expected global decision |
|---|---|---|
| Corrections | "No, I said Tuesday" after (a) an executed Rhythm, (b) a pending offer, (c) a Board answer, (d) an Event date | `move=correct`, `bindTarget`=the item, `may_execute` only for (a)/(b) under the existing grant; **never** `decline` |
| Clarification | "I don't know what you mean — can you explain before we keep going?" in all 15 areas | `move=clarify`, `obligation=hold_and_explain`, `may_advance_owner=false`, `may_store_as_answer=false`, `pendingPreserved=true` |
| Question during a workflow | "Wait, why does that matter?" / "How much does that usually cost?" mid-intake | `move=ask_spark`, `obligation=answer_first`, hold the process, pending kept |
| Don't know + help | "I'm not sure — can you help me figure that out?" | `move=dont_know_help`, `obligation=answer_first` (help), not stored as an answer, not a deferral |
| Modified acceptance | "Yes, but make it 4:00" to an offer / an executed item | `move=accept_modified`, `bindTarget`=previous-turn offer, `may_execute` only the modified version |
| Partial acceptance | "Do the first two, not the third" to a 3-item proposal | `move=accept_partial`, scope `[1,2]`, item 3 not executed and named |
| Discuss vs act | "I'm thinking about adding a dentist appointment" / "Add a dentist appointment…" | `stance=talk_about` → `may_execute=false`; `stance=act` → capability resolution |
| Hypotheticals | "What if we charged $200?" | `stance=talk_about`, no write, no truth update; KNOW lens `current` for the comparison |
| Compound actions | "Add a Rhythm and put it on my calendar and notify me" | Every part preserved; supported parts executed with receipts; unsupported parts named (the Round 1 rule, generalized) |
| Interruption | Emotional turn mid-intake; topic switch mid-intake | `transition=interrupt/switch`; pending suspended, not destroyed |
| Return | "Go back to what we were doing" | `transition=return`; exact suspended owner + question restored |
| Stale references | "Yes" 4 turns after an offer; "yes" after reload; "yes" on a second device | `bindTarget=none`; no execution |
| Current vs historical truth | "What are we charging now?" / "originally?" / "why did we change?" | `truthLens` = current / history / reason; fixture BU with a supersession chain and `changeReason` |
| Action execution | Rhythm, Reminder, Project item, Event speaker, Hold | Receipt from read-back; reply built from the receipt |
| Receipts | "What did you just do?" after 0/1/2 actions | Answer from the persisted receipts; "nothing yet" when there are none |
| Unsupported capability | "Put it on my Google Calendar" | Named as unsupported; no claim; no navigation away unless asked |
| Specialist contribution | Same clarification in Board vs Events | Identical global decision; different domain explanation text (asserted separately) |

### 11.4 Founder proof (live)
A fixed 20-turn script is run on the preview, in main chat and in 4 rooms. Each turn records the page's own turn log (`finalResponseOwner`, `move`, `obligation`, `receipts`). A turn passes when the log matches the certification row and the member-visible reply matches the Founder rubric.

---

## 12. Smallest safe beta convergence sequence

**OB-P (prerequisite, not a convergence round).** Land R0 (`claude/spark-r0-release-gate-l7edvu`) once the Production config gates close. Close the `/api/claire-reasoning` P1.
- **Founder action:** network/Vercel access + the Board flag decision.
- Every round below builds on R0 code.

---

**OB-1 — Member Move on the Boundary decision (shadow) + certification harness**
- **Purpose:** give the parent brain the vocabulary; measure divergence.
- **Authority converged:** UNDERSTAND.
- **Reused:**
  - `conversationConfirmationGate` yes/no/deferral
  - CRCI `triggerDetection`
  - Board `classifyMemberBoardResponse` move rules
  - `turnRecovery` correction
  - `executableRequest` stance
  - `activeTopicGate` uncertainty
- **Duplication removed:** none yet (shadow). Predicates are *moved* into one module; the originals re-export from it where their signatures match.
- **Files:**
  - `lib/conversationBoundary.ts` (decision type + fields)
  - one new predicate module beside it (Boundary is its only caller)
  - the harness under `lib/oneBrainCertification/`
  - area adapters (read-only)
- **Tests:** the §11 harness baseline (expected failures recorded); unit tests per move with paraphrases and negative controls; the S4 snapshot-purity test still green.
- **Founder proof:** a dev harness page or test report showing each of the 12 A-L sentences with its move/stance.
- **Promotion gate:** 0 behaviour change (full-suite delta 0); move accuracy ≥ the agreed bar on the labelled set.
- **Rollback:** delete the field (no consumers).
- **Stop condition:** do not wire any consumer.

**OB-2 — Hold-and-answer grant in every room loop** ← *first Founder test*
- **Purpose:** no child advances over `clarify` / `ask_spark` / `dont_know_help`; nothing non-answer is stored as an answer.
- **Authority converged:** DECIDE (`obligation` + `grant.may_advance_owner` / `may_store_as_answer`) = the "Advancement Gate", generalized from D3.
- **Reused:** D3 `boundaryGrantsCreateAnswer`; Board `heldOpenIds`; CRCI hold.
- **Duplication removed:**
  - Events `detectDisposition` "don't know" → defer for clarifications
  - Claire `isIdkOrUncertain` and the question-as-decline branch
  - Strategy / Day Designer / Board intake / Create entrance / Work Recognition / Reminder advance-on-anything
- **Files:**
  - `applyEventConversationalAnswer.ts`
  - `claireConversation.ts` + `BusinessProfileBp2aPrototype.tsx` (the decline branch)
  - `strategyApplyCoach.ts`
  - `guidedJourney.ts`
  - `dayMessages.ts`
  - `boardDirectorDiscussion.ts`
  - `entranceUnderstanding.ts`
  - `workRecognitionFallthrough.ts`
  - `reminderIntelligence.ts`
  - `CPC:16792` (legacy clear)
- **Tests:** the certification "Clarification", "Question during workflow" and "Don't know + help" families flip to pass in every applicable area.
- **Founder proof:** the exact OB-0 sentence in Main, Claire, Board intake, Events, Strategy, Create, Plan My Day and Reminder: Spark explains, the process holds, the next turn resumes.
- **Promotion gate:** those rows green; 0 new failures.
- **Rollback:** one kill switch that restores each loop's previous advance rule.
- **Stop condition:** no pending-binding changes.

**OB-3 — One pending authority (ADR steps 1-5, MA-04 Phase 2b)**
- **Purpose:** every "yes / modification / correction / decline" binds through Boundary against the spine's `expectedReply`.
- **Authority converged:** CONTEXT + pending binding.
- **Reused:**
  - spine `ownership.expectedReply`
  - `isShortAcceptanceOfArmedOwner`
  - the Round 1 "previous-turn offer only" + expiry rule
- **Duplication removed:**
  - Boundary's `pendingCreateQuestionSnapshot` becomes `pendingOwnerSnapshot` (covering confirmation, Chamber, Board, collection, invites, VTS menu, Reminder, strategy offers)
  - the spine resolver is demoted to persistence
  - Board/Chamber invite, VTS menu and Reminder bind sites obey the grant
  - model-text arming is restricted to arming the *spine* record only, with expiry
  - `resolveFrictionlessAction` receives `boundaryDecision`
- **Files:**
  - `conversationBoundaryInputs.ts`
  - `conversationSession/ownership/*`
  - `CompanionPageClient.tsx`: the bind sites listed in §5 only, not a `handleSend` rewrite
  - `frictionlessActionLayer.ts` (parameter)
- **Tests:**
  - "Stale references", "Modified acceptance", "Interruption" and "Return" families;
  - MA-01/04/05 integration test "assistant asks → member says yes → same owner continues";
  - the B-10 Decision Ledger case (reproduce first).
- **Founder proof:** offer → unrelated turn → "yes" does nothing; offer → "yes, but at 4" modifies; reload → "yes" does nothing.
- **Promotion gate:** those families green; 0 new failures.
- **Rollback:** a flag that restores the first-match ladder.
- **Stop condition:** do not collapse the other ~60 vocabularies beyond the bind sites touched; retire them opportunistically later.

**OB-4 — Receipts, action history and the claim guard** ← *first full-loop Founder test*
- **Purpose:** Spark may say an action happened only from a receipt; "What did you just do?" is answered from receipts.
- **Authority converged:** VERIFY + UPDATE log.
- **Reused:**
  - `lib/executionReceipts.ts` shape
  - `turnDecisionStore` (`actionExecuted`, moved to start at HEAR; `receipts[]`; persisted, short retention)
  - `certifyCompanionDelivery` (add a receipt-claim check)
  - the Rhythm read-back pattern
- **Duplication removed:**
  - per-capability success strings built from input objects (Reminder, Hold, Project Coach, Sheets ack, Create "saved" when the flag is off)
  - the calendar claim in `companionPrompt.ts:252` (corrected, not deleted)
- **Additional fix:** correction-vs-decline, using `move=correct` from OB-1 in `continueActiveRemember`.
- **Files:**
  - `turnDecisionStore.ts`
  - `certifyCompanionDelivery.ts`
  - `reminderStore.ts` / `reminderIntelligence.ts` (read-back)
  - `attentionObligation/conversation.ts`
  - `projectCoachSession.ts`
  - `companionPrompt.ts`
  - `frictionlessActionLayer.ts` (the correction branch)
- **Tests:** "Receipts", "Action execution", "Unsupported capability" and "Corrections" families; delivery rows with model-like false claims.
- **Founder proof:**
  - create a Rhythm, then "No, I said Tuesday" → corrected;
  - "What did you just do?" → an exact receipt list;
  - "Put it on my calendar" → honestly unsupported.
- **Promotion gate:** 0 unverified completion claims in the delivery rows.
- **Rollback:** a guard flag (log-only mode).
- **Stop condition:** no new capabilities.

**OB-5 — Capability chain convergence (beta set)**
- **Purpose:** complete the chain for the beta capabilities.
- **Authority converged:** ACT (one execution manifest).
- **Reused:**
  - `executableRequest` action/slot extraction
  - `executionFoundation/capabilityManifest.ts` (add Rhythm, Reminder, Hold, Project item and Event patch entries)
  - existing domain writers
- **Duplication removed:** `memberIntent` availability reads the manifest; navigation registries are demoted to "open room" only (no execution claims); the dead `strategyChamberActionRouting` is retired.
- **Scope:**
  - Reminder full chain;
  - "add X to project Y" (project resolved from active work or by name);
  - partial authorization over a multi-item proposal;
  - Events: the active event as `activeWork` + a speaker/person slot (**Founder decision on the Events data model**);
  - Calendar per the Founder decision (honest unsupported vs Google Calendar write scope).
- **Tests:** "Compound actions", "Partial acceptance" and "Specialist contribution" families; examples A, C, D, F.
- **Founder proof:** examples A-H live.
- **Promotion gate:** each capability row green end to end.
- **Rollback:** per-capability manifest entry flags.
- **Stop condition:** no capability outside the Founder's beta list.

**OB-6 — Truth lens (KNOW)**
- **Purpose:** current vs historical vs reason.
- **Authority converged:** KNOW.
- **Reused:** `readProvider` (`includeSuperseded`), `isLegacyLive`, the gate status labels, the Decision Ledger history format, `quantityFactSummary`.
- **Duplication removed:** legacy `businessContextSummary()` demoted to a fallback used only when BU has no current item for that path; Board and gate agree on legacy-field status.
- **Also:**
  - pass `changeReason` / `supersedesId` through the projection;
  - filter scenario edges and retired offers from `current`;
  - add a sample/seed provenance marker.
- **Files:** `readProvider.ts`, `collectBusinessUnderstandingItems.ts`, `retrieveRelevantSituation.ts` (a lens field on the query, set from UNDERSTAND), `gateRelevantSituationForConversation.ts`, `businessUnderstandingContext.ts`, `companionStore.ts`.
- **Tests:** "Current vs historical truth" family; `r0LegacyTruthResurfacing` stays green.
- **Founder proof:** examples K and L plus "why did we change the price?"
- **Promotion gate:** those rows green.
- **Rollback:** a lens flag that defaults to current.
- **Stop condition:** no RAG.

**OB-7 (post-beta or Founder-prioritized)** — durable Supabase persistence for BU, pending state and receipts (cross-device); evaluation of hybrid recall over research/evidence/transcripts; retirement of the remaining duplicate vocabularies.

**Earliest Founder testing against a real One Brain loop:**
- **OB-2** on preview: the same conversational meaning across rooms for clarification and questions.
- **OB-4:** the first true HEAR → … → VERIFY → CONTINUE loop.
- **OB-5 / OB-6** complete the beta capability and knowledge set.

OB-1 through OB-4 are each small enough for one round. OB-5 may split per capability.

---

## 13. Adversarial self-review

| # | Attack | Answer | Revision made |
|---|---|---|---|
| 1 | Did I create a second brain? | The first draft had a separate "Turn Interpreter" module. **Revised:** the move is a field on the Boundary decision, computed by predicates that only Boundary calls. Children receive it read-only. | Yes |
| 2 | Another router? | No routing is added. Routers are demoted to navigation executors (OB-3). | — |
| 3 | Another pending authority? | The first draft had a new "pending registry". **Revised:** it reuses the spine `ownership.expectedReply` the ADR already names, so Boundary reads it and does not replace it. | Yes |
| 4 | Another truth store? | No. The lens is a query field; history comes from existing supersession fields. | — |
| 5 | Specialist expertise confused with conversation ownership? | Each child row keeps its domain intelligence (Directors, Claire's write meaning, Events foundation, the strategy catalog). Only generic move judgments move up. | — |
| 6 | Can a child still reinterpret the member? | **Residual risk:** the Chamber's post-generation understanding gate and Claire's model path. OB-2 feeds them the move before generation. The certification "Specialist contribution" family detects reinterpretation. | Flagged |
| 7 | Can a child advance over a question? | Not after OB-2, for the listed loops. **Residual:** loops not yet listed (any new room). A certification rule requires every new surface to register an adapter or fail CI. | Yes: CI rule |
| 8 | Can Spark claim an action without a receipt? | After OB-4: model replies are guarded. **Residual:** local templates added later that bypass `certifyCompanionDelivery`. The guard must sit at the single egress (`finalizeMemberFacingAssistantText`), not per template. | Yes: placed at egress |
| 9 | Can a hypothetical become execution? | Stance is global after OB-1; `may_execute` requires `stance=act`. **Residual:** the Claire write path has its own SCENARIO rule. Keep it as defense in depth (a domain never-write rule), consistent with the global stance. | — |
| 10 | Can historical truth override current truth? | The lens defaults to current; superseded items appear only with the history lens and carry a "superseded" label. The legacy prose is demoted (OB-6). | — |
| 11 | Can current truth block a historical question? | Today, yes. After OB-6, no. **Residual:** planned values are still never written, so "originally planned" answers from supersession history only. Storing planned values is a Founder decision. | Listed in §14 |
| 12 | Can an interruption destroy pending work? | Today, yes (the legacy clear at `CPC:16792`). OB-2 removes it and OB-3 makes pending state survive interruption via the spine. | — |
| 13 | Can a compound request lose one part? | The Round 1 compound rule is generalized in OB-5; the certification "Compound actions" family asserts every part is executed or named. | — |
| 14 | Can cross-device state produce a false "yes" binding? | Pending state is device-local, so a "yes" on another device binds nothing (safe). Stale same-device revival is closed by the OB-3 expiry. Durable cross-device pending (OB-7) must carry turn provenance and expiry, or it would *create* this risk. | Constraint recorded |
| 15 | Is any proposed layer unnecessary? | The first draft proposed hybrid retrieval for beta; it was **cut** to post-beta and evaluation-only. The first draft also merged OB-1 and OB-2; they were **split**, so the vocabulary lands in shadow before any behaviour changes. | Yes |
| 16 | Is there a simpler architecture using what exists? | Considered: make every room post its text into main-chat `handleSend`. **Rejected:** it would force navigation and break room UX, and `handleSend` is already about 8,700 lines. Calling one exported Boundary entry from each room is simpler and keeps rooms intact. Also considered: skip Boundary and promote the spine resolver (the roadmap's Phase 1). **Rejected** per the ADR evidence: it runs late, reads mutated state and has one consumer. | — |

**Post-review architecture:**
- Boundary decision + 4 fields;
- one predicate module with a single caller;
- spine `expectedReply` reused;
- one execution manifest (existing, extended);
- receipts on the existing turn record;
- one egress guard;
- one lens field.

No new runtime, router, store or registry.

---

## 14. Unresolved Founder decisions

1. **R0 landing:** unblock the Production config gates (Vercel/Supabase/OpenAI access, Board V2 flag). Every round depends on it.
2. **Calendar for beta:** honest "not yet" (current) vs a Google Calendar write scope (a new OAuth scope, `GOOGLE_SETUP.md`).
3. **Direct-instruction execution policy (Option B) beyond Rhythms:** execute immediately for reversible low-risk capabilities only (Reminder, Hold, Project item)? Confirm first for Events and business truth?
4. **Events data model:** add a people/speakers structure (needed for example D).
5. **Model-assisted move reading:** allowed as a fallback for `unclear` (cost and latency) or deterministic only for beta?
6. **Action history:** visible to the member (e.g. a "What I did" list) or conversational only; retention period.
7. **Planned / historical values:** should Claire store "we originally planned $X" as historical truth (today it is blocked at write)?
8. **Durability:** is browser-local truth acceptable for beta, or is Supabase persistence of BU / pending / receipts beta-blocking?
9. **Roadmap vs ADR:** confirm the ADR (Boundary canonical) supersedes Roadmap Phase 1 (spine canonical).
10. **Board intake:** should intake hold on questions like the meeting does (recommended), accepting a small intake UX change?
11. **Phone Board Room nameplates** (carried over from the R0 gate).

---

## 15. Recommended FIRST implementation prompt (OB-1) — do not run until the Founder authorizes it

```
BRAIN SPARK ESTATE™ — OB-1
MEMBER MOVE ON THE BOUNDARY DECISION (SHADOW) + ONE BRAIN CERTIFICATION HARNESS

Repository: ShariLHudson/adhd-business-companion-vs3
Base: main AFTER R0 lands (else the R0 release-gate branch tip). Record the SHA.

GOAL
Give Boundary (S4) — the ADR-designated single authority
(docs/architecture/CANONICAL_OWNERSHIP_AUTHORITY.md) — the vocabulary to say
what the member is doing with the turn. SHADOW ONLY: no consumer reads it.

BUILD
1. Extend ConversationBoundaryDecision (lib/conversationBoundary.ts) with:
   move: ask_spark | clarify | dont_know_help | correct | accept |
         accept_modified | accept_partial | decline | defer | answer |
         think_aloud | hypothetical | command | pause | resume | switch |
         emotional | none
   stance: act | talk_about | none
   (obligation/grant are OB-2 — do not add yet)
2. Compute move/stance in ONE predicate module beside Boundary, called ONLY by
   resolveConversationBoundary, from the pure pre-turn snapshot + text.
   CONSOLIDATE, do not invent. Source rules from:
   - lib/conversationConfirmationGate.ts (yes/no/deferral — canonical)
   - lib/conversationRepairClarificationIntelligence/triggerDetection.ts
   - lib/board/reconstructed/orchestration/classifyMemberBoardResponse.ts
     (clarification/correction/help — best existing)
   - lib/shariAnswerFirst/turnRecovery.ts (correction)
   - lib/memberIntent/executableRequest.ts (stance, modified acceptance,
     hypothetical, negation, capability question, past tense)
   - lib/conversationStabilization/activeTopicGate.ts (genuine uncertainty)
   Where an original predicate's signature matches, make it re-export the
   consolidated one. Do not change any caller's behavior.
   "No, I said Tuesday" MUST be move=correct, not decline.
   "I don't know what you mean" MUST be move=clarify, not dont_know_help/defer.
3. Build lib/oneBrainCertification/: situation fixtures (pending-question
   role/affordance shape + text), ≥5 paraphrases + ≥3 negative controls per
   family in §11.3 of docs/reviews/ONE_BRAIN_FULL_LOOP_CONVERGENCE_AUDIT.md,
   and read-only area adapters for: main chat, Claire, Board intake, Board
   meeting, Events, Strategy Apply, Strategy Chamber, Day Designer, Reminder
   intake, Rhythm owner, Create entrance, Work Recognition, VTS menu.
   Each adapter reports what the area does TODAY with the sentence (advance?
   store as answer? bind? execute?). Record current divergence as expected
   failures (it.fails / todo) — do not fix any area.
4. Log move/stance in the existing turn log (finalResponseOwner line) in dev.

DO NOT
- No consumer of move/stance. No room behavior change. No handleSend reorder.
- No new router, pending store, registry, truth store, model call, RAG.
- No phrase patch for a single sentence; every rule proven by paraphrase set.
- Do not touch pendingAcceptanceAuthority semantics, D3, S4 snapshot purity.

PROVE
- conversationBoundaryPreTurnSnapshot.test.ts green.
- Full-suite delta: 0 new failures; tsc error multiset unchanged.
- Move accuracy on the labelled set reported per family.
- Divergence matrix (situation × area) committed as the baseline.

RETURN docs/reviews/OB1_MEMBER_MOVE_SHADOW_RETURN.md with: SHA, files, move
accuracy table, divergence matrix, adversarial self-review (did I create a
second brain / router / pending authority?), rollback (revert; no consumers).
STOP after OB-1. Do not begin OB-2.
```

---

*OB-0 complete. Read-only. Nothing implemented, merged or deployed in `adhd-business-companion-vs3`.*
