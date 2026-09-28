# BRAIN SPARK ESTATE™ — Intelligence Inventory
## What Spark already has: specialists, advisors, engines, and system intelligence

**What this is.**
- A repository-backed inventory of the specialist and system intelligence that already exists in `ShariLHudson/adhd-business-companion-vs3`.
- Taken at the OB-5 base `b9ef5d6a`. The OB-5 edits change no specialist intelligence.
- Every row cites a file. **"Not traced"** means the item was not verified end to end; it does not mean the item is missing.
- Nothing in this document was built in OB-5. The inventory exists so the Founder can decide what to **connect** before anything new is **built**.

**How to read "One Brain".**
- *Discover*: can main chat (`app/companion/CompanionPageClient.tsx` plus `/api/companion-chat`) find it from a natural sentence?
- *Context*: does it receive the member's situation?
- *Return*: does its result come back into the main conversation?

---

## 0. Top-line findings

1. **At least seven separate Board/advisor rosters exist.** Only two drive the Board room today:
   - the reconstructed **seven**, which handle new discussions and certified server deliberation;
   - the legacy **twelve**, which handle history, the Meet-the-Directors cards and the template engine.

   The other five are all live somewhere or only half-wired: 20 advisory members, 7 founder advisors, 4 workspace advisors, 8 legacy `AdvisorType`s and 15 Estate experts. **There is no shared advisor registry** (`lib/adaptiveCompanionArchitecture.ts` admits this).
2. **There are two different "Chambers":**
   - the **Chamber of Momentum**: 24 members, answered silently in main chat;
   - the **Strategy Chamber**: 11 strategy domains, deterministic, no LLM, and it runs in the Strategies panel.
3. **Several intelligent pieces look live but are not wired:**
   - Board Director specialist and research escalations are declared data only.
   - Chamber deep intelligence (19 expert modules) sits behind a flag that defaults OFF.
   - `buildCompanionTurnIntelligence` is never called in production.
   - `eventsIntelligenceHintForChat` has no production consumer.
   - The founder `lib/governor` is not used in member chat.
4. **Several files describe themselves wrongly:**
   - `lib/board/reconstructed/registry.ts:1-4` and `lib/board/boardRuntimeAuthority.ts:4-8` say "NOT wired to member-visible runtime". They are wired.
   - `lib/conversationBoundary.ts:1-6` says "PURE, UNWIRED". It is wired.
   - `lib/chamberExpertise/chamberExpertRegistry.ts:9-10` says "not imported by chat runtime". It is consumed through activation.
   - The Board layer of `lib/adaptiveCompanionArchitecture.ts` never mentions `lib/board/`.
5. **Claire, Project Brain, the Strategy engine and Events intelligence are strong but isolated.** Before OB-5, main chat could not reach Claire. OB-5 connects Claire and Projects; see the OB-5 report.

---

## 1. Board of Directors

### 1a. Runtime authority (traced)

| Concern | File | Evidence |
|---|---|---|
| Flag | `lib/intelligence-layer/featureFlags.ts:141-149` | `isBoardDeliberationV2Enabled()`: localStorage override, then `NEXT_PUBLIC_BOARD_DELIBERATION_V2`. **Default false.** |
| Authority seam | `lib/board/boardRuntimeAuthority.ts:26-65` | Chooses "legacy-twelve" or "reconstructed-seven". `assertReconstructedBoardDeliberationAllowed()` throws when the flag is off. |
| Roster for new discussions | `lib/board/boardParticipantRoster.ts:1-31` | `NEW_BOARD_DISCUSSION_ROSTER = "reconstructed-seven"`. The legacy twelve are a "read-only history dictionary". |
| Engine selection | `lib/board/boardDeliberationRoute.ts`; `components/companion/board/BoardDirectorDiscussionIntake.tsx:626-775` | A legacy draft uses the legacy template engine. Seven + V2 on goes to the server. Seven + V2 off is held ("not-open"). No fallback either way. |
| Certified server pipeline | `app/api/board/deliberate/route.ts:1-70` → `lib/board/delivery/runCertifiedBoardDeliberation.ts:5-44` | Supabase bearer auth, V2 gate, OpenAI key. Stages: orchestrator → first pass → cross-exam → synthesis → delivery. The LLM call is `lib/internalAgent/invokeStructuredLlm.ts:14` (`gpt-4o-mini`). |
| Material signals | `app/api/board/material-signals/route.ts:19-24` | `reconstructed/selection/modelMaterialSignalExtractor` |
| Legacy-only routes | `app/api/board/recommend/route.ts:1-9` ("LEGACY… No member-facing surface calls this route"); `app/api/board/directors/*`, `app/api/board/relationships/*` | Legacy twelve metadata |
| Board UI | `components/companion/boardroom/BoardroomRoomPanel.tsx:15-91` | Imports the roster, `visibleDirectors` (legacy twelve), `reconstructed/types`, **and** `lib/boardroom` + `lib/advisory/types` (the 20-member advisory model) |

