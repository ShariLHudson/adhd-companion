# BRAIN SPARK ESTATE™ — OB-0.5
## Boundary Meaning Contract + Interpretation Approach Decision

**Type:** Read-only architecture decision. No code, no merge, no deployment, no new runtime, no new layer.
**Subject repository:** `ShariLHudson/adhd-business-companion-vs3`

### 12. Branch and SHA audited (stated first for traceability)

| Tree | SHA | Status on 2026-09-28 |
|---|---|---|
| `origin/main` | `7e2efec6144c5f1872aa1062b8802cb75c2cd2cf` | Unchanged since OB-0 (last commit 2026-09-23). **R0 has not landed.** |
| `origin/claude/spark-r0-release-gate-l7edvu` (audited) | `0e35402438b91ee0e2124f7832db13da5c1652ae` | The same R0 candidate OB-0 audited. No newer authoritative R0 base exists (`claude/spark-r0-foundation-landing-l7edvu` = `a4ef163a` is its ancestor). |

Line references are to the audited R0 tree.

---

## 1. Executive decision

1. **Boundary stays the one parent authority.** This round adds only the minimum *meaning* it lacks. The OB-0 `move` enum (18 values), `obligation` and `grant` fields, and `truthLens` are **withdrawn**.

2. **Minimum contract.** Two fields already exist and are reused. Two are new and small:
   - `transition`: existing. It now also carries pause / resume / switch.
   - `confidence` + `evidence`: existing (`conversationBoundary.ts:42-51`). They now also carry certainty and fail-safe.
   - `relation`: **new**, 7 values. What the member is doing with Spark's last contribution or the pending item.
   - `binding`: **new**, conditional. Which thing the relation applies to, plus the authorized scope.
   - `stance`: **reused** from `memberIntent/executableRequest.ts` (`act | talk_about | none`). It is computed once by Boundary instead of per capability.
   - `affect`: one modifier. Emotion becomes a modifier, never an exclusive meaning.

   Obligations and permissions are **derived by one pure function** in the Boundary module. They are not stored as fields.

3. **Interpretation approach: no final choice yet; OB-1 measures A against C.**
   - The repository evidence rules out **D** (no new interpreter): nothing existing can express clarify, ask, unsure or correct across rooms.
   - It also rules out **B** (a model read on every turn): it would add model latency to about 180 local fast paths that are instant today, and it would need a new authenticated server call on the hot path.
   - The two live candidates:
     - **A**: consolidated deterministic predicates.
     - **C**: hybrid, with a deterministic *certain* tier plus one structured model read only for ambiguous turns that carry a pending item or action content.
   - **Recommendation: C, conditional on OB-1 evidence.** The repo already has a proven "model proposes, deterministic authority disposes, fallback on any failure" pattern (`modelMaterialSignalExtractor.ts:1-21`; Claire reasoning adapter). The documented deterministic misreads are listed in §5.
   - OB-1 must measure both A and C on the same labelled corpus before the Founder picks.

4. **Execution can never come from interpretation alone.** Every write requires all of the following:
   - `relation = accept` bound to an owner armed on the immediately previous turn, **or** `relation = none` with `stance = act`;
   - `confidence = high`;
   - a deterministic restraint veto that finds no negation, hypothetical, past-tense or capability-question cue;
   - scope ids that exist in the armed record;
   - a successful slot parse by the capability's own parser.

   Uncertainty fails safe: answer, hold and ask. Never execute, store as an answer or advance.

5. **The OB-0 certification harness is corrected.** It no longer builds "adapters that produce a decision" (that would be one more implementation of meaning). It **drives each room's real exported step function and observes state diffs**: advanced? stored as answer? executed? pending kept? bare "yes" bound? Expected outcomes come from a **human-labelled corpus**, not from code.

---

## 2. Disposition of the OB-0 `move` enum

