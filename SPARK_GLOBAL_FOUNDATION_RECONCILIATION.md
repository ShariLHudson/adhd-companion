# Spark Estate™ Global Foundation Reconciliation
## Authoritative architecture and convergence plan

**Round type:** Investigation only. No code was implemented, merged, deployed or changed in `adhd-business-companion-vs3`. `main` was not touched.
**Prepared:** 2026-09-26, by Claude Code as senior systems architect.
**Repository:** `ShariLHudson/adhd-business-companion-vs3`. The brief also names `adhd-companion`; that repository holds only Fable 01 and the prior audit.
**Input audit:** *Spark Estate: Global Companion Architecture*, `adhd-companion` branch `claude/spark-estate-audit-d0f9b9` @ `519a37e`, taken at vs3 `main @ 7e2efec6`.
**Method:**
- All 643 remote branches were fetched read-only. Ancestry and patch-equivalence (`git cherry`) were computed for the 225 branches with commits dated 2026-09-08 or later that are not ancestors of `main`.
- Seven parallel read-only investigations covered: Board; Claire/BU/LMC; execution and acceptance; routing; continuity and memory; Research and rooms; guards and proactive systems.
- Contested points were re-checked by hand, and a trial three-way merge was run with `git merge-tree`.
- No test suite was executed.

**Evidence notation:** `M:` means `origin/main` (production), `R:` the Board branch `atomic/board-r3f5b-conversation-continuity`, `S:` the Claire/BU/LMC stack tip `atomic/lmc-s0b-founder-seed-isolation`, `EI:` `executable-intent/round-1-remember-precedence`. `CPC` is `app/companion/CompanionPageClient.tsx` (31,810 lines). Line numbers are at the cited SHA.

**Labels:** **NRV** marks a conclusion that NEEDS RUNTIME VERIFICATION. Everything else is static code truth.

---

## 1. Executive finding

1. **Production has not moved since the audit.** `main` is still `7e2efec6` (2026-09-23). Every commit on `main` after the branch point of today's active work (`f48361bd`) is Drift Glass or Sensorium visual work (14 files). Every *behavioral* conclusion about production in the audit is therefore still true. Where this report says "fixed", it means fixed **on a branch**.

2. **The newer work lives in three stacks, and they do not collide.**

   | Stack | Tip | Contents | Size | Draft PR |
   |---|---|---|---|---|
   | **R**: Board | `ced219af` | Board R1 → R3F-5B, plus the semantic understanding rounds | 59 commits, 211 files | #453 (stacked chain #447 … #453) |
   | **S**: Claire / BU / LMC | `1c4d776e` | G-1.1 → G-1.4a canonical writes, C-4 → C-5.4a Claire, S0/S0b data safety | 28 commits, 54 files | #452 (chain #442 … #452) |
   | **EI**: Executable Intent round 1 | `c047cc72` | Directly on `main` | 4 commits, 17 files | None |

   - **The three touch no common files.** R's only touch on CPC is one added line (`onOpenPlanMyDay`). Neither S nor R touches `companion-chat`.
   - **Merge test.** `git merge-tree` of `main` + R + S + EI produces a **clean tree** (verified).
   - **Tests were not run on the combined tree (NRV).**

3. **The audit's core diagnosis stands.** Spark has too many partial systems, and the routing is decided by code order inside one client component. The branches improve particular domains (Board, Claire, BU writes, reminder/rhythm execution). **None of them unifies the turn.**

4. **Spark has no semantic understanding of a member turn anywhere in main chat.**
   - Every intent, stance, move, yes/no and continue detector in `handleSend` is regex. That includes EI's new executable-request authority, the Board's conversational-move classifier and Claire's "model-led" person-before-process path.
   - The one working model-understands-meaning / code-enforces-contract implementation is the Board's `modelMaterialSignalExtractor`: model-first, evidence grounded in the member's words, strict validation, deterministic fallback, behind a server route. It uses `lib/internalAgent/invokeStructuredLlm.ts`, **which is already on `main`**.
   - This is the pattern to extend. It is not a new architecture.

5. **The minimum global foundation is mostly landing, wiring and consolidating.** Only **one** genuinely new component is justified: a thin, server-side **Turn Understanding** step that produces a typed reading of the turn. It reuses EI's `ExecutableRequest` types, the Board move vocabulary and `invokeStructuredLlm`, and falls back to the existing regex readers. Section 12 shows that no equivalent exists.

6. **Recommendation:**
   - **GO** for Round 0: land the three current stacks after Founder authorization and a combined test/preview run.
   - **STOP** on the Turn Understanding layer until Round 0 and Round 1 (contract, registry, safety) are in.

---

## 2. Current repository and branch truth

### 2.1 Anchors

| Item | Truth | Evidence |
|---|---|---|
| Production | `main` on vs3 deploys to `ecosystem.visualsparkstudios.com` | `M:VERCEL.md` |
| `main` SHA | `7e2efec6` (2026-09-23, drift-glass fix) | `git rev-parse origin/main` |
| Commits on `main` since `f48361bd` | 5, all drift-glass / sensorium (14 files) | `git diff --name-only f48361bd origin/main` |
| Remote branches | 643. Of the 225 with commits after 09-08 that are not ancestors of `main`, 198 carry commits not patch-equivalent to `main` | `branch_cherry` table (appendix A) |

### 2.2 The three active stacks

| Stack | Branch / tip | Base | Ahead / behind `main` | Contains | Draft PRs |
|---|---|---|---|---|---|
| **R: Board** | `atomic/board-r3f5b-conversation-continuity` `ced219af` (09-25) | `f48361bd` | 59 / 5 (55 not patch-equivalent) | board-room-convergence, BC-P0, BC-6 No-Advice, J1, R1, R2, R2.1, BOARD-CTX-1, BOARD-CONVERGE-1, BBC-1/2, SITUATION-SHAPE-1, SI-BU-READ, R3A–R3F-5B, Semantic Understanding rounds 1–2, conversational-move, question reasoning, session lifecycle | #447 (r3b, not draft), #448, #450, #451, #453 |
| **S: Claire/BU/LMC** | `atomic/lmc-s0b-founder-seed-isolation` `1c4d776e` (09-24) | `f48361bd` | 28 / 5 | G-0.2, G-1.1–G-1.3, G-1.2b–f, C-A, C-B, C-B.1, C-5 (re-applied as `3c9aa711`), C-4, C-5.1–C-5.4a, S0, G-1.4, G-1.4a, S0b | #442–#446, #449, #452 |
| **EI: Executable Intent round 1** | `executable-intent/round-1-remember-precedence` `c047cc72` (09-25) | `7e2efec6` | 4 / 0 | Round 1a–1c and return report | None |

**Correction to the audit.** The audit says C-5 is "contained in g1-4". It is not: `atomic/claire-c5-person-before-process` (`d13b436e`) is **not** an ancestor of S. Its content was re-applied inside S as `3c9aa711`, with an identical stat of 7 files, +662/−68. The standalone branch is a stale duplicate.

### 2.3 Classification of every materially relevant branch

| Branch | Status | Verdict |
|---|---|---|
| R `board-r3f5b-…` and its ancestors (r3f5, r3f4 … r3a, board-room-convergence, bc-6, bc-p0, j1, r1, r2, board-ctx-1, board-converge-1) | Branch-only | **LAND as one unit (R tip)**. Retire the intermediate branches afterwards. |
| S `lmc-s0b-…` and its ancestors (g1-4, lmc-s0, c54a, c54, c53, c52, c51, c4, g1-1) | Branch-only | **LAND as one unit (S tip)** |
| `atomic/claire-c5-person-before-process` | Duplicate of `3c9aa711` in S | **RETIRE** |
| EI `executable-intent/round-1-…` | Branch-only, fresh base | **LAND** |
| `cursor/atomic-0-foundation-truth-reconciliation-39cc`, `-0a-p0-05-production-enforcement`, `-2-proven-capability-registry` | 206 behind. None of `runtimeIntelligenceContract`, `provenCapabilityRegistry` or `runPrimaryRoutingOwnerSelfCheck` is on `main`. 32 of the 36 evidence paths still exist; `main` has not changed frictionlessActionLayer, estateBrain or conversationGate since the base. | **REBASE, then LAND** (Round 1) |
| `cursor/atomic-3…5-business-building-*-39cc` | 206 behind. atomic-5 carries the 517-line v1 catalog. | **REBASE with atomic-2.** The certification harness content was **not deeply inspected** (§21, open item). |
| `atomic-3c3` → `3c4` → `3d1` → `3d2` → `3d3` | Strict chain, 140 behind. 3c1/3c2 already landed. | **REBASE 3d3 (contains all), then LAND.** Retire the four intermediates. |
| `convergence/strategies-s1` → … → `s5b` | Strict chain, 140 behind. Zero Strategy commits on `main` since base. | **REBASE s5b, then LAND** |
| `atomic/events-role-type-flexibility-2026-09-22` | 5 behind, touches none of the files `main` changed | **LAND** (domain) |
| Chamber chain g1c ⊂ … ⊂ `chamber-member-response-cards-f78c` | Cherry-picked onto `main` except H1 | **SALVAGE `f330ff5e2` (H1)**, retire the rest |
| `cursor/atomic-3b-vts-lbm-boundary-8b6e` | `lbmBoundary.ts` absent on `main` | **REBASE, then LAND** (domain) |
| `atomic/global-attachments-a0-reconciliation` | 0 of 57 new files on `main` | **REBASE, then LAND** (later) |
| `claude/main-conversation-continuity` | 587 behind, 31 commits unmerged | **SALVAGE by re-implementation.** Its tests are the spec (Round 5A). Never merge. |
| `convergence/c1-canonical-truth-foundation` | Partly on `main` | **SALVAGE** the LBM boundary and BU situation collector onto S |
| `cursor/atomic-bc1-business-context-isolation` (⊂ `claire-harbor-demo-experience-correction`) | 243 behind | **SALVAGE** `lib/businessContext/*`: REAL/SAMPLE/PRACTICE/FOUNDER_DEMO partitioning (`5958353f1`), which S0b lacks |
| `cursor/bu-founder-review-round5a-20b6` | 243 behind | **SALVAGE UI only.** Drop its write-path changes. |
| `cursor/lmc-live-wiring-recovery-9fb3` | Marked "do not merge". Adds its own transaction, classifier and a protected-host writer. | **REBASE onto S** through a sanctioned writer, or retire |
| `cursor/bp-c1-unified-write-resolver-20b6` | Its `estate_field` writer is removed by S | **RETIRE** |
| `cursor/lmc-focused-area-ripple-18df`, `board-claire-member-friction-18df`, `exact-create-resume-convergence-ae8a`, `authenticated-creation-boot-hydration-6e81`, `bu-s1-*`, `chamber-c2-quieter-entry-replay`, `execution-foundation-0a..0d`, `conversation-continuity-tier1-production-5fda`, `interruption-return-identity-f106`, `cognitive-return-f106`, `atomic-7-p1-turn-contract-*` | Landed in substance | **RETIRE** the branches |
| `cursor/atomic-7-p1-t5-use-{precedence,conditioning,wisdom}-f106` | `settledDecisionAuthority/usePrecedence.ts` not on `main` | **DO NOT TOUCH YET**. Review during Strategy/Board convergence. |
| `cursor/atomic-output-execution-repair-f106` | A second stance classifier for Create (`outputExecutionPosture`) | **SALVAGE** into EI as the Create owner's stance. Do not land separately. |
| `cursor/board-v2-founder-demo-bridge-fc8f` = `bd-fc8f`, `cursor/x` | Client-side preview arm, superseded by R's server route | **RETIRE.** Mine `classifyBoardInquiry` and the vote-validator narrowing only. |
| `cursor/board-final-integration-b103` | 86 unmerged commits. "production v2 default" conflicts with R's no-fallback rule. | **DO NOT MERGE.** Retire. |
| `docs/board-v2-cutover-decision` | Authoritative Board cutover doc, not on `main` or R | **LAND the doc** with R |
| Events 4G/LEU lineage (`events-entry-creation-demo` ⊇ `event-knowledge-ingestion-06f7` ⊇ `conversation-event-projects-4g31` ⊇ `event-specialty-project-4g1`, `leu-*`) | 336 behind. 0 of 710 files on `main`. `main` chose adaptive `eventsIntelligence` and the EVT library. | **RETIRE.** Optionally salvage the `docs/events/leu` corpus (Founder confirmation, §17). |
| `cursor/events-production-convergence`, `events-final-cert-d81a`, `feature/global-estate-attachments`, `chamber-v3-specialist-experience`, `chamber-a1-intake-concern-handoff-f78c` | Superseded | **RETIRE** |
| `cursor/shari-adhd-specialized-agent-e985` | Separate old history | **SALVAGE docs only** (Intervention Engine, Proactive gating), plus `proactive.ts` receptivity gates as a contract |
| `cursor/desktop-notifications-toggle-fix-684f` | Root snapshot | **SALVAGE** `lib/notifications/sparkDesktopNotification.ts` |
| `claude/youthful-knuth-677ce1` (Autumn Drift) | 19 ahead, sensorium only | Out of scope. No architectural interaction. |
| `fix/drift-glass-layer-physics` | = `main` | Nothing to do |