### 1b. The reconstructed seven: the authoritative contract for new Board work

**Where each part of a Director is defined:**
- Registry: `lib/board/reconstructed/registry.ts:21-42`.
- Identity: `identities.ts:10-74`.
- Reasoning, expertise and guardrails: `reasoningProtocols.ts`, RP-1 to RP-7. The fields are coreReflex, steps, inputPriorities P0–P3, ignoreRules, evidenceStandard, timeHorizon, riskSensitivities, defaultHypothesis, disconfirmationRule, changeMindConditions and silenceRules (types at `types.ts:135-147`).
- Handoffs: `collaborationProfiles.ts`, with crossExamEdges, specialistEscalation and researchEscalation.
- Voice and life story: `voiceProfiles.ts` and `executiveLifeProfiles.ts`, linked through `biographyReasoningLinks.ts`.
- Output guardrail: `firstPass/epistemicContract.ts`.

| reasoningId | Name | Expertise | Legacy origin (`legacyMigrationMap.ts`) | Specialist escalation (`collaborationProfiles.ts`) |
|---|---|---|---|---|
| customer-reality (RP-1) | Sofia Ramirez | demand, pricing, willingness to pay | customer-market (identity kept) | sales-win-loss / pricing (:26, :32) |
| economic-survivability (RP-2) | Margaret O'Brien | cash timing, margin, survival | absorbs Melissa Grant | finance-bookkeeping (:61) |
| recovery-hard-truth (RP-3) | Gerald Novak | stop or recover | absorbs Laura Bennett (partly) | turnaround-ops (:90) |
| scale-systems (RP-4) | Renee Ashford | growth breaking delivery, founder bottleneck | absorbs Marcus Whitaker | operations (:119) |
| strategic-reinvention (RP-5) | James Holloway | opportunity and cost of waiting | growth-opportunity (identity kept); absorbs Victoria and Maya | competitive-intel (:148) |
| human-systems (RP-6) | David Kim | founder and team sustainability | founder-advocate (identity kept) | facilitation (:177) |
| commitment-portfolio (RP-7) | Camille Turner | portfolio gates, one bet | new | data-analytics (:206) |

**Context in (traced).**
- `reconstructed/context/buildAuthorizedBoardContext.ts:74` supplies the situation through authorized consumption with `consumerRole: "board"`.
- `orchestration/contextAssembly.ts:1-9` only shapes that context.

**Results out (traced).**
- Member decision → Decision Ledger, via `lib/board/memberDecision/connectBoardMemberDecisionToLedger.ts` (called from `processBoardRecordMemberResponse.ts:190`).
- Shared retrieval reads Board results in `lib/relevantSituation/retrieveRelevantSituation.ts:604` (`collectCertifiedBoardLedgerItems`) and `:622` (`collectBoardSharedHandoffItems`).
- **OB-5 adds** a direct Board → main-chat return projection; see the OB-5 report §8.

**Disconnected.**
- `specialistEscalation` and `researchEscalation` are read only by `differentiationMatrix.ts:29,53`. No Director invokes a Chamber, Strategy or Research specialist.
- OB-5 connects Board → Research at the Brief level, where the member asks, not per Director.
- The first-pass prompt (`firstPass/buildFirstPassPrompt.ts:6,33-100`) uses only `REASONING_PROTOCOLS`. Voice and executive-life profiles are not in the prompt. Synthesis and delivery prompts were not traced.

### 1c. The legacy twelve (`lib/board/boardDirectorRegistry.ts`)
- Seeds are at :55-573 and the export `BOARD_DIRECTORS` is at :627; narratives come from `directorProfileNarratives.ts`.
- Fields (`lib/board/types.ts:58-96`): purpose, decisionLens, questionsAsked, tone, openingMessage, responseStructure, aliases, watchesFor, chamberContrast, philosophy, whatIProtect.
- Response templates are in `directorResponseProfiles.ts`. The engine is template-based; no LLM was found.

