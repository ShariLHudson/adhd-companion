# BRAIN SPARK ESTATE™ — Capability Connection Audit
## What Spark is already supposed to do, and where the connection breaks

**Scope.** This is a read-only audit of `ShariLHudson/adhd-business-companion-vs3` at the OB-2R working state (base `6b48a4bc` plus the OB-2R edits). It records repository truth, not a wishlist. Every claim cites a file. No capability was built in this round.

**How it was done.**
- I traced each capability from the member's natural-language sentence in main chat (`app/companion/CompanionPageClient.tsx`, 31,817 lines) through every seam that can intercept it, into the room that owns it, and back.
- The question at each step was whether the chain holds: **Understand → Connect → Decide → Act → Return → Continue**.
- "First broken connection" means the earliest step at which that chain fails.

**Limits.**
- This is a code trace. There was no browser run and no live model run.
- Where I did not trace something to the end, the text says **not traced**, not "missing".

**Bucket key:**
- **A** works;
- **B** built but not connected;
- **C** connected in only some rooms or paths;
- **D** One Brain cannot discover or route to it;
- **E** context is lost at handoff;
- **F** cannot act or write correctly;
- **G** the result does not return to the conversation;
- **H** duplicated;
- **I** partially built;
- **J** truly missing.

---

## 0. The one structural fact that explains most failures

**One Brain decides *what the member is doing*. It does not decide *which capability is relevant*.**

**Evidence:**
- **Boundary's input has no capability field.** `BoundaryTurnInput` (`lib/conversationBoundary.ts:162-175`) holds only these: the text, the turn, the active topic, active work, a pending question, a pending offer, suspended items, the last assistant text, armed items, and the last executed item. Nothing in it names a room, a specialist or a capability.
- **CONNECT happens outside One Brain.** After Boundary runs (`CompanionPageClient.tsx:16589`), it happens in about 20 page-level regex seams. Each one is gated only by `!boundaryClaimedTurn`. Some of the seam call sites:

  | Seam | Location |
  |---|---|
  | Work Recognition | `:17404` |
  | Universal capability | `:17853` |
  | App-feature navigation | `:19342` |
  | Estate guide | `:20382` |
  | `resolveFrictionlessAction` | `:21443` |
  | Strategy open | `:21836` |
  | Estate intelligence route | `:23613` |

- **The biggest router is a 6,243-line regex layer.** `lib/frictionlessActionLayer.ts` itself consults the capability catalog, navigation intelligence, estate-intelligence runtime and concierge (`:391`, `:421`, `:450-453`).
- **The model cannot act.** The main chat model call (`app/api/companion-chat/route.ts:374-379`) is `gpt-4o-mini` with **no tools**. The system prompt tells it so: "Never claim you opened, saved, or drafted from chat" (`lib/companionPrompt.ts:196`).
- **So a capability is reachable from natural language only if some regex seam was written for it.** If none was, the model can at most *name* the feature.

**Consequence.** The member *does* have to know how to phrase things, or which room or button to use, for any capability without a seam. This is the root cause behind most D, C and G findings below. It is a **connection** problem, not a construction problem: the capability catalog, the rooms and the specialists already exist.

---

## 1. What Spark can do now (A — the full chain works from natural language)

| Capability | Evidence |
|---|---|
| **Reminders:** create from a chat sentence, ask for a missing time, save | `resolveReminderTurn` at `CompanionPageClient.tsx:18193`; the reminder driver in `roomDrivers.ts` executes and stores |
| **Rhythms:** offer → "yes" → create | `lib/rhythms`, and `lib/remindersVsRhythms/conversationPending.ts`. The offer-pending "yes" row is green in the matrix. |
| **Create (Universal Creation):** discovery from chat, workspace, Current Focus | `lib/universalCreation`, `lib/createEstate/entranceUnderstanding.ts`, `lib/currentFocus/*`. Discovery holds on clarification (OB-2/OB-2R). |
| **Plan My Day / Day Designer** from chat | `lib/day-designer` (`CompanionPageClient.tsx:2642`); `lib/planMyDayRouting` (`:1886`) |
| **Research:** launch from conversation, with the result **returned** into the chat | `lib/researchLibrary/conversationResearchLaunch.ts`; the return path runs through `activeConversationResearchReturn` / `researchReturnHintForChat` (`CompanionPageClient.tsx:1542-1544, 23722`). This is one of the few full round-trips. |
| **VTS (Visual Thinking Studio) menu:** offer → choose → open | `lib/visualThinkingContinuation`, `lib/visualRecommendationEngine`; the matrix rows are green |
| **Estate identity and room canon answers** | `lib/canonContext/canonContextForChat.ts:14-23`, injected server-side into every chat (`route.ts:346-353`) |
| **Board intake invite from conversation:** the continuity gate offers the Board, "yes" seeds the decision | `CompanionPageClient.tsx:17642-17663` (invite), `:17134-17160` (acceptance) |
| **Strategy open from chat** | `resolveStrategyOpenFromChat` (`:21836`) |
| **Calendar handoff (no account needed):** prefilled Google/Outlook links and `.ics` files | `lib/calendar/memberCalendarDestination.ts`; stated honestly in `companionPrompt.ts:252` |
| **Hold-and-answer (One Brain) in every converged room** | OB-2 + OB-2R: clarify, ask and unsure hold with the room's own explanation. Matrix: 2/120 and 4/285 diverging (Rhythm only). |