| OB-0 value | Disposition | Where it goes | Evidence / reason |
|---|---|---|---|
| `ask_spark` | **KEEP** (renamed `ask`) | `relation` | No existing field expresses "member asked Spark something". Obligation: answer first, hold the process. |
| `clarify` | **KEEP** | `relation` | Must differ from `ask`: the answer source is the owner's *own last utterance*. Claire's defect is answering business-uncertainty coaching instead of re-explaining her term (`claireConversation.ts:254-265`). |
| `dont_know_help` | **MERGE** (renamed `unsure`) | `relation` | "I don't know" and "I don't know, help me" have the same obligation: don't store it as an answer, don't defer, offer help with the pending item. A separate "help" flag changes nothing downstream. |
| `correct` | **KEEP** | `relation` + `binding.target` | Must beat `decline`. Today "No, I said Tuesday" → decline → "left it as it is" (`frictionlessActionLayer.ts:1986-1993`). The label alone is not enough; the target is required (§4). |
| `accept` | **KEEP** | `relation` + `binding` | The authorization meaning. |
| `accept_modified` | **MAKE A MODIFIER** | `binding.amended = true` | The modified value is parsed by the capability's slot parser (e.g. `parseRememberModifiers`, `executableRequest.ts:464`), not by Boundary. Boundary only has to say "this acceptance is conditional on an amendment". |
| `accept_partial` | **MAKE A MODIFIER** | `binding.include` / `binding.exclude` | Scope, not a separate meaning. |
| `decline` | **KEEP** | `relation` | Clears or disarms the pending offer. |
| `defer` | **MERGE into `decline`** | `relation = decline` | Execution safety is identical: nothing happens now. *When* to re-offer is owner policy. Board `NOT_YET_RE` and Events' pause remain domain re-offer policies. **DERIVE LATER** if certification shows a cross-room need. |
| `answer` | **DERIVE** (not a value) | `transition = answer_pending_question` + `relation = none` + the owner's affordance validates | Boundary already models "turn engages the pending item" (`conversationBoundary.ts:399+`, step 5). Storing `answer` too would say the same thing twice. |
| `think_aloud` | **MOVE TO EXISTING FIELD** | `stance = talk_about` | `executableRequest.ts:130-158` already separates thinking-aloud, hypothetical, aspiration, negation and past tense as *reasons* for `talk_about`. The epistemic nuance (scenario vs musing) is domain-owned: Claire `SCENARIO_PATTERNS` and never-write kinds (`writeMeaningAuthority.ts:118-150`). |
| `hypothetical` | **MOVE TO EXISTING FIELD** | `stance = talk_about` | Same as above. Global safety only needs "do not act". |
| `command` | **REJECT** | `stance = act` + the action system's capability extraction | It adds no independent information once `stance = act` and an extracted action exist. |
| `pause` | **MOVE TO EXISTING FIELD** | `transition = interrupt_and_suspend` | This transition already parks work (`suspend: true`); a pause cue becomes one more trigger. |
| `resume` | **MOVE TO EXISTING FIELD** | `transition = return_to_suspended_topic` | Already exists, with `returnTargetId`. |
| `switch` | **MOVE TO EXISTING FIELD** | `transition = switch_topic` / `cancel_current_workflow` | Already exists. |
| `emotional` | **MAKE A MODIFIER** | `affect` | It co-occurs with every relation (§2.1). Keeping it exclusive is today's defect: Boundary step 1 (`:411-416`) turns "I'm overwhelmed, but yes, do the first one" into `interrupt_and_suspend` and the authorization is lost (`EMOTIONAL_URGENCY_RE` `:133` matches "overwhelmed"). |
| `none` | **KEEP** | `relation` | Nothing is addressed to Spark's last contribution: new content, statements, answers (see `answer`). |

**Result:** 18 values become 7 relation values. The rest are removed as separate labels.

### 2.1 Emotion tests