| id | Name | Disposition (`reconstructed/legacyMigrationMap.ts:8-99`) |
|---|---|---|
| board-chair | Thomas Ellison | retired → Spark orchestration |
| vice-chair | Shari Menon | retired → shared execution |
| founder-advocate | David Kim | → RP-6 |
| strategy-director | Victoria Hayes | retired → shared method |
| financial-stewardship | Melissa Grant | retired → RP-2 + finance specialist |
| operations-capacity | Marcus Whitaker | retired → RP-4 |
| customer-market | Sofia Ramirez | → RP-1 |
| growth-opportunity | James Holloway | → RP-5 |
| risk-resilience | Laura Bennett | retired → shared method |
| technology-future | Maya Chen | retired → tech specialist + Research |
| values-trust | Carlos Rivera | retired → shared method |
| devils-advocate | Mateo Vargas | retired → cross-exam method |

Where the twelve are still live:
- Meet-the-Directors cards (`visibleDirectors.ts`).
- The `shouldOpen{Thomas,Shari,Marcus,…}FromEntry` deep links (`BoardroomRoomPanel.tsx:62-68`).
- Director alias resolution in main-chat intent (`lib/memberIntent/classifyMemberIntent.ts:13`).
- History records.

### 1d. Other Board and advisor rosters (duplicates)

| Roster | File | Members | Runtime use |
|---|---|---|---|
| Advisory board (Boardroom v1) | `lib/advisory/members/boardMembers.ts:9-205` | 20: CEO, Visionary, Strategist, Product Manager, Marketing Director, Sales Director, Customer Experience, ADHD Expert, Behavioral Psychology, Learning Designer, Technology Advisor, AI Advisor, Operations, Finance, Community Builder, Creative Director, Research Analyst, Accessibility Expert, … | `lib/boardroom/generateDiscussion.ts` and `recommendBoard.ts`. Still invoked in `BoardroomRoomPanel.tsx:373,404,443`. Reachability of the "new-situation" view is **not traced**. Also used by `lib/profile/advisoryHelp*`. |
| Founder Advisor Board | `lib/ecosystem/board/advisorTypes.ts:1-50` | 7: ceo, marketing, sales, operations, productivity, accountability, wellness | `boardReasoningEngine.ts:182`, `FounderBoardPanel.tsx`, `lib/ecosystem/ops/advisorExecutionEngine.ts`. **Not in member chat** (ledger: "Founder board not wired through companionIntelligenceRouter"). |
| Workspace advisors | `lib/workspaceContextLock.ts:43-58,124-143` | 4: marketing, operations, planning, mindset | Live hint, via `buildWorkspaceBoardAdvisorHint` → `lib/workspaceAwareness.ts:62` |
| Legacy AdvisorType | `lib/companionIntelligence.ts:42-50,137-160,293` | 8: adhd_coach, organization_advisor, business_strategist, marketing_strategist, content_creator, wellness_guide, deep_dive_companion, general_companion | Live. `buildCompanionIntelligence` → `intelligenceHintForChat` injects `ADVISOR_VOICE` |
| Estate experts | `lib/estateBrain/expertRegistry.ts:8-113` | 15: copywriter, research-analyst, marketing-expert, business-strategist, sales-expert, instructional-designer, project-manager, adhd-coach, executive-coach, writing-coach, technology-expert, productivity-specialist, graphic-design-advisor, financial-educator, career-advisor | Metadata only (triggers, specialties, no prompts). These are the `expertIds` on every capability-catalog entry. They reach chat as `legacyExpertIds` through `lib/chamberExpertise/legacyExpertAliasMap.ts`. |

---

## 2. The Chambers

### 2a. Chamber of Momentum: 24 members in three layered registries