## 2. What Spark already has but cannot reliably use (C / D)

| Capability | What exists | First broken connection | Bucket |
|---|---|---|---|
| **Claire / Business Understanding** | A full conversation engine, a write-candidate contract, confirmation, and the `claire-reasoning` API (`lib/businessProfileFounder/*`, `app/api/claire-reasoning/route.ts`) | **No path from main chat.** `CompanionPageClient.tsx` contains no reference to Claire. Claire is hosted only in `ProfileDestinationHost.tsx:5` (Profile → My Business Profile, a button) and the prototype page. A member who says "I want to update what my business does" in chat never reaches Claire. | **D** |
| **Estate capability catalog** (what each capability is for, when to use it, its room, whether it can launch) | `lib/estateCapabilityRegistry/catalog.ts` (composed from `estateBrain/capabilityRegistry` and the creation plugins) | The catalog reaches runtime **only through regex seams** in `frictionlessActionLayer` (concierge, `:450`). **It is never given to the model or to Boundary.** The model's prompt instead carries a separate hand-written list (`companionPrompt.ts:205-213`, 262) that omits Claire, Events, Strategy Chamber, Rhythms and Reminders. It mentions the Board only as an *advisory voice* (`:177-191`), not as the Board Room. | **D + H** |
| **Board of Directors: deliberation, Directors' reasoning, handoffs** | `lib/board/reconstructed/*`, `app/api/board/*` | It is reachable only through the continuity-gate invite (C). The Board's **results do not return to main chat**: no Board outcome, recommendation or settled decision is read anywhere in `CompanionPageClient.tsx` (a search for `boardOutcome\|boardRecommendation\|settledDecision…` finds 0 matches). | **C + G** |
| **Projects coach** | `lib/projectCoachSession`, `lib/projectsIntelligence`, `app/api/project-brain` | It runs only while the Projects panel is open (`CompanionPageClient.tsx:22972`, `workspacePanel === "projects"`). Saying "help me with my launch project" in chat does not start it. | **C** |
| **Strategy Chamber specialists** (pricing and other domain intelligence) | `lib/strategyChamber/intelligence/registry.ts`, `…/domains/pricing/*`, `chamberAuthorizedPromptBlock` (`route.ts:256-262`) | The specialist context reaches the model **only when the Chamber authorizes a prompt block** (passed in by the client). Outside the Chamber the specialists are not consulted. | **C** |
| **Events** | `lib/eventsIntelligence/*`, `lib/eventsEstate/*` | The Events entrance and Current Focus work. Whether a chat sentence starts Events directly: **not traced** to a single seam in this round. | **C** (partial trace) |
| **LMC (Living Model Canvas)** | Business-model projection of the profile (`lib/lmc/*`) with an LMC → Claire handoff (`lib/businessProfileFounder/lmcClaireHandoff.ts`) | It is a Profile surface only; no chat path reaches it (same break as Claire) | **C/D** |
| **Files and uploads** | Upload inputs exist in panels: `ProjectAssetsPanel`, `IdealClientBuilder`, `Growth*`, `MyProfilePanel` | **The chat composer has no file input** (0 × `type="file"` in `CompanionPageClient.tsx`). A file cannot enter the conversation, so One Brain never sees it. | **C** |
| **Member knowledge and context** | Business profile (`companion-business-profile-v1`), relationship memory (`companion-relationship-memory-v1`, `lib/companionAdaptiveUserEngine.ts:44`), estate memory (`spark:estate:memory:v1`), strategy decision memory (`spark:strategy-decision-memory:v1`) | The chat receives a client-assembled `businessContext` string (`CompanionPageClient.tsx:23776`). Rooms read their own stores. The Estate's own ledger states "Three relationship stores" and "Companion profile is client localStorage — no server-authoritative sync" (`lib/adaptiveCompanionArchitecture.ts:133, 222`). | **H + E** |