---

## 3. Audit claims revalidated

Verdict key: **ST** still true · **PT** partially true · **AF(x)** already fixed on branch x (not in production) · **SUP** superseded · **NLA** no longer applicable · **NRV** needs runtime verification.

| # | Audit claim | Verdict | Current evidence |
|---|---|---|---|
| 0.1 | Runtime Intelligence Contract, Atomic 0A and Proven Capability Registry are branch-only | **ST** | Nothing on `M` matches `provenCapabilityRegistry`, `runtimeIntelligenceContract` or `runPrimaryRoutingOwnerSelfCheck`. Branches are 206 behind with low staleness (32/36 paths valid). |
| 0.2 | Executable Intent round 1 is branch-only, regex, rhythm/reminder scope | **ST**, and narrower than the audit said | EI executes **one** action per turn: a rhythm if present, else a reminder. The rest are named as not done. The reminder path is still **not read back** (it delegates to `M:lib/reminderIntelligence.ts:316-319`). The flag is on by default (`!== "0"`). |
| 0.3 | G-1.4 / C-5 are branch-only | **ST**, with a correction | Both are in S. C-5 is not "contained in g1-4" (§2.2). |
| 0.4 | Three explicit-research detectors | **PT, undercounted** | Five: the three cited, plus `M:lib/estateBrain/researchRouting.ts:17` (about 15 importers) and `M:lib/researchIntelligence.ts:90`. 3D-1 would add a sixth unless it also deletes the others. |
| 0.5 | `stageConversationResearch` has no production caller | **ST** | `M:conversationResearchLaunch.ts:80` |
| 0.6 | main-conversation-continuity is about 3 weeks stale | **ST**, now 587 behind | Re-implement; do not merge |
| 0.7 | Board No-Advice is branch-only | **ST, AF(R)** | `R:validateBoardSynthesis.ts:57-98` `DIRECTIVE_BOARD_LANGUAGE`. `M`'s validator has no directive rule. |
| 1.1 | One surface / one main LLM route | **ST** | `M:app/api/companion-chat/route.ts:165-173,381`, gpt-4o-mini, no tools or `response_format` |
| 1.2 | Transcript browser-only, never reloaded into main chat | **ST** (one exception) | `M:CPC:3898`. Chamber reloads it on resume (`CPC:3510-3530`). `messagesForApi` takes only the React view (`M:lib/workspaceChatPurity.ts:71`). |
| 1.3 | New Day deletes continuity | **ST, broader** | `M:CPC:4453-4460` → `runSharedNewDay.ts:66-80` → `resetActiveConversation.ts:113-180`. This also resets today's plan (`runSharedNewDay.ts:79`), and the absence-return path triggers it too. |
| 1.4 | Estate digest is session-only, with a "FRESH CONVERSATION THREAD" instruction | **ST** | `M:estateMemoryStore.ts:12,47,60`; `estateMemoryHint.ts:55-60` |
| 1.5 | No chat writer for plan or project items; no compound execution | **ST** | CPC has 0 references to `addQuickPlanItem` / `saveProjectItem`. `isMultiIntent` forces chat (`M:lib/conversationGating.ts:34,57`). R adds a **Board UI button** that calls `addQuickPlanItem` (`R:BoardDiscussionOutcomePanel.tsx:120`). It is not a chat writer and has no dedupe. |
| 1.6 | No resolver for named past work | **PT** | `M:activeWorkspaceRegistry/matchResumeIntent.ts:188,268` resolves creation titles, but only against the registry. Nothing covers Projects, Saved Work, Sparks, persons, decisions or conversation topics. |
| 1.7 | No single turn owner; about 175 early returns | **ST** | Exactly 175 bare `return;` in `CPC:16542-25284`. Three "authoritative" headers: `conversationBoundaryInputs`/CPC:16600, `turnAuthority.ts:2`, `routeConversationTurn.ts:2`. |
| 1.8 | No global attention governance; nothing fires with the tab closed | **ST** | One `setInterval` (`M:CPC:8444`). Time blocks skip quiet hours. No `sw.js`, cron, push or web-push dependency. |
| 1.9 | No cross-device continuity; general LS keys not user-namespaced | **PT** | Per-user keys also exist for the Plan My Day deferred list (`planDayOwner.ts:26`) and rhythms (`rhythms/store.ts:37-47`). Everything conversational is still global. Sign-out clears only Create (`CompanionAuthProvider.tsx:525`, `authenticatedBootHydration.ts:87-108`). **Neither S0 nor S0b namespaces storage.** |
| 1.10 | No global No-Advice | **ST** | Runtime filters exist only in `decision-analyze` (`route.ts:194-195,328`) and the Board. Contradicting prompts: `project-brain/route.ts:6`, `strategyChamber/continueYourJourney.ts:11`, `companionPrompt.ts:94`. |
| 1.11 | Psychological inference is prompted; clinical guard unwired | **ST** | `M:companionPrompt.ts:79,83,86`. Regex trait labels: `activationSignals.ts:93`, `momentumSignals.ts:208`, `recoverySignals.ts:112`, `memory/reflection/patternSignals.ts:19` (shown in the Memory Library). `clinicalLanguageGuard.ts` is imported only by tests. |
| 2.x | Four memory "current work" stores; Active Work only on referential turns; no staleness check | **ST** | `activeWorkContext/routingEnrichment.ts:97`. `lastReferencedAt` is never age-checked. `last-activity` is defined twice (`companionStore.ts:2149`, `companionProjectsStore.ts:111`). |
| 2.x | About 9 continue detectors | **PT, undercounted** | About 12 (list in appendix B) |
| 2.x | `workContinuity` / `cognitiveReturn` merged but unwired | **ST** | Only `pertinentQuestionEngine` imports them, and that chain has no importer in `app/` or `components/` |
| 2.x | 4–5 capability registries | **PT, undercounted** | Six. Add `M:lib/estate/canonicalEstateRegistry.ts`, which calls itself the "runtime authority" (13 importers). Per-room registries exist as well. |
| 2.x | `specializedIntelligence/registry.ts` is descriptive only | **ST** | Consumers `import type` only. `resolveCompanionIntelligence.ts:34` keeps its own hard-coded copy. |
| 3 | Routing self-check disabled in production | **ST, AF(0A)** | `M:routeEstateIntelligence.ts:437` |
| 3 | Stream path skips human-conversation enforcement | **ST** | `M:route.ts:395-470` applies only `applyShariVoiceLayer` (logs `stream_fast_path`). Enforcement runs non-stream only (`:531`, `:576`). |
| 3 | `systemPromptOverride` replaces the whole prompt | **PT** | Only when `talkItOutShariEngine` is set (`route.ts:152`), but both values come from the client and the route has no auth. It is effectively an open gpt-4o-mini proxy. |
| 3 | Board V2 calls the model from a client component | **ST on M, AF(R)** | `M:BoardDirectorDiscussionIntake.tsx:233-234` calls `runCertifiedBoardDeliberation` → `invokeStructuredLlm` with a server-only key. R adds `app/api/board/deliberate/route.ts` (Supabase bearer, flag gate, 128KB cap). |
| 3 | Three Board runtimes | **PT, reframed** | `lib/boardroom` is the room shell plus an **older advisory engine** reachable only from resumed records. The live `M` deliberation is **legacy `lib/board/boardDiscussion` templates**. `lib/board/reconstructed` is V2 behind a flag that defaults off (`featureFlags.ts:141-145`). |
| 5 | Case A "where did I leave off" fails | **ST** | Detectors, New Day, Gate sources and the digest are all unchanged on `M` |
| 5 | Case B compound fails (opens Plan My Day) | **ST** (NRV for the sticky-owner caveat) | With EI: the reminder and rhythm portion becomes honest; plan and project parts are named as not done |
| 5 | Case C "can't get started" treated as troubleshooting, plus a room offer without an LLM call | **ST** | `decideShariResponse.ts:96`. `normalize()` does not fold curly `’`. `blockAutoWorkspace` (`CPC:20948`) ignores `answerFirstPreferChat` (`CPC:16699`). |
| 6 | Three weekday resolvers disagree | **PT, reframed** | They duplicate each other with different accepted phrasings. **Worse than stated:** "remind me Friday at 3pm" resolves to **today** (`M:reminderIntelligence.ts:162`). |
| 6 | `executionFoundation` is Board-only | **ST** | Only importer: `BoardDecisionProjectExecutionOffer.tsx` |
| 7 | About 44 yes-regex files, about 20 `is*Affirmation` functions, `isActionAcceptance` duplicated | **ST, undercounted** | 26 functions, about 42 files. `isActionAcceptance` is defined in `assistedActionBridge.ts:36` and `ecosystem/actions/actionSelectors.ts:43`. `explicitCompanionActions` acts on a bare yes by scanning the assistant's text. |
| 7 | 13 proactive engines on boolean chains | **ST** | `M:CPC:20580-20800`. The only shared gate is the governor's `suppressCards` on/off switch. 33 "dismissed today" files. |
| 7 | About 20 greeting composers | **ST, understated** | 58 exported composer functions across about 37 files |
| 7 | 85 handoff types; `creationWorkspace/destination` not used across rooms | **PT** | 85 confirmed. **Correction:** `destination` *is* used across rooms (Research → VTS, Research → Project). `SharedHandoff` is Board-only. Chamber added `chamberContextHandoff.ts`. |
| 7 | Two recovery systems | **ST** | `recovery-intelligence` is still imported by CPC (about line 20589) |
| 9 | Stale "UNWIRED" headers | **ST** | `conversationBoundary.ts:2`, `conversationSuspension.ts:3` |
| 10 G11 | Security | **ST, plus a new finding** | Also `R:app/api/board/material-signals/route.ts` has **no auth** and triggers model calls |
| 14 Q1 | A server transcript needs a schema change | **NLA** | `companion_member_records.domain` is free text; the only CHECK is on `status` (`supabase/companion_member_records_schema.sql:16-17`). A new `lib/durableRecords/domains/conversation_session` needs no migration. Deletion is soft-delete only (grants: select/insert/update). |
| 14 Q2–Q9 | Founder questions | **Answered** by Founder decisions 1–9, except Q7 (Board authority), which this report resolves (§5 row 31) | See §17 for what remains |
| *(not in audit)* | Structured-LLM infrastructure exists | **New finding** | `M:lib/internalAgent/invokeStructuredLlm.ts` (json_object, retry, 45s timeout) is on `main`. It is used by the Board. Claire's adapter is model-first with a deterministic fallback (`claireReasoningServer.ts:162`). |