| Layer | File | Content | Runtime |
|---|---|---|---|
| Persona cards | `lib/chamber/chamberMemberRegistry.ts:8-33,50-339` | 24 ids (ai-technology … wellness): displayName, specialty, bio, howTheyHelp, activationOpener | Live |
| Prompt and guardrails | `lib/chamber/chamberMemberPrompt.ts:18-107` | `CHAMBER_SHARED_RESPONSE_POLICY` (11 binding rules), `CHAMBER_UNDERSTANDING_FIRST_BLOCK`, a banned-phrase list, an inline Events operating block (:56-71), and a knowledge block | Injected by `CompanionPageClient.tsx` into `intentHint` → `/api/companion-chat` |
| Expert registry | `lib/chamberExpertise/chamberExpertRegistry.ts` | 24 codes (STR, SYS, MKT, CR, FIN, SALES, CNT, PM, AI, RES, CRE, DATA, EVT, HOR, INN, KMG, LEAD, LEARN, MOM, NET, PART, PC, PRES, WELL): activationSignals, outcomeSignals, supportingRelationships (handoffs), intentAffinities | Live via `resolveChamberExpertActivation(V2)`; V2 defaults ON |
| Deep intelligence | `lib/chamberIntelligence/intelligenceRegistry.ts:71-124`; `experts/*.ts` | **19 built:** MKT SYS EVT STR CR FIN PM SALES CNT AI CRE RES PRES LEAD KMG DATA PC MOM WELL. **Missing:** HOR, INN, LEARN, NET, PART. | **Gated OFF** (`isChamberIntelligencePilotEnabled()` defaults false) |
| Knowledge packs | `lib/chamber/knowledge/chamberKnowledgeRegistry.ts:84-150` | Approved and bridged: client-relationships, events, knowledge-management. 12 are "architecture-pack-only / docs-only"; the rest are specialty-prompt only. | `chamberKnowledgeHintForChat` |

**One Brain.**
- Discover: yes. `resolveSpecialistTurnMember` lets a specialist answer silently in main chat.
- Context: yes. `buildChamberAuthorizedPromptBlockForChat` (`lib/chamber/chamberAuthorizedContext.ts:29-45`, role chamber) is gated on `chamberConversationActive`.
- Return: results stay in the chat thread. Handoffs go to Create and Research (`lib/chamber/chamberContextHandoff.ts`). Chamber outcomes are **not** a source in `retrieveRelevantSituation`.

**Prompt path (traced).**
1. `CompanionPageClient.tsx` builds `chamberAuthorizedPromptBlock`.
2. `app/api/companion-chat/route.ts:256-261` truncates it to 2,000 characters.
3. `lib/companionPrompt.ts:693-695` adds it to the system prompt.
4. The model is `gpt-4o-mini`.

### 2b. Strategy Chamber (`lib/strategyChamber/**`)
- **Registry:** `intelligence/registry.ts:14-26` holds 11 `StrategyTypeContract`s, matched on regex `entrySignals` (:47-66).
- **Domain loader:** `intelligence/domainIntelligence/registry.ts:25-37`.
- **Engine:** `intelligence/engine/*` (classify, question selection, options, compare, recommend, readiness, decision record).
- **Frameworks:** `intelligence/frameworks/*`; `optionCatalog.ts` alone is 957 lines.
- **Memory and patterns:** `memory/*` and `patterns/*`.

| Domain | Status | Evidence |
|---|---|---|
| pricing | **Full domain pack** | `domains/pricing/` (pricingDomain 854 lines, pricingIntelligence 483, contract 125) |
| growth | **Full domain pack** | `domains/growth/` (growthDomain 1001, growthIntelligence 537, contract 174) |
| offer, market_customer, capacity_focus, hiring_delegation, partnership, pivot_rethink, personal_direction | Contract level only (187–207 lines each) | `strategyTypes/*.ts` |
| business_direction, ninety_day | Thinnest contracts (100 / 86 lines) | same |
| thin engine parts | `engine/recommendHandoff.ts` (11 lines), `identifyRisks.ts` (14), `designExperiment.ts` (45) | wrappers |

- **No LLM:** no `fetch`, `openai` or `invokeStructuredLlm` in `lib/strategyChamber`.
- **UI:** `components/companion/StrategiesPanel.tsx:90` → `StrategyChamberConversation`.

**One Brain.**
- Context: `buildStrategyAuthorizedPromptBlockForChat` (`strategyAuthorizedContext.ts:35-77`) is gated by `isStrategyChamberTurn`.
- Return: only the prior conclusion string reaches main chat (`strategyChamberContinuity.ts:65-84`). The engine's options, risks, readiness and decision record stay inside the Chamber.
- Memory: `memory/strategicMemoryStore.ts` has no consumers outside the Chamber and is not a situation source.