## 3. What is built but disconnected (B), by the code's own admission

| Built piece | Evidence that it is disconnected |
|---|---|
| **Board shared handoffs** → decision record, evidence research, specialist intelligence, execution next step | `resolveSharedHandoffConnectionStatus` returns **`DESTINATION_NOT_CONNECTED`** for everything except Board re-entry (`lib/board/reconstructed/sharedHandoff/resolveDestinationCapability.ts:29-36`). Tests assert it (`atomic8.test.ts:136,176,308`; `atomic9c.test.ts:130,235`). |
| **Board Room "Research this", "Bring into meeting" and "Ask about this"** | Marked `status: "seam_only"`, with member toasts saying "isn't connected in this proof yet" (`lib/board/visualFoundation/boardRoomV4BCapabilitySeams.ts:6-34`). Research exists (§1); the Board → Research connection does not. |
| **Board handoff packaging** | `DESTINATION_NOT_CONNECTED_YET` status labels (`lib/board/delivery/handoffPackaging/types.ts:23,31`) |
| **Founder board for end-user chat** | "Founder board not wired through companionIntelligenceRouter for end-user chat" (`lib/adaptiveCompanionArchitecture.ts:303`) |
| **Continuous learning** | "Production learning OFF by default", "Signal bus in shadow mode only" (`adaptiveCompanionArchitecture.ts:329-331`) |
| **Governor as the turn authority** | "Governor OS not sole turn entry (page.tsx still orchestrates)" (`adaptiveCompanionArchitecture.ts:192`) |

## 4. What is duplicated (H) and the likely canonical owner

