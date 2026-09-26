# Spark Estate™: Final Conversational Intelligence Architecture

**Round type:** Architecture synthesis only. No code was implemented, merged or deployed. R1 was not started.
**Prepared:** 2026-09-26, by Claude Code acting as senior conversational-systems architect.
**Decision owner:** Founder.

## What this was checked against

**Repository:** `ShariLHudson/adhd-business-companion-vs3`.
- **Post-R0 state:** branch `claude/spark-r0-foundation-landing-l7edvu` @ `df5bb516`. It contains:
  - Stack 1 (Claire, canonical truth and LMC);
  - Stack 2 (Executable Intent Round 1);
  - Stack 3 (reconstructed Board R3F-5B);
  - seven R0 gate commits, including authentication on `/api/board/material-signals`.
- **Production:** `origin/main` was still `7e2efec6` when inspected. Whether R0 has been promoted to production **needs runtime verification (NRV)**. This report treats the R0 branch as the current truth, as the brief directs.

**Inputs:**
1. *Spark Global Foundation Reconciliation*. Both versions were read: `adhd-companion` branches `…-sriqp5` (R1–R9 numbering, "Turn Interpretation") and `…-wf3oo8` (R0–R8 numbering, "Turn Understanding").
2. The Perplexity and Gemini multi-lens research. **Limitation:** neither report was in either repository or attached to the brief. I worked only from the conclusions the brief quotes:
   - reject one agent, call or classifier per lens;
   - one structured interpretation, plus one deterministic authority;
   - the names CSA, CSI, CSR and "Response Commitment".
   Where this report disagrees with "the research", it disagrees with those quoted conclusions only.
3. The post-R0 code. Three parallel read-only investigations covered:
   - Board and Claire understanding;
   - the main-chat turn spine;
   - evaluation harnesses, the Founder-failure history and telemetry.
   Contested points were re-checked by hand.

**Labels:**
- **NRV** marks a claim that needs runtime verification.
- File references are relative to the vs3 root at `df5bb516`.

---

## 1. Executive verdict

1. **Do not adopt "CSI / CSR / Response Commitment" as named.** The underlying idea survives falsification, but only in a much smaller form than either research report proposes.
   - The name "situation" already means three different things in this codebase:
     - `RelevantSituationItem` (Shared Intelligence context);
     - `BoardSituationModel` / `assessBoardSituation` (Board Director selection);
     - the Gate's `ConversationalTurnContract`.
   - A fourth "situation" would guarantee confusion between understanding and context. That is the exact contamination this architecture exists to prevent.

2. **The surviving architecture has three parts. Only one of them is new.**

   | Part | What it is | New or existing |
   |---|---|---|
   | **Turn Interpretation** | One model-assisted, evidence-grounded, schema-validated reading per member turn. It generalizes the Board's `modelMaterialSignalExtractor` pattern on the shared `invokeStructuredLlm` seam. Its output is a small **Turn Reading** with five fields (§8). | **NEW, by generalization** |
   | **Turn Obligations** | A deterministic, pure policy function over the Turn Reading, the pending state and the capability manifest. It emits what Spark owes the member this turn and what it must not do. It extends the Gate's existing `ConversationalTurnContract` (`primaryJob` + `constraints`). It is **not** model-predicted and **not** an owner. | **EXTEND** |
   | **Advancement Gate** | One deterministic checkpoint that every terminal path in `handleSend` must pass through. A process step (next intake question, execution, navigation, room open, proactive offer) cannot be emitted while an obligation to the person is unmet. This is what makes person-before-process *structural*. | **EXTEND** the Boundary / `turnAuthority` binding that the reconciliation already planned |

3. **The strongest simpler alternative is not dead. It is the control arm.**
   - It is one capable reply model, with the same bounded context, emitting evidence-carrying tool calls through the same deterministic execution gate (Architecture D, §3).
   - It really does handle most *conversational* quality as well as a structured reader would.
   - It fails only where **deterministic code must decide something before or without the reply model**:
     - binding a reply to a pending question;
     - holding an intake workflow;
     - authorizing a write;
     - deciding whether an assertion is truth or a hypothetical;
     - checking delivery.
   - Spark has more than 40 such deterministic decision points today. Board and Claire each run multi-step processes that need them.
   - So the Reading is justified **only** as the interface to those decisions. Every field that does not gate a deterministic decision was removed (§8.3).

4. **R1 is a real falsification experiment, not a build.**
   - Turn Interpretation must beat Architecture D, run with identical context, on hard conversational errors. Beating today's regex runtime is not enough.
   - If D matches it within the pre-registered margin, the separate interpreter is killed. Its fields then move into D's tool-call arguments on write paths only (§19–20).

5. **What I could not verify:**
   - interpretation quality on real member language with the production model (`gpt-4o-mini`) (NRV);
   - added latency, estimated at 0.6–1.8 s p50 for a small JSON call and not measured (NRV);
   - cost;
   - whether the Founder accepts any per-turn latency at all (§26).

---

## 2. Strongest argument against CSI

The best case against CSI:

> "Spark's failures are not failures of *understanding*. They are failures of *authority*. The reminder intake re-asks 'Do you mean AM or PM?' when the member asked a question (`CompanionPageClient.tsx:18182-18214` → `reminderIntelligence.ts:545-576`). It does that because it runs **before any model sees the turn** and never consults the Boundary. The fix is to delete those pre-model responders and let one capable model, holding the whole pending state, answer. A second model call to produce labels that code then reads is a *renamed dialogue-state tracker*, rebuilt in 2026 on top of a model that can already do the whole job. It adds latency, adds a taxonomy that will rot, and gives engineers labels to optimize instead of conversations. It is a hidden router with extra steps."

Specific points in that argument that are **true**:

| Claim | Verdict | Evidence |
|---|---|---|
| CSI is a renamed dialogue-state / dialogue-act tracker | **Largely true.** Moves = dialogue acts; pending relation = DST slot binding. The novelty is only model-based reading with evidence spans and a deterministic consumer. | Classical DST literature; Board `MemberConversationalMove`; Claire `responseMode` |
| A rich schema becomes a maintenance nightmare | **True for the research-scale schema** (14 candidate concepts). Board already has three move vocabularies (`MemberConversationalMove`, `MemberDecisionResponseType` with 14 values, `CommitmentIntent` with 10). Claire has 21 `ClaireReasoningSignal`s. | `classifyMemberBoardResponse.ts:77`, `memberDecision/types.ts:9`, `decisionToCommitment/types.ts:29`, `claireReasoningTypes.ts` |
| Engineers will optimize labels | **Real risk.** Every existing harness scores deterministic labels (`bp2c4_2CertificationScoring.ts`, Board atomic certs). No harness scores conversation outcome. | §7 of the eval survey |
| Confidence values create false precision | **True.** The Board extractor's `confidence` is set by the model and silently coerced to `"low"` when invalid. Nothing calibrates it. | `modelMaterialSignalExtractor.ts:145` |
| Latency without value | **Unknown (NRV).** One extra call per turn is plausible at 0.6–1.8 s. | none measured |
| A strong model with the same context would do as well | **Plausibly true for reply quality.** Unproven for gating decisions. | This is exactly what R1 must measure |
| "Response Commitment" becomes another ownership layer | **True if model-predicted.** Four near-duplicates already exist: `PertinentQuestionMove` (11 move types, unwired), Claire `responseMode` (8), `ShariPrimaryHelpMode` (16), and the Gate's `ConversationalPrimaryJob`. | `lib/pertinentQuestionMove/`, `claireReasoningTypes.ts`, `shariAnswerFirst/types.ts:14`, `conversationalTurnContract.ts:19` |
| CSI duplicates the Boundary | **True if CSI decides topic switch or return.** The Boundary already has 8 decision kinds including `answer_pending_question`, `interrupt_and_suspend` and `return_to_suspended_topic`. | `conversationBoundary.ts:32-40` |
| CSI duplicates Member Operating Context / memory | **True if it carries "relevant approved context".** The Gate already approves context. | `gateRelevantSituationForConversation.ts:229` |
| CSI duplicates the capability registry | **True if it selects capabilities.** | `executionFoundation/capabilityManifest.ts` |
| Psychological inference risk | **True.** "Observable communication signals" invite a model to label affect. Spark has four regex emotion detectors already and prompt-level inference the Founder has rejected. | `companionEmotions.ts:87`; `conversationBoundary.ts:134`; `turnAuthority.ts:64`; `companionPrompt.ts:79-86` |

**What the argument gets wrong (why it does not win outright):**
- Deleting the pre-model responders does **not** remove the need for a machine-readable reading. It moves the need.
  - Board's question queue must decide whether "i am not sure what you mean" answers the Director's question. A regex got that wrong (`round3f5cConversationalMoveUnderstanding.test.ts` header).
  - Claire's grouped confirmation must decide whether "yes, but…" is confirmation. The regex counts short "yes…" replies as **confirmed** (`confirmationContract.ts`).
  - The execution gate must decide whether "say we charged $500" is a price.
  - None of these are reply-generation decisions. They are state-transition decisions that deterministic code must make, and they need a structured input.
- So the argument kills **the rich schema**, **the model-predicted commitment** and **the "situation" framing**. It does not kill a **minimal, decision-gating reading**. Whether that reading must come from a *separate* call, rather than from D's tool arguments, is the open empirical question for R1.

---

## 3. Alternative architectures evaluated

| | Architecture | How it handles the nine brief failures | Fatal weakness | Verdict |
|---|---|---|---|---|
| **A** | Research CSI/CSR: one structured interpretation (about 14 concept families: proposition, moves, antecedents, subject relation, epistemic, action relation, context refs, active-work refs, communication signals, knowledge gap, authority risk, uncertainty, evidence, commitment candidates), then a deterministic authority | Covers all nine | Schema bloat. Commitment candidates duplicate four existing move taxonomies. Context refs duplicate the Gate. Signals invite inference. Engineers tune labels. | **Rejected as specified.** Reduced to E. |
| **B** | One end-to-end reply model, bounded context, deterministic action boundary, no intermediate schema | Correction, clarification, frustration and questions are handled well *in text*. Partial acceptance, hypotheticals and discussion-vs-execution are handled only if the action boundary can tell. | Deterministic owners (intakes, Board queue, Claire confirmation, pending binding) have no input. Person-before-process is prompt-only, which the brief forbids. | **Insufficient alone.** Promoted to D. |
| **C** | Lightweight deterministic dialogue-state / discourse-act tracker (extend the existing regex readers) | Today's system is this, times about 147 classifiers | Fails on open phrasing. Every Founder round has added regexes, and there are two divergent "don't know" and "correction" detectors (Board vs Claire). | **Rejected as the primary reader.** Kept as fallback. |
| **D** | **Guarded end-to-end:** B, plus (1) the pending state and capability manifest in context; (2) side effects only through tool calls whose arguments carry `evidence_span` and `stance` (act / hypothetical / do_not / later); (3) the deterministic gate validates tool calls; (4) pre-model responders removed or converted into state the model sees | Strong on reply quality; one call; streaming preserved | Board and Claire state transitions still need a per-turn reading *before* their deterministic step. D would need a second call there anyway, or a non-streamed structured reply. Person-before-process is checkable only after the text is generated. | **Strongest competitor.** This is the **control arm** in R1. |
| **E** | **Minimal Turn Interpretation + deterministic Turn Obligations + Advancement Gate** (this report) | All nine, structurally | One extra model call; a taxonomy to govern; risk of over-reading | **Candidate.** Must beat D. |
| **E′** | E, with the Reading emitted **by the reply model in the same call** (structured preamble or tool call before text) | As E | Obligations cannot shape a reply that is already being generated. Only a post-hoc check is possible. | **Simplification arm** in R1 |
| **F** | Tiered E: model interpretation only when deterministic triage says "stateful turn" (pending exists, workflow active, action verbs, a room with a process) | As E on stateful turns; as today on others | Triage is regex, and misses reintroduce today's failures | **Latency fallback** if the Founder rejects per-turn latency. Measured in R1. |