---

## 3. Room specialists

| Specialist | Runtime files | Prompt / model | Guardrails | Context in | Result back to One Brain |
|---|---|---|---|---|---|
| **Claire** (Business Understanding) | `lib/businessProfileFounder/*` (≈90 files); `app/api/claire-reasoning/route.ts`; mounted via `components/companion/ProfileDestinationHost.tsx:87` → `ClaireBusinessProfileDestination` → `BusinessProfileBp2aPrototype` | `claireReasoningServer.ts` system prompt (strict JSON), `gpt-4o-mini` | Leak guard, praise restraint, reask contract, confirmation contract, write authority (`writeMeaningAuthority.ts`, `p6WriteExecutor.ts`) | Conversation Gate (`claireSharedContext.ts`); LMC handoff (`lmcClaireHandoff.ts`); **OB-5: chat topic handoff** | Writes Business Understanding (read by `relevantSituation/collectBusinessUnderstandingItems.ts`). **OB-5: a confirmed write now returns to main chat.** Networking Intelligence is declared but not invoked (`claireInternalCapabilityMap.ts:1-6`). |
| **Project Brain** (LLM next action) | `app/api/project-brain/route.ts:4-18`; called only from `components/companion/ProjectsPanel.tsx:612` | Inline `PROJECT_BRAIN_PROMPT`, `gpt-4o-mini` | One primary action, at most two backups; energy and overwhelm rules | Project fields only | Stays in ProjectsPanel |
| **Project Homes next-step engine** | `lib/projectHomes/nextStepEngine.ts`, `homeActions.ts:480-530` (`resolveProjectHomeNextMove`) | Deterministic, grounded; "nothing" when there is no evidence | Never restates setup text; member-chosen step wins | Project items, facts, constraints | **OB-5: answered in main chat** |
| **Project coach** | `lib/projectCoachSession.ts`, `projectCoachHandoff.ts`, `projectCoachChoices.ts` | Deterministic coaching in chat | — | Workspace context (needs the old beside-chat ProjectsPanel) | In main chat, only while `workspacePanel === "projects"` |
| **Events** | `lib/eventsIntelligence/*` (record store, question paths, lifecycle, projects bridge); Chamber EVT module; Chamber knowledge pack; inline Events block in `chamberMemberPrompt.ts:56-71` | Via the Chamber prompt | Never Talk-It-Out loops; one question at a time | Room gate (`applyEventConversationalAnswer.ts`) | Projects bridge. **`eventsIntelligencePrompt.ts:16` is an orphan duplicate of the inline block.** |
| **Research** | `lib/researchLibrary/*`; `app/api/research-live/route.ts` (`gpt-4o-mini-search-preview`, fallback `gpt-4o-mini`) | Citation-only rule | `researchTruthfulness`, claim state | `researchAuthorizedContext.ts` | Yes: `researchReturnHintForChat` and `collectResearchItems`. **OB-5: Board origin connected.** |
| **Work Recognition** | `lib/estateBrain/workRecognitionFallthrough.ts` (605 lines) | Deterministic | First-refusal / resumption priority | Message + session | Opens workspaces from chat |
| **Estate coaching** | `lib/estateBrain/estateCoachingRegistry.ts`, `estateCoaching.ts` | Deterministic menus | Coach before navigating | Text | Via `frictionlessActionLayer.ts` / `discoveryMode.ts` |
| **Estate knowledge** | `lib/estateBrain/knowledgeRegistry.ts` (857 lines) | Data | — | — | Navigation and discovery |
| **Visual Thinking (VTS)** | `lib/visualRecommendationEngine.ts`; `app/api/decision-analyze` (LLM) | Deterministic recommender | One decisive fit, at most 2 alternatives, never a default Mind Map | — | `visualRecommendationEngineHintForChat` |
| **Create** | `lib/universalCreation/documentRegistry.ts:30` (22 plugins), `orchestrator.ts`; LLM routes `api/generate`, `refine`, `remix`, `score`, `email-generator`, `create-draft-review`, `templates`, `snippets` | Per route, `gpt-4o-mini` | No invented recipients; ownership boundary | Create consumption policy | In the chat workspace |
| **Day Designer / Plan My Day** | `lib/day-designer/*` | Deterministic | Room gate | — | In chat |
| **Technology future** | `lib/technologyFutureIntelligence/resolveTechFutureOffer.ts:117` | Hint | — | — | Main chat hint |
| Other LLM personas | `api/avatar-research` ("AIRA"), `api/braindump-classify`, `api/founder/guidance`, `lib/ecosystem/founderAiAdvisor.ts`, `lib/pertinentQuestionMove/wordConversationalMoveLive.ts` | `gpt-4o-mini` | — | — | Not traced |

