# BRAIN SPARK ESTATE™ — OB-5 Return Report
## Capability CONNECT: One Brain knows what Spark already has, and uses it

**Standing constraints.** Nothing was merged. There was no production deployment. `main` is unchanged. The OB-5 branch has **not** been pushed; pushing triggers a Vercel preview, so it needs Founder authorization. OB-6 was not started.

---

## 1. Verified starting point

| Item | Value |
|---|---|
| Accepted OB-4 | `ob4/receipts-universal-corrections` @ `b9ef5d6abcb02e5e619b55e02e013817cc31da8f`, verified to match exactly |
| OB-4 report | `docs/reviews/ob4/BRAIN_SPARK_ESTATE_OB4_RETURN_REPORT.md` (adhd-companion), present |
| Capability Connection Audit | `docs/reviews/ob2/BRAIN_SPARK_ESTATE_CAPABILITY_CONNECTION_AUDIT.md`, present; re-verified in §3 |
| Older action work | `origin/atomic-gca-r1`, the same commit as `atomic/global-conversation-action-r1` (`9ae818cc`); inspected as evidence only |

## 2. Ending branch / SHA

| Item | Value |
|---|---|
| Branch | `ob5/one-brain-capability-connect`, created from exactly `b9ef5d6a` |
| Ending SHA | `0877243b5b3040ca4eef700ad5b6e92bf775fcf8` (`ob5/one-brain-capability-connect`, local, not pushed) |
| Artifacts | This report · `BRAIN_SPARK_ESTATE_INTELLIGENCE_INVENTORY.md` |

---

## 3. Canonical capability source, and what changed since the audit

**Re-verification.** I traced every named registry again, and ran each owner's own recognizer on the certification sentences.

| Finding | Status now |
|---|---|
| `estateCapabilityRegistry/catalog` is the canonical *capability* source | **Partly true.** It holds 62 entries: Create, Research, Momentum, Focus, Restore, Journal, Learn and Places. It has **no entry** for Claire, Board, Events, Strategy Chamber, Reminders, Rhythms, Plan My Day, VTS or LMC. It also holds duplicates: `create.business_plan` / `create.business-plan`, `create.social` / `create.social_post`, `focus.music` / `restore.music`. Its only runtime reader is the concierge (`frictionlessActionLayer.tryEstateConciergeFlow`) plus `routeEstateIntelligence`. |
| **Correction:** "Claire has no path from main chat" | **Wrong, and already wrong at the audit.** `detectBusinessEstateNavIntent` (`CompanionPageClient`, before the router) opens My Business Estate. The real break was **context**: Claire received nothing. The recognizer is also narrow; see §13. |
| **Correction:** "Research launch + return from chat works (A)" | **Wrong.** `stageConversationResearch` had **0 production callers**, so the chat → Research → chat round-trip never ran. Only the Project and Chamber round-trips existed. Meanwhile the model was told "you own research… say 'I looked into…'" with no tools. That is a fabrication risk. |
| **Correction:** "Strategy open from chat" | `resolveStrategyOpenFromChat` opens the **ADHD strategy library**, not the Strategy Chamber. The Chamber is reachable only by a button. |
| **New:** Board chat invite dead-ended | Intake ran in chat and ended at "we can begin the Board discussion", but **never opened the Board Room**. |
| **New:** Work Recognition shadows other owners | "Help me plan today", "design my day" and "make a mind map" all become a generic Create "Document". |
| Model has no tools; prompt has a hand-written feature list | Still true at base. The feature list omitted Claire, Events, the Strategy Chamber, Rhythms, Reminders, VTS, LMC, the Research Library and the Board Room. |

**Canonical source adopted: no single registry holds everything, and no new catalog was created.** One Brain's single read path is a **projection** (`lib/oneBrainCapability/projection.ts` + `readPath.ts`). Every name, purpose and recognizer is read from registries and owner modules that already exist:

| Owner | Name / purpose read from | Existing recognizer consumed |
|---|---|---|
| Claire | `profileNavigatorModel.BP2_PROFILE_AREAS` | `businessEstateNavIntent.detectBusinessEstateNavIntent` |
| Board | `boardRoomEntranceCopy` (Founder-approved "how it works") | `memberIntent.classifyMemberIntent` → `board_member`; the Board's own copy phrase |
| Research | catalog `research.current`, `myDayAndWorkNavigation` | catalog `consultEstateCapabilities` (score ≥ 60) |
| Projects | `appFeatureKnowledge.projects`, catalog `momentum.projects` | `workspaceIntent.extractProjectQuery`, `classifyMemberIntent` → `project` |
| Events | `chamberMemberRegistry.events` | `eventsIntelligence.detectEventIntent` |
| Strategy Chamber | `strategyChamber/intelligence/registry` | `matchStrategyTypesFromText` |
| Create | `appFeatureKnowledge.create` | `classifyMemberIntent` → `new_document` |
| Plan My Day | `appFeatureKnowledge.plan-my-day` | its `match` patterns; `universalAccess` |
| Reminders / Rhythms | `myDayAndWorkNavigation` | `executableRequest.resolveExecutableRequest`, `rhythms.classifyRememberIntent` |
| VTS | `myDayAndWorkNavigation`, catalog `visual.model` | `universalAccess` → `visual-thinking` |
| Client Avatars | `appFeatureKnowledge.client-avatars` | `clientAvatarOffer.detectClientAvatarExploration` |
| LMC | `boardRoomEntranceCopy.livingModelNote` | — (none exists) |

**What OB-5 adds is wiring only.** The adapter table (`lib/oneBrainCapability/connections.ts`) records, for each owner, the traced facts about how One Brain reaches it:
- mode: acts with confirmation / acts / advises / navigates
- handoff kind
- return path
- connection status
- context carried
- the honest limit
- evidence (file / function)

It contains **no names, descriptions or member-need vocabulary**. The catalog itself was not changed.

## 4. One Brain capability-selection architecture

```
Boundary (what the member is doing)          — unchanged, OB-1
  → resolvePendingBinding / resolveCorrectionBinding   — OB-3 / OB-4
  → resolveCapabilitySelection                         — OB-5, ONE call per turn
       meaning: gate.capabilityTurnEligibility (the gate is the one reader of
                relation / stance / meaningConfidence — no new classifier)
       recognitions: readPath.recognizeCapabilities (existing recognizers)
       → route | confirm | ask | defer | none
  → planCapabilityTurn (pure) → the page executes with each owner's existing entry point
```

- **Request vs discussion comes from Boundary alone.**
  - `stance === "talk_about"` means no capability.
  - A person-before-process hold on the current thread means none.
  - Accept, decline, correct, clarify and unsure relations mean none.
  - Nothing new classifies meaning.
- **LOW meaning never connects.** It becomes `confirm`, which is an offer.
- **A catalog-only candidate is only offered**, never connected.
- **Two owners fitting equally produce a short choice** (`ask`). The choice is armed as items on the one pending record, and nothing runs until the member names one.
- **An owner whose seam still routes it (`owner_seam`) is `defer`.** One Brain records the selection and the existing seam acts, so behaviour for those owners is unchanged.
- **Kill switches:**
  - `NEXT_PUBLIC_ONE_BRAIN_CAPABILITY_CONNECT=0`
  - or the existing `NEXT_PUBLIC_BOUNDARY_MEANING_HOLD=0`
  - Either one returns `null`, which leaves only the legacy seams.
- **Placement.** The selection is computed immediately after the OB-3/OB-4 bindings. The connect block runs **before** the legacy business-estate seam and the continuity gate (guarded by `oneBrainConsumers.test.ts`).

## 5. Existing systems reused (nothing rebuilt)