**Why E, and not D, is the candidate going into R1:**
- The brief demands structural person-before-process.
- Only E gives deterministic code a reading **before** it emits a process step.
- D can only detect a violation after the reply is written.
- This argument is structural, not empirical. D could still win on measured errors. That is why D is the control arm and not a strawman.

---

## 4. Repository reconciliation (post-R0)

### 4.1 Everything that already contributes, and what it becomes

| Concern | Existing system (post-R0) | Regex or model | Becomes |
|---|---|---|---|
| Model-first extraction with deterministic fallback | `lib/board/reconstructed/selection/modelMaterialSignalExtractor.ts` (validate :145, fallback, trace `pathUsed`); authed route `app/api/board/material-signals` | Model | **REUSED as the pattern.** Generalized into `lib/turnInterpretation/`. Board keeps its extractor (domain). |
| Structured LLM seam | `lib/internalAgent/invokeStructuredLlm.ts` (json_object, 45 s default timeout, 2 attempts, returns latency and usage); `InternalAgentPhase` union (`types.ts:6`) | — | **REUSED.** Add phase `turn_interpretation`. A short timeout override (about 2.5 s) is required. |
| Stance / hypothetical / negation / capability question | `lib/memberIntent/executableRequest.ts`: `ExecutableStance` (act, talk_about, none), 12 `ExecutableStanceReason` values, `HYPOTHETICAL_RE`, `NEGATED_RE`, `THINKING_ALOUD_RE` | Regex | **FALLBACK** reader. Its **types are GENERALIZED** into the Reading's `action.stance`. |
| Modified acceptance | EI `LEADING_ACCEPTANCE_RE` → `interpretRememberReply` (acceptance, modified_acceptance, modification…) | Regex | **FALLBACK.** Concept generalized to `accept_modified` / `accept_partial`. |
| Pending (Remember) | `remindersVsRhythms/conversationPending.ts` (phase, 3-turn / 10-min expiry, `isOfferAnswerTurn`) | — | **REUSED** as a payload of the single pending authority (R2) |
| Topic / boundary decisions | `conversationBoundary.ts` (8 kinds), `conversationBoundaryInputs.ts` (`answerFillsPendingSlot`, role shapes). The header "PURE, UNWIRED" is stale. | Regex | **REUSED as the decider.** It consumes the Reading as evidence. **Gap:** its snapshot omits the Remember pending state, the reminder intake and the Sheets intake, and `pendingOffer` is never populated. |
| Answer-first | `shariAnswerFirst/decideShariResponse.ts` (16 help modes, `directAnswerRequired`, `routingAllowed`); `turnAuthority.ts` (10 owners) | Regex | **REUSED** as a policy input. Help-mode detection → **FALLBACK**. |
| Person-before-process (Claire) | `claireMemberRequestCompose.ts:125` `applyConversationalMoveToReasoning` (forces answer and nulls the question); `claireMemberResponse.ts:462` `resolveQuestion`; `isProcessAdvancementQuestion` | Regex over model output | **GENERALIZED.** This is the only code-enforced person-before-process in the repository. Its rule ("a substantive ask → answer; the next process question is dropped") becomes a Turn Obligation. Claire keeps its wording. |
| Board move understanding | `classifyMemberBoardResponse.ts` (`clarification_request`, `correction`, `help_request`; `extractMemberQuestion`); `applyBoardMemberAnswers` holds the question open on clarification/correction | Regex | **DOMAIN-SPECIFIC consumer.** Its *classification* becomes FALLBACK once the Board consumes Reading moves (R2b). Its *queue semantics* stay domain. **Gap:** `helpRequested` is set but nothing reads it. |
| Board decision/commitment readers | `classifyMemberResponse` (14 types), `classifyCommitmentResponse` (10 intents) | Regex | **DOMAIN-SPECIFIC.** They keep their domain vocabulary but read Reading moves first (later round). |
| Hypothetical future conditions (Board) | `isUnknowableFutureHypothetical` (`boardMemberQuestions.ts:205`) | Regex | **DOMAIN-SPECIFIC** (synthesis truth). The global `assertion.status = hypothetical` covers member turns. |
| Meeting truth / fact propagation | `effectivePositions.ts`, `reconcileSynthesisTruth.ts`, `directorsAffectedByMemberAnswers` | Deterministic | **DOMAIN-SPECIFIC**, unchanged |
| Claire reasoning | `claireReasoningServer.ts:164`: raw fetch, **no timeout, no retry**, weak validation; `app/api/claire-reasoning` **has no authentication** | Model | **DOMAIN-SPECIFIC.** Security fix in R1-S. Later move onto `invokeStructuredLlm`. |
| Claire confirmation | `confirmationContract.ts` (confirmed, rejected, modified, partial, unrecognized). A short "yes…" counts as confirmed. | Regex | **DOMAIN-SPECIFIC outcome.** Reads Reading `accept_modified` first (fixes the gap). |
| "Don't know" | Board `UNKNOWN_MARKERS`; Claire `isIdkOrUncertain` + `buildIdkThinkingSupport`; Board `DONT_KNOW_RE` | Regex (three copies) | **FALLBACK.** Replaced as primary by the move `dont_know`. |
| Correction | Board `CORRECTION_RE`; Claire `detectMemberCorrection` (re-ask only); EI `detectSubjectCorrection` | Regex (three copies) | **FALLBACK.** Replaced as primary by the move `correct` + `target`. |
| Acceptance vocabulary | `conversationConfirmationGate.ts` (`isBareShortAcceptanceText`, `isPureConfirmationDecline`, `isShortAcceptanceOfArmedOwner`); `pendingAcceptanceAuthority.ts` (2-turn limit) | Regex | **REUSED** as the fast path for bare acknowledgements (no model needed for "yes") and as the fallback |
| Spine ownership / expected reply | `conversationSession/ownership/types.ts` (`ExpectedReplyKind`, 23 owners) | — | **REUSED** as the pending authority (R2) |
| Emotion | `detectEmotionalState`, Boundary `EMOTIONAL_URGENCY_RE`, `turnAuthority EMOTIONAL_OVERLOAD_RE`, `classifyOverwhelmNeed`, `frustrationContextHintForChat` | Regex (four or more divergent) | **FALLBACK, then RETIRED as primary.** Replaced by move `express_state` (explicit words only). |
| Response-move taxonomy | `lib/pertinentQuestionMove/` (11 move types, `epistemicStance`), unwired in app; `lib/pertinentQuestionEngine/` (question worthiness) | Deterministic | **REUSED** by Turn Obligations for *which question Spark may ask* (its `no_question` law). Not duplicated. |
| Turn contract to the reply model | `conversationGate/conversationalTurnContract.ts` (`ConversationalPrimaryJob` + constraints + provenance), already sent per turn | Deterministic | **EXTENDED**: Turn Obligations are its new primary input |
| Context | `retrieveRelevantSituation.ts:740` + Gate (approved items, provenance, epistemic status) | Lexical | **REUSED.** The interpreter gets a *bounded slice*, not the Gate's output (§13). |
| Active work / references | `activeWorkContext` (primary + 5 suspended, `lastReferencedAt` never age-checked); `matchResumeIntent` | Lexical | **REUSED** as reference *candidates*. The model chooses among given ids only. |
| Execution / verification | `executionFoundation` (1 manifest entry; readiness; receipt; run store; verify). **Remember executes rhythms directly, without a receipt.** | — | **REUSED/EXTENDED** in R3; the capability list is the interpreter's action vocabulary |
| Delivery guards | `enforceHumanConversation` (**skipped on stream**, `route.ts:395-470`); `certifyCompanionDelivery` (client); `clinicalLanguageGuard` (**unwired**); Claire `containsInternalReasoningLeak` | Regex | **REUSED** in R4. Adds an obligation-conformance check. |
| Per-turn trace | `conversationStabilization/turnDecisionStore.ts` (`beginTurnDecision`, `annotateTurnDecision`, stale-turn rejection); `logConversationDecision`; shadow precedent `intelligence-layer/shadowSignalStore.ts` | — | **REUSED** as the shadow sink (R1b). No Supabase log table exists, so a durable sink is a Founder decision (§26). |
| Acceptance harness | `lib/conversationAcceptance/journeys` (14 Founder journeys, wording-independent invariants, `knownGap` with named owner) | Deterministic | **REUSED as the backbone** of the Correctness Suite (§14) |
| Parity corpus pattern | `chamberExpertise/__tests__/foundersCorpus` (frozen V1 baseline + stricter V2) | — | **REUSED** as the baseline/candidate pattern |
| Model fakes | `vi.mock("@/lib/internalAgent")` phase-dispatched fakes; injected `fetchImpl` | — | **REUSED** for deterministic tests of the interpreter and policy |
| Feature flags | `lib/intelligence-layer/featureFlags.ts` (localStorage override, then env, default OFF) | — | **REUSED**: `NEXT_PUBLIC_TURN_INTERPRETATION_SHADOW` |

### 4.2 Findings that change the plan

1. **Person-before-process already exists in code once: Claire C-5.** It works by *removing the process question after the model replies*. The global design generalizes that removal into the Advancement Gate. It does not invent a new mechanism.
2. **A response-move taxonomy already exists and is unwired: `pertinentQuestionMove`.** A new "Response Commitment" enum would be the fifth. Rejected (§9).
3. **The Boundary's pending snapshot is blind to the Remember pending state, reminder intake and Sheets intake.** This is why a question during reminder intake is swallowed. Turn Interpretation cannot fix this alone. R2 must put every pending kind in one authority. **The Reading is necessary but not sufficient.**
4. **The Board extractor's "evidence grounding" is one shared four-character token.** That is too weak to be the global contract. The Reading requires **exact substring spans** (§8).
5. **The stream path skips `enforceHumanConversation`,** and the client streams most turns. Any delivery-side obligation check is ineffective until R4 closes this.
6. **Two open model proxies remain after R0:**
   - `companion-chat` (`systemPromptOverride` from the client, no auth);
   - `claire-reasoning` (no auth).

   A new interpreter route must not add a third. Authentication is a precondition (R1-S).

---
## 5. Final architecture

**Name:** **Turn Interpretation**, which produces a **Turn Reading**, which is consumed by **Turn Obligations** and enforced by the **Advancement Gate**.
- I keep the reconciliation's term "Turn Interpretation" (sriqp5) rather than CSA or CSI.
  - "Situation" is taken three times over in this codebase (§1).
  - "Interpretation" is honest: it is a reading, not a judgment or a decision.
- I reject the name "Turn Understanding" (wf3oo8). It overclaims what a model reading is.

### 5.1 One turn, in order

1. **Fast lexical triage (deterministic, about 1 ms).** Its only job is to *skip* the model when the model cannot add anything:
   - the turn is a bare acknowledgement that the existing gate already binds (`isBareShortAcceptanceText` with exactly one armed pending item);
   - the turn is an explicit navigation command (`hardNavigationCommands`).
   Triage never *assigns* meaning to anything else.
2. **Bounded interpretation slice (deterministic).** Assembled from existing stores (§13). It contains the candidate ids the model may choose from.
3. **Turn Interpretation (model, server, authenticated).** Returns a Turn Reading (§8). It is validated strictly, and every item needs an exact evidence span. If the model fails or times out, the existing regex readers produce a *degraded* Reading marked `source: "fallback"`.
4. **Existing deciders consume the Reading as evidence. They remain the deciders.**
   - The Boundary decides the topic relationship.
   - The single pending authority decides binding (R2).
   - `turnAuthority` / the Boundary pick the owner.
   - The capability manifest and readiness gate decide what *may* execute.