---

## 4. System-level intelligence

| System | Evidence | State |
|---|---|---|
| Conversation Boundary (One Brain) | `lib/conversationBoundary*.ts`; room gate `conversationBoundaryRoomGate.ts` | Live. Governs turn meaning, pending binding (OB-3), corrections (OB-4) and, in OB-5, **capability selection** (`lib/oneBrainCapability`) |
| companionIntelligenceRouter | `lib/companionIntelligenceRouter.ts` (509 lines) | **`buildCompanionTurnIntelligence` (:141) has no production caller.** Main chat imports only `resolveCompanionAcceptanceTurn` and `trackConversationOffer`, so the router's Board step and `interventionLearningHintForChat` / `effectivenessHintForChat` are dormant. |
| Companion Governor | `lib/companionGovernor.ts` | Live (`evaluateCompanionTurn`) |
| Founder Governor | `lib/governor/` | Only via `lib/founder/services/governorBridge.ts`, which nothing imports |
| Estate intelligence | `lib/estateIntelligence/*`, `estateIntelligenceRuntime/*` | `estateConversationHintForChat` is live; `routeEstateIntelligence` feeds Chamber activation |
| Authorized consumption / Conversation Gate | `lib/authorizedEstateConsumption/*`; roles `lib/relevantSituation/types.ts:39-47`; sources `retrieveRelevantSituation.ts:195-622` | Live. Policies for board, chamber, strategy, research and create. Sources: suspended work, projects, estate, vault, research, board ledger, board handoff, business understanding. |
| Signal bus / learning | `lib/intelligence-layer/signalBus.ts` | Shadow mode; flag `NEXT_PUBLIC_UNIFIED_SIGNAL_BUS` defaults off. Profile learning off by default. `closedLoopLearning.ts` and `companionInterventionLearning.ts` are dormant. |
| Action execution foundation | `lib/executionFoundation/capabilityManifest.ts` | One proven executor: Board decision → project starter (`persistProjectStarter`, verifier `verifyProjectExists`) |

**Admitted gaps, quoted from the Estate's own ledger** (`lib/adaptiveCompanionArchitecture.ts`):
- "Profile learning disabled by default".
- "Companion profile is client localStorage — no server-authoritative sync".
- "Behavior rules fragmented across ~15 modules".
- "Governor OS not sole turn entry (page.tsx still orchestrates)".
- "Three relationship stores".
- "Two prediction systems".
- "Three parallel advisor models (4 workspace, 7 founder, 8 legacy AdvisorType)".
- "No shared advisor registry".
- "Founder board not wired through companionIntelligenceRouter for end-user chat".
- "Production learning OFF by default"; "Signal bus in shadow mode only".

**The ledger undercounts.** It omits `lib/board` (12 + 7 Directors), `lib/advisory` (20), the Estate experts (15) and the Chamber (24).

---

## 5. One Brain matrix

| Intelligence | Main chat can discover it | Receives shared context | Result returns to main chat |
|---|---|---|---|
| Board (seven) | Continuity-gate invite; **OB-5: capability selection** | Yes (role board) | Decision Ledger and the Gate; **OB-5: direct return projection plus a visible return** |
| Board (legacy twelve) | Alias only | No | History only |
| Advisory 20 / Founder 7 | No / No | No | No |
| Workspace 4 / AdvisorType 8 | Implicit (hint) | n/a | Same turn |
| Chamber of Momentum 24 | Yes (silent specialist) | Yes | In chat; not in the situation store |
| Chamber deep intelligence 19 | Only when the pilot flag is on | — | — |
| Strategy Chamber | Turn detection only | Yes (strategy block) | Conclusion string only |
| Claire | **Before OB-5: no. OB-5: yes** | Yes; **OB-5: the member's request and topic** | **OB-5: yes, on a confirmed write** |
| Project Brain (LLM) | No | No | No |
| Project Homes next-step engine | **OB-5: yes** | Project context | **OB-5: yes, answered in chat** |
| Research | Yes | Yes | Yes (chat origin needs an active project; see the OB-5 report) |
| Events runtime | Via the Chamber `events` member | Via the Chamber | Projects bridge only |
| Estate experts 15 | Yes (routing ids) | — | Same turn |