| Responsibility | Implementations found | Likely canonical owner |
|---|---|---|
| **Estate self-knowledge** (what the Estate is, its rooms, capabilities and places) | `canonContext` (canon + `estateKnowledgeBase` loader); `estateKnowledge/estateKnowledgeRegistry`; `estateKnowledgeBase` (locations, assets, aliases, vocabulary); `estateBrain/{capabilityRegistry,expertRegistry,knowledgeRegistry,environmentRegistry}`; `estateCapabilityRegistry/catalog`; `estateObjectIntelligence/estateObjects`; `estateExperiences/registry`; `estateMap/*`; `sparkKnowledge/estateGuide`; `appFeatureNavigation`; `universalBlueprintInterface/capabilityManifest`; `presentation/sparkFeatureRegistry`; plus the **hand-written lists in `companionPrompt.ts:205-262`**. **At least 12 sources.** | `estateCapabilityRegistry/catalog` for *capabilities* (it already composes estateBrain and the creation plugins); `canonContext` for *identity and canon*. The others should become adapters that read from these two, not parallel sources. |
| **Intent / capability routing** | `frictionlessActionLayer`; `conversationRouter/*`; `companionIntelligenceRouter`; `estateIntelligence/estateCommandRouter` (+ `estateConversationPipeline`); `estateBrain/routeEstateIntelligence` and `routeIntentFirstNavigation`; `estateNavigationIntelligence`; `estateIntelligenceRuntime` → `semanticIntentResolver`; `estateHelpDiscoveryIntelligence`; `universalAccess`; `conversationContinuity/resolveContinuityGate`. `lib/` holds **864 exported `route*/resolve*/classify*` functions across 666 files**. | Boundary for *what the member is doing*. **There is no single owner yet for *which capability*.** That gap is the OB-3/OB-5 target (§10). |
| **Acceptance ("yes") parsing** | **24** production files hold their own affirmation detectors (e.g. `pendingAcceptanceAuthority.ts:90,94` `isBareGenericAcceptance`/`isAcceptanceAttempt`; `confirmationContract.ts:50`; Work Recognition's `isSimpleAffirmation`). The model prompt adds another: "YES MEANS CONTINUE" (`companionPrompt.ts:201`). | Boundary + `permitsFor.mayExecute` (OB-3, already scoped) |
| **Correction handling** | **15** production files hold their own correction detectors (e.g. Board `detectConversationalMove`, `classifyMemberBoardResponse.ts:55`, now legacy-only; Events `applyCorrections`; Remember's decline rule, which causes the Rhythm "Tuesday" defect) | Boundary `relation = correct` + the owner's correction specialist (OB-4) |
| **Pending-question and offer state** | **30** production files hold `pendingQuestion`/`PendingQuestion` state (for example the frictionless pending store `companion-frictionless-pending-v1`, `frictionlessActionLayer.ts:658`; Board, Events, Create, Claire and Remember each keep their own) | A single spine `pendingOwnerSnapshot` (OB-3, already scoped) |
| **Advisor models** | "Three parallel advisor models (4 workspace, 7 founder, 8 legacy AdvisorType)", "No shared advisor registry" (`adaptiveCompanionArchitecture.ts:301-302`) | The reconstructed Board registry (`lib/board/reconstructed`) |
| **Prediction** | "Two prediction systems" (`adaptiveCompanionArchitecture.ts:249`) | Not in One Brain scope; noted only |

**Not consolidated on purpose.** Several of these share names but serve different jobs: `estateMap` (the visual map), `estateExperiences` (scenic places) and the capability catalog. Merging them would be wrong. The fix is one **read path** for One Brain, not a merge.

## 5. What is partially built (I)

| Piece | Evidence |
|---|---|
| Enumerated armed offers and receipts for Boundary | `armedItems` / `lastExecuted` exist in `BoundaryTurnInput` (`conversationBoundary.ts:171-174`) but are commented "not yet fed by production" |
| Rhythm post-execution correction | The receipt exists (`phase: "executed"`, `executedItemId`) but the correction path is not wired; this is the 4 remaining matrix cells (OB-4) |
| Behavioral scenario registry | "categories still TypeScript union, not data-driven registry" (`adaptiveCompanionArchitecture.ts:164`) |
| Profile learning | "disabled by default (NEXT_PUBLIC_PROFILE_LEARNING)" (`adaptiveCompanionArchitecture.ts:132`) |

## 6. What is truly missing (J), with evidence that no equivalent exists

| Missing | Searches that found nothing equivalent |
|---|---|
| **Main-chat model tool use / function calling** (the model *doing* something) | `app/api/companion-chat/route.ts`: no `tools`, `tool_choice`, `function_call` or `tool_use` (a search for all four returned 0 matches). The only other model routes (`claire-reasoning`, `board/*`, `generate`, `research-live`) are room-internal. |
| **Writing to the member's actual calendar** | The Google OAuth scope is `drive.file forms.body openid email` only (`lib/google.ts:6-7`). No `googleapis.com/calendar` anywhere in `lib/`. The link-out and `.ics` path exists and works (§1). |
| **A capability-selection authority inside One Brain** | `BoundaryTurnInput` has no capability field (§0); no module takes Boundary's decision plus the catalog and returns a capability. The routers in §4 each choose on their own. |
| **Email account connection** | Stated as not built (`companionPrompt.ts:254`); consistent with the OAuth scope above |

Nothing else is labelled J. Everything else the Estate claims to support exists in some form.

## 7. Why each important failure happens (root cause, not symptom)

1. **A member asks for something with no seam, and Spark only talks about it.**
   - Root cause: CONNECT lives in regex seams, not in One Brain, and the model has no tools (§0).
2. **Spark says a feature isn't there, or names the wrong one.**
   - Root cause: the model's feature knowledge is a hand-written prompt list (`companionPrompt.ts:205-262`), not the capability catalog, so the two disagree.
   - For example, the prompt list never mentions Claire, Events or the Board Room.
   - Worse, the prompt tells the model that it "owns research" and should "gather and synthesize it automatically" (`companionPrompt.ts:63-64`), but the model has no tools. The prompt instructs a capability the model cannot perform; the real Research path is a separate launch-and-return flow (§1). This is an **F** risk: Spark may present unsourced text as research.
3. **The Board decides something and main chat doesn't know.**
   - Root cause: the Board result is not read back into the conversation (G), and its handoffs are `DESTINATION_NOT_CONNECTED` (B).
4. **Claire is unreachable from "update my business info".**
   - Root cause: Claire is only a Profile destination; there is no handoff from chat (D).
5. **"Yes" does the wrong thing after a detour.**
   - Root cause: 24 local yes-detectors, and ~20 page fast paths that bind "yes" to whichever offer they own (H). This is already scoped as OB-3.
6. **The Rhythm "No, I said Tuesday" correction fails.**
   - Root cause: the Remember owner's own decline rule reads the correction as a decline, and there is no correction/receipt execution (I/F). This is OB-4.
7. **Context resets between rooms.**
   - Root cause: member knowledge is spread across several localStorage stores, and each room reads its own (H/E; the Estate's own ledger agrees).

## 8. What needs connection rather than construction

| Connect | Existing pieces |
|---|---|
| The capability catalog → One Brain's CONNECT step | `estateCapabilityRegistry/catalog` (`bestUsedWhen`, `requiredRoomId`, `canLaunchDirectly`, `requiresDiscovery`) |
| The capability catalog → the model prompt, replacing the hand-written lists | The same catalog; `canonContext` already shows the server-side injection pattern (`route.ts:346-353`) |
| Board result → main chat | The Board session store and the `memberAskedYou`/shared-handoff shapes; the Research return (`researchReturnHintForChat`) is the working template |
| Board → Research | `lib/researchLibrary/contextualResearch.ts` (named by the seam itself, `boardRoomV4BCapabilitySeams.ts:31`) |
| Chat → Claire | `lib/businessProfileFounder/claireTopicHandoff.ts` and `lmcClaireHandoff.ts` already build topic handoffs *into* Claire; they need a chat-side entry |
| Chat → Projects coach | `projectCoachSession` / `projectCoachHandoff` exist; they need a chat entry instead of the panel-only gate |
| One pending/binding authority | `armedItems` / `lastExecuted` already in `BoundaryTurnInput`; `permitsFor.mayExecute` already exists |

## 9. What One Brain still cannot see or reach

- **Capabilities:** there is no catalog input (§0).
- **Specialists and what they know:** Chamber and Board specialist registries exist but are not inputs to Boundary.
- **Results of rooms it routed to**, except Research.
- **Files:** there is no chat upload.
- **The member's full context:** Boundary gets only the active topic, work and pending state. Business, relationship and estate memory are not unified.
- **Armed offers and receipts:** the fields exist but production does not feed them.

## 10. The smallest remaining work for the Estate to behave like one connected intelligence

This reuses what exists. Each step is a *connection*, and each has a named owner round.

1. **OB-3 — One pending authority** (already scoped in the OB-2 report §17).
   - Feed `armedItems`/`lastExecuted` from the spine.
   - Route the ~20 "yes" fast paths and the 24 local affirmation detectors through Boundary + `permitsFor.mayExecute`.
   - Fold in Claire's subject-change check and the B-10 Decision Ledger case.
2. **OB-4 — Receipts and corrections.**
   - Connect `relation = correct` against `lastExecuted` to the owner's correction/receipt path.
   - This fixes the 4 Rhythm cells, the only remaining matrix divergence.
3. **OB-5 — Capability connection (the CONNECT step).**
   - Give One Brain *one read path* to `estateCapabilityRegistry/catalog`: a `capabilityCandidates` input computed from the catalog, not new vocabulary.
   - Inject the same catalog into the model prompt in place of the hand-written feature lists.
   - Existing seams then become consumers of One Brain's choice, removed one by one. This is the same method as OB-2's room gate.
   - First connections, in order of member impact:
     - Chat → Claire;
     - Board result → chat, reusing the Research-return template;
     - Board → Research;
     - Chat → Projects coach.
4. **OB-6 — Knowledge (KNOW lens).**
   - Make member context one read model over the existing stores (business profile, relationship memory, estate memory, strategy memory) for Boundary and the rooms.
   - Do not create a new store.
5. **Only after OB-5, and only if the Founder wants Spark to act in external systems:** decide on genuinely missing pieces (model tool use, calendar write scope). These are the only J items that need construction.

**Sequence from here:**

OB-2R (done; committed locally) → **OB-3** pending/binding → **OB-4** receipts/corrections → **OB-5** capability CONNECT (catalog → One Brain → seams retired) → **OB-6** unified member knowledge → (optional) external action tools.

---

*Read-only audit. No capability was built. Items marked "not traced" were not followed to the end in this round.*