5. **Turn Obligations (deterministic, pure).** Input: Reading + pending state + owner decision + manifest. Output: `primaryJob`, `secondary[]`, `prohibitions[]` and `holds[]`, written into the existing `ConversationalTurnContract`.
6. **Advancement Gate (deterministic).** Every terminal return in `handleSend`, and every room process step, calls it with the step it proposes. It returns `allow`, `defer` (hold the step and let the reply answer the person first), or `deny` (for example, execution when the stance is not `act`).
7. **Reply.** The existing reply route gets the turn contract (obligations in plain language) and the Gate context. **It never gets the Reading's labels.**
8. **Delivery (R4).** The existing guards run, plus an obligation-conformance check (a truth guard that needs receipts; no process question when a `hold` is present). This is stream-safe.
9. **Trace.** Reading, obligations, gate verdicts and owner are written through `turnDecisionStore`.

### 5.2 What stays exactly where it is

- The Boundary is still the only topic/turn owner.
- Pending binding stays in one place (converged in R2).
- The capability manifest, readiness gate, run store and verification are unchanged.
- Board, Claire, Events, Chamber and Create keep their domain processes. They *consume* the Reading and obligations; they do not re-read the turn.
- The reply model writes all language. The interpreter writes none.

---

## 6. Architecture diagram

```
                           MEMBER TURN (text + turn id)
                                     │
                   ┌─────────────────┴──────────────────┐
                   │ 0 Triage (deterministic, skip-only) │── bare ack w/ one armed pending ─┐
                   └─────────────────┬──────────────────┘   or explicit nav command         │
                                     ▼                                                       │
     ┌────────────── 1 Interpretation slice (deterministic, bounded) ──────────────┐         │
     │ last 2 Spark turns · last 4 member turns · ALL pending items (one authority) │        │
     │ active + suspended work labels/ids · last 5 action-journal entries           │        │
     │ capability names from manifest · current room/process step                    │        │
     └──────────────────────────────┬──────────────────────────────────────────────┘        │
                                    ▼                                                        │
     ┌──────── 2 TURN INTERPRETATION  (model; /api/turn-interpretation; authed) ─────┐       │
     │ invokeStructuredLlm phase=turn_interpretation · timeout ≈2.5s · 1 attempt      │       │
     │ → TURN READING {moves[], actions[], assertions[], references[], source}        │       │
     │ validator: enum + exact-substring evidence spans + ids ∈ slice                  │       │
     │ fail/timeout → FALLBACK READING from regex readers (EI, Board, Claire, gate)    │       │
     └──────────────────────────────┬─────────────────────────────────────────────────┘      │
                                    ▼                                                        ▼
  ┌──────────── 3 EXISTING DETERMINISTIC DECIDERS (evidence in, decisions out) ────────────────┐
  │ Boundary (topic/turn owner) · Pending authority (binding) · turnAuthority                  │
  │ Capability manifest + readiness gate (what MAY execute) · Board/Claire/Events processes    │
  └──────────────────────────────┬─────────────────────────────────────────────────────────────┘
                                 ▼
  ┌──── 4 TURN OBLIGATIONS (pure policy fn → extends ConversationalTurnContract) ────┐
  │ primaryJob · secondary[] · prohibitions[] · holds[]                               │
  └──────────────────────────────┬────────────────────────────────────────────────────┘
                                 ▼
  ┌──── 5 ADVANCEMENT GATE — every terminal path & room process step must call it ───┐
  │ proposedStep ∈ {ask_next, execute, navigate, open_room, offer, proactive}         │
  │ → allow | defer (answer the person first, keep pending) | deny                     │
  └───────┬───────────────────────────────┬───────────────────────────────────────────┘
          ▼                               ▼
   6 REPLY (companion-chat /       EXECUTE via manifest → verify → receipt
     room route) gets plain-         (R3; journal feeds references)
     language obligations
          ▼
   7 DELIVERY (R4): human-conversation · No-Advice · clinical · leak ·
     truth-vs-receipt · obligation conformance (stream-safe)
          ▼
   8 TRACE: turnDecisionStore {reading, obligations, gate verdicts, owner, receipts}
```

---

## 7. What Turn Interpretation is, and is not

**It IS:**
- A stateless function: `(member text, bounded slice) → Turn Reading`.
- Run at most once per member turn, server-side, behind authentication.
- A *reading of what the member did with their words*. Every claim in it points at the member's exact words.
- Ephemeral. Nothing it produces is stored as member truth.
- In shadow mode, written to the trace only.
- Replaceable. If R1 shows Architecture D is as good, it is deleted.

**It is NOT:**

| Not a… | Why this matters | Enforcement |
|---|---|---|
| Router or turn owner | The Boundary and `turnAuthority` decide | No output field names an owner or room. A governance test forbids importing the Reading into navigation code except through the Boundary and the Gate. |
| Capability registry | The manifest decides what exists and what is available | `actions[].capability` must be a name from the slice's manifest list, or `"unlisted"` |
| Memory store | — | The Reading is never persisted outside the trace. A test asserts no writer imports it. |
| Pending-state store | Pending lives in one authority (R2) | The Reading references pending items by id only |
| Business-truth store | Canonical writes go only through the S transaction | `assertions[]` are *candidates* with a status. Only the owner, after confirmation, writes. |
| Execution authority | The readiness gate and receipts decide | `stance: act` is necessary, never sufficient |
| Transcript | — | It reads a bounded slice and emits no text |
| Agent | — | One call, no tools, no loop, no memory |
| Response generator or commitment predictor | Obligations are deterministic (§9) | No field describes Spark's reply |
| Psychological assessor | Founder Decision 6 | Only the `express_state` move, grounded in explicit words, with a closed category list (§8) |

---

## 8. Minimum Turn Reading (schema)

### 8.1 Schema (v1)

```ts
type TurnReading = {
  source: "model" | "fallback" | "triage";
  moves: Array<{
    move:
      | "ask"            // substantive question/request for information or help
      | "clarify"        // asks what Spark meant / what an option means
      | "correct"        // says something Spark said/did/stored, or member said earlier, is wrong
      | "answer"         // supplies what a pending question asked for
      | "accept" | "accept_modified" | "accept_partial" | "decline"
      | "defer"          // not now / later / after X
      | "dont_know"      // member states they do not know / are unsure
      | "express_state"  // member explicitly states a feeling/energy/frustration/excitement
      | "pause" | "resume"
      | "switch"         // explicitly leaves the current subject
      | "social"         // greeting, thanks, closing, small talk
      | "inform";        // volunteers information not asked for
    target?: { kind: "pending" | "spark_last_turn" | "action" | "work" | "assertion" | "none"; id?: string };
    evidence: string;                 // exact substring of member text
    certainty: "clear" | "unsure";    // categorical; no numeric confidence
    detail?: {
      stateCategory?: "frustrated_with_spark" | "frustrated_general" | "overwhelmed" | "tired" | "excited" | "relieved" | "worried"; // express_state only
      modification?: string;          // accept_modified: exact substring of the change
      scope?: string[];               // accept_partial: ids/ordinals of accepted items from the slice
      condition?: string;             // defer: exact substring ("until I hear from Sam")
    };
  }>;
  actions: Array<{
    capability: string;               // from slice manifest list, or "unlisted"
    stance: "act_now" | "discuss" | "hypothetical" | "do_not" | "later_conditional";
    slots: Record<string, { value: string; evidence: string }>;
    dependsOn?: number;               // index of another action (inter-action reference)
    evidence: string;
  }>;
  assertions: Array<{                 // only statements that could become stored truth
    about: "business" | "member_plan" | "person" | "event" | "other";
    status: "stated_fact" | "tentative" | "hypothetical" | "third_party_claim" | "past_no_longer_true";
    evidence: string;
  }>;
  references: Array<{
    phrase: string;                   // exact substring ("that", "the other one", "Hendricks")
    resolvedId?: string;              // must be an id present in the slice
    candidates?: string[];            // ≥2 ids if ambiguous; empty if none match
  }>;
};
```

**Size limit:** at most 4 moves, 4 actions, 4 assertions and 4 references. Anything beyond that means the turn is a brain dump, and the policy routes it to capture-and-confirm.

### 8.2 Justification for each field