| Reused | How |
|---|---|
| Boundary meaning contract (OB-1) | Read through the gate's new `capabilityTurnEligibility` |
| One pending record (OB-3, spine `expectedReply`) | Every capability offer is armed on it. It carries a `handoff` payload so "yes / do that" executes exactly that offer, and a stale offer never runs. |
| Receipts (OB-4) | Claire's confirmed write becomes the receipt, so "change it" returns to Claire |
| Capability catalog + its consult scorer | Research candidates; Research purpose |
| Owner recognizers (table §3) | Consumed unchanged |
| `claireTopicHandoff.handoffFromArea` → `talkWithClaire` | The same path the Living Model → Claire handoff uses |
| `businessEstateSectionIntent` sessionStorage one-shot pattern | Mirrored for the Claire handoff and return |
| Board invite (`pendingBoardInvite` + `board_invite`) + `createEmptyBoardIntakeDraft({source:"chat_invite"})` | One Brain's Board route *is* the existing invite |
| `buildCertifiedV2BoardContextProjection` | The Board return projection. BC-6 is respected: member decision and Board position stay distinct, and no Board next step is invented. |
| `BoardDiscussionOutcomePanel` "Return to …" button (`onReturnToSource`) | It existed and was never passed; now wired to `goBackToChat` |
| `stageContextualResearch` (origin `"board"` already existed) + Research panel origin pattern | Board → Research → Board |
| `stageConversationResearch` (0 callers before) + `activeConversationResearchReturn` | Chat → Research |
| Project Homes next-step engine `resolveProjectHomeNextMove`; `searchProjects` / `scoreProjectMatch`; `openProjectHomesPrototypeCore` | Projects connection |
| **Old action work** (`atomic-gca-r1`) | **Reused as evidence only:** its accurate executor mapping (Board decision → project starter via `persistProjectStarter` / `verifyProjectExists`) is already on HEAD in `executionFoundation`, and its field vocabulary informed the adapter's `mode` / return columns. **Not reused:** its reminder manifest (wrong authority key `reminder-store-v1`; the real key is `companion-reminders-v1`), its OpenAI tool definitions, `ActionProposal`, the shadow action route, and the parallel Cursor manifest. The branch predates OB-1 to OB-4 and would delete receipts and undo if merged. |

## 6. The four required connections, and proof

| Connection | Before | OB-5 | Proof (`capabilityConnect.ob5.test.ts`) |
|---|---|---|---|
| **A. Main chat → Claire** | The seam opened My Business Estate. Claire received **nothing**. There was no return. | One Brain `route:claire` connects Claire **with the member's words + profile area**. Claire consumes the handoff on mount and answers through her own topic path. A member-**confirmed** write leaves a return note; back in chat, Spark says what Claire saved and records the OB-4 receipt. "No, make it …" goes back to Claire. "Undo that" is answered honestly (no fake rollback). | "Help me update my business profile." and "I need to update what my business does." → execute with payload; nothing written. One-shot handoff; a return only for chat visits. Correction binds `correct_receipt` (owner-supported); `receiptCorrection` defers to Claire. |
| **B. Board result → main chat** | 0 Board reads in the page. The chat invite dead-ended before the Board Room. | The chat-invited intake **opens the Board Room** on the same saved draft when it is ready. On return, the page posts the smallest structured result: what was brought, the member's own decision (or "the decision stays yours"), the strongest pushback, and what is still open. If the Board itself said evidence is missing, that **one** research question is armed on the pending record, so "Okay, let's do that." binds to exactly it. The model also gets a labelled `BOARD RETURN` hint. The outcome panel's "Return to …" button is now wired. | Return projection from a certified chat-invite record: `memberDecision: null` (the Board never decides), the next action is research with Board provenance, and there is no internal `leadingPosition` in member text. "Okay, let's do that." → bound `research_launch`. Stale → nothing. |
| **C. Board → Research** | The Brief's "Research this" was a disabled button; seams were `seam_only`. | The Brief's existing button launches Research with the Board's **own bounded question** and situation (origin `board`). The Research Library shows "From your Board discussion — Back to the Board". Research **returns into the Board Brief** ("Research came back": question, synthesis, sourced-finding count, uncertainty) through Research's own return package. It is not a Board-specific research. | `researchReturnForBoard(id)` returns the collection launched from that discussion and nothing for others. The disabled button is unchanged when no host handler is passed (existing tests). |
| **D. Main chat → Projects** | "Help me with my launch project" reached nothing. The coach was panel-only. | One Brain `route:projects` finds the **saved** project the member named and answers **in chat** with the Project Homes next-step engine: the member's own chosen step, a grounded suggestion, or an honest "I don't know enough yet". It then offers the project's Project Home; "yes" opens it. With two matches it asks which; with no saved project it defers (nothing invented). | Grounded step answered, read-only; "Okay, let's do that." → `project_home`; ambiguity asks with nothing armed; no project → defer. |