| Member | Today | Contract reading |
|---|---|---|
| "I'm frustrated. What do you mean?" | "frustrated" is not in `EMOTIONAL_URGENCY_RE`, so it falls through. There is no clarify outcome; clarification is lost. | `relation = clarify`, `affect = strained`. Re-explain gently; hold the process. |
| "I'm overwhelmed, but yes, do the first one." | `interrupt_and_suspend`. **The authorization is erased.** | `relation = accept`, `binding.include = [item1]`, `affect = strained`. Execute item 1 only; gentle reply; **no new asks or offers this turn**. |
| "This is confusing. No, I said Tuesday." | "No" → decline (Rhythm owner). | `relation = correct`, `affect = strained`. Apply or confirm the correction; acknowledge the confusion. |
| "I'm falling apart, I can't do this." | `interrupt_and_suspend` ✅ | `relation = none`, `affect = distressed` → `transition = interrupt_and_suspend` (unchanged). |

**Decision:** emotion is a **modifier** that governs delivery (tone) and *process pressure* (suppress new questions and offers). It becomes a **transition** only when `affect = distressed` **and** `relation = none`. Rich emotional reading (which strategy, which tone) stays **specialist-owned**: `adhdEmotionalFrictionIntelligence`, Chamber, Talk-It-Out.

---

## 3. Minimum Boundary meaning contract

```
BoundaryDecision {
  // existing — unchanged
  decision:   ConversationBoundaryDecisionKind   // "transition"; now also fed by
                                                 // pause cues and distressed affect
  confidence: "high" | "medium" | "low"          // now also the certainty/fail-safe
  evidence:   string[]                           // + grounded spans when model-read
  returnTargetId?, suspend?                      // existing

  // new — minimum meaning
  relation:  "ask" | "clarify" | "unsure" | "correct"
           | "decline" | "accept" | "none"
  stance:    "act" | "talk_about" | "none"       // memberIntent semantics, computed once
  affect:    "none" | "strained" | "distressed"
  binding?:  {                                   // present only when relation ∈
    target:   "pending" | "executed" | "referent"//   {accept, decline, correct, clarify, unsure}
    include?: ItemId[]                           // accept scope (ids from the armed record)
    exclude?: ItemId[]                           // explicitly not authorized
    amended?: true                               // acceptance conditional on a change
  }
}
```

**Not in the contract, by design:**
- **Obligations and permissions.** One exported pure function, `permitsFor(decision, snapshot)`, lives in the Boundary module (§6). Children call it and never re-derive it.
- **Truth lens.** Owned by KNOW (§8).
- **Action lists and slot values.** Owned by ACTION (§8).
- **Owner.** Already chosen by Boundary + the spine record (ADR); no new field.

**One required extension to an existing store (no new store).** Partial authorization needs ids. The existing spine `ownership.expectedReply` (`kind: "confirmation"`, `ownership/types.ts:57-60`) gains an optional `items?: {id, label}[]` list when the owner offers more than one thing. Precedent: Round 1's `PendingRememberCreate.requestedActions` (`conversationPending.ts:41`).

---

## 4. Payload / binding decision