| Field | 1. Downstream decision that uses it | 2. Why that decision is unsafe without it | 3. Grounding | 4. Low certainty or fallback | 5. Lifetime | 6. Consumers | 7. Inference risk |
|---|---|---|---|---|---|---|---|
| `moves[].move = ask` | Obligations `primaryJob = answer`; Gate defers any process step | Intakes re-ask instead of answering (reminder intake :545-576) | Exact span, usually the interrogative clause | `unsure` → treat as ask (answering costs little; swallowing costs a lot) | Turn | Obligations, Gate, Board `extractMemberQuestion` replacement | Low |
| `clarify` | Pending is **held**, never bound as the answer; reply explains | "i am not sure what you mean" was stored as a settled unknown (Board 3F-5C); MA-17 killed the offer | Span | `unsure` between clarify and dont_know → hold pending and explain (both safe) | Turn | Pending authority, Board queue, Obligations | Low |
| `correct` + `target` | The owner updates the target (fact, action, slot, Spark's summary); Boundary is **not** "switch" | Correction treated as a new topic or as evidence (3F-5C case 6, BP2C7 BU-03/04/09, G8) | Span + target id from slice | No target → acknowledge and ask what to fix; never write | Turn | Boundary, owners, Obligations | Low |
| `answer` + `target` | Pending authority binds the slot | Needed to separate an answer from a question about the slot | Span | `unsure` → deterministic shape check (`answerFillsPendingSlot`) decides | Turn | Pending authority | Low |
| `accept` / `accept_modified` / `accept_partial` / `decline` + `detail` | Execute exactly the accepted scope with modifications, or nothing | "Yes but 4pm" and "yes, only the first two" executed as a full yes (EI §3, Claire `confirmationContract`) | Span; `modification` / `scope` spans or ids | `unsure` → confirm the *interpreted* plan; never execute | Turn | Pending authority, readiness gate | Low |
| `defer` + `condition` | Hold; optionally offer a conditional reminder; never execute | "Wait until Sam replies" is not a yes | Span | → treat as decline-for-now | Turn | Pending authority, Obligations | Low |
| `dont_know` | Do **not** record missing evidence or a fact; offer a low-effort path; limit re-asks | "don't know" became a settled-unknown fact; intake loops | Span | → fallback regex | Turn | Obligations, Board queue, Claire | Low |
| `express_state` + `stateCategory` | Obligation `acknowledge_state` (once); suppress proactive offers and new process questions this turn; `frustrated_with_spark` → stop the current process and offer to skip or pause | Frustration ignored while the process advances (MA-19) | **Explicit words only.** The validator rejects it if the span holds no first-person or evaluative expression (a closed list of cues checked by a regex *veto*, not detection) | `unsure` → no acknowledgement (under-empathy is safer than projection) | **Turn only; never persisted, never in the reply prompt as a label** | Obligations, attention governor (R7) | **Highest.** Mitigated by the closed category list, span requirement, non-persistence and the delivery clinical guard. |
| `pause` / `resume` | Boundary suspend/return; pending expiry frozen or unfrozen | Existing `interrupt_and_suspend` is regex | Span | → Boundary regex | Turn | Boundary | Low |
| `switch` | Boundary `switch_topic`; pending held (not expired) | Real switches exist; drift must not become a switch | Span | `unsure` → treat as drift, keep subject | Turn | Boundary | Low |
| `social` | Obligation: brief social reply; no process step | "thanks!!" answered with a new question | Span | — | Turn | Obligations | None |
| `inform` | Owners may treat it as a candidate fact (with `assertions`) | Keeps volunteered information from being lost | Span | — | Turn | Owners | Low |
| `actions[].capability/stance/slots/dependsOn` | Readiness gate: only `act_now` can proceed; `discuss` / `hypothetical` / `do_not` → no execution; compound ordering | "Put this in my Rhythm" wrote "this"; hypotheticals executed; compound requests dropped | Spans per slot | `unsure` → confirm | Turn | EI owner registry → manifest | Low |
| `assertions[].status` | Only `stated_fact` may be *proposed* for a truth write (still confirmed); `hypothetical` / `third_party_claim` / `tentative` never written as established | Hypothetical price written; tentative client stored as established | Span | → not established | Turn | S transaction callers, Claire, Board | Medium (over-reading "tentative"), bounded because the result is only ever *less* writing |
| `references[]` | Owners act on the resolved id; ≥2 candidates → a clarification obligation **only if a side effect depends on it** | "make it shorter" edits the wrong draft; "the other proposal" | Span + ids from slice | No id → conversational best-guess with the assumption named; side effect → clarify | Turn | Owners, resolver | Low |

### 8.3 Candidate concepts removed

| Candidate | Removed because |
|---|---|
| Semantic proposition (a paraphrase of the turn) | No deterministic consumer. The reply model reads the member's words directly. A paraphrase is a lossy copy that invites drift. |
| Active-subject relationship | Covered by the `switch` / `resume` moves plus Boundary evidence. A separate field would duplicate the Boundary. |
| Epistemic state (global) | Kept **only** where it gates writes (`assertions[].status`) |
| Relevant approved context references | The Gate owns context approval. Duplicating it is the contamination risk. |
| Active-work references | Folded into `references[]` / `target` |
| Knowledge gap | Derived by policy from `dont_know` + pending slot. Model-stated gaps became "missing evidence" in the Board. |
| Authority risk | Deterministic, from the manifest's side-effect class. A model must never rate its own permission risk. |
| Global uncertainty / confidence numbers | False precision. Replaced by the per-item categorical `certainty`, whose low value always maps to the *safer* branch. |
| Evidence spans as a separate field | Required inline on every item |
| Response commitment candidates | Rejected (§9). Deterministic. |
| Observable communication signals (open-ended) | Narrowed to `express_state` with a closed category list and explicit words |
| Intent label (help mode, room) | Duplicates `decideShariResponse` / the capability selection |

---

## 9. Response Commitment decision

**Decision:** Spark needs an explicit, inspectable artifact between understanding and generation. That artifact **already exists** as the Gate's `ConversationalTurnContract` (`primaryJob` + constraints + provenance), and it already reaches the reply model every turn.
- It is **extended** with deterministic **Turn Obligations**.
- **No** "Response Commitment" type is created.
- **No** model predicts it.

**Why not the research's version:**
- **It would be the fifth move taxonomy.** The existing four are:
  - `PertinentQuestionMove` (11 types);
  - Claire `responseMode` (8);
  - `ShariPrimaryHelpMode` (16);
  - `ConversationalPrimaryJob`.
- **A model-predicted commitment is a hidden router.** It decides what Spark does, outside the Boundary and the manifest.
- **The candidate list mixes three layers:**
  - obligations to the person: acknowledge, answer, clarify;
  - process steps: continue, offer next step;
  - authority steps: request approval, execute.
  Obligations are about the *person*. Process and authority steps are *proposals* that the Advancement Gate approves or defers. Mixing them is how "continue the process" has been allowed to override "answer the question".

**Obligation vocabulary (closed, deterministic):**
- `answer`
- `explain_own_words`
- `acknowledge_correction_and_fix`
- `acknowledge_state`
- `offer_help_path`
- `confirm_interpreted_plan`
- `report_receipt`
- `name_unavailable`
- `social_reply`
- `resume_context`

**Constraints:**
- `prohibitions[]`: `no_process_question`, `no_execution`, `no_navigation`, `no_proactive_offer`, `no_truth_write`, `no_repeat_question:<id>`.
- `holds[]`: pending ids whose expiry clock is frozen this turn.

**Answers to the brief's questions:**

| Question | Answer |
|---|---|
| Is one primary commitment necessary? | Yes: **one `primaryJob`**, so the reply has a lead. Tie-break order: `acknowledge_correction_and_fix` > `answer` / `explain_own_words` > `confirm_interpreted_plan` > `report_receipt` > `acknowledge_state` > `social_reply`. |
| Are secondary commitments needed? | Yes, at most 2, and only if compatible (e.g. `answer` + `acknowledge_state`). An incompatible secondary becomes a hold for the next turn. |
| Model-predicted? | **No.** Pure function of Reading + pending + owner + manifest, unit-testable. |
| Deterministic policy selects it? | **Yes** |
| How does it differ from turn ownership? | Ownership = *who* handles the turn (Boundary). Obligations = *what Spark owes the person* whoever handles it. Every owner, including Board and Claire, receives the same obligations. |
| How does it differ from intent? | Intent (Reading) = what the member did. Obligation = what that requires of Spark *given state*. The same `ask` gives `answer` normally, and gives `answer` + hold when an intake is pending. |
| How does it differ from capability selection? | The capability manifest says what *can* be done. The obligation may be `name_unavailable` or `confirm_interpreted_plan`, never "use tool X". |

---

## 10. Person-before-process enforcement

### 10.1 Structural mechanism

1. **Single choke point.** R2 converts every terminal return in `handleSend` into `return commitTurn(proposal)`. There are 175 bare `return;` statements today (reconciliation). Room process steps call the same function:
   - Board: `advanceBoardMemberQuestions`;
   - Claire: `resolveQuestion`;
   - Create: the discovery question;
   - reminder/Sheets intakes.
   `commitTurn` consults the **Advancement Gate**.
2. **The Gate rule, in one sentence.** A proposed process step is allowed only if (a) no obligation to the person is unmet, or (b) the member's own move explicitly requests that step. A step that fails is **deferred, not dropped**: the pending item is held, and the reply fulfils the obligation.
3. **Conformance.** A governance test enumerates `handleSend` terminal paths and room step functions. Any path that emits a process step without calling the Gate fails CI. This follows the reconciliation's "single primary reader" governance pattern.
4. **Delivery check (R4).** If `no_process_question` is present, a reply whose final sentence is a process question from the owner's registry is trimmed. This generalizes Claire's `isProcessAdvancementQuestion`. The text itself is never regex-rewritten.

### 10.2 General rules (they operate on moves, never on sentences)

| # | Situation (by Reading) | Obligations | Prohibitions / holds | Deterministic authority |
|---|---|---|---|---|
| PBP-1 | `ask` present, with an active process whose pending slot the question does not fill | `answer` | Hold pending; `no_process_question` unless the answer *is* the slot; re-offer the pending item after answering, at most once | Pending authority, Gate |
| PBP-2 | `clarify` targeting the pending item or Spark's last turn | `explain_own_words` | Pending held; never bound; the same question may be re-asked once, reworded | Pending authority |
| PBP-3 | `correct` | `acknowledge_correction_and_fix` (fix via owner: slot patch, action update with receipt, or truth change → confirm) | `no_truth_write` without confirmation; the Boundary may not classify the turn as `switch` | Owner + readiness + S transaction |
| PBP-4 | `express_state` (`frustrated_with_spark`) | `acknowledge_state` + offer to skip or pause the process | `no_process_question`, `no_proactive_offer`; pending held | Gate |
| PBP-5 | `express_state` (other) together with a practical `ask` / `actions` | primary: the practical ask; secondary: `acknowledge_state` (one clause) | `no_proactive_offer`; no room offer replaces the practical answer | Gate |
| PBP-6 | `dont_know` alone, on a pending slot | `offer_help_path` (skip, default, or a smaller question) | `no_repeat_question:<slot>` after one re-ask; never stored as a fact or as "evidence missing" | Pending authority |
| PBP-7 | `dont_know` + `ask` / help | `answer` (help first) + `offer_help_path` | Slot held | Pending authority |
| PBP-8 | `accept_partial` / `accept_modified` | `confirm_interpreted_plan` if the modification is `unsure` or the scope is ambiguous; else execute the scope with a receipt | `no_execution` of unaccepted scope | Readiness gate |
| PBP-9 | `pause` / interruption | brief acknowledgement | Suspend (Boundary); freeze the pending expiry clock; `no_process_question` | Boundary |
| PBP-10 | `resume` / return after time away | `resume_context` (where we were, from stored state) | If the pending item or referent is stale (older than the freshness policy, or the context changed) → `confirm_interpreted_plan` before any step | Continuity + freshness |
| PBP-11 | `decline` / `defer` | Acknowledge | That offer is suppressed for the rest of the session (dismissal ledger, R7) | Pending authority |
| PBP-12 | `social` only | `social_reply` | `no_process_question`, unless the process is explicitly awaiting and the member's previous move was `pause` → then a gentle re-offer | Gate |

**Fallback discipline:** if `source = fallback`, only rules PBP-1 to PBP-3 apply, and only when the fallback regex itself fires. Otherwise today's behavior runs. A model outage therefore **never makes Spark stricter than today**, and cannot cause a clarification storm.

---

## 11. Model vs deterministic responsibilities

| Responsibility | Model | Deterministic |
|---|---|---|
| What the member did with their words (moves, spans) | ✔ Turn Interpretation | Fallback regex readers; validator |
| Which stored thing "that" means | Picks among given ids | Supplies candidates; verifies the id exists; freshness |
| Whether a turn answers a pending question | Evidence (`answer` / `clarify` / `ask`) | **Pending authority decides** |
| Topic continue / switch / return | Evidence | **Boundary decides** |
| What Spark owes the person | — | **Turn Obligations** |
| Whether a process step may happen now | — | **Advancement Gate** |
| Which capability exists or is available | — | **Manifest** |
| Whether to execute | Stance evidence | **Readiness gate + risk policy + receipt** |
| Whether something becomes business truth | Status evidence | **S canonical transaction, only after member confirmation** |
| Whether an action happened | — | **Receipt / read-back only** |
| Wording, tone, empathy, explanation | ✔ Reply model | Delivery guards |
| No-Advice, clinical language, leaks | — | **Delivery pipeline** |
| Specialist selection (Board Directors, Chamber experts) | Domain extractors | **Domain deterministic selection** |

---

## 12. Domain-specific boundaries

| Domain | Keeps (domain) | Consumes (global) | Must not |
|---|---|---|---|
| **Board** | Question queue (4-question limit, one open), Director selection, material-signal extractor, synthesis truth, hypothetical-future filter, commitment classification, meeting session | Reading moves (clarify, correct, ask-addressed-to-Director, dont_know + help) in place of `classifyMemberBoardResponse` as primary; obligations; Gate before `advanceBoardMemberQuestions` | Run its own global-style move reader again; treat the Reading as Director evidence (the Reading is not a fact source) |
| **Claire / BU** | Profile question registry, re-ask contract, confirmation *wording*, grouped candidate UX | `accept_modified` / `accept_partial` (fixes the short-"yes…" gap); `assertions[].status` for write eligibility; obligations replace prompt-only C-5.x rules | Write any assertion that is not `stated_fact` + member-confirmed |
| **Create** | Interview, workspace, drafts | `ask` / `clarify` during the interview (replaces `DETOUR_QUESTION_RE`); references to drafts | Park Create on a question *about the creation* (answer and adjust instead) |
| **Reminders / Rhythms / Plan** | Stores, intake slot logic, scheduling | `actions[]`, `accept_modified`, `defer`, hold rules | Re-ask a slot when the member asked a question (today's defect) |
| **Events / Chamber / Strategy / Research** | Their records, experts, journeys, sources | Reading at entry; references; obligations | Open a room on keywords before the reply (answer-first) |

---

## 13. Member Operating Context requirements

The interpreter gets a **bounded interpretation slice**. It does not get the full Member Operating Context. This keeps contamination low and latency small.

| Slice element | Source (existing) | Why the interpreter needs it | Limit |
|---|---|---|---|
| Last 2 Spark turns (text) | Spine | `clarify` / `correct` targets; what "yes" answers | About 600 tokens |
| Last 4 member turns | Spine | Self-correction; drift vs switch | About 400 tokens |
| **All** pending items (id, kind, expected reply, offered options with ids) | **Single pending authority (R2).** In R1 it is assembled read-only from: spine `expectedReply`, `pendingAcceptanceAuthority`, `conversationPending` (Remember), reminder-intake session, Sheets intake, Create discovery, decision-ledger confirmation, Board open question | `answer` / `accept*` / `clarify` targets | 6 items |
| Active + suspended work (id, label, lastReferencedAt) | `activeWorkContext` | References; resume | 6 items |
| Last 5 action-journal entries (id, capability, label, time) | `executionFoundation` run store + Remember executions (R1: read-only adapters) | "undo that", "I said Tuesday" | 5 items |
| Capability names (+ availability) | Manifest + EI `AVAILABILITY` (R1) | `actions[].capability` vocabulary | About 20 names |
| Current room / process step | Owner / spine | Board or Claire context | 1 |

**Excluded on purpose:**
- business facts;
- pattern observations;
- the memory digest;
- research findings;
- other members' or sample data.

These belong to the reply model through the Gate, with provenance. The interpreter never needs to *know* a fact to see that the member *asserted* one.

**Requirements this places on the later Member Operating Context round:**
- **Freshness.** Every pending item and active-work item carries `at` and `turn`.
- **One id space.** Ids are stable across devices once R6 lands.
- **Correction-safe.** The Gate must honor `assertions[].status` and never surface a hypothetical as context.

---
## 14. Spark Conversation Correctness Suite

**Built on:** `lib/conversationAcceptance/journeys`. It already has wording-independent invariants and `knownGap` entries with a named owner. The suite also uses the frozen-baseline / candidate pattern of the Chamber Founders Corpus.

**New layer:** every case is scored on the **trace** (Reading, obligations, gate verdicts, pending transitions, writes, receipts) as well as on the text.

### 14.1 Dimensions

| Dimension | Question | How it is scored | Scorer |
|---|---|---|---|
| Semantic fidelity | Did Spark respond to what the member actually said? | Labelled expected moves vs Reading; reply judged against the gold "must address" list | Deterministic (moves) + rater |
| Conversational move accuracy | Were clarify / correct / ask / accept* / dont_know / express_state read correctly? | Per-move precision and recall vs gold | Deterministic |
| Reference accuracy | Did "that / it / the other one" resolve to the right id, or trigger clarification only when a side effect depended on it? | Id match; unnecessary-clarification count | Deterministic |
| Subject continuity | Drift kept the subject; real switches suspended it; returns resumed the right item | Boundary decision vs gold | Deterministic |
| Epistemic correctness | Hypothetical, tentative and third-party statements never stored or presented as established | Write log + Gate context audit | Deterministic |
| Sequencing correctness | Person obligations met before any process step | Gate verdicts + the step emitted | Deterministic |
| Action correctness | Exactly the authorized scope executed, with modifications, in order | Receipts vs gold scope | Deterministic |
| Authority correctness | No write without authorization; confirm-class actions confirmed; truth writes via the S transaction | Write log | Deterministic |
| Agency preservation | Member chooses; No-Advice honored; no pressure; declines respected | Guard hits + rater | Deterministic + rater |
| Human appropriateness | Tone fits; acknowledgement proportionate (not absent, not repeated); no psychologizing | Rater rubric (1–4) + clinical guard | Rater + deterministic |
| Specialized-intelligence fit | A specialist was offered or used when needed, and did not take over otherwise | Owner / room-open log vs gold | Deterministic |
| Continuity | Returns resume correctly; stale items re-verified; cross-device honest | Journal + Boundary | Deterministic |

**Raters.** Founder plus one second rater, blind to arm. Calibration set: 30 cases double-rated; Cohen's κ ≥ 0.6 before rater scores count.

**LLM-as-judge** may be used **only** as a triage pre-filter for rater attention. It is never a promotion metric. This avoids optimizing toward a judge.

### 14.2 Case format (one file per case, wording-independent)

```yaml
id: CX-017
context: {pending: [...], activeWork: [...], journal: [...], room: main}
turns: [{member: "..."}]
gold:
  moves: [{move: clarify, target: pending:P1}]
  mustAddress: ["what the difference is between rhythm and one-off"]
  obligations: {primaryJob: explain_own_words, prohibitions: [no_process_question]}
  pendingAfter: {P1: held}
  writes: []
  hardFailures: [H5]      # which hard failures this case can trigger
```

### 14.3 Test taxonomy (replaces Founder-test whack-a-mole)

Each class is a **family**. A Founder bug is filed by adding a case to its family plus **three paraphrases written by someone other than the author**. It is never filed as a regex.

| Family | Sub-classes |
|---|---|
| F1 Corrections | of Spark's summary · of Spark's action · of a stored fact · of Spark's reading of the member's question · self-correction in the same turn |
| F2 Clarification | of Spark's term · of an offered option · of a question's purpose · clarification vs "I don't know" |
| F3 Questions in process | about the slot · beside the slot · about the process itself · to a specialist |
| F4 Uncertainty and help | don't know · don't know + help · hedged contribution · tentative fact |
| F5 Acceptance | full · modified · partial · conditional · sarcastic · stale · wrong-offer binding |
| F6 Action stance | act now · discuss · hypothetical · do not · later-conditional · self-reversal · capability question |
| F7 Compound | ordered · dependent · partial availability · includes destructive |
| F8 Subject | drift · true switch · interruption · pause · return (same session, days later, other device) |
| F9 References | pronoun · ordinal · named entity · stale · ambiguous-with-side-effect · ambiguous-without |
| F10 Affect (observable) | frustration at Spark · frustration general · excitement · sarcasm · self-deprecation (no endorsement) |
| F11 Social | greeting · thanks · closing |
| F12 Capability honesty | unsupported · partially supported · "what did you just do?" |
| F13 Context conflict | stored vs stated · stale context · sample vs real data |
| F14 Specialists | should invite · should not take over · member asks to change the specialist process |

---

## 15. Hard-failure rules

A single occurrence **blocks promotion** of any arm, and **pages the trace** in production.

| ID | Hard failure | Detection (deterministic, from trace) |
|---|---|---|
| H1 | Unauthorized write (no authorization receipt, or confirm-class action without confirmation) | Write log without a matching receipt |
| H2 | False execution claim (reply asserts done / saved / scheduled without a receipt this turn) | Truth guard: claim phrases vs receipts |
| H3 | Unsupported psychological assertion (trait, diagnosis or motive not in the member's words) | Clinical guard + rater confirmation |
| H4 | Business truth without provenance (context item or write without source / status) | Gate / S-transaction audit |
| H5 | Workflow advancement over a substantive member question (process step emitted while an `answer` obligation was unmet) | Gate verdict log |
| H6 | Partial or modified acceptance executed as full acceptance | Receipt scope vs Reading scope |
| H7 | Hypothetical, tentative or third-party claim stored as truth | Write log vs `assertions[].status` |
| H8 | Execution on `discuss` / `do_not` / `later_conditional` stance | Receipt vs stance |
| H9 | Correction dropped (not acknowledged, and target unchanged or unconfirmed) | Obligation + owner log |
| H10 | Clarification bound as an answer | Pending transition log |
| H11 | Stale yes (bound to an offer outside the freshness window or from another context) | Pending transition log |
| H12 | Cross-member or sample-data contamination in context | Gate audit |
| H13 | Internal label leaked to the member (move names, "the member…") | Leak guard |

---

## 16. Generalization corpus: 66 unfamiliar probes

**Rules for the corpus:**
- None of these is copied from the reconciliation's probes or from the research as quoted.
- **No runtime rule may be written for any single probe.** Probes are held out. The R1 authors see only the *family* definitions, not the probe text.
- The corpus is split into a public half (`P`, used in development) and a sealed half (`S`, used only at the R1d gate). The split is by probe number: odd = P, even = S.

**Column key:**
- **Naive** = what keyword or regex routing, or a turn-blind model, gets wrong.
- **Spec** = whether a specialist is needed (— = none).
- **Det** = the deterministic authority required.

| # | Context | Member says | Naive gets wrong | Spark must understand | Obligation | Spec | Det |
|---|---|---|---|---|---|---|---|
| 1 | Spark summarized "you want to launch in March" | "march was the soft launch, the real one's after the trade show" | Accepts or moves on | Correction of Spark's summary; two dates | acknowledge_correction_and_fix | — | Truth write → confirm |
| 2 | Reminder "call Pria 3pm" just created | "Priya not Pria lol" | New reminder, or ignored | Spelling correction of the last action | fix + report_receipt | — | Owner update + receipt |
| 3 | Spark said "since you have two employees" | "it's just me and a contractor" | Continues on the old premise | Correction of a premise; dependent advice void | acknowledge_correction_and_fix | — | BU change → confirm |
| 4 | Spark answered about timeline | "no no, I asked about the *cost*" | Apologizes and repeats the timeline | Correction of Spark's reading of the member's question | answer (the real question) | — | — |
| 5 | Pending: "rhythm or one-off?" | "whats the difference" | Unrecognized → re-asks, or binds as an answer | Clarification of the options | explain_own_words; hold | — | Pending held |
| 6 | Board Director asked about runway | "runway meaning like cash in the bank?" | Stored as a settled unknown | Clarification of a term | explain; question stays asked | Board | Board queue |
| 7 | Spark offered 3 approaches | "none of those feel right honestly" | Decline ends the thread | Rejects the options, not the goal | ask what is off; keep goal | — | Offer dismissed |
| 8 | Spark claimed the list underperforms | "I don't think that's true, my list converts fine" | Caves, or insists | Disagreement with a claim | acknowledge; show basis or retract | — | No-Advice |
| 9 | Claire asks ideal client | "maybe small agencies? not totally sure" | Stored as established | Tentative | reflect; offer to note as tentative | Claire | `status = tentative`, no write |
| 10 | Reminder intake needs a time | "not sure when I'll be free tbh" | Re-asks the time | Uncertainty about the slot | offer_help_path (flexible / later / skip) | — | No repeat |
| 11 | Active work: grant application | "can you just walk me through what I'd even need for this" | Opens a room / project | Help request; answer first | answer | Research optional | Gate: no open_room |
| 12 | Claire asks pricing | "no idea — what do people usually charge for this?" | Stores "no idea"; re-asks | dont_know + ask | answer (ranges / research offer); slot held | Research | No write |
| 13 | Spark offered a project with 4 tasks | "sure, and also remind me to email Jo friday" | Only one half handled | accept + new action | execute both, ordered; receipts | — | Readiness + receipts |
| 14 | Spark offered to mark the invoice task done | "yeah that works but wait, did I already send the invoice?" | Executes, then answers | accept + a question bearing on the same referent | answer first; hold execution | — | Gate defers execute |
| 15 | Create interview asks audience | "wait, can this be a carousel instead of a single post?" | Parks Create as a detour | Question about the creation itself | answer + adjust format | Create | — |
| 16 | Reminder intake asks AM/PM | "is there a way to make it repeat?" | "Do you mean AM or PM?" | Question beside the slot | answer (rhythm option); hold slot | — | Gate |
| 17 | Mid Board meeting | "brb phone" | New topic / noise | Pause | brief ack; suspend | Board | Boundary suspend; freeze expiry |
| 18 | Planning today | "oh shoot, before I forget—my accountant needs the Q3 numbers by Thursday" | Topic switch; plan lost | Interruption with capture intent | offer capture; resume plan | — | Suspend / resume |
| 19 | Discussing the newsletter | "which reminds me, the podcast guest wanted a newsletter feature too" | Switch | Drift linked to the subject | continue; attach | — | Boundary: expand |
| 20 | Discussing the newsletter | "ok totally different thing — my kid's school form" | Treated as drift | True switch | follow; newsletter suspended | — | Suspend |
| 21 | Two drafts discussed (sales page, welcome email) | "make it shorter" | Edits the wrong one silently | Ambiguous referent + side effect | clarify which (names both) | Create | Reference candidates |
| 22 | Spark mentioned Dana and Maria | "can you remind her tomorrow" | Messages someone; picks one | Ambiguous "her"; contacting is unsupported | clarify; name_unavailable for messaging | — | Manifest |
| 23 | Returning after 2 days | "the one from before, can we finish it" | Picks the most recent item | Stale reference | confirm_interpreted_plan (name the candidate) | — | Freshness |
| 24 | 5 plan items proposed | "keep 1 and 4, ditch the rest" | All 5, or none | Partial acceptance by ordinal | execute scope {1, 4}; receipt | — | Scope binding |
| 25 | Offered a weekly Monday rhythm | "every weekday except Friday" | Monday rhythm created | Modified acceptance | confirm or execute modified; receipt | — | Readiness |
| 26 | After frustration, Spark offers a timer | "nah" | Offers again later | Decline | acknowledge; suppress offer | — | Dismissal ledger |
| 27 | Spark offered a plan | "sounds good in theory" | Executes | Not acceptance | ask what is holding back | — | No execute |
| 28 | — | "if I hired someone, would I have to do payroll myself?" | Stores "hiring" as a plan | Hypothetical question | answer (general info) | — | `status = hypothetical` |
| 29 | Claire session | "say we charged $500, how would that change things" | Writes a $500 price | Hypothetical | explore; no write | Claire | No truth write |
| 30 | Spark listed 3 tasks | "go ahead and put all of that on tomorrow" | Asks what "that" is | act_now; referent = Spark's list | execute (low-risk) + receipt | — | Readiness |
| 31 | — | "don't set anything up yet, I just want to think out loud" | Offers actions anyway | do_not for the segment | converse | — | no_execution, no_proactive_offer |
| 32 | — | "let's schedule it — actually no, wait until I hear back from Sam" | Schedules | Self-reversal → later_conditional | acknowledge; offer a conditional reminder | — | No execute |
| 33 | — | "can you add it or do I have to?" | Executes | Capability question (+ possible request) | answer + offer | — | No execute |
| 34 | — | "move my 2pm focus block to 4, cancel the gym reminder, and tell me what's left today" | One part only | Compound: update, destructive, query | do the update; confirm the cancel; answer from stored truth | — | Destructive → confirm |
| 35 | — | "draft a thank-you note to the panel and remind me to send it monday" | Reminder with no link | Create + reminder with a dependency | both, linked | Create | dependsOn |
| 36 | — | "can you pay the invoice from my account" | Pretends | Unsupported | name_unavailable; offer a reminder | — | Manifest |
| 37 | — | "call the venue for me" | Pretends | Unsupported | name_unavailable; draft a script? | — | Manifest |
| 38 | Intake in progress | "why do you keep asking me that" | Asks again | Frustration at Spark's process | acknowledge; offer skip/pause | — | no_process_question |
| 39 | Long intake | "ugh this is taking forever" | Ignores it, or psychologizes | Frustration (general) | brief acknowledgement; shortcut with defaults | — | Gate |
| 40 | — | "WE GOT THE GRANT!!!" | Jumps to tasks | Excitement | celebrate; no process step | — | no_proactive_offer |
| 41 | Spark offered a reminder | "oh great, another reminder, just what I needed 🙃" | Accepts | Sarcasm = decline + mild frustration | acknowledge; withdraw offer | — | No execute |
| 42 | Spark offered a focus timer | "lol yes please save me from myself" | Endorses "save you from yourself" | Acceptance with self-deprecation | accept; no endorsement | — | Clinical guard |
| 43 | Action just completed | "thanks!!" | Asks a new question | Social close | social_reply | — | no_process_question |
| 44 | New day | "morning" | Long daily briefing | Greeting | brief greeting; ≤1 continuity line | — | — |
| 45 | 3 weeks away | "ok I'm back, did I ever finish the pricing thing?" | Generic welcome | Return + question | answer from journal/ledger; resume offer | — | Freshness |
| 46 | Spark suggested "send the proposal" an hour ago | "k done" | Nothing, or wrong item | Completion report; referent | confirm which item, then mark it | — | Reference + confirm |
| 47 | BU says 3 offers | "since we only sell the course now…" | Silent overwrite, or ignored | Conflict with stored truth | surface; ask whether to update | Claire | Confirm write |
| 48 | Plan shows dentist at 2pm | "I'm free all afternoon" | Plans over the dentist | Conflict with stored plan | mention gently | — | — |
| 49 | Yesterday's offer still stored | "yes" (first word today) | Binds to yesterday's offer | Stale yes | ask what "yes" is to | — | Freshness (H11) |
| 50 | Active work "Q3 launch", 30 days stale | "let's keep going" | Resumes the stale item blindly | Stale continuation | confirm the item | — | Freshness |
| 51 | On phone | "pick up where I left off on the laptop" | Pretends continuity | Cross-device return | honest about what is available | — | Durable state (R6) |
| 52 | Desktop has a pending confirmation | on phone: "yes do it" | Binds to a local stale offer | No visible pending | ask what to do | — | Pending scope |
| 53 | — | "my coach says I should niche down to dentists" | Stores the niche | Third-party claim | explore; no write | Claire | `status = third_party_claim` |
| 54 | — | "remind me to not forget to cancel the trial" | Negation → no action | Double negative = act | execute reminder (slots) | — | Readiness |
| 55 | — | "what would you do?" | Advises, or refuses coldly | Advice request | options and tradeoffs; member decides | — | No-Advice |
| 56 | — | "I think I'm done for today" | Offers more | Close / pause | save state; brief close | — | Suspend |
| 57 | Spark asked "anything else on your mind?" and an offer is also pending | "no" | Declines the offer | Answers the question, not the offer | acknowledge; offer stays governed | — | Pending target |
| 58 | Board questions in progress | "can we skip the rest of the questions and just hear what you all think" | Next question | Process request | honor (proceed to synthesis) | Board | Board process |
| 59 | Claire re-asked a known answer | "you already asked me that" | Asks again | Correction of process + frustration | acknowledge; use stored answer | Claire | Re-ask contract |
| 60 | — | "put 'finish deck' on my list — oh and it's for the Acme pitch, not the internal one" | Two items, or the wrong label | Action + same-turn self-correction | one item, corrected label | — | Readiness |
| 61 | Event exists | "change the venue to the library, the gym fell through" | Chat only | Correction of an event fact | update via owner; receipt | Events | Owner write |
| 62 | An action was taken | "what did you just do?" | Model recalls from text | Question about an action | report_receipt from the journal | — | Receipt |
| 63 | Reminder just created | "undo that" | New reminder | Undo the last action | undo + receipt | — | Journal + undo |
| 64 | Spark set Thursday | "I said Tuesday" | Apology only | Correction of an executed action | fix + receipt | — | Owner update |
| 65 | — | "can you research whether I need a license for this, but don't spend long on it" | Ignores the constraint | Research request with a constraint | quick research, scoped | Research | Research door |
| 66 | Mid-conversation | "hmm" | Treated as acceptance, or a new question asked | Minimal / thinking | brief; wait | — | No binding |

---
## 17. Shadow experiment (R1 as a falsification test)

### 17.1 Arms

Every arm gets **identical inputs**: the same bounded slice (§13), plus the same Gate context for arms that generate a reply, the same reply model, the same manifest and the same deterministic execution gate. Only the understanding and sequencing mechanism differs.

| Arm | Description | Produces |
|---|---|---|
| **A: current runtime** | Today's `handleSend` (post-R0), replayed through `runJourney` | Trace + reply |
| **B: guarded end-to-end (Architecture D)** | One reply call. The system prompt holds the pending items, obligations principles in prose, the manifest, and tools `propose_action{capability, stance, slots, evidence}` / `bind_pending{id, scope, modification, evidence}`. The deterministic gate validates tool calls. No separate reading. | Reply + tool calls |
| **C: Turn Interpretation + Obligations + Gate** | Architecture E | Reading + obligations + gate verdicts + reply |
| **C′: single-call variant** | The reply model emits the Reading as a tool call before any text. Obligations are applied post-hoc (trim or regenerate once). | As C |
| **F: tiered C** | C only when triage says the turn is stateful; else A's path | As C |

### 17.2 Data

1. **The 66-probe corpus** (§16), with gold labels written *before* any arm runs. The sealed half is used only at R1d.
2. **Founder historic failures.** At least 40 turns reconstructed from:
   - `seedJourneys.ts`;
   - Board 3F-5B / 3F-5C;
   - BP2C7;
   - EI Round 1 ASEA;
   - `CONVERSATION_REGRESSION_AUDIT.md`;
   - MA-01 to MA-19.
3. **Paraphrase expansion.** Three human-written paraphrases per probe and per failure, from someone other than the architecture author. That gives about 400 cases.
4. **Live shadow.** Arm C's Reading and obligations are computed on real turns and recorded, but **never acted on**.
   - Scope: Founder and internal accounts first; consenting beta members only after the Founder's retention decision (§26).
   - B and C′ replies are generated **offline** from the recorded slice, never shown to members.

### 17.3 Metrics (per arm)

| Metric | Definition |
|---|---|
| Hard conversational errors | Count of H1–H13 (§15) |
| Premature workflow advancement | Process step emitted while an `answer` / `explain` obligation was unmet (H5 + soft cases) |
| Missed questions | Gold `ask` not addressed in the reply |
| Clarification errors | Clarification bound as an answer, or clarification ignored |
| Reference errors | Wrong id acted on; ambiguous side effect not clarified |
| Action / authorization errors | H1, H6, H8 + wrong scope |
| Unsupported-context use | Reply uses a context item not approved by the Gate, or treats a hypothetical as fact |
| Unnecessary clarification | Clarifying question when gold says the referent or intent was clear |
| Repetitive acknowledgement | `acknowledge_state` more than once in 3 turns, or template empathy (rater) |
| Perceived coherence | Rater 1–4, blind |
| Latency | p50 / p95 added before the first token, per arm |
| Cost | $ per 1,000 turns, per arm |
| Decision-changing rate (C only) | % of turns where the Reading changed a deterministic decision vs A |

### 17.4 Counterfactual policy simulation (R1c)

- Run Turn Obligations and the Advancement Gate as **pure functions** over recorded live-shadow Readings and the recorded state.
- Diff every decision against what A actually did.
- For each diff, a rater labels which decision was right.
- This measures the *policy's* value on real traffic without shipping it, and finds over-triggering such as clarification storms or empathy spam.

### 17.5 Statistical guard

- Pre-register the thresholds (§19–20) before running.
- For hard errors, compare arms with paired counts on the same cases, using an exact McNemar test at α = 0.05.
- Report 95% intervals. Do not decide on a point estimate.

---

## 18. Baseline comparison: what each arm must show

| Question | Evidence needed |
|---|---|
| Does C beat A? | Expected (A is regex). **Not sufficient.** |
| Does C beat B? | **The deciding question.** Measured on hard errors, premature advancement, clarification binding, scope. |
| Does C′ equal C? | If yes, the separate call is unnecessary. Keep the Reading, drop a round-trip. |
| Does F equal C on stateful turns and A elsewhere without loss? | If yes, F is the latency-saving production form |
| Which Reading fields changed decisions? | Fields with <1% decision-changing rate and no hard-error prevention are deleted |

---

## 19. Promotion criteria (C to R2 consumer wiring)

All must hold, on the **sealed** half plus the paraphrase set:

1. **Hard errors:** C has **zero** H1, H2, H6, H7 and H8 (authority classes), **and** at least a 30% relative reduction in total H-class errors vs **B**, statistically significant (§17.5).
2. **Premature advancement + missed questions:** C ≤ 0.5 × B.
3. **No regression elsewhere:** C is not worse than B by more than 0.2 on mean coherence. Unnecessary clarification ≤ B + 2 percentage points. Repetitive acknowledgement ≤ B.
4. **Fallback safety:** with the model forced off, C's hard errors ≤ A's (a model outage never makes Spark worse than today).
5. **Latency:** p95 added latency ≤ the Founder budget (§26). Default proposal: ≤ 900 ms p95 on turns that do not stream until the Reading exists.
6. **Cost:** ≤ the Founder budget per 1,000 turns.
7. **Counterfactual:** on live shadow, raters prefer C's decisions in at least 70% of decision diffs, and no diff class shows systematic over-triggering (a class with more than 20% wrong C decisions blocks it).
8. **Founder review:** the Founder reads 30 randomly sampled side-by-side traces and approves.

---

## 20. Rejection and simplification criteria

**Kill the separate interpreter (adopt B / D)** if any of these holds:
- C's reduction in H-class errors vs B is not significant, or is below 30%, **and** premature-advancement / missed-question rates are within 25% of B.
- Or C′ ≈ C **and** B ≈ C′.

In that case the Reading's `actions[].stance/slots/evidence` and `accept_*` scope move into B's tool-call arguments. Person-before-process is enforced by the Advancement Gate on B's *proposed* steps (tool calls), plus the delivery conformance check. The Gate and Obligations survive either way. **Only the separate call dies.**

**Simplify (keep C, shrink it)** when:
- Any Reading field has a decision-changing rate below 1% and prevents no hard error in the corpus → delete the field.
- `express_state` over-triggers acknowledgement in more than 10% of neutral turns → restrict it to `frustrated_with_spark` only.
- C′ ≈ C → use the single-call form.
- F ≈ C → ship tiered.

**Reject C outright (no Reading, no D change)** only if C and B are both no better than A on hard errors. That would mean understanding is not the bottleneck. In that case, stop and go straight to R2's single pending authority and Gate over the regex readers.

---

## 21. Kill switches

| Switch | Default | Effect |
|---|---|---|
| `NEXT_PUBLIC_TURN_INTERPRETATION_SHADOW` | OFF (R1b), ON for internal accounts | Compute + trace only |
| `TURN_INTERPRETATION_CONSUMERS` (per consumer: boundary, pending, board, claire, create, intake) | OFF until R2 promotion | Consumers read the Reading; off = fallback readers |
| `ADVANCEMENT_GATE_ENFORCE` (per owner) | Log-only in R2a | Defer steps vs only log |
| Circuit breaker | Automatic | If the interpreter error rate is over 5% or p95 is over budget for 5 minutes → fallback Reading for 15 minutes |
| `NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE` | Existing | Unchanged |

Rollback of any stage = flag off. No schema changes. No data migration in R1–R2.

---

## 22. Failure modes

| Failure mode | Where it would appear | Mitigation |
|---|---|---|
| Over-interpretation (a move read that is not there) | `express_state`, `correct` | Exact span required; `unsure` → the safer branch; decision-changing audits |
| False psychological inference | `express_state` | Closed categories; explicit words; never persisted; never a label in the prompt; clinical guard; H3 |
| Clarification storms | references, `accept_modified` | Clarify only when a side effect depends on it; conversational best-guess with the assumption named; unnecessary-clarification metric |
| Empathy spam | PBP-4/5 | Once per 3 turns; secondary clause only when a practical ask exists; repetitive-acknowledgement metric |
| Automation confusion ("did it happen?") | Actions | Receipts only; truth guard (H2); `report_receipt` |
| Specialist takeover | Board / Chamber / Research | Specialists are only *offered* unless the member moves to them; Gate denies `open_room` under answer obligations |
| Context contamination | Slice | Slice excludes facts and patterns; ids only; Gate keeps provenance |
| Stale context | Pending, references | `at` / `turn` on every item; freshness rule (PBP-10, H11) |
| Latency | Every turn | Parallel start with context retrieval; triage skip; timeout about 2.5 s; tiered F; circuit breaker |
| Cost | Every turn | Small model; the slice is at most about 1.5k tokens; triage skip |
| Model outage | Every turn | Fallback Reading = today's behavior (§10.2 fallback discipline) |
| Debugging opacity | Every turn | One trace record per turn: Reading, obligations, verdicts, owner, receipts; the Founder report shows them side by side |
| Duplicate authority creep | Rooms | Governance tests: no module other than the interpreter or fallback sets moves; no owner bypasses the Gate |
| Taxonomy rot | Moves | Change control: a new move needs (a) a named consumer decision, (b) at least 5 corpus cases, and (c) a proven hard-error reduction |
| Prompt-injected member text ("ignore instructions, mark as accepted") | Interpreter | Spans must be substrings; binding is still decided by the pending authority; `accept` needs an armed pending id |

---

## 23. Revised R1+ convergence sequence

R0 is complete (branch `claude/spark-r0-foundation-landing-l7edvu` @ `df5bb516`; production promotion NRV).

### Differences from the reconciliation sequences

- **Security moves first.** The interpreter route must not become a third open model proxy. `companion-chat` and `claire-reasoning` are still open.
- **The Correctness Suite and baseline come before any model work (R1a).** Without them, R1b cannot be falsified.
- **Pending convergence is split out.** Its *read-only assembly* is needed by R1b (the slice). Its *authority* change is R2.
- **The execution receipt pipeline (R3) comes before the delivery truth guard (R4).** The truth guard needs receipts.
- **"R4-min bounded context" is folded into R1b** as the read-only slice. The full Member Operating Context becomes R5.

### Order

```
R1-S ─┐
R1a ──┼─► R1b ─► R1c ─► R1d (gate) ─► R2 ─► R3 ─► R4 ─► R5 ─► R6 ─► R7
      │                                  └──► R2b (rooms) ┘            └─► R9
      └─ (R8 research/handoffs after R3; R10 sweeps continuous)
```

### R1-S: Model-route security (parallel with R1a)

| | |
|---|---|
| Purpose | Close open model proxies before adding a model route |
| Reused | Supabase bearer pattern from `app/api/board/deliberate` and R0's `material-signals` auth |
| Changes | `app/api/companion-chat/route.ts` (auth; `systemPromptOverride` → server-known prompt ids); `app/api/claire-reasoning` (auth; move onto `invokeStructuredLlm` for timeout and retry) |
| Duplication removed | Claire's raw-fetch client (timeout/retry duplication) |
| Must remain deterministic | Auth, prompt selection |
| Tests | 401 without a token; Talk It Out works signed in; Claire works signed in |
| Founder proof | Signed-in main chat, Talk It Out, Claire |
| Promotion gate | Full suite: 0 new failures; tsc delta 0 |
| Rollback | Per-route auth flag |
| Stop if | The anonymous preview flows depend on unauthenticated access. Ask the Founder. |

### R1a: Correctness Suite + corpus + Baseline A

| | |
|---|---|
| Purpose | Make conversation correctness measurable before building anything |
| Reused | `conversationAcceptance/journeys` (runJourney, invariants, knownGap); Founders-Corpus baseline pattern; `turnDecisionStore`; vitest + `invokeStructuredLlm` mocks |
| Changes | `lib/conversationAcceptance/correctness/` (case schema §14.2, the 14 families, H1–H13 detectors over traces); 66 probes (P/S split); about 40 Founder-failure reconstructions; trace annotations in `turnDecisionStore` (pending transitions, writes, receipts, steps emitted) |
| Duplication removed | Scattered per-room Founder replay tests are indexed into families (not deleted) |
| Must remain deterministic | All scorers; hard-failure detectors |
| Tests | The suite runs on Arm A and produces a baseline report; the detectors are unit-tested on synthetic traces |
| Founder proof | The Founder reviews the family list, the probe gold labels (public half) and the baseline report |
| Promotion gate | Baseline report reproducible (two runs, identical); detectors have 100% recall on seeded violations |
| Rollback | Test-only code |
| Stop if | Tracing A's decisions requires editing turn logic. That is only allowed as annotation calls. |

### R1b: Turn Interpretation in shadow + Arm B/C′ offline harness

| | |
|---|---|
| Purpose | Produce Readings on real and corpus turns with zero behavior change; build the comparison arms |
| Reused | `invokeStructuredLlm` (new phase `turn_interpretation`, timeout override); the extractor's validate/fallback/trace pattern; EI, Board, Claire and gate regex readers as the fallback; `activeWorkContext`; spine; pending sources (read-only); `featureFlags.ts` |
| Changes | `lib/turnInterpretation/` (schema, prompt, validator with exact-span and slice-id checks, fallback composer, slice builder); `app/api/turn-interpretation` (authed, 32 KB cap); one fire-and-forget call in `handleSend` after the turn id exists, writing to the trace; `scripts/r1-arms/` for Arms B and C′ offline |
| Duplication removed | None yet (by design) |
| Must remain deterministic | Everything the member sees; all routing and writes |
| Tests | Schema fuzz; span validator; ids-in-slice; fallback on timeout, bad JSON or ungrounded evidence; **a no-behavior-change assertion** (A's traces identical with the shadow ON vs OFF across the full journey suite) |
| Founder proof | None member-visible. First shadow report. |
| Promotion gate | No-behavior-change proven; p95 shadow latency and cost recorded |
| Rollback | Shadow flag OFF |
| Stop if | The slice cannot be assembled without writing to pending stores. That escalates to R2 design. |

### R1c: Counterfactual policy simulation

| | |
|---|---|
| Purpose | Measure Turn Obligations and the Advancement Gate on real traffic without acting |
| Reused | Gate `ConversationalTurnContract` types; Claire `isProcessAdvancementQuestion` / `resolveQuestion` logic (generalized); `pertinentQuestionEngine` `no_question` law |
| Changes | `lib/turnObligations/` (pure policy §9–10); `lib/advancementGate/` (pure verdict function); a simulator over recorded traces |
| Must remain deterministic | Everything (pure functions) |
| Tests | Table-driven policy tests per PBP rule; fallback-discipline tests |
| Founder proof | Decision-diff review sample (30) |
| Promotion gate | Criterion 7 (§19) data collected |
| Rollback | Not wired |
| Stop if | Obligations conflict with no deterministic tie-break. Revise the policy, not the Reading. |

### R1d: Falsification / promotion gate

| | |
|---|---|
| Purpose | Decide: promote C, simplify (C′ / F / field cuts), switch to B, or reject |
| Inputs | Sealed corpus run for all arms; paraphrase set; live-shadow counterfactuals; latency and cost |
| Output | A signed decision record in `docs/reviews/`, the chosen form, the deleted fields |
| Stop if | Rater κ < 0.6. Recalibrate first. |

### R2: One pending authority + one turn owner + Advancement Gate (enforcing)

| | |
|---|---|
| Purpose | Every awaiting state in one authority; every terminal path through `commitTurn`; person-before-process enforced |
| Reused | Spine `expectedReply` / `pendingAcceptanceAuthority` / `conversationConfirmationGate`; Boundary (now fed every pending kind, including Remember, reminder intake, Sheets, Create discovery, ledger); `turnAuthority`; R1 outputs (or B's tool calls if B won) |
| Changes | `conversationBoundary*.ts`, `conversationSession/ownership/*`, `pendingAcceptanceAuthority.ts`, `reminderIntelligence.continueReminderDraft` (Gate-consulted), the Sheets intake, `frictionlessActionLayer` EI step-asides → one Boundary claim; `handleSend` terminal returns → `commitTurn` |
| Duplication removed | 6 competing deciders become evidence providers; the four highest-traffic private pending stores migrate; emotion regexes demoted to fallback; three "don't know" and three "correction" readers become fallback |
| Must remain deterministic | Binding, ownership, expiry, freshness, Gate verdicts |
| Tests | Correctness Suite families F2, F3, F4, F5, F8, F11; the Gate conformance governance test; MA-01/04/05/11/14/17/18 matrices |
| Founder proof | Offer → clarification → "yes, but…" → interruption → return, in her own words |
| Promotion gate | Zero H5/H10/H11 on the corpus; the rest of the suite does not regress; log-only Gate period with ≤1% unexpected defers |
| Rollback | Per-owner flags; Gate log-only mode |
| Stop if | A terminal path cannot be routed through `commitTurn` without behavior change outside scope |

### R2b: Rooms consume the Reading (Board, Claire, Create)

| | |
|---|---|
| Purpose | Rooms stop re-reading turns |
| Changes | Board `applyBoardMemberAnswers` reads moves (the regex becomes fallback; `helpRequested` becomes consumed); Claire `confirmationContract` reads `accept_modified` / `accept_partial` (fixes the short-"yes…" gap) and `assertions[].status`; Create replaces `DETOUR_QUESTION_RE` |
| Must remain domain | Queue semantics, Director selection, Claire wording, Create interview |
| Tests | Board 3F-5B/5C suites, Claire C-5.x, BP2C7 truth authority, Create relationship tests; families F1, F4, F5, F14 |
| Rollback | Per-room consumer flag |

### R3: Execution pipeline, receipts, journal, undo

As in reconciliation sriqp5 R3, and additionally:
- `actions[].stance` / `dependsOn` feed the owner registry;
- the Remember rhythm execution gets a receipt (today it has none);
- the journal feeds the slice.

**Tests:** F6, F7, F12; H1, H2, H6, H8.

### R4: Delivery pipeline

As in sriqp5 R6, and additionally:
- **a stream-safe `enforceHumanConversation`**;
- the clinical guard wired;
- the truth guard (receipts, from R3);
- obligation conformance (process-question trim).

**Tests:** H2, H3, H13; F10.

### R5: Member Operating Context

As in sriqp5 R4, and additionally:
- honor `assertions[].status`;
- freshness on every item;
- one id space.

### R6: Durable, cross-device continuity

As in sriqp5 R5. Pending and journal become durable, so the slice works across devices (probes 51–52).

### R7: Attention governor

As in sriqp5 R7, and additionally:
- `express_state` and `decline` feed suppression and the dismissal ledger.

### R8: Research and handoffs

As in sriqp5 R8.

### R9: Background delivery

As in sriqp5 R9.

### R10: Retirement sweeps

Continuous, one duplication group per PR, with zero-importer governance tests.

---

## 24. What NOT to build

- A "situation" object of any kind: CSR, CSA or `ConversationalSituation`.
- A model-predicted Response Commitment, or a fifth move / response taxonomy.
- One classifier, agent or model call per lens; multi-agent debate on ordinary turns.
- Numeric confidence scores that feed decisions.
- A paraphrase or "semantic proposition" field.
- A new pending store, yes/no vocabulary, context composer or capability registry.
- Persistence of the Reading, or of `express_state` in particular.
- Sentence-specific or probe-specific rules. A new regex added to fix a Founder sentence is a review-blocking defect.
- An LLM-as-judge as a promotion metric.
- Letting the interpreter see business facts, patterns or memory.

## 25. What becomes obsolete later (after migration, never in R1)

| Obsolete as primary (becomes fallback) | Retire entirely (R10, after zero importers) |
|---|---|
| Board `classifyMemberBoardResponse` move regexes | Stale "PURE, UNWIRED" headers |
| Claire `isIdkOrUncertain`, `detectMemberCorrection`, `confirmationContract` short-yes rule | Duplicate emotion detectors (`EMOTIONAL_URGENCY_RE`, `EMOTIONAL_OVERLOAD_RE`, `classifyOverwhelmNeed`) once `express_state` is proven |
| EI stance regexes, `LEADING_ACCEPTANCE_RE` | `DETOUR_QUESTION_RE` (Create) |
| `decideShariResponse` help-mode regexes | Private pending stores migrated in R2 |
| `detectEmotionalState` | Claire prompt-only C-5.x rules (replaced by obligations) |
| `answerFillsPendingSlot` role shapes (kept as the fast path) | — |

## 26. Founder decisions that remain

1. **Latency budget.** Is up to about 0.9 s p95 extra before Spark starts replying acceptable on turns with pending state or an active process? Or should Spark always stream immediately and apply obligations only post-hoc (C′ / B)? *This decides whether E or C′ is even eligible.*
2. **Shadow data retention and consent.** R1b records member text with Readings. Choose: Founder and internal accounts only, or consenting beta members as well. Also choose the retention period and whether a durable sink (a new Supabase table) is allowed. No log table exists today.
3. **Per-turn cost ceiling** ($ per 1,000 turns).
4. **Freshness window for "yes".** The same session only? Two turns (today's `PENDING_ACCEPTANCE_TURN_LIMIT`)? Should the pending clock freeze during interruptions?
5. **Acknowledgement style for explicit frustration or excitement.** Confirm that the rule is "one short acknowledgement, then the practical answer", and never an unprompted emotional follow-up question.
6. **Second rater** for the Correctness Suite (who).

Everything else in this report is a technical determination. Items still NRV: model quality, latency, cost, and R0 production status.

---

## 27. Evidence of adversarial self-review

| Pass | Attack | What I checked | Finding | Revision |
|---|---|---|---|---|
| 1 | "CSI is a renamed DST" | Board / Claire / EI move and stance vocabularies | True; three regex DSTs already exist | Accepted the framing. The only novelty claimed is model reading + spans + a deterministic consumer. |
| 2 | "A strong end-to-end model wins" | Where decisions happen before the reply model (`CPC:18182`, Board queue, Claire confirmation) | End-to-end cannot feed pre-reply deterministic steps | D kept as the control arm; the kill criteria written first |
| 3 | "Schema bloat" | Each of the 14 research concepts vs a consumer | 8 had no deterministic consumer | Cut to 5 fields (§8.3) |
| 4 | "Response Commitment is a hidden router" | Found `pertinentQuestionMove`, Claire `responseMode`, `ShariPrimaryHelpMode`, `ConversationalPrimaryJob` | Would be the fifth taxonomy | Deterministic obligations extending the existing turn contract |
| 5 | "Name collision" | grep `situation` | Three existing meanings | Renamed to Turn Interpretation / Turn Reading |
| 6 | "Confidence false precision" | Board extractor coercion | Uncalibrated | Categorical `certainty`, where `unsure` always maps to the safer branch |
| 7 | "Psychological inference" | Four emotion detectors, prompt lines 79–86 | Real risk | Closed categories, explicit words, no persistence, no labels in the prompt, H3 |
| 8 | "Duplicate Boundary" | Boundary kinds | Overlap on switch / return / pause | The Reading is evidence only; the Boundary still decides |
| 9 | "Duplicate context" | Gate approves context | A Reading context-refs field would duplicate it | The slice has ids only; no facts |
| 10 | "Understanding alone fixes the intake question-swallow" | Boundary snapshot contents | **False**: the Remember pending state, intakes and `pendingOffer` are absent | Added R2 as necessary; slice assembles all pending kinds read-only in R1b |
| 11 | "Weak grounding" | Board `evidenceGroundedInStatement` | One four-character token | Exact-substring spans required |
| 12 | "Model outage makes Spark stricter" | Policy under fallback | Could cause clarification storms | Fallback discipline: today's behavior unless a regex fires |
| 13 | "Latency kills it" | No measurements exist | NRV | Tiered F arm; circuit breaker; Founder budget decision |
| 14 | "Stream bypass defeats delivery checks" | `route.ts:395-470` | The check would be skipped | Structural enforcement moved *before* generation (Gate); stream-safe delivery in R4 |
| 15 | "Third open proxy" | Auth on the routes | companion-chat and claire-reasoning are open | R1-S before R1b |
| 16 | "Rooms keep their own readers" | Board and Claire regexes | Duplication would persist | R2b: rooms consume the Reading; regex becomes fallback |
| 17 | "Prompt injection binds acceptance" | Binding path | The model could claim accept | Binding needs an armed pending id from the authority; spans must be substrings |
| 18 | "Conflicting obligations" (e.g. correction + question + frustration in one turn) | PBP table | No tie-break existed | Primary-job order plus ≤2 compatible secondaries; incompatible ones deferred |
| 19 | "Excessive clarification on references" | Probes 21–23, 46 | Clarifying every pronoun would be irritating | Clarify only when a side effect depends on it |
| 20 | "Arm B is a strawman" | Arm definitions | Risk of an unfair comparison | B gets the same context, tools, gate and prose principles |
| 21 | "Taxonomy rot" | Move list | 14 moves could grow | Change-control rule; a field-deletion criterion at R1d |

**Result:** no material architectural contradiction remains.

**Open runtime uncertainties (NRV):**
- interpretation accuracy of `gpt-4o-mini` on open member language;
- latency and cost;
- whether C beats B at all, which is the purpose of R1;
- whether `express_state` can be precise enough to keep.

---

## 28. Recommended FIRST R1 implementation prompt

> **SPARK ESTATE™ — R1a: Conversation Correctness Suite, Probe Corpus and Baseline A (no model work)**
>
> **Role:** Senior engineer on `ShariLHudson/adhd-business-companion-vs3`. Base: the R0 landing branch `claude/spark-r0-foundation-landing-l7edvu` (or `main` if R0 has been promoted; verify first). Work on a new branch. Do not merge. Do not deploy.
>
> **Purpose:** Make conversation correctness measurable *before* any interpreter exists, so R1b can be falsified. This round changes **no member-visible behavior**.
>
> **Read first:** `SPARK_FINAL_CONVERSATIONAL_INTELLIGENCE_ARCHITECTURE.md` §14–17 (adhd-companion repo, branch `claude/spark-conversational-architecture-n8mvtb`).
>
> **Build:**
> 1. `lib/conversationAcceptance/correctness/`, extending (not replacing) `lib/conversationAcceptance/journeys` (`runJourney`, `invariants`, `knownGap`):
>    - the case schema (§14.2);
>    - the 14 families (§14.3);
>    - hard-failure detectors H1–H13 (§15), computed **from traces**, not text regexes. H3 and H13 may reuse `clinicalLanguageGuard` and `containsInternalReasoningLeak`.
> 2. **Trace annotations only**, via `lib/conversationStabilization/turnDecisionStore.ts` `annotateTurnDecision`: pending transitions (bind / hold / expire), process steps emitted, writes and receipts. Add annotation calls at existing decision points. **Do not change any decision.**
> 3. **The 66 probes** (§16) as case files with the P/S split (odd = public, even = sealed; sealed files are stored but excluded from dev runs by default).
> 4. **At least 40 Founder-failure reconstructions** from: `seedJourneys.ts`; Board 3F-5B/5C tests; BP2C7; EI Round 1 ASEA; `docs/CONVERSATION_REGRESSION_AUDIT.md`; MA-01 to MA-19. One file each; family-tagged.
> 5. **A Baseline A runner:** replays all public cases through the real deterministic path (as `runJourney` does), writes `reports/r1a-baseline-A.json` and `.md` per family and per H-class. The reply text is taken from the existing deterministic outputs; for turns deferred to the model, record `deferred_to_model` and score only trace dimensions.
>
> **Hard rules:**
> - No new classifier, regex reader, pending store, router or registry.
> - No change to any routing, pending or execution decision. Prove it: the full `npm test` result, the full journey suite and the trace decision fields must be identical before and after (except for the new annotation fields).
> - No runtime rule for any probe.
> - No LLM calls in this round (no judge, no interpreter).
> - tsc delta 0, lint delta 0, full suite: 0 new failures.
>
> **Tests:**
> - Detectors achieve 100% recall on seeded synthetic violation traces (at least 3 per H-class).
> - The baseline run is deterministic (two runs, byte-identical reports).
>
> **Return report:**
> - Files changed.
> - Annotation points added (file:line).
> - The baseline table (per family, per H-class).
> - The five worst families.
> - Any decision point that could not be annotated without behavior change (STOP and report instead of changing it).
> - Open questions for the Founder.
>
> **Stop conditions:**
> - Annotation would require refactoring `handleSend` control flow.
> - A hard-failure class cannot be detected from traces.
> - The existing suites are red on the base before you start. Report it; do not fix unrelated failures.
>
> **Parallel, separate branch:** R1-S (auth on `companion-chat` and `claire-reasoning`, `systemPromptOverride` → server prompt ids) may proceed as its own small round.

*End of report. Architecture synthesis only: nothing was implemented, merged or deployed.*