**Why Projects uses the next-step engine, not the old coach.** The old beside-chat Project coach is gated to `workspacePanel === "projects"`. The Founder correction of 2026-08-16 (`CompanionPageClient.openWorkspaceWithSession`) sends saved projects to Project Homes, where chat is hidden. So the certified project intelligence that answers "what next" is the Project Homes next-step engine.

## 7. Context-handoff architecture

- **One payload type** (`handoffs.ts` `CapabilityHandoffPayload`). The owner gets:
  - the member's **actual words**;
  - the target object (profile area, project id, Board discussion id);
  - the **source room**;
  - the **return destination**.
- **Never the whole conversation.**
- **Two carriers:**
  - The OB-3 pending record (`expectedReply.handoff`) for offers. Fresh-only binding means a stale or replaced offer cannot execute.
  - The owner's own one-shot slot for rooms that mount (Claire), mirroring `businessEstateSectionIntent`.
- **Board:** the member's sentence seeds the Board decision (the existing `decisionSeed` pattern).
- **Research:** the question plus what "this" refers to (active topic) and member decisions in play, via `stageConversationResearch`. From the Board: the bounded question and situation summary.

## 8. Return architecture

**Projections over the owners' own records.** This follows the Research pattern; there is no new result store.

| Owner | Where the result goes | How OB-3 / OB-4 can use it |
|---|---|---|
| Claire | Main chat, as a visible "Back from Claire…" message + OB-4 receipt | "change it" → Claire; "undo" → an honest limit |
| Board | Main chat: a visible return, the `BOARD RETURN` model hint, and at most one armed next action (research the missing evidence) | "do that" / "yes" → exactly that action; stale → nothing |
| Research (from Board) | Back into the Board Brief | Research's own return package; reopen also consumes saved research (existing) |
| Research (from chat) | Main chat model context via `activeConversationResearchReturn`, **only while a project is active** (existing lookup, pinned by existing tests) | — |
| Projects | Answered in chat at the moment of the request | "do that" → opens the Project Home |

## 9. Routing authority: retired / kept / deferred

| Seam / router touched | Classification |
|---|---|
| Business-estate nav seam (`detectBusinessEstateNavIntent` block) | **REPLACED by One Brain** for its turns: the connect block runs first with the same recognizer, and adds context. The seam remains **LEGACY behind rollback** (kill switch) and for binding turns. |
| Continuity gate `board_invite` (for `board_member` turns) | **REPLACED by One Brain.** It is the same invite mechanism. **LEGACY behind rollback.** |
| Board intake `route_to_owner` | **KEEP as domain specialist**; now connected to the Board Room |
| Frictionless research `direct_action` ("Study Hall… I'll gather what's current") | **REPLACED by One Brain** for recognized research turns (an honest offer instead of a promise). **DEFER** for others. |
| `researchIntelligenceHintForChat` + prompt "you own research" | **REPLACED** with honest research instructions |
| Hand-written prompt feature lists | **REPLACED as authority** by the `ESTATE CAPABILITIES` block. Kept as conversational examples. |
| Work Recognition first refusal | **DEFER.** It shadows Plan My Day and VTS (§13). |
| `universalAccess` / `resolveExplicitCapabilityIntent`, Remember owner, Create fast path, Day Designer, estate concierge, estate guide | **KEEP as execution adapters** (One Brain defers) |
| `detectClientAvatarExploration` | **KEEP as domain specialist.** Duplicate-owner question (§13). |
| `chamber_invite`, `resolveStrategyOpenFromChat` | **DEFER to a later round** |
| Project coach (beside-chat panel) | **LEGACY.** It is unreachable for saved projects by Founder rule; Project Homes is the owner. |

No working code was deleted.

## 10. Capability certification results