---

## 6. Duplicates, and which one runs

- **Board rosters:**
  - reconstructed 7: live for new work and V2;
  - legacy 12: history and cards;
  - advisory 20: Boardroom v1 path, reachability not traced;
  - founder 7: founder UI only;
  - workspace 4: live hint;
  - `AdvisorType` 8: live hint.
- **Finance:** Margaret (RP-2) · Melissa (legacy) · Chamber `finance` + FIN · advisory `finance` · Estate `financial-educator` · Strategy `pricing` domain.
- **Technology:** Maya Chen (legacy) · Chamber `ai-technology` + AI · advisory `technology-advisor` / `ai-advisor` · Estate `technology-expert` · `technologyFutureIntelligence`.
- **Research:** Chamber `research` + RES · advisory `research-analyst` · Estate `research-analyst` · `researchLibrary` + `api/research-live` (**the live engine**).
- **Events:**
  - live: the inline block in `chamberMemberPrompt.ts`, the EVT module (flagged), the knowledge pack and the `eventsIntelligence` runtime;
  - orphan: `eventsIntelligencePrompt.ts`.
- **Strategy:** Chamber `strategy` + STR · Strategy Chamber · advisory `strategist` · Estate `business-strategist` · `lib/strategyIntelligence.ts` · legacy Victoria Hayes.
- **Ideal client / People I Help:** Claire's `people-i-help` area · Client Avatar Builder (`client-avatars` section; the model prompt routes "ideal customer" here) · catalog `business.strategy` (trigger "ideal client" → `client-avatars`).
- **Marketing / Operations / Wellness:** each exists in the Chamber, advisory, founder, workspace and `AdvisorType` rosters.
- **Project next step:** Project Brain (LLM, ProjectsPanel) · Project Homes next-step engine (deterministic) · `lib/founderWorkspace/intelligence/nextStepEngine.ts` (founder) · `lib/projects/suggestNextStepHelpers`.

---

## 7. Existing intelligence to connect vs. intelligence that is genuinely missing

### Exists — connect it (no construction)
1. Director `specialistEscalation` / `researchEscalation` (`collaborationProfiles.ts`) → Chamber experts, the Strategy pricing/growth domains and Research. Today these are declared data only.
2. Chamber deep intelligence, 19 modules: a rollout decision on `NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT`.
3. Strategy Chamber engine output and `strategicMemoryStore` → a source in `retrieveRelevantSituation`, so the Board and main chat can see strategy decisions.
4. Chamber conversation outcomes → the situation store (none today).
5. Project Brain (LLM) → shared context in and out. It currently sees only the project body. It also duplicates the Project Homes engine.
6. `buildCompanionTurnIntelligence` and the router-only learning hints: unused.
7. `eventsIntelligenceHintForChat`: an orphan; consolidate it with the inline Chamber block.
8. The founder advisor board → member chat (the gap the ledger admits).
9. Signal bus and profile learning: built, flags OFF.
10. The architecture ledger: register `lib/board`, the Chamber, the Strategy Chamber and Claire.
11. Board `boardDecision → project starter`: already a proven executor (`executionFoundation`), reachable only from the Board's own offer UI.

### Genuinely missing (no implementation found)
1. **A single shared advisor/specialist registry.** Every roster above is independent.
2. Deep intelligence for Chamber HOR, INN, LEARN, NET and PART.
3. Full domain packs for 9 of the 11 Strategy domains; only pricing and growth are built.
4. Knowledge packs for 21 of the 24 Chamber members; only CR, Events and KMG are bridged.
5. Claire's Networking Intelligence, declared as future work.
6. Server-side storage or sync for Chamber, Strategy and companion-profile state; all are localStorage.
7. Closed-loop outcome attribution and a prediction-accuracy feedback loop, per the ledger.
8. Director voice and executive-life profiles in a runtime prompt. The first pass uses only the RP protocol; synthesis and delivery were not traced.
9. Main-chat tool use and external write integrations: calendar write scope and email account connection.

*Read-only inventory. OB-5 changed no specialist intelligence. Rows marked "OB-5" record connections added in this round.*