---

## 4. Current runtime architecture (production, `main @ 7e2efec6`)

The audit's §3 runtime map is accurate and unchanged. Confirmed ordering (`M:CPC`):

```
handleSend 16542 ──(ALL IN BROWSER)──────────────────────────────────────────────────
 16573 resolveCreationTurnEnvelope
 16588 resolveTurnBoundaryDecision (Boundary: "sole ownership authority")
 16619 appendConversationSpineTurn
 16634 runShariCognitivePipeline → 16653 decideConversationTurnAuthority ("authoritative")
 16754 processActiveTopicOnUserTurn
 17242 routeConversationTurn ("authoritative arbiter") → may navigate & return
 ~17357 Work Recognition (ON; comment says OFF; workRecognitionFallthrough.ts:540-542)
 17750 classifyPrimaryConversationTurn
 17847 resolveExplicitCapabilityIntent → detectUniversalCapabilityRequest → may open room & return
 18120/21755/21889 resolvePendingAcceptance
 18187 resolveReminderTurn (writes reminder)
 18452 & 21183 resolveIntentRouting (twice)
 20132/20170 estate kernel classify/execute
 20525 intentStabilizer.resolveIntent
 20559 companionGovernor.evaluateCompanionTurn
 20580-20800 13 proactive engines, hand-chained
 21221 evaluateEstateConversationTurn (keyword registry)
 21437 resolveFrictionlessAction (5,592 lines; routeEstateIntelligence inside; EI plugs in here)
 22797-22890 workspace offer → local reply, no LLM, answer-first ignored
 23431 businessContextSummary()  ← legacy BU in parallel with
 23697 gateRelevantSituationForConversation  and 23711 a second retrieval
 → POST /api/companion-chat (no auth, no user id, no tools; stream skips enforcement)
 → client certification may replace streamed text (NRV what member sees)
 → persistence: LS transcript + LS spine + SS digest; New Day wipes.
```

**How the branches change this picture:**

- **EI** adds `buildExecutableRememberDecision` inside `resolveFrictionlessAction`. Seven interceptors step aside for reminder/rhythm capability objects.
- **R** changes only what happens *inside* the Board Room: server deliberation route, persistent Board session, the seven Directors, semantic material signals, No-Advice validator.
- **S** changes only Claire / Business Profile, the BU write path and LMC safety.
- **None of the three changes the turn spine.**

---

## 5. Authoritative-system matrix

Each row gives: the candidate that should win, where it lives, its status, what competes with it, and what must be extended. Retirement always means "after migration", never in this round.