| Family (no room named) | Result |
|---|---|
| Claire: "Help me update my business profile." / "I need to update what my business does." | **Connected** with context |
| Claire: "I need to change how I describe my business." | **Not discovered** (GAP §13-1); One Brain does not guess |
| Claire: "My ideal client is different now." | **Deferred** to the Client Avatar Builder's own recognizer (DUPLICATE owner §13-2) |
| Board: "What does the board think about this?" | **Board invite**, words kept |
| Board: "I want several perspectives on this." | **Offered** (the Board's own phrase; confirm) |
| Board: "I need help making a big business decision." | **Not discovered** (GAP §13-3) |
| Research: "Research this before I decide." / "Find out whether this is actually true." | **Offered**; "yes" stages the member's own question |
| Research: "What evidence do we have?" | No guess |
| Projects: "…what to do next on my launch project." / "…my website project." / "What's holding up my project?" | **Answered in chat** from the saved project; Project Home offered |
| Events: "Help me with my event." | Deferred (existing seam) · "I'm planning a webinar." — **GAP** |
| Strategy: "I need help with my pricing." | Deferred · "I need a strategy for this." — **GAP** |
| Create: "Help me create a client onboarding guide." | Deferred (Create) |
| Plan My Day: "Help me plan today." | Deferred; **Create shadows it** (§13-6) |
| Reminder: "Remind me tomorrow to call Susan." | Deferred (Remember owner) |
| Rhythm: "I want to do this every month." | Deferred; **referent lost** (§13-9) |
| VTS: "Can you map this out visually?" | Deferred (universal access) |
| Ambiguous / overlapping ("Update my business profile for my launch project.") | **Short choice**; only an offered option can be chosen |
| Unsupported ("Can you send an email to my client for me?") | No capability claimed; the prompt says Spark cannot send |
| Capability question ("What can you do?") | No route; the model answers from the projection |
| Discussion-only (Boundary `talk_about`) | Never selects |
| LOW meaning | Offers, never connects |
| Correction after return | Claire: back to Claire. OB-4 families unchanged. |
| Yes after return | Binds to exactly the armed next action |
| Clarification during handoff | Offer preserved (OB-3); "yes" next turn binds |
| Stale handoff / decline | Nothing executes / offer released |
| Active-work interruption | A direct Claire connection does not replace an armed Rhythm offer |
| Kill switches | `null` → legacy only |

The deterministic matrix is `capabilityConnect.ob5.test.ts` (44 cases) plus 5 new page-wiring guards in `oneBrainConsumers.test.ts`.

## 11. Safety proofs

| Proof | Result |
|---|---|
| False actions (a member store written by selection or offer turns) | **0.** The storage snapshot over every family turn is unchanged. |
| Actions without authorization | **0.** Only an owner-armed, fresh, bound offer executes (`pendingBinding.executable`). Claire still writes only after **her own** member confirmation. |
| False capability routes | **0 connected false routes in the matrix.** Catalog-only and LOW candidates are only *offered*. |
| Ambiguous routes that correctly asked | Two-owner overlap → choice. Two matching projects → "which project". LOW → offer. |
| Context-loss failures in the four connections | **0.** Every handoff carries the member's words and target. |
| Results stranded without return | Claire, Board, Board → Research and Projects: **0**. Research from chat without an active project: **still stranded** (§13-8). |
| Stale handoffs executed | **0** |
| Existing work destroyed | **0.** Deferred owners are untouched; an armed Rhythm offer survives a Claire connection. |
| Known limit | Boundary's stance contract marks only executable "talk about" as discussion. A *discussion* that names a connected owner ("I was reading about the board…") can receive an **offer**, never an action. This is recorded, and the next round should consider widening the stance contract in Boundary itself. |

**Room divergence vs OB-4 baseline:** **0 / 285**. All OB-1 / OB-2 / OB-3 / OB-4 certification stays green.

## 12. Specialist intelligence findings

The full inventory is in `BRAIN_SPARK_ESTATE_INTELLIGENCE_INVENTORY.md`. Headlines:
- **7 Board/advisor rosters, and no shared advisor registry.**
  - Runtime Board = the reconstructed **seven** (RP-1 to RP-7).
  - The legacy **twelve** survive for history and cards.
  - A 20-member advisory model is still imported by the Boardroom UI.
- **Two "Chambers".**
  - Chamber of Momentum: 24 members; 19 deep-intelligence modules, **flag OFF**.
  - Strategy Chamber: 11 domains, **only pricing and growth are full packs**, no LLM.
- **Director specialist and research escalations are declared data only.** OB-5 connects Research at the Brief, not per Director.
- **Dormant but built:**
  - `buildCompanionTurnIntelligence`
  - the Events prompt hint (orphan)
  - founder governor and founder advisor board
  - signal bus / learning (flags OFF)
- **Stale self-descriptions** in `reconstructed/registry.ts`, `boardRuntimeAuthority.ts`, `conversationBoundary.ts` and `chamberExpertRegistry.ts`. The architecture ledger undercounts the Board.

## 13. What Spark still cannot do from natural conversation, and why

| # | Member says / needs | Why | Smallest connection |
|---|---|---|---|
| 1 | "I need to change how I describe my business." | **Capability exists, disconnected.** Claire's chat recognizer (`BUSINESS_PROFILE_NAV_RE`) is narrow, and also over-broad ("help me build my business" opens Claire). | Give Claire a recognizer built from her own member labels (`browseExploreLabels.EXPLORE_MEMBER_LABEL_BY_SOURCE`). Consume it in the read path. |
| 2 | "My ideal client is different now." | **Duplicated owner.** The Client Avatar Builder and Claire's People-I-Help both own it. | A Founder decision on one owner. The read path then routes to it. |
| 3 | "I need help making a big business decision." | **Knowledge unavailable.** The Board has no member-need recognizer, only its name and its own copy. | A need recognizer in the Board's own module (from its "use it when…" copy), read by the read path |
| 4 | "I'm planning a webinar." | **No handoff.** `detectEventIntent` has no chat consumer; the Events doorway is menu-only. Chat turns go to generic Create. | Adapter: One Brain → `openCreateEventsDoorwayCore` with `isEventDomain` + the member's words |
| 5 | "I need a strategy for this." / pricing | **No handoff.** The Strategy Chamber is button-only; `resolveStrategyOpenFromChat` opens the library. Pricing intelligence never reaches chat. | Adapter: `StrategiesPanel.beginChamberEntry` seeded with the request + strategy type (already recognized) |
| 6 | "Help me plan today." | **Owner shadowed.** Work Recognition claims it as a Create "Document"; Plan My Day also loses context (opener id only). | Work Recognition yields when One Brain recognizes a non-Create owner; pass the request to Plan My Day |
| 7 | "Make a mind map of my ideas." | **Owner shadowed** by Work Recognition before universal access | Same yield rule as #6 |
| 8 | Research from chat, no active project | **No return.** The existing lookup needs `activeWorkProjectId` (pinned by tests). | A Founder decision to allow a topic-only conversation return |
| 9 | "I want to do this every month." | **Context lost at Act.** The Remember owner titles it "I want to do this". "Every Monday…" goes to `attentionObligation` (duplicate owner). | Pass the active-topic referent to the Remember owner; settle the Rhythm vs `attentionObligation` owner |
| 10 | Living Model Canvas | **Disconnected.** It opens only inside Claire. | Claire handoff kind `lmc` already exists; add an `lmc` open flag to the Claire handoff |
| 11 | "Ask the board about hiring." | **Mis-route.** The Chamber step runs before the Board step (`classifyMemberIntent`), and the Chamber invite drops the sentence. | Reorder or make the ambiguity explicit; carry `sourceText` on the Chamber invite |
| 12 | Director-level research / specialist escalation | **Declared, not wired** (`collaborationProfiles`) | Route a Director's `researchEscalation` through the Board → Research connection built here |
| 13 | Send an email, write the calendar | **External integration missing** (OAuth scope; no email connection) | Out of scope (external construction) |
| 14 | Share a file in chat | **Capability genuinely missing** in chat (no composer upload) | — |
| 15 | Project Brain (LLM next action) from chat | **Disconnected**, and it duplicates the Project Homes engine | Decide on one next-step owner |

## 14. Full-suite / typecheck / lint evidence

Compared against the accepted OB-4 base (`b9ef5d6a`).

| Check | Result |
|---|---|
| Full Vitest suite | OB-4: 20,882 tests / 459 failing → OB-5: 20,931 tests / 459 failing. **NEW failures: 0.** The two journal snapshot tests only appear under a different worktree path; they are the same tests. All 459 failures are pre-existing on OB-4. |
| One Brain certification (`lib/oneBrainCertification`) | **279 / 279.** This is OB-1 to OB-4's 230, plus 44 OB-5 capability cases, plus 5 new page-wiring guards. |
| Room divergence vs OB-4 baseline | **0 / 285** |
| TypeScript (`tsc --noEmit`) | 353 errors, **identical multiset** to the baseline (0 new) |
| ESLint (changed + new files) | **171 → 171 (0 new)** |

**Intentional test updates (behaviour changed on purpose):**
- `oneBrainConsumers.test.ts`: Claire's receipt recorder was added to the recorder allowlist. OB-5 guards were also added.
- `conversationGate/jobFamilyComposition.ts` + 2 tests: the research-section signal moved from "gather and synthesize it automatically" (the fabricated-research instruction OB-5 removes) to the honest Research Library offer.

**Also changed in One Brain's own lexicon:**
- The bare-acceptance set gained "let's do that" / "do that", beside the existing "let's do it".
- The brief requires "Okay, let's do that." to bind after a return. It previously read as an unrecognized tail, which is LOW confidence.

## 15. Exact remaining connection gaps

**By owner** (every row is one adapter over existing code, per §13):
- **Events:** #4
- **Strategy Chamber:** #5
- **Plan My Day and VTS:** #6 and #7 (the Work Recognition yield rule)
- **Rhythms:** #9
- **LMC:** #10
- **Chamber invite:** #11
- **Director escalations:** #12
- **Chat → Research return:** #8
- **Claire recognizer:** #1
- **Board need recognizer:** #3

**Two ownership decisions for the Founder:**
- Ideal client: Claire or the Client Avatar Builder (#2).
- Rhythm or `attentionObligation` for "every Monday…" (#9).

**One architecture decision:** widen Boundary's stance contract so discussion-vs-request covers non-executable capabilities (§11 known limit).

## 16. Recommended OB-6 scope

**"Connect the remaining owners" — finish CONNECT before KNOW.** The evidence says the highest-impact failures left are *connection* failures on owners that already exist (§13 #1–#11), and each is one adapter on the handoff/return contract built here.
- Recommended order:
  1. the Work Recognition yield rule (unblocks Plan My Day and VTS);
  2. Events;
  3. Strategy Chamber with the pricing domain;
  4. the Rhythm referent;
  5. Claire's and the Board's own need recognizers;
  6. the Chamber invite `sourceText`.
- Include the two Founder ownership decisions.
- Unified member knowledge (the original OB-6 "KNOW" lens) is better as OB-7, once every owner is reachable.

---

## Final question

*If the capability, specialist, knowledge or tool already exists somewhere in Spark Estate, can One Brain find it, get the member to it with the right context, use it appropriately, bring the result back, and continue the conversation?*

**For Claire, the Board, Board → Research, and Projects: yes.** Each is found through its own existing recognizer, reached with the member's words, used within its own confirmation contract, and returned to the conversation where OB-3 and OB-4 can bind "do that" and "change it".

**Elsewhere: not yet.** The exact broken connections are:
- Events (no handoff)
- Strategy Chamber (no handoff)
- Plan My Day and VTS (shadowed by Work Recognition)
- Rhythms (referent lost)
- LMC (no chat route)
- Chat → Research (returns only with an active project)
- the Claire, Board and ideal-client recognizers (narrow or duplicated)
- Director escalations (declared only)

None needs a new brain, catalog or router: each is one adapter over code that already exists.

*Verification: code trace plus deterministic certification. No browser run and no live model run.*