| Member | Contract | Who resolves the rest |
|---|---|---|
| "Yes, but make it 4:00." | `accept`, `binding {target: pending, amended}` | The capability's slot parser reads "4:00". If it cannot parse, **do not execute the unamended version**; ask. |
| "Do the first two, not the third." | `accept`, `binding {target: pending, include: [i1, i2], exclude: [i3]}` | Ordinals map to armed `items`. If the offer has no enumerated items → `confidence: low` → ask. |
| "No, that's wrong. I said Tuesday." | `correct`, `binding {target: executed \| pending}` (whichever was last: receipt or armed offer) | The capability parses "Tuesday" into its own slot. Boundary does not know what a day slot is. |
| "Yes, add Susan, but don't add David yet." | Pending proposal → `accept`, `include: [susan]`, `exclude: [david]`. No proposal → `relation: none`, `stance: act`, and the action system's per-item negation keeps David out. | Excluded items are never executed. Whether they stay "not yet done" is owner policy, and must be named in the reply. |
| "I don't mean the conference. I mean the retreat." | `correct`, `binding {target: referent}` | CONTEXT (`activeWorkContext`) resolves "retreat" to a named work item; if not found, ask. |
| "What do you mean by audience?" | `clarify`, `binding {target: pending}` (or Spark's last utterance) | The owner explains its own term. Specialist content, same global meaning. |
| "I'm not sure. Help me figure that out." | `unsure`, `binding {target: pending}` | The owner provides domain help; nothing stored; nothing deferred. |

**Field justification (what each replaces or governs):**

| Field | Existing authority it replaces / governs | Keep? |
|---|---|---|
| `relation` | The ~75 yes, ~25 decline, ~12 clarify, ~25 don't-know and ~20 correction deciders in rooms; the unread router `responsePolicy`; the rejected continuity `clarify` | **Yes** |
| `stance` | Governs every capability's execution. It is the `executableRequest` stance, generalized; it replaces ~18 hypothetical and ~16 command predicates | **Yes** (existing semantics) |
| `affect` | Replaces Boundary's exclusive emotional precedence and the ~30 emotion checks that currently pre-empt meaning (MA-19) | **Yes** |
| `binding.target` | Governs the first-match "yes" ladder of about 20 sites (OB-0 §Audit 2) and correction targeting | **Yes** |
| `binding.include` / `exclude` | Governs execution scope; replaces `parseSelection`'s single-choice correction for proposals. No existing authority handles partial authorization today (OB-0 §8) | **Yes** |
| `binding.amended` | Replaces the `accept_modified` label; governs "never execute the unamended version" | **Yes** |
| `correctionValue` | None. Slot parsers already own values | **Rejected** |
| `referent` (text) | None. `activeWorkContext` owns named-work resolution | **Rejected** |
| `declinedScope` separate from `exclude` | None; same execution effect | **Rejected** |
| `later` / defer flag | None global; re-offer is owner policy | **Rejected** (derive later if needed) |

---

## 5. Interpretation approaches

**Repository evidence used:**

1. **Deterministic brittleness (documented, not hypothetical):**
   - "No, I said Tuesday" → decline (`conversationConfirmationGate.ts:148`)
   - Events "I don't know what you mean" → `defer` (`applyEventConversationalAnswer.ts:119-150`)
   - Claire IDK → business coaching
   - `workflowCorrection.ts:9` matches "stop" / "i'm not"
   - Boundary `NEW_SUBJECT_MARKER_RE` contains "thinking about" (`:152`), so "I'm thinking about it, but what would it cost?" can read as a topic switch
   - Round 1 needed **7 interceptor step-asides** before one sentence reached its owner
   - The R0 Rhythm subject was saved as "'send the"
   - "a feeling can become a Rhythm subject"; "every weekday" becomes daily (R0 report §25)
   - ~75 yes vocabularies drifted, including the same function name defined twice with different logic
2. **Deterministic strengths:**
   - `executableRequest` restraint (49 tests, live-proven on the Founder's ASEA transcript)
   - the Board round3f5c move suite
   - zero latency; runs offline and without a key; fully unit-testable
3. **Model-assisted precedent already in the repo:**
   - `modelMaterialSignalExtractor.ts`: model reads meaning; strict schema validation; **evidence must be grounded in the member's own words**; any failure → deterministic fallback; the model *never selects*, and a deterministic authority decides.
   - Claire reasoning uses the same model-first / deterministic-fallback adapter.
   - The shared seam is `lib/internalAgent/invokeStructuredLlm.ts` (gpt-4o-mini, default 45 s timeout; a turn-path budget must be far smaller).
4. **Hot-path constraint:** `handleSend` has about 180 local return sites that answer or act with no model call today. Boundary is synchronous and runs client-side (`CPC:16586`).
5. **Security constraint:** the unauthenticated `/api/claire-reasoning` (R0 P1) shows that any new model call must use the Bearer / `getUser` pattern from `/api/board/*`.

Latency and cost figures below are **qualitative estimates**; the repo contains no measurements of a turn-reading call. OB-1 must measure them.

| Criterion | A. Consolidated deterministic | B. Model read every turn | C. Hybrid (certain tier + model for ambiguous) | D. No new interpreter |
|---|---|---|---|---|
| Duplicate-authority risk | Low if Boundary is the only caller | Low (one reader), but the model output must not grant | Low if both tiers live inside Boundary and emit the same contract; tier 1 must be a strict subset that agrees with labels | High: rooms keep their own readers because nothing expresses clarify/ask/unsure/correct |
| Latency | ~0 | Model round trip on **every** turn, including today's instant fast paths | ~0 for the certain tier; one model round trip only on ambiguous turns with a pending item or action content (fraction unknown; measure) | ~0 |
| Cost | 0 | Every turn | Only the ambiguous subset | 0 |
| Brittleness | High (evidence #1) | Low for phrasing; model drift instead | Low where it matters | High |
| Paraphrase generalization | Poor; requires phrase growth (conflicts with R0's "no phrase rules") | Good | Good on the ambiguous subset | None |
| Testability | Excellent (unit) | Needs recorded or eval runs; nondeterministic | Tier 1 is unit-tested; tier 2 uses an offline eval + a validator unit-tested with recorded outputs | Excellent, but for the wrong behaviour |
| False-positive execution risk | Medium (regex over-match, e.g. `workflowCorrection`) | High if unguarded; acceptable with the §5.1 gates | Acceptable with the §5.1 gates | Same as today |
| Clarify vs ask vs unsure | Weak (the "I don't know" substring conflict is the core bug) | Strong | Strong | Cannot |
| Correction vs decline | Needs ordering rules; fragile with "No, …" | Strong | Strong | Cannot |
| Modified / partial acceptance | Only for fixed forms ("yes, but…", ordinals) | Strong, but ids must be validated | Strong + validated | Cannot |
| Hypothetical / discuss | Good (`executableRequest` proven) | Good | Good; the deterministic restraint stays as a **veto** | Only Rhythm/Reminder |
| Failure mode when uncertain | Silent misread with no signal (today's failure) | Timeout or malformed output → needs a fallback | Model failure → deterministic reading with `confidence: low` → hold/ask; never execute | Silent misread |
| Beta implementation size | Medium (consolidate about 6 predicate families) | Medium-large (async hot path, new authenticated route, fallback) | Medium-large (A's certain tier + B's read, but only on a subset) | Small, but does not solve the problem |

**Recommendation.** C, **conditional on the OB-1 bake-off.** A is the fallback if C's measured latency, cost or accuracy does not beat A on the labelled corpus. Neither is selected by assumption.

### 5.1 Guards that apply under any approach
- The model (if used) **proposes** `relation`, `binding`, `affect` and grounded `evidence` spans. It **never** outputs permissions.
- **Deterministic restraint veto.** If `executableRequest`'s talk_about reasons (negation, hypothetical, past tense, capability question) fire, or a decline cue co-occurs with `accept` → `confidence: low`.
- **Validation.** Evidence spans must be substrings of the member text. `include`/`exclude` ids must exist in the armed `items`. `target: executed` requires a receipt from this conversation. Any violation → `confidence: low`.
- **`permitsFor` refuses execution unless `confidence = high`.**

---

## 6. Person-before-process precedence

**Rule 1: one primary relation plus modifiers is enough.** It was checked against every Task 4 example and the 7 payload cases; no case needed two primary relations to be executed at once.

**Rule 2: relation order when cues co-occur** (highest first):

`clarify > ask > correct > unsure > decline > accept > none`

**Rule 3: a higher relation suspends a lower action-bearing one; it does not erase it.**
- If `ask` or `clarify` wins over an `accept` or `correct` cue, nothing executes this turn. The pending item is preserved and re-offered after the answer.
- If a decline cue co-occurred, the pending item is **disarmed** for bare-"yes" binding. The next turn must restate the item.

**Rule 4: affect never removes a relation.** It sets tone and suppresses new offers and questions. `distressed` + `relation = none` → `interrupt_and_suspend`.

**Rule 5: stance gates action.** `talk_about` blocks execution for `relation = none`. `accept` of an armed offer is itself authorization, unless the restraint veto fires.

**Rule 6: low confidence fails safe.** Treat the turn as `clarify`-like on Spark's side ("Just to check — did you mean…?"). No execute, no store, no advance. Pending is preserved.

| Member | Result |
|---|---|
| "I don't know what you mean. Can you explain?" | `clarify` (beats `unsure`) → re-explain; hold; not an answer; not a deferral |
| "No, that's wrong. I said Tuesday." | `correct` (beats `decline`) → target executed/pending → capability parses "Tuesday" |
| "I'm thinking about it, but what would it cost?" | `ask` + `stance: talk_about` → answer the cost; never execute |
| "I'm frustrated, but yes, do the first one." | `accept`, `include: [1]`, `affect: strained` → execute item 1 (if all guards pass); gentle; no new asks |
| "Yes, but what does it cost?" | `ask` beats `accept` → answer; re-offer; do not execute yet |

**`permitsFor` (derived, one function, no stored fields):**

| Permit | True only when |
|---|---|
| `mayExecute` | `confidence = high` AND ( (`relation = accept` AND `binding.target = pending` AND owner armed on the previous turn AND ids valid) OR (`relation = none` AND `stance = act`, handed to the capability's slot check and direct-execution policy) ) AND no restraint veto |
| `mayModifyExecuted` | `relation = correct` AND `target = executed` AND `confidence = high`. The capability must parse the new value, else ask |
| `mayStoreAsAnswer` | `decision = answer_pending_question` AND `relation = none` AND `confidence = high` AND the owner's own affordance validates the value |
| `mayAdvance` | `mayStoreAsAnswer` succeeded, OR `relation = decline` of an optional question |
| `obligation` | `clarify` → owner re-explains its last contribution · `ask` → answer · `unsure` → help with the pending item · `correct` → apply or confirm · `decline` → acknowledge + clear/disarm · `accept` → execute the scope and report from the receipt · `none` → domain turn |

---

## 7. Certification-harness correction

**OB-0 defect.** "Per-area adapters that produce a `GlobalTurnDecision`" would re-implement each room's meaning inside tests. That is a second interpretation layer, and it proves nothing about production.

**Corrected design (smallest):**
1. **Labelled corpus.** Situations are real pre-turn state fixtures, in each room's *native* state format, plus member text. Sources:
   - the Founder transcripts already in the repo (ASEA replay, the R0 §17 scenarios, the Board round3f5c cases);
   - the OB-0 A-L examples;
   - paraphrase families (at least 5 each) and negative controls (at least 3 each).

   Humans label two things per case:
   - (a) the expected contract values;
   - (b) the expected **observable outcome**: `{advanced, storedAsAnswer, executedScope, pendingPreserved, bareYesArmed}`.
2. **Drivers, not interpreters.** For each room the harness calls the room's **real exported step function** on the fixture:
   - `applyEventConversationalAnswer`
   - `answerBoardIntakeStep`
   - `applyBoardMemberAnswers`
   - `advanceDayDesignerSession`
   - `processStrategyApplyTurn`
   - `applyGuidedJourneyAnswer`
   - `resolveReminderTurn`
   - `continueActiveRemember`
   - `advanceEntranceUnderstanding`
   - `buildClaireTurnResponse`
   - `resolveConversationBoundary`

   Main-chat ordering (`handleSend`) is covered by the existing Playwright replay method from Round 1 / R0 (real input box, page turn log), run as a dev script, not in CI.
3. **Generic observer.** A structural diff of the returned or persisted state computes the outcome vector: question id changed, text present in a record field, store record added or changed, pending record cleared. The observer contains **no language rules**.
4. **Assertion.** Observed outcome vs labelled outcome. Today's mismatches are recorded as the **divergence baseline** (expected failures); convergence rounds flip them.
5. **Reader accuracy** (for the A/C bake-off) is measured separately: `resolveConversationBoundary` output vs labelled contract values.

**CI rule.** A new room input surface must register a driver entry, or the harness fails.

---

## 8. Parent versus specialist boundary

| Owner | Owns | Must NOT absorb |
|---|---|---|
| **ONE BRAIN** (Boundary module) | `transition` + suspend/return target; owner selection (ADR); `relation`, `stance`, `affect`, `binding`; `confidence` + grounded `evidence`; `permitsFor` | Slot or value parsing (times, days, cadence, names); domain answers and explanations; question generation or sequencing; capability execution; truth retrieval or the truth lens; prompt composition; room UI; domain epistemics (scenario vs plan, evidence vs assumption); navigation; the content of offers. **Target size:** decision logic plus one predicate module, measured in hundreds of lines, not thousands. |
| **SPECIALISTS** | Domain content; explaining their own questions and terms; domain question sequences; answer affordance validation ("is this a valid headcount?"); domain write meaning (Claire never-write kinds); re-offer and defer policy; tone rendering from `affect`; domain expertise (Directors, experts, blueprints, the planner) | Re-reading the member's relation, stance or emotion; advancing without `mayAdvance`; binding a "yes"; claiming execution without a receipt |
| **CONTEXT systems** | The spine `ownership.expectedReply` (the one pending record, armed with `items` when enumerated, `offeredAtTurn`, expiry); `activeWorkContext` (active and suspended work, named-work resolution for `target: referent`); the pre-turn snapshot | Interpreting text |
| **ACTION system** (`memberIntent` extraction → `executionFoundation` manifest → domain writer) | Capability extraction and per-item negation; slot parsing, including amendments and correction values; required-slot check; execution; read-back; receipts; naming unsupported parts | Deciding authorization meaning (it consumes `permitsFor`) |
| **KNOW / TRUTH** (`retrieveRelevantSituation` + canonical BU) | Status and provenance labels; the current / history / reason lens (a retrieval query aspect, parsed at retrieval time); supersession and `changeReason` | Deciding the member's relation |

---

## 9. What changes from OB-0

| OB-0 | OB-0.5 |
|---|---|
| `move` with 18 values | `relation` with 7 values; the rest moved to `transition`, `stance`, `affect` or `binding` |
| `obligation` and `grant` fields | Removed as fields; derived by `permitsFor` |
| `truthLens` in the Boundary / global decision | Moved to KNOW |
| `bindTarget`, `pendingPreserved` | `binding.target`; `pendingPreserved` becomes an observed harness outcome, not a field |
| Deterministic-first reader assumed | A vs C bake-off in OB-1; C recommended if the evidence supports it; D and B rejected |
| Emotional precedence first (inherited from Boundary) | `affect` modifier; transition only if distressed with no relation (a behaviour change, applied in OB-2) |
| Harness adapters emit decisions | Harness drives real step functions and observes state diffs against a human-labelled corpus |
| OB-1 = move field + harness | OB-1 = contract types + labelled corpus + divergence baseline + A/C bake-off (below) |
| OB-2 through OB-6 sequence | Unchanged in order. OB-2 consumes `permitsFor` (hold / store / advance); OB-3 adds `items` to `expectedReply` and routes the binding sites; OB-4 uses `relation = correct` for the Tuesday fix |

---

## 10. Exact recommended OB-1 scope (do not start without Founder authorization)

**OB-1: Boundary meaning contract (shadow) + labelled corpus + divergence baseline + A/C bake-off**

1. **Types only, in `lib/conversationBoundary.ts`.** Add optional `relation`, `stance`, `affect`, `binding` to `ConversationBoundaryDecision`. Add `permitsFor()` as a pure function. **No consumer reads either.**
2. **Tier 1 (certain, deterministic).** One predicate module beside Boundary; Boundary is its only caller. It consolidates the existing canonical sources:
   - `conversationConfirmationGate` whole-message yes/no
   - `executableRequest` stance and restraint reasons
   - Board `classifyMemberBoardResponse` clarification and correction rules
   - CRCI `triggerDetection`
   - `turnRecovery` correction

   It emits `confidence: high` only for anchored, unambiguous forms. Everything else is `low`. The original functions are **not** re-pointed in OB-1.
3. **Tier 2 (model read), in an offline evaluation script only.** It is not wired into `handleSend` and adds no production route. It follows the `modelMaterialSignalExtractor` pattern: strict schema, grounded spans, validator, deterministic fallback. Run it on the labelled corpus with the Founder's key.
4. **Labelled corpus + drivers + generic observer** (§7). Commit the divergence baseline for every listed room.
5. **Bake-off report.** Per relation for A (tier 1 plus a full deterministic attempt at every case) and C (tier 1 + tier 2):
   - precision and recall;
   - confusion matrix (especially clarify / ask / unsure / correct / decline);
   - the fraction of cases reaching tier 2;
   - tier-2 latency p50/p95 and tokens per call;
   - **false-execution count, which must be 0 under the §5.1 guards**.
6. **Proof:**
   - the S4 snapshot-purity test stays green;
   - 0 new test failures;
   - the `tsc` error multiset is unchanged;
   - no member-visible change.
7. **Stop.** The Founder picks A or C from the numbers. OB-2 does not start in the same round.

**Rollback:** revert. No consumers, no routes, no stores.

---

## 11. Adversarial self-review

| Question | Answer |
|---|---|
| Did I represent transition twice? | No. pause / resume / switch map to existing transition kinds. `answer` is derived from `answer_pending_question` + `relation: none`, not stored. **Invariant:** `relation ≠ none` only when `decision ∈ {continue, expand, answer_pending, unclear}`. A switch or cancel carries `relation: none`. |
| Did I represent action intent twice? | No. `command` is rejected; `stance` is the existing `executableRequest` stance; action lists and slots stay in ACTION. |
| Did I make emotion an exclusive meaning? | No. `affect` is a modifier; today's exclusive emotional precedence is identified as a defect with evidence (`:411-416`). |
| Are labels missing binding information? | `binding` carries the target, ids and the amended flag. Values are deliberately left to slot parsers. Residual risk: an offer without enumerated `items` cannot take a partial acceptance. It fails safe to "ask", and OB-3 must arm `items`. |
| Did I move specialist expertise into the parent? | No. Explanations, affordance validation, re-offer policy, epistemics and tone stay in the specialists (§8). |
| Did I merely centralize brittle regexes? | Only tier 1, and only for anchored forms, with `confidence: low` otherwise. Whether that is enough is exactly what the A/C bake-off measures instead of assuming. |
| Did I create a model classifier that can authorize? | No. The model proposes meaning only; `permitsFor` is deterministic and requires an armed owner, valid ids, `high` confidence and no restraint veto. |
| Could ambiguous interpretation directly grant execution? | No. Ambiguity → `confidence: low` → `mayExecute = false`. |
| Does uncertainty fail safe? | Yes: hold, ask and preserve pending. Never store, advance or execute. |
| Is this smaller than OB-0? | Yes. OB-0 added 7 new concepts (move ×18, stance, obligation, grant ×3, bindTarget, pendingPreserved, truthLens). OB-0.5 adds 4 (relation ×7, stance [existing semantics], affect ×3, conditional binding), reuses `confidence` / `evidence`, and derives the rest. |
| Did I create another router, store, registry or authority? | No router. No store (one optional `items` field on the existing spine record). No registry. `permitsFor` is part of Boundary, the existing authority. |
| Does C create two readers? | Both tiers live inside Boundary and emit one contract. Tier 1 is certified as a strict subset (it must agree with the labels 100% on its `high` cases, or the case is downgraded to `low`). |
| Honesty check | Latency and cost for tier 2 are **not measured** in the repo; they are stated as estimates to be measured in OB-1. The Decision Ledger "yes" skip (OB-0 B-10) is still unreproduced. |

---

*OB-0.5 complete. Read-only. Nothing implemented, merged or deployed.*