| # | Responsibility | Authoritative candidate · location · status | Why it wins | Competes | Retire | Extend | Depends on |
|---|---|---|---|---|---|---|---|
| 1 | **Turn ownership** | `decideConversationTurnAuthority` (`M:lib/shariAnswerFirst/turnAuthority.ts`), fed by the Boundary decision · wired | Already sits at the top of the spine and consumes answer-first | `routeConversationTurn`, governor/turnArbiter, `continuityGate`, Work Recognition first refusal, `classifyPrimaryConversationTurn`, frictionless `finalResponseOwner` | "authoritative" labels elsewhere; Work Recognition as an interceptor; duplicate `resolveIntentRouting` | Consume the Turn Understanding result. Its decision must bind **every** terminal return (workspace offer, capability open, local replies). | Turn Understanding (#2), runtime contract (0A) |
| 2 | **Intent / meaning understanding** | **Turn Understanding** (thin NEW) on `M:lib/internalAgent/invokeStructuredLlm.ts`, following the `R:modelMaterialSignalExtractor.ts` pattern. Output type extends `EI:lib/memberIntent/executableRequest.ts`. Deterministic fallback: EI `resolveExecutableRequest` + `decideShariResponse`. | Only proven pattern for model semantics plus deterministic contract; reuses existing infra and types | `classifyCompanionIntent`, `intentStabilizer.resolveIntent`, `classifyPrimaryConversationTurn`, `classifyTurnIntent`, help-mode regexes, five research detectors, about 12 continue detectors, Board and Claire move regexes | All of these as **primary** signals; they remain as fallback only | Server route with auth; a `turn_understanding` phase in `InternalAgentPhase`; a latency budget | EI landed (types), R landed (pattern / extended phase union), R1 security |
| 3 | **Capability selection** | `routeEstateIntelligence` + `routingOwnershipContract`, choosing only from **Proven Capability Registry** entries (39cc atomic-2/5) · partly wired / branch | The contract already names it the sole place/capability owner. The registry is evidence-tiered with `isRuntimeInvocable()`. | `detectUniversalCapabilityRequest`, `rooms.ts` keyword offers, workspace-offer path, frictionless internals | Keyword room offers as openers; workspace-offer local reply | Enforce the self-check in production (0A); read the understanding's capability candidates | R1 |
| 4 | **Conversation Boundary** | `resolveTurnBoundaryDecision` (`M:lib/conversationBoundaryInputs.ts:243`) over `conversationBoundary.ts` · wired | Already models answer-pending, interrupt, switch and return | `continuityGate`, `processActiveTopicOnUserTurn`, standalone `conversationSuspension` | Stale UNWIRED headers | Pending kinds for domain writes and scheduling; conversationId-stamped topics (salvaged from main-conversation-continuity) | Round 4/5A |
| 5 | **Answer-first / person-before-process** | `M:lib/shariAnswerFirst` (`decideShariResponse` + `turnAuthority`) · wired, but not binding | Most complete; already forces chat for the kernel | About 11 parallel gates, `shouldBlockAutoWorkspaceOpen`, `chatHint` registers, Claire C-5 (room-local, keep) | Separate `blockAutoWorkspace` logic | Help-mode taken from Understanding; fix `can't get` troubleshooting; normalize `’` | #1, #2 |
| 6 | **Member Operating Context** | `retrieveRelevantSituation` → `gateRelevantSituationForConversation` → `consumeAuthorizedSituation` · wired | Already the authorized context seam used by Board, Chamber, Create, Research and Strategy roles | `businessContextSummary()`, second retrieval at `CPC:23711`, four current-work stores, `dailyContextEngine` in isolation | Second retrieval; `businessContextSummary` in chat | Sources: Create drafts/registry titles, Saved Work, LastActivity, **Plan My Day today + current focus**; roles for events, projects, VTS, claire | S landed (BU reader) |
| 7 | **Business Understanding** | `collectBusinessUnderstandingSnapshot` (`readProvider.ts:229`) + S canonical write transaction · reader on M, writer on S | One reader; honest grouped writes; resurrection closed | Legacy `saveBusinessProfile` (`companionDiscovery.ts:609`, `phase1Onboarding.ts:527`, `businessEstateProfile.ts:725`), `businessContextSummary`, `demoSeed`, `bp2bWriteSeed`, `migrationHelper` | `businessContextSummary` as a chat source; legacy writers outside the boundary | Bring legacy writers under the boundary; add BC-1 context partitioning; add durability later | S |
| 8 | **Conversation transcript** | ConversationSession spine (`M:lib/conversationSession`, `transcriptAuthority.ts`) · wired (write), not read by the model | Designed as the spine; carries a conversationId | `companion-conversation-v1`, estate digest, Board `memberContributions`, Claire `recentTurns` | `companion-conversation-v1` as a second truth (keep as the Chamber resume view) | Transcript reaches the model (salvage `051c602` + tests); durable domain | Round 5A/5B |
| 9 | **Continuity** | `lib/workContinuity/composeWorkContinuity` + `cognitiveReturn` as the read model; Boundary as the in-session owner · merged, unwired | Built for exactly "what's unfinished / what's next" | `companionLedContinue`, `continuityManifest`, `resolveWelcomeActiveWork`, `arrivalIntelligence`, `estateMemory`, Board `resumeCoherence` | Continue detectors as separate predicates; `postLoginContinue`; `welcomeBackBridge` | Wire into the Gate and the Understanding "continue" reading; staleness | #6, #10 |
| 10 | **Active Work** | `activeWorkContext` (`spark:active-work-context:v1`) · wired | Self-described canonical (`suspensionStore.ts:6`); suspend/resume works | Registry, `continuityManifest`, `last-activity` (two writers) | Duplicate `last-activity` writer in `companionProjectsStore` | `lastReferencedAt` staleness; user-scoped; durable | Round 5 |
| 11 | **Reference resolution** | `matchResumeIntent` (`activeWorkspaceRegistry/matchResumeIntent.ts`), extended into one resolver · wired, registry-only | Only resolver that already maps member phrasing to stored objects by title | About 7 resolvers: `resumeResolver`, `resolveWorkIdentity`, `resolveActiveOwner`, `semanticIntentResolver/resolveTarget` (navigation), … | Room-local resolvers as they migrate | Sources: Projects, Saved Work, Sparks, Events, BU persons, decisions, recent transcript, **action journal**; Understanding supplies referent phrases | #2, #6 |
| 12 | **Pending question / action** | `pendingAcceptanceAuthority` (binding) + Boundary pending kinds · wired, partial | Only module whose stated job is "what does this reply bind to" | About 16 stores, about 18 offer registries, about 20 `*Offer` React states, EI phase record, Board question queue, Claire `pendingGroupedCandidates` | Room pending stores as they migrate (Board queue stays domain) | `domain_write` kind with the EI phase/expiry record as payload | Round 4 |
| 13 | **Acceptance yes/no** | Binding: `pendingAcceptanceAuthority`. Vocabulary: `conversationConfirmationGate` (`isBareShortAcceptanceText`, `isConfirmationDecline`) · wired | The vocabulary EI already reuses; 13 production importers | 26 `is*Affirmation`, about 42 regex files, `isAffirmativeReply` (humanConversation), Claire `confirmationContract`, Board `classifyMemberResponse` | Duplicate `isActionAcceptance`; `explicitCompanionActions` bare-yes-on-assistant-text | "Yes, but …" as acceptance plus a slot patch (EI `LEADING_ACCEPTANCE_RE`) | Round 4 |
| 14 | **Executable intent** | EI `resolveExecutableRequest` / `CapabilityObject` · branch | Stance (act / talk_about / none), ordered actions, availability, honest not-done | `outputExecutionPosture` (f106), `creationExecutionEligibility`, `actionPhrases` + dead `strategyChamberActionRouting`, `explicitCompanionActions` | `strategyChamberActionRouting` (dead) | Generic owner registry (plan_item, project_item, research, navigation, create); fed by Understanding | EI, #2 |
| 15 | **Compound requests** | EI `actions[]` · branch | Already ordered, already honest | `isMultiIntent` → chat-only | `isMultiIntent` gating, except for real brain dumps | Execute all authorized actions; inter-action references ("remind me the night before **it**") | Round 4 |
| 16 | **Execution authorization** | EI phase record (confirm / details / executed, 3 turns or 10 minutes) registered as a pending kind. BU truth goes through S `executeGroupedIfMemberConfirmed`. Board keeps `executionFoundation` receipts. | Real expiry and adjacency; one confirmation covers N intents for BU | `frictionlessPending`, legacy remember yes-path | — | Risk policy table: reversible + unambiguous = act with receipt/undo; compound, ambiguous, destructive, BU-changing or high-impact = confirm (Founder decisions 3–4) | S, EI |
| 17 | **Execution** | Existing domain writers only (`createRhythmFromContent`, `saveReminder`, `addQuickPlanItem`, `saveProjectItem`, `holdConversationCapture`, S transaction), wrapped by `executionFoundation` idempotency · mixed | No new stores | Direct `persistReminders` path | Direct reminder write as a chat entry point | Idempotency for reminders; a dated plan writer | Round 4 |
| 18 | **Execution verification** | EI read-back-then-reply + `executionFoundation` verify, generalized to `verify(owner, id)` · branch / Board | Replies are composed from stored truth | — | — | Reminder and plan read-back; one receipt shape (done / not done / why) | Round 4 |
| 19 | **Research** | `lib/researchLibrary` (inquiry + persistence + `contextualResearchLaunch` as the only door) · wired; 3D branch | Owns sources (`persistence.ts:9-13`); 3C-1/3C-2 landed | Five research detectors; `researchIntelligence` as a router | Detector copies (alias to one) | Land 3d3; Understanding supplies the research reading, with `explicitResearchIntent` as fallback | Round 6 |
| 20 | **Cross-Estate handoffs** | `creationWorkspace/destination` (contracts, registry, `returnPaths`, `consume*Handoff`), with Board `SharedHandoff` as a payload · wired across rooms | Already cross-room; has return paths | 85 types, `chamberContextHandoff`, Strategy `executeHandoff` / S-3 `strategyHandoffClass`, 3C-3 staging | New per-room handoff types | Carry the inquiry and understanding reading; Claire/Board/Strategy return paths | Round 6 |
| 21 | **Decision / commitment recording** | `decisionLedger` (`companion-decision-ledger-v1`) · wired | Canonical key (`authorityKeys.ts:49`); Board V2 commits to it on R | Strategy memory (bypasses the ledger), `decision-intelligence`, `boardroom-decision`, `compass-decision` | Legacy keys after migration | Strategy through S-3 `persistStrategyDecision`; a shared commitment record (today Board-only) | Round 6 |
| 22 | **Observable pattern awareness** | `lib/patternAwareness` + `recoveryAttention/evidence` · wired | Behavior counts; member can pause/delete | Regex trait labels (activation, momentum, recovery-intelligence, reflection `patternSignals`, loop, `adhdMultiTurnPatterns`) | Trait labels and `companionPrompt.ts:79-86` inference lines | Feed `planBehaviorLearning`, `rhythms/adaptive`, `patternObservation` in | Round 2 / 7 |
| 23 | **Proactive intelligence** | `companionGovernor.evaluateCompanionTurn` as the single arbiter · wired as an on/off switch | Already the only shared gate | 13 engines hand-chained; phase 3–6 recorders; `checkInEngine`; `interventionPolicy` | Hand-chained precedences; 33 dismissal stores | Ranked single choice per turn; shared dismissal/cooldown ledger; e985 receptivity gates; global proactivity level | Round 7 |
| 24 | **Attention / notification governance** | `rhythms/loadManager.ts` + `delivery.ts` · wired for reminders and rhythms | Quiet hours, caps, dedupe, critical exceptions | Time-block loop branch; recovery 48h; arrival/celebration/card channels; dead `reminderAlerts` | `reminderAlerts.ts`; bare `new Notification` | All channels through `filterDeliverables`; `sparkDesktopNotification` (684f); background channel (Founder, §17) | Round 7 |
| 25 | **No-Advice** | Shared guard seeded from `R:subjectBrief/noAdviceGuard.ts` + `decision-analyze` `RECOMMENDATION_LANGUAGE_PATTERN` + Board `GENERIC_ADVICE` / `DIRECTIVE_BOARD_LANGUAGE` · pieces exist | Existing, tested phrase sets | Contradicting prompts (project-brain, Strategy, `companionPrompt:94`, certifiedConversation advisory) | Those prompt lines | One post-processor for every model route, including stream | R landed; Round 2 |
| 26 | **Human conversation guard** | `lib/humanConversation/enforceHumanConversation` · wired, non-stream only | Existing validator | Stream fast path; room routes | — | Run it on the stream `done` payload (or buffer); add S's `containsInternalReasoningLeak` | Round 2 |
| 27 | **Clinical / unsupported-inference guard** | `lib/ecosystem/clinicalLanguageGuard.ts` · unwired | Exists and is tested | Prompted inference | `companionPrompt.ts:79-86` | Wire into the shared guard | Round 2 |
| 28 | **Cross-device persistence** | `companion_member_records` + `lib/durableRecords` domain pattern (RLS) · wired for Create and saved_spark | No schema change needed | LS-only stores (Board session, BU, transcript, Active Work) | — | `conversation_session`, `active_work`, `estate_digest` domains; user-namespaced LS; clear on sign-out | Round 5B |
| 29 | **Capability registry** | Proven Capability Registry (39cc atomic-2/5), with `canonicalEstateRegistry` as its "place" source · branch | Evidence tiers; governance test that paths exist | Six registries | `companionCapabilityRegistry`, keyword `registrations/rooms.ts` offers, `estateRoomRegistry` (to adapters) | Rebase; re-verify Chamber records | Round 1 |
| 30 | **Specialized intelligence registry** | `companionConstitution/specializedIntelligence/registry.ts` · descriptive | Already the catalog | Hard-coded `ALL_SPECIALIZED` (`resolveCompanionIntelligence.ts:34`) | The duplicated list | Derive runtime lists from it; link each entry to a Proven Registry capability | Round 1 |
| 31 | **Board runtime** | **R: certified seven-Director V2 behind `/api/board/deliberate`**, with the migration rule in `R:lib/board/boardDeliberationRoute.ts` · branch | Only runtime with a server model boundary, auth, No-Advice validator, BU read, ledger commit and persistent session. It also blocks legacy roster downgrade. `lib/boardroom` is a shell plus an older advisory engine; legacy templates are for drafts started on the twelve. | `lib/boardroom` discussion engine, legacy `boardDiscussion` templates, fc8f/`cursor/x` preview arm, b103 | After drain: `lib/boardroom` discussion/store (keep entry/view), legacy templates, `boardRuntimeAuthority.ts`, unused `resumeCoherence/*` | Production flag ON (else seven-seat discussions are **held**; NRV); auth on material-signals; durable session later | R, Founder acceptance |

---

## 6. Duplication kill list

KEEP = authority · MIGRATE INTO = target · RETIRE = after migration · DO NOT TOUCH YET = leave alone until a named round. Nothing is deleted in this round.

| Group | KEEP | MIGRATE INTO | RETIRE | DO NOT TOUCH YET |
|---|---|---|---|---|
| **Routers / arbiters** | `turnAuthority` + Boundary; `routeEstateIntelligence` for place/capability | `routeConversationTurn`, `resolveExplicitCapabilityIntent` → capability candidates for `routeEstateIntelligence` | Duplicate `resolveIntentRouting` call; "authoritative" headers elsewhere | `frictionlessActionLayer` internals (60 `try*` flows) until Round 4 |
| **Classifiers** | Turn Understanding (new, model) with fallback: EI `resolveExecutableRequest`, `decideShariResponse` | `classifyCompanionIntent`, `intentStabilizer`, `classifyPrimaryConversationTurn`, `classifyTurnIntent` → fallback only | Help-mode regex as primary; ASCII-only patterns | Board `classifyMemberBoardResponse` and Claire classifiers (room-local; revisit in Round 8) |
| **Capability registries** | Proven Capability Registry; `canonicalEstateRegistry` (places) | `estateCapabilityRegistry`, `estateBrain/capabilityRegistry` → adapters | `companionCapabilityRegistry`, keyword `registrations/rooms.ts` offers, `estateRoomRegistry` | Per-room registries (Chamber, Events …), which are domain |
| **Yes/no interpreters** | `conversationConfirmationGate` vocabulary + `pendingAcceptanceAuthority` binding | 26 `is*Affirmation`, about 42 regex files, `isAffirmativeReply` | Duplicate `isActionAcceptance`; `explicitCompanionActions` bare-yes rule | Board `classifyMemberResponse` / `classifyCommitmentResponse`, Claire `confirmationContract` (domain semantics) |
| **Pending stores** | Boundary pending + `pendingAcceptanceAuthority` | EI `pendingRememberCreate`, `frictionlessPending`, `reminderIntakeSession` → payloads | Unproduced `"scheduling"` kind (or start producing it) | Board question queue, Claire grouped candidates |
| **Conversation transcripts** | Spine | `companion-conversation-v1` → Chamber resume view only | Estate digest as a transcript surrogate | Board `memberContributions` (meeting record) |
| **Continuity stores** | `activeWorkContext` + `workContinuity` read model | `continuityManifest`, registry → Create-scoped projections | Duplicate `last-activity` writer; `postLoginContinue`; `welcomeBackBridge` | Board session store (domain) |
| **Active-work stores** | `activeWorkContext` | `last-activity` / `recent-work` → one module | `companionProjectsStore` duplicate write | Registry (Create) |
| **Resume systems** | `workContinuity` + Boundary return-to-suspended | About 12 continue detectors → Understanding "continue" reading | 4 dead resume stacks (audit §7.3) | Room-local resume in Chamber, Strategy ×4, Events, Create ×3, VTS, Board (domain) |
| **Proactive engines** | `companionGovernor` | 13 engines → ranked candidates | Hand-chained `!shouldSurfaceX`; `recovery-intelligence` (legacy) | Engine internals until Round 7 |
| **Greeting systems** | `lib/dailyOpening` (`resolveGlobalDailyOpening`) with `arrivalIntelligence` input | About 35 other composers → context lines | Dead greeting and celebration components | Room hospitality copy |
| **Notification rules** | `rhythms/loadManager` | Time-block branch, recovery suppression, celebrations, cards | `reminderAlerts.collectDueReminderAlerts` | Timer notification preference (merged) |
| **Memory stores** | Spine, `activeWorkContext`, `decisionLedger`, BU reader, `evidenceBankStore`, `researchLibrary`, `patternAwareness` | `estateMemory` digest → durable/LS, with "open loops" as real unfinished items | `companionMemory.ts`, `sparkCompanionMemory` (dead) | Founder Studio sample memories (not member memory) |
| **Board runtimes** | R V2 | Legacy drafts → drain | `lib/boardroom` engine/store, legacy templates, fc8f / `cursor/x` / b103 | `lib/boardroom` entry and view state |
| **Handoff types** | `creationWorkspace/destination` | `SharedHandoff` (as payload), `chamberContextHandoff`, Strategy handoffs, 3C-3 staging | New per-room handoff types | Event-internal coordination handoffs |
| **Research detectors** | 3D-1 `explicitResearchIntent` as fallback under Understanding | `conversationalTurnContract:114`, `claireResearchRequestRouting:8`, `questionVersusAction:133`, `estateBrain/researchRouting:17` | `researchIntelligence` as a router (keep as classifier) | — |
| **Psychological / pattern detectors** | `patternAwareness`, `recoveryAttention/evidence`, `planBehaviorLearning`, `rhythms/patternObservation` | — | `activationSignals` perfectionism, `momentumSignals` / `recoverySignals` avoidance, `patternSignals` task-avoidance, `loop-intelligence` types, `adhdMultiTurnPatterns`, `companionPrompt:79-86` | — |
| **Date resolvers** | One shared resolver (extend `reminderIntelligence.resolveRelativeDay`, fix bare weekday) | `attentionObligation/conversation.ts:31`, `resolveRecoveryAction.ts:88` | — | — |
| **Stance classifiers** | EI `ExecutableStance` | f106 `outputExecutionPosture` → Create owner stance | — | — |

---

## 7. Systems to land (as-is, after Founder authorization and combined verification)

1. **S** `atomic/lmc-s0b-founder-seed-isolation` (`1c4d776e`), including its chain.
2. **EI** `executable-intent/round-1-remember-precedence` (`c047cc72`).
3. **R** `atomic/board-r3f5b-conversation-continuity` (`ced219af`) plus `docs/board-v2-cutover-decision`. Conditions:
   - Founder accepts the preview.
   - Production flag decision (§17).
   - Auth on `/api/board/material-signals`, as a landing blocker.
4. `atomic/events-role-type-flexibility-2026-09-22` (domain; clean).

## 8. Systems to rebase

1. 39cc `atomic-0` / `0a` / `2` (+ atomic-5 catalog): runtime contract, production routing self-check, Proven Capability Registry.
2. `atomic-3d3-research-claire-return-continuity`. Resolve the `ContextualResearchOrigin` union against `main`'s `"chamber"`.
3. `convergence/strategies-s5b-context-consumption`. The only conflict is CPC.
4. `cursor/atomic-3b-vts-lbm-boundary-8b6e`.
5. `atomic/global-attachments-a0-reconciliation` (later).
6. `cursor/lmc-live-wiring-recovery-9fb3`, onto S through a sanctioned writer, or retire.

## 9. Systems to salvage (take ideas, code or tests, never merge the branch)

| From | Salvage |
|---|---|
| `claude/main-conversation-continuity` | Spine-to-model (`051c602`), pending-question ownership, parked topics, answer-before-detour, conversationId-stamped topic/suspension stores, and the whole test set as the spec |
| `cursor/atomic-bc1-business-context-isolation` | `lib/businessContext/*` REAL / SAMPLE / PRACTICE / FOUNDER_DEMO partitioning |
| `convergence/c1-canonical-truth-foundation` | `collectBusinessUnderstandingSituationItems.ts`, VTS `lbmBoundary` (if not taken via 3B) |
| `cursor/bu-founder-review-round5a-20b6`, `atomic/claire-harbor-demo-experience-correction` | UI only (Round 5B areas, Full Document, research workspace, PIH-1). Drop the direct writers. |
| Chamber H1 `f330ff5e2` | Infographic outline preservation (cherry-pick) |
| `cursor/atomic-output-execution-repair-f106` | `outputExecutionPosture` as the Create owner stance inside EI |
| `cursor/shari-adhd-specialized-agent-e985` | Intervention Engine and Proactive docs; `proactive.ts` evidence/receptivity gates as a contract |
| `cursor/desktop-notifications-toggle-fix-684f` | `sparkDesktopNotification.ts` |
| fc8f / `cursor/x` | `classifyBoardInquiry`, vote-validator narrowing (evaluate only) |
| Events 4G/LEU | `docs/events/leu` corpus (optional) |
| R | The model-first extractor pattern and Board move vocabulary, as the template for Turn Understanding. The session lifecycle pattern (suspended flag → explicit Continue / Start New / Remove; archive before clear) for New Day. |
| S | `containsInternalReasoningLeak`, as a generic internal-fragment filter |

## 10. Systems to retire (after migration; nothing deleted now)

- **Branches:**
  - `atomic/claire-c5-person-before-process`
  - `cursor/bp-c1-unified-write-resolver-20b6`
  - `cursor/lmc-focused-area-ripple-18df`
  - `cursor/board-final-integration-b103`
  - fc8f / `bd-fc8f` / `cursor/x`
  - The Events 4G/LEU lineage
  - `cursor/events-production-convergence`, `events-final-cert-d81a`
  - `feature/global-estate-attachments`
  - `chamber-v3-specialist-experience`, `chamber-a1-intake-concern-handoff-f78c`
  - All landed-in-substance branches in §2.3
  - Intermediate stack branches once R and S land
- **Code, dead or unwired:**
  - `companionMemory.ts`, `sparkCompanionMemory`
  - `postLoginContinue.ts`, `welcomeBackBridge` export
  - `reminderAlerts.collectDueReminderAlerts`
  - `strategyChamberActionRouting` exports
  - `chamber/knowledge` (test-only)
  - Dead greeting and celebration components
- **Code, superseded:**
  - `recovery-intelligence`
  - Regex trait-label modules
  - Keyword room offers as openers
  - `companionCapabilityRegistry`
  - Duplicate `isActionAcceptance`
  - Duplicate `last-activity` writer
  - `lib/boardroom` discussion engine and legacy Board templates (after legacy drafts drain)

## 11. Systems that must remain domain-specific

| Domain | Keep domain-specific | But must consume the global foundation for |
|---|---|---|
| **Board** | Deliberation, seven Directors, cross-exam, synthesis, provenance, Board No-Advice contract, meeting session and question queue, SharedHandoff packaging | Auth / model route safety, BU reader, ledger, Plan My Day writer through the execution path, handoff envelope, durable persistence |
| **Claire / Business Profile** | BU conversation, roadmap, C-5 person-before-process, confirmation *wording* | Canonical write transaction (shared), shared output guards, Gate context |
| **Events** | Event Record, roles, foundation questions, adaptive Event Map, EVT library, entrance | Understanding (entry), reference resolution (people, events), handoffs, reminders/plan writers |
| **Chamber** | Roster, personas, response cards, intake concern, one expertise system (`chamberExpertise`) | Gate role, guards, handoffs, pending/acceptance |
| **Strategy** | Catalog, guided journey, work items, engine | Ledger (S-3), handoff envelope, No-Advice guard (retire "one recommended next step") |
| **Create / VTS** | Creation workspace, durable hydration, business canvas, LBM projection | Handoff destination (already), reference resolution, execution receipts |
| **Research** | Library, inquiries, sources, research-live | Single door (`contextualResearchLaunch`), Understanding reading, guards |
| **Plan My Day / Rhythms / Reminders** | Stores and UI | Chat writers through the execution path, attention governor |

---

## 12. Minimum global foundation

```
MEMBER
  ▼
ONE SPARK ── CPC.handleSend (WRAP; no rewrite)
  ▼
UNDERSTAND ── Turn Understanding [NEW-thin] → typed TurnReading
  │            (invokeStructuredLlm; grounded evidence; schema-validated;
  │             fallback = EI resolveExecutableRequest + decideShariResponse)
  ▼
CONTEXTUALIZE ── Conversation Gate (EXTEND: +sources, one call/turn) + BU snapshot (REUSE)
  │               + reference resolver (EXTEND matchResumeIntent) + Active Work (EXTEND staleness)
  ▼
OWN & ROUTE ── Boundary → turnAuthority (EXTEND: binds every terminal path)
  │             → routeEstateIntelligence over Proven Registry (MIGRATE/REBASE; 0A enforced)
  ▼
CONVERSE / ACT
  │  converse: companion-chat (EXTEND: auth, shared output guard on stream + room routes)
  │  act: EI owner registry (EXTEND) → existing domain writers (REUSE)
  │       authorization: pendingAcceptanceAuthority + Boundary pending (EXTEND) + risk policy
  │       BU truth: S canonical transaction (REUSE)
  │       idempotency: executionFoundation (WRAP)
  ▼
VERIFY ── read-back verify(owner,id) (EXTEND EI + executionFoundation) → honest receipt
  ▼
REMEMBER ── spine (EXTEND: to model, durableRecords domain) · action journal (EXTEND executionFoundation run store)
  │          ledger (REUSE) · user-namespaced LS (EXTEND) · member control (EXTEND MemoryLibrary)
  ▼
CONTINUE ── workContinuity (WIRE) · New Day archive-then-offer (EXTEND resetActiveConversation, Board lifecycle pattern)
```

| Component | Action | Existing system |
|---|---|---|
| Turn entry | **WRAP** | `handleSend`. Insert Understanding before the cascade; do not rewrite CPC. |
| Turn Understanding | **NEW (thin)** | Built on `invokeStructuredLlm` (REUSE), output type from EI (REUSE), pattern from R (REUSE) |
| Deterministic fallback readers | **REUSE AS-IS** | EI, `decideShariResponse`, 3D-1 `explicitResearchIntent` |
| Operating context | **EXTEND** | Conversation Gate |
| Business truth | **REUSE AS-IS** (after S lands) | `readProvider` + S transaction |
| Reference resolution | **EXTEND** | `matchResumeIntent` |
| Turn ownership | **EXTEND** | `turnAuthority` + Boundary |
| Capability selection | **MIGRATE** | 39cc contract and registry onto `routeEstateIntelligence` |
| Pending / acceptance | **EXTEND** | `pendingAcceptanceAuthority` + `conversationConfirmationGate` + Boundary |
| Execution | **EXTEND** | EI → owner registry; **WRAP** domain writers with `executionFoundation` |
| Verification / receipts | **EXTEND** | EI read-back + `executionFoundation` verify |
| Action journal (for "undo", "that thing you did") | **EXTEND** | `executionFoundation` run store (is it adequate for non-Board owners? NRV) |
| Output guards | **WRAP** | `humanConversation` + No-Advice seeds + `clinicalLanguageGuard` + leak guard in one post-processor |
| Transcript / continuity | **EXTEND** | Spine + `workContinuity` + `durableRecords` |
| Attention | **EXTEND** | `loadManager` + governor (later round) |
| Security | **EXTEND** | Supabase auth pattern already used by `R:/api/board/deliberate` |

### Why Turn Understanding is the only NEW item, and why it is not a seventh classifier

- **No equivalent exists.**
  - No turn-intent classifier on `M` calls a model; every `handleSend` reader is regex.
  - `invokeStructuredLlm` consumers are Board-only.
  - Claire's model path covers Business Profile salience only.
  - EI is regex by design (its own report, G7: "the model can promise actions it didn't take").
  - No branch among the 225 examined adds model-based turn understanding: `git diff` scan for `memberIntent | turnUnderstanding | semanticIntent | pendingAcceptance | conversationBoundary` found only EI, landed Chamber commits, and abandoned Events and Board forward-port lineages.
- **Regex cannot meet the product law.** Member language is open-ended; the audit's Case A/B/C and §13 below fail on phrasing, not on missing stores.
- **It must replace, not join.** The contract (Round 1 manifest) names Turn Understanding as the **single primary** reader. Existing classifiers are demoted to fallback in the same round that wires it. A governance test asserts that no other module sets turn meaning in production.
- **The model never decides.** It returns a validated reading: stance, move, ordered action candidates with slots, referent phrases, research/deliberation/emotional signals, and grounded evidence spans. Deterministic code keeps ownership, permissions, authorization, execution, verification and the Board's Director selection. This matches principle 13 and the `modelMaterialSignalExtractor` contract.

---

## 13. Twenty-four unfamiliar-language architecture probes

Each probe asks what happens today (static reading of `M`, or of R/S/EI where relevant), what the target foundation does, and **what general capability is missing**. None of these is to be fixed as a sentence.

| # | Member says | Today (static) | Target foundation | General capability exposed |
|---|---|---|---|---|
| 1 | "ugh scratch that, make it Thursday instead" (after a reminder) | No referent to the last action; likely a new reminder or chat | Understanding: move = correction, target = last action. Resolver finds it in the action journal. Update the owner, receipt. | **Action journal as referent + update/undo ops per owner** |
| 2 | "what do you mean by positioning?" | Regex help / troubleshooting modes may misfire | Move = clarification of Spark's own words; answer-first; no process advance | **Global conversational-move reading** (Board has regex-only, room-local) |
| 3 | "help me figure out whether to hire a VA or keep doing it myself" | Keyword offers may open a room without an LLM call | Deliberation signal → converse first, *offer* Board; No-Advice guard | Answer-first binding on every terminal path; No-Advice on stream |
| 4 | "text Maria I'll be late" | Unknown; may chat as if done | Capability unavailable → honest "I can't send texts", offer an alternative | **Availability truth from the Proven Registry** |
| 5 | "block tomorrow morning for the grant app and remind me the night before" | Opens Plan My Day or single detector; "night before" unresolved | Two actions; the second's time depends on the first | **Inter-action references in compound plans** |
| 6 | "where are we with the Hendricks thing?" | No resolver beyond registry titles | Resolver over Projects, Events, BU persons, ledger, transcript | **Unified referent resolution across domains** |
| 7 | "I'm so behind, everything's on fire" | Emotion regex, possible Momentum room offer | Move = friction; person first; observable context (plan items) if relevant; no clinical inference | Plan My Day and current focus in context; clinical guard; offer governance |
| 8 | "find out what other bakeries in Austin charge for custom cakes" | 1 of 5 research detectors; `research-live` unguarded | Research reading → single door → sources in Library → returns to conversation | One research door; guards on the room route |
| 9 | "make a flyer for the workshop on the 14th" | Create path; "workshop" not resolved to an Event | Create owner; referent = Event; handoff via `destination` | Referent resolution into Create; handoff envelope |
| 10 | "actually our main customers are dental offices now, not chiropractors" | Main chat has no BU write; `businessContextSummary` keeps the old truth | BU-truth change → confirm → S transaction → Gate/LMC reflect it | **Global route to canonical BU writes** + retire the legacy summary |
| 11 | "let's plan the launch event for October" | Events room detection by keyword | Understanding → Events owner (domain) with slots | Capability selection from the registry, not keywords |
| 12 | "back. where was I?" (4 days later, on phone) | New Day wiped; no cross-device transcript | Durable spine; New Day archived; `workContinuity` answers; offer to resume | **Durable, user-scoped conversation + continuity read model** |
| 13 | "no, not that one, the other proposal" | Nothing | Resolver returns candidates; pending clarification; member picks | **Disambiguation as a pending question kind** |
| 14 | "remind me every other Tuesday to invoice" | EI routes to rhythm (on branch) | Same; honest if the cadence is unsupported | Owner-level slot capability (EI G1) |
| 15 | "stop suggesting the focus timer" | Per-engine "dismissed today" at best | Preference write → shared dismissal ledger → governor respects it | **Global preference / dismissal ledger** |
| 16 | "forget what I told you about my divorce" | No delete; digest/transcript/pattern stores untouched | Member-control op: soft-delete across transcript, digest, patterns, BU | **Cross-store forget** (Founder decision 9) |
| 17 | "hang on, someone's at the door" (mid-Board meeting) | Board session persists (R); main chat may treat it as a new topic | Move = interruption; Boundary suspends; Board session resumable | Interrupt/return as a global move |
| 18 | "should I raise my prices?" | Strategy prompt "one recommended next step" contradicts No-Advice | Evidence, options and tradeoffs; member decides; Board/Research offered | No-Advice shared guard; prompt retirement |
| 19 | "add the three things we just talked about to my project" | Transcript not in model context; no project writer | Referent = transcript span → N items → project owner → receipt | **Transcript-grounded list extraction + project writer** |
| 20 | "yes but make it 4pm" | Many yes regexes; EI `LEADING_ACCEPTANCE_RE` for remember only | Acceptance plus slot patch on the pending action | **Acceptance-with-modification, global** |
| 21 | "what did I decide about the podcast?" | Strategy decisions bypass the ledger | Ledger recall (Strategy through S-3) | Single decision store |
| 22 | "can you do that thing you did last week with the email?" | Nothing | Action journal lookup → propose repeat | **Action journal (durable)** |
| 23 | "tell Claire I changed my mind about the pricing tiers" | Main chat cannot route a BU correction | Member names an internal agent. Understanding maps it to BU correction; Spark handles it without exposing internals. | Internal names are accepted but never required |
| 24 | "honestly I think I'm just lazy" | Prompt says to "identify the real problem (avoidance)"; trait labels may be stored | No endorsement or diagnosis; reflect observable evidence (e.g. items completed) if helpful | Clinical guard; observable-only patterns |

**Gaps that are general and appear in no current plan:**
- An **action journal** that supports referents, undo and repeat.
- **Inter-action references** inside a compound request.
- **Disambiguation** as a pending kind.
- **Acceptance with modification.**
- **Cross-store forget.**
- A **shared preference/dismissal ledger.**

All six are added to Rounds 4, 5 and 7 below as extensions of existing systems. No new store family is needed; the journal extends the `executionFoundation` run store (NRV).

---

## 14. Final convergence sequence

Rounds are meaningful convergence units, not symptom patches. R0 items are file-disjoint and can land in any order. Later rounds are dependency-ordered.

### Round 0: Land the current truth (no new design)

- **Purpose:** Get finished, reviewed work into production so later rounds build on it rather than around it.
- **Changes:**
  - **R0-S:** land S (chain #442 … #452).
  - **R0-EI:** land EI.
  - **R0-B:** land R (chain #447 … #453) plus the cutover doc, with **auth added to `/api/board/material-signals`** as a landing blocker.
  - **R0-D:** Events role-type; H1 cherry-pick.
- **Reuses:** Everything on those branches, as-is.
- **Eliminates:** Branch/production divergence. Claire private context. `okCount/failCount` partial writes. Reminder/rhythm confirm asymmetry. The client-side Board model call. Legacy roster downgrade.
- **Dependencies:** Founder authorization; Board preview acceptance; flag value (§17).
- **Tests:** Full `npm test` / vitest on the **combined** tree (not run in this round). The branch suites: `canonicalWriteTransaction`, C-5.x, `canonicalWriterBoundary`, `executableIntent.round1`, Board BOARD-CTX-1 / R3F. Typecheck, lint, build.
- **Founder test:** Board meeting end-to-end on the preview with the flag ON. Claire correction plus confirmation. "Remind me every Monday…" and "remind me tomorrow at 9" in main chat.
- **Regression risk:** Low textual (clean merge-tree). Medium behavioral. EI is on by default and changes seven interceptors. Board seven-seat discussions are held if the flag is OFF.
- **Rollback boundary:** Each stack is revertible as one merge commit. EI kill switch `NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE=0`.
- **Must not change:** LMC projection contracts, reminder intake UX, Research Library keys.

### Round 1: Foundation contract, registry and safety

- **Purpose:** One named owner per turn stage, enforced in production. Close the open-proxy holes.
- **Changes:**
  - Rebase 39cc `atomic-0/0a/2` plus the atomic-5 catalog.
  - Remove the `NODE_ENV` guard at `routeEstateIntelligence.ts:437`.
  - Fix the stale headers.
  - Auth plus user id on `companion-chat` and the room routes (`claire-reasoning`, `project-brain`, `research-live`, `decision-analyze`, `generate`).
  - `systemPromptOverride` → server-known prompt IDs.
  - Derive `ALL_SPECIALIZED` from the specialized registry.
- **Reuses:** Branch code; the Supabase bearer pattern from `R:/api/board/deliberate`.
- **Eliminates:** Six-registry ambiguity (registry becomes the invoke gate); contradictory "authoritative" / "UNWIRED" claims.
- **Dependencies:** R0 (the manifest must list R/S/EI paths).
- **Tests:** Governance (every manifest path exists); `routingOwnership.production`; unauthenticated request → 401; Talk It Out still works.
- **Founder test:** Talk It Out, Claire, Research and Board still work signed in.
- **Risk:** Medium (the self-check could throw; auth could break the anonymous preview).
- **Rollback:** Per-route auth flag; self-check behind a revertible commit.
- **Must not change:** Routing results.

### Round 2: Global output guards

- **Purpose:** Guards that are global in fact.
- **Changes:** One shared post-processor on the stream `done` payload and on every room route. It combines:
  - `enforceHumanConversation`
  - No-Advice (R `noAdviceGuard` + `decision-analyze` + Board `GENERIC_ADVICE`)
  - `clinicalLanguageGuard`
  - S `containsInternalReasoningLeak`
- **Also:** Rewrite `companionPrompt.ts:79-94` to observable-only. Retire the "one recommended next step" and "Next Step Engine" prompt lines. Hide trait labels in the Memory Library.
- **Eliminates:** Per-room No-Advice copies; prompted psychological inference.
- **Dependencies:** R0-B (guard seeds), R1 (routes identified).
- **Tests:** No-Advice and clinical suites across all routes, stream and non-stream.
- **Founder test:** "Should I raise my prices?" / "I think I'm just lazy" in main chat, Strategy and Projects.
- **Risk:** Medium (voice changes; streamed text replaced).
- **Rollback:** Guard feature flag per route.
- **Must not change:** Room personas; Board synthesis contract.

### Round 3: Turn Understanding plus answer-first closure

- **Purpose:** Spark understands meaning. Answer-first becomes structural.
- **Changes:**
  - Server route (authed) on `invokeStructuredLlm`, with a `turn_understanding` phase and a latency budget.
  - `TurnReading` schema (EI stance and actions + Board move vocabulary + referent phrases + signals + grounded evidence).
  - Strict validator; fallback to EI / `decideShariResponse`.
  - Boundary and `turnAuthority` consume it.
  - `blockAutoWorkspace` and `resolveExplicitCapabilityIntent` returns consult answer-first.
  - Normalize `’`.
  - Research, continue and help detectors become fallback-only.
  - Manifest names Understanding as the single primary reader.
- **Reuses:** `invokeStructuredLlm`, the R extractor pattern, EI types, `shariAnswerFirst`.
- **Eliminates:** The primary role of about 20 regex classifiers, 5 research detectors and about 12 continue detectors.
- **Dependencies:** R0 (EI, R), R1 (auth, registry), R2 (guards).
- **Tests:**
  - Schema-validation fuzz.
  - Fallback on timeout / bad JSON / ungrounded evidence.
  - A **held-out corpus of unfamiliar phrasings** (§13, plus Founder-supplied language never used in fixtures).
  - Case A/B/C replays.
  - Governance test: no other primary reader.
- **Founder test:** Free conversation using her own phrasing across rooms; room offers appear only as offers after a reply.
- **Risk:** Medium-high (latency, cost, model variance).
- **Rollback:** Flag → pure regex fallback (today's behavior).
- **Must not change:** Explicit navigation verbs ("open Momentum"); Board Director selection authority.

### Round 4: Pending, acceptance and execution convergence

- **Purpose:** "Tell Spark what you want to do" works for everyday actions, honestly.
- **Changes:**
  - EI → generic owner registry (reminder, rhythm, plan_item with date, project_item, hold, research launch, navigation).
  - Execute all authorized actions in order, with inter-action references.
  - `domain_write` and disambiguation pending kinds in `pendingAcceptanceAuthority` / Boundary; EI phase record as payload.
  - Acceptance-with-modification.
  - One vocabulary (`conversationConfirmationGate`).
  - One date resolver (bare weekday fixed).
  - `executionFoundation` idempotency for all chat writes.
  - `verify(owner, id)` read-back.
  - One receipt shape, with undo for reversible actions.
  - Action journal on the run store.
  - Risk policy: act-with-receipt for low-risk reversible; confirm for compound, ambiguous, destructive, BU-changing or high-impact.
  - BU changes routed to the S transaction.
  - Retire `isMultiIntent` gating, the duplicate `isActionAcceptance`, the `explicitCompanionActions` bare-yes rule, and the direct reminder write.
- **Reuses:** EI, `pendingAcceptanceAuthority`, Boundary, `executionFoundation`, domain writers, S transaction.
- **Eliminates:** About 16 pending stores and about 26 yes functions (incrementally), 3 date resolvers, Board-only idempotency.
- **Dependencies:** R3, R0-S.
- **Tests:** Case B replay (every part executed or named, receipt read back from storage); yes/no conformance suite; idempotent retry; undo; expiry.
- **Founder test:** Her own compound requests; "scratch that, Thursday"; "yes but 4pm".
- **Risk:** Medium-high (broad).
- **Rollback:** Per-owner enable flags.
- **Must not change:** Plan My Day UI flows; Board clarification semantics; Claire confirmation wording.

### Round 5A: Single-device continuity

- **Purpose:** Spark remembers the conversation and the work.
- **Changes:**
  - Spine transcript to the model (salvage `051c602` + tests).
  - Pending-question ownership and parked topics (salvage).
  - Single Gate call per turn, with new sources (Create/registry, Saved Work, LastActivity, Plan My Day today, current focus).
  - `businessContextSummary` replaced by the BU snapshot.
  - Wire `workContinuity` / `cognitiveReturn`.
  - Active Work staleness.
  - Unified reference resolver over all domains plus the action journal.
  - **New Day → archive-then-offer** using the Board lifecycle pattern: no deletion; last-activity kept; `estateMemoryHint` softened; plan reset behavior preserved or decided.
- **Reuses:** Spine, Gate, `workContinuity`, `activeWorkContext`, `matchResumeIntent`, `resetActiveConversation`.
- **Eliminates:** Three transcripts → one; four current-work stores → one plus projections; the New Day vs Continue conflict.
- **Dependencies:** R3 (continue / referent readings), R4 (journal).
- **Tests:** The main-conversation-continuity suites (ported); Case A same-device next-day replay.
- **Founder test:** Work, close the tab, come back tomorrow, and ask in her own words.
- **Risk:** Medium (prompt size; Gate caps at 4 items).
- **Rollback:** Flags per source; New Day mode flag.
- **Must not change:** Daily opening card; store schemas.

### Round 5B: Cross-device, user-scoped memory

- **Purpose:** Continuity survives devices. No shared-browser leak.
- **Changes:**
  - `durableRecords` domains `conversation_session`, `active_work`, `estate_digest` (no schema change).
  - Namespace all member LS keys by user (the `planDayOwner` pattern).
  - Clear all member stores on sign-out / account switch.
  - BC-1 context partitioning for BU and sample data.
  - Board session durable (optional).
  - Retention policy.
- **Reuses:** `companion_member_records` RLS, `durableRecords`, `authenticatedBootHydration`.
- **Eliminates:** Device-only continuity; the second-account leak.
- **Dependencies:** R5A; Founder retention decision (§17).
- **Tests:** Cross-device replay; account-switch test; RLS test.
- **Founder test:** Phone ↔ desktop resume.
- **Risk:** Medium-high (data).
- **Rollback:** Domain flags (the pattern already exists).
- **Must not change:** Supabase schema (stop and ask if needed).

### Round 6: Research, Strategy, handoffs and decisions

- **Purpose:** One door into Research; one handoff envelope; one decision store.
- **Changes:**
  - Rebase and land 3d3 and s5b.
  - `destination` as the single envelope, with SharedHandoff, `chamberContextHandoff` and Strategy handoffs as payloads.
  - Strategy decisions to the ledger (S-3).
  - A shared commitment record.
  - VTS 3B.
- **Dependencies:** R3 (research reading); R0. Can run in parallel with R4/R5 if CPC conflicts are managed.
- **Tests:** Claire → Research → Claire round trip; Strategy decision appears in the ledger; handoff return paths.
- **Risk:** Medium (stale bases).
- **Rollback:** Per-branch merge commits.
- **Must not change:** Research Library storage keys.

### Round 7: Attention, proactivity and member control

- **Purpose:** Spark reaches out only as the member allows, and the member can see and remove what Spark remembers.
- **Changes:**
  - `loadManager` gates every channel.
  - Governor ranks one proactive candidate per turn.
  - Shared dismissal/preference ledger.
  - Global "Spark may reach out" level.
  - `sparkDesktopNotification`.
  - Background channel (Founder choice).
  - Observable-only pattern feed.
  - Memory Library inspect / correct / delete (soft-delete) across stores.
  - "Open loops" become real unfinished items.
- **Dependencies:** R5B (durable, user-scoped stores); Founder defaults.
- **Tests:** Quiet hours across all surfaces; dismissal honored across engines; forget removes from context.
- **Risk:** Medium.
- **Rollback:** Per-channel flags.
- **Must not change:** Reminder delivery timing.

### Round 8: Retirement sweeps

- **Purpose:** Remove what the prior rounds made redundant: dead modules, legacy Board engines after drain, keyword registries, trait-label modules, duplicate stores, and stale branches.
- **Rule:** One sweep per duplication group in §6. Each is a deletion-only PR with a governance test proving zero importers.

---

## 15. Dependencies

```
R0 (S, EI, R, domain) ─┬─> R1 (contract/registry/auth) ─> R2 (guards) ─> R3 (understanding)
                       │                                              ├─> R4 (pending/exec) ─> R5A (continuity) ─> R5B (devices) ─> R7 (attention/control)
                       │                                              └─> R6 (research/strategy/handoffs)  [parallel to R4/R5]
                       └────────────────────────────────────────────────────────────────────────────────> R8 sweeps (after each group migrates)
```

- **Hard dependencies:**
  - EI types → R3 schema.
  - R extractor pattern / phase union → R3.
  - S transaction → R4 BU writes.
  - R4 action journal → R5A referents.
  - R5A → R5B.
  - R5B → R7 member control.
- **Parallelizable:** R6 alongside R4/R5. R0 items are independent of each other.

## 16. Risks

1. **Behavioral regressions from landing EI (on by default).** Seven interceptors change priority. Mitigation: kill switch; Founder replay.
2. **Board flag.** With `NEXT_PUBLIC_BOARD_DELIBERATION_V2` OFF, new seven-seat discussions are **held with no fallback** (`R:BoardDirectorDiscussionIntake.tsx:607-617`). NRV on the Vercel env value.
3. **Open model proxies** (`companion-chat` `systemPromptOverride`, `R:material-signals`). These are cost and abuse risks today, and should be closed before or with R0-B / R1.
4. **Understanding latency and cost.** A per-turn model call adds roughly 1.5–2.5s (estimate; NRV). Mitigation: parallel start, short timeout, regex fallback, streaming reply unaffected.
5. **Model variance.** Mitigation: schema validation, grounded-evidence rule, deterministic ownership, held-out phrasing corpus.
6. **CPC merge pressure.** 3d3, s5b and attachments all conflict in CPC. Rebase them one at a time after R0.
7. **Data migration** (R5B namespacing): existing members' un-namespaced keys need a one-time adopt step.
8. **Tests not executed in this round.** Every "land" verdict assumes the branch suites pass on the combined tree (NRV).
9. **The atomic-5 business-building certification harness** was not deeply inspected. Scope creep into R1 is possible.
10. **Parallel-system risk.** Turn Understanding becomes a seventh classifier unless R3 demotes the others in the same round. This is enforced by a governance test.

## 17. Founder decisions still genuinely required

The code cannot answer these.

1. **Accept the Board R3F-5B preview for production, and turn the V2 flag ON.** If the flag stays OFF, new Board discussions are held.
2. **Latency and cost budget for understanding every turn** with a model call. For example: "up to about 2s extra before Spark starts replying is acceptable", or "only for turns the fast path can't settle".
3. **Retention for server-stored conversations.** How long; whether "remove" is soft-delete, which fits the current DB grants, or requires hard deletion.
4. **Background reminder channel.** Browser push, email or SMS, and in what order (Founder decision 5 says "eventually"; the channel is a product choice).
5. **Default proactive level for new members** (Founder decision 7 establishes the control; the default is open).
6. **Confirm abandonment of the Events 4G/LEU lineage** (0 of 710 files on `main`; `main` chose a different Events architecture).
7. **What New Day does to today's plan.** Today `runSharedNewDay` also resets the plan. Keep that, or make it part of archive-then-offer.

Everything else in this report is a technical determination backed by repository evidence.

## 18. What NOT to build

- No Context Bus, Memory Service, Companion Agent framework, Notification Engine or new orchestration service.
- No new router, classifier (other than the single Turn Understanding reader), capability registry, pending store, yes/no vocabulary, transcript store, continuity store, handoff type or decision store.
- No new Supabase tables or schema changes for Rounds 0–5B.
- No sentence-, scenario-, room- or Founder-test-specific regex patches.
- No unrestricted model judgment over permissions, execution, BU truth or Director selection.
- No promoting Board-local mechanisms (session store, question queue, move regex) wholesale into global. Take the *pattern*, not the storage.
- No second Board runtime, and no "production V2 default with fallback" (b103).

## 19. What NOT to merge

`claude/main-conversation-continuity` (re-implement) · `cursor/board-final-integration-b103` · fc8f / `bd-fc8f` / `cursor/x` · `atomic/claire-c5-person-before-process` · `cursor/bp-c1-unified-write-resolver-20b6` · `cursor/lmc-live-wiring-recovery-9fb3` as-is (fails S's writer ratchet) · Events 4G/LEU lineage · `feature/global-estate-attachments` · `cursor/chamber-v3-specialist-experience` · `cursor/shari-adhd-specialized-agent-e985` runtime · `cursor/atomic-bc1…` / `claire-harbor…` / `bu-founder-review-round5a…` as branches (salvage only) · `cursor/atomic-output-execution-repair-f106` separately · intermediate stack branches individually (land the tips).

## 20. Recommended FIRST implementation round

**Round 0: land S and EI first, then R once the Founder accepts the preview.**

1. **One integration check before any merge.** Build the combined tree (`main` + S + EI + R) on a throwaway branch or preview. Run typecheck, lint, the full unit suites and build. No merge happens until this is green.
2. **Land S** (lowest behavioral surface: Claire/BU/LMC only; no CPC, no `companion-chat`).
3. **Land EI** (fresh base; kill switch). Founder replays reminder and rhythm phrasing.
4. **Land R** after (a) Founder acceptance of the preview, (b) the flag decision, and (c) auth on `/api/board/material-signals`.
5. Land Events role-type and cherry-pick H1 (domain, independent).

This round adds no new design. It removes the largest source of "we fixed it but it isn't live", and gives Round 1's contract a stable target.

## 21. Evidence that the proposed solution was challenged and rechecked

| Challenge | What I looked for | Result | Revision |
|---|---|---|---|
| "Is `main` really unchanged?" | `git log f48361bd..origin/main` | 5 drift-glass commits only | Audit production claims hold; fixes are branch-only |
| "Did I miss newer global work on some branch?" | Scanned all 225 recent unmerged branches for `memberIntent`, `turnUnderstanding`, `semanticIntent`, `executableRequest`, `pendingAcceptance`, `conversationBoundary` | Only EI; landed Chamber commits (g1d affirmation continuity is on `main`); abandoned Events and Board forward-port lineages | No competing understanding or pending authority exists |
| "Do the three stacks conflict?" | File-set intersection, then `git merge-tree` of `main`+R, `main`+S, `main`+R+S+EI | No shared files except R's one-line CPC change; combined tree clean | R0 can land in any order |
| "Is the Board move classifier model-based, as described?" | `R:classifyMemberBoardResponse.ts:62,79` | **Regex only**; only `modelMaterialSignalExtractor` is model-first | Turn Understanding reuses the *extractor* pattern, not the move classifier |
| "Is Claire's person-before-process model-led?" | `S:claireModelLedConversation.ts:15-55`, `claireMemberRequest.ts:44-103` | Mostly regex gating | Claire C-5 stays room-local; it does not solve global answer-first |
| "Is C-5 contained in g1-4?" | `merge-base --is-ancestor` | No; re-applied as `3c9aa711` | Retire the standalone C-5 branch |
| "Which yes/no module is canonical?" | Importer counts | `pendingAcceptanceAuthority` 12, `conversationConfirmationGate` 13, `isAffirmativeReply` in `humanConversation` / `companionPending` only | Authority is a **pair**: binding + vocabulary (row 13) |
| "Can the Board session store be the global session?" | `R:boardDirectorDiscussion.ts:294-299` | LocalStorage, not user-scoped | Reuse the lifecycle *pattern*; durability comes from `durableRecords` |
| "Does durable transcript need a schema change (audit Q1)?" | `supabase/companion_member_records_schema.sql` | `domain` is free text; only `status` has a CHECK | No migration needed; retention is still a Founder call |
| "Is `creationWorkspace/destination` really unused cross-room?" | Importers | Used Research → VTS and Research → Project | Chosen as the single envelope (the audit had leaned toward SharedHandoff) |
| "Does S fix the shared-browser leak?" | S0/S0b diffs | No; seed gating only | BC-1 salvage + R5B namespacing |
| "Does landing R regress newer work?" | Checked fc8f, `cursor/x`, b103, cutover doc against R | Those are older or competing; R is newest; cutover doc is authoritative and should land with R | R is the Board authority |
| "Does EI create another pending store or yes vocabulary?" | EI diff | Extends the existing remember store with a phase/expiry; reuses `isBareShortAcceptanceText`; adds `LEADING_ACCEPTANCE_RE` | EI is compatible; R4 registers its record under `pendingAcceptanceAuthority` |
| "Does the plan handle arbitrary language?" | 24 probes (§13) | Regex-only understanding fails on phrasing; six general gaps found | Added Turn Understanding (R3) and the six extensions to R4, R5 and R7 |
| "Does the plan add a parallel system?" | Reviewed every NEW / EXTEND | Only Turn Understanding is new | Gated by a single-primary-reader governance test; old classifiers are demoted in the same round |
| "Hidden runtime callers?" | `resumeCoherence`, `boardroom` engine, `recovery-intelligence` | `buildSessionForResume` is live via `executionFoundation`; the boardroom advisory engine is live via resume; `recovery-intelligence` is still imported by CPC | Marked DO NOT TOUCH YET / retire after drain, not dead |

**Unresolved after the challenge cycle (labelled, not contradictions):**
- Test status of the combined tree (NRV).
- Vercel Board flag value (NRV).
- Understanding latency (NRV).
- Adequacy of the `executionFoundation` run store as a general action journal (NRV).
- What members actually see when the client replaces streamed text (NRV).
- The atomic-3/4/5 business-building harness (not deeply inspected).

No material architectural contradiction remains.

## 22. Final recommendation

**GO**: begin implementation with **Round 0**, landing the existing S, EI and R stacks after a green combined-tree verification and Founder authorization.
**STOP**: do not start Turn Understanding (Round 3), or any new global mechanism, until Round 0 and Round 1 are in production.
**STOP**: no further room-level symptom fixes to routing, yes/no, continuity or pending behavior outside this sequence. Each one adds to the duplication this plan is removing.

---

### Appendix A: Branch patch-equivalence table

`ahead` is commits since merge-base; `notInMain` is commits not patch-equivalent to `main` (`git cherry`); `behind` is `main` commits since merge-base. Generated 2026-09-26 for the 225 branches not ancestors of `main` with commits dated 2026-09-08 or later. The key rows are reproduced in §2.3. The full list is reproducible with:
`git cherry origin/main <branch> $(git merge-base origin/main <branch>)`.

### Appendix B: Continue / "left off" detectors on `main`

`workspaceIntent.ts:88`, `chamberConsumptionPolicy.ts:22`, `conversationGate/conversationalTurnContract.ts:79`, `conversationRouter/classifyTurnIntent.ts:40`, `platformIntent/classifyPlatformIntent.ts:14`, `activeWorkspaceRegistry/matchResumeIntent.ts:36,43`, `sparkEstateDailyCompanionExperience.ts:178`, `roomActionMatchers.ts:32`, `companionGovernor.ts:97`, `conversationHandoffRecovery.ts:19`, `workflowResumeDecision.ts:15`, plus `companionLedContinue.ts`, `talkItOut/reentry.ts`, `continuityRecovery.ts`.

*End of report. Investigation only: nothing was implemented, merged or deployed, and `main` was not changed.*
