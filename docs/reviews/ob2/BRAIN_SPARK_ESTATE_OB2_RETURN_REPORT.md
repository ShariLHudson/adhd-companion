# BRAIN SPARK ESTATE™ — OB-2 Return Report
## Hold-and-Answer Convergence Through One Brain

**Status:** Complete and certified locally. **Not pushed, not merged, not deployed.** `main` is untouched. OB-3 has not been started.

**Outcome.** Every room in scope now asks One Brain (Boundary → `permitsFor`) before it stores the member's words or moves forward. When the member asks something, asks what Spark meant, says "I don't know, help me", corrects Spark, or gives a bare "Yes." to an open question, the room holds. It explains its own question in its own words, and the question stays pending for the next turn.

In the real-room certification matrix, divergence fell from **61 of 120 cells (OB-1) to 8 of 120**, and to **4 of 165** once the brief's extra phrasings and distress are included. Every remaining divergence is the Rhythm correction defect, which OB-4 owns.

With the kill switch set to `0`, the matrix reproduces the OB-1 baseline **exactly**.

---

## 1. Verified starting point

| Check | Result |
|---|---|
| Accepted OB-1 SHA `c1110a89fadfb676313cf91b40b67906b912a72c` | **Exists** (`git cat-file -t` = commit). It is on `ob1/boundary-meaning-shadow`, and its parent is R0 `0e354024`. |
| Contains the OB-1 contract, corpus, divergence baseline and `permitsFor` | **Yes.** It has `lib/conversationBoundaryMeaning.ts` (with `permitsFor`), `lib/conversationBoundaryLexicon.ts`, `lib/oneBrainCertification/{corpus,evaluate,roomDrivers}.ts` and `docs/reviews/ob1/divergence_baseline.json`. |
| Material difference from the OB-1 report | None found |
| Base used | **Exactly `c1110a89`.** Not `main`. |

## 2. OB-2 branch

| | |
|---|---|
| Branch | `ob2/one-brain-hold-answer`, created from `c1110a89` |
| Ending SHA | `6b48a4bc9b755233f4568d2bca7855ce2cb0e3d8` (local commit on `ob2/one-brain-hold-answer`) |
| Pushed | **No.** Pushing any branch in this repository triggers a Vercel preview, and the brief asks for no push until the Founder authorizes one after local certification. A patch or review pack is delivered alongside this report. |

## 3. Files changed

About 30 files, including tests and data.

**One Brain (Boundary)**

| File | What changed |
|---|---|
| `lib/conversationBoundary.ts` | Transition reconciliation (§4); `MEANING_HOLD_EVIDENCE`; `isMeaningHold()` |
| `lib/conversationBoundaryMeaning.ts` | Kill switch `isBoundaryMeaningHoldEnabled()`. New `pause_for_person` obligation. `permitsFor` gains `pendingQuestionOwnsInput` and `pendingQuestionOptional` (§5). Six structural reader refinements, each certified with a paraphrase family (§10). |
| `lib/conversationBoundaryRoomGate.ts` | **New.** `roomTurnVerdict()` is the single gate every room calls. `renderRoomHoldReply()` frames the room's own copy and contains no language rules and no domain content. |

**Rooms.** Each room gets a thin gate call plus its own specialist copy:

| File | Room |
|---|---|
| `lib/board/boardDiscussion/boardDirectorDiscussion.ts` (`boardIntakeTurn`), `components/companion/board/BoardDirectorDiscussionIntake.tsx`, `lib/conversationContinuity/routeTurnToOwner.ts` | Board intake |
| `lib/board/reconstructed/orchestration/boardMemberQuestions.ts` | Board meeting |
| `lib/eventsIntelligence/applyEventConversationalAnswer.ts`, `lib/eventsEstate/eventsEntranceUnderstanding.ts`, `lib/currentFocus/submitCurrentFocusResponse.ts` | Events |
| `lib/strategyApplyCoach.ts` | Strategy Apply |
| `lib/strategyChamber/guidedJourney.ts`, `components/companion/StrategiesPanel.tsx` | Strategy Chamber |
| `lib/day-designer/dayMessages.ts` (`dayDesignerTurn`), `lib/day-designer/index.ts`, `app/companion/CompanionPageClient.tsx` (reply line) | Day Designer (Plan My Day) |
| `lib/createEstate/entranceUnderstanding.ts` | Create entrance; Work Recognition inherits it |
| `lib/businessProfileFounder/claireConfirmationTurn.ts` (new), `components/prototype/businessProfileBp2a/BusinessProfileBp2aPrototype.tsx` | Claire confirmation |
| `app/companion/CompanionPageClient.tsx` (turn claim + legacy-clear guard), `lib/universalCreation/createTurnRelationship.ts` | Main chat |

**Certification** (reuses the OB-1 harness; the drivers still call real production step functions and the observer stays language-free):

| File | Change |
|---|---|
| `lib/oneBrainCertification/roomDrivers.ts` | Three new situations: the brief's exact "I don't know. Help me…" and "No, that's not what I meant.", plus distress alone. The Claire confirmation driver now calls the new production entry. The Work Recognition observer is now structural (§8). |
| `roomDivergence.ob1.test.ts` | Kill-switch-off equals the OB-1 baseline; kill-switch-on equals the OB-2 baseline |
| `roomHold.ob2.test.ts` | **New.** Specialist explanation per room, then resume on a real answer, plus kill-switch checks |
| `oneBrainConsumers.test.ts` | **New.** Replaces OB-1's shadow-isolation test |
| `corpus.ts` | `OB2_ADDITIONS`: 37 cases |
| `bakeoff.ob1.test.ts` | Gates now include `OB2_ADDITIONS` |
| `docs/reviews/ob2/divergence_baseline.json` | New baseline |

**Two existing tests updated, with the reason written inline:**
- **`lib/board/round3f5ConversationalTurns.test.tsx` (12/13).** "Why are you asking me that?" now reaches the asking Director verbatim as `memberAskedYou`, through the certified R3F-5B question-to-Director seam. It previously arrived as `newMemberInformation`. The harness now records both channels. The test's intent ("the member's words go to the Board verbatim and never become a decision") is unchanged and still asserted.
- **`lib/board/boardDiscussion/boardDirectorDiscussion.intake.test.ts`.** The fixture answer "Why" to "Why does it matter now?" was a bare question word. It is replaced with a real answer ("Timing matters"). The test's intent (prior answers and Directors persist) is unchanged.

## 4. Boundary reconciliation (exact)

`resolveConversationBoundary` now returns `reconcileTransitionWithMeaning(transition, meaning, input)`, unless the kill switch is `0`. There are two rules; everything else keeps the unchanged OB-1 transition.

**Rule 1 — hold, don't switch or answer.**
- **Condition:** all of the following hold:
  - there is a live thread (a pending question or offer, armed items, an executed item, an unresolved topic, or active work);
  - `meaningConfidence = high`;
  - `relation ∈ {clarify, ask, unsure, correct}`;
  - the transition is anything other than `cancel_current_workflow` or `return_to_suspended_topic`.
- **Result:** `continue_current_topic` (confidence high), with evidence `meaning_hold` appended.
- **Emotion:** "I'm frustrated. What do you mean?" was `interrupt_and_suspend` and is now `continue_current_topic` + `meaning_hold`. Affect stays a modifier.
- **Distress with no relation is unchanged.** "I'm falling apart. I can't do this." stays `interrupt_and_suspend` (distressed, `relation none`).

**Rule 2 — a yes or no is not an answer to an open question.**
- **Condition:** all of the following hold:
  - the transition was `answer_pending_question`;
  - `relation ∈ {accept, decline}`;
  - the pending question does not expect yes/no and is not a decision slot;
  - none of the owner's own affordances match the reply.
- **Result:** `unclear` (low), with evidence `meaning_not_an_answer`.

**Consumers of the reconciliation (main chat):**
- **`CompanionPageClient`:** `boundaryClaimedTurn` also counts `isMeaningHold(decision)`, so a held turn is Boundary's and no fast-path "yes" handler can take it.
- **`CompanionPageClient`:** the legacy "not a yes/no → drop the armed offer" clear is **skipped** on a hold. This was the OB-0 B-5 defect: asking what an offer means no longer loses the offer.
- **`createTurnRelationship`:** a Create discovery answer requires `!isMeaningHold(decision)`.
- **Continuity gate:** for `continue_current_topic` it already keeps Create intact (fall-through), so nothing is parked or destroyed on a hold.

**Transition differential against OB-1** (300 inputs: the whole corpus + holdout + OB-2 additions, and every driver situation in every context):
- **202 identical.**
- **98 changed, all carrying an OB-2 marker:**
  - 95 × `meaning_hold`: `switch_topic→continue` 57, `unclear→continue` 30, `answer_pending→continue` 5, `interrupt→continue` 3;
  - 3 × `meaning_not_an_answer`: `answer_pending→unclear`.
- **0 unexplained changes** (asserted).

## 5. The `permitsFor` consumer architecture

```
member text + the room's pending question (plain data)
        │
        ▼
roomTurnVerdict()                          lib/conversationBoundaryRoomGate.ts
  ├─ resolveConversationBoundary(...)      One Brain: relation · stance · affect · binding · confidence
  ├─ permitsFor(decision, { pendingQuestionOwnsInput: true, pendingQuestionOptional, answerAffordanceValid })
  └─ verdict: proceed | skip | hold(obligation)
        │
        ▼
room: proceed → its own domain validation, then store / advance exactly as before
      skip    → its own existing skip path (optional questions only)
      hold    → store nothing, advance nothing, keep the question;
                renderRoomHoldReply(verdict, ROOM'S OWN copy {question, meaning, help})
```

**Rules inside the gate.** These are general; none is per room.

| Rule | Behavior |
|---|---|
| Store / advance | `proceed` only when `permitsFor(...).mayStoreAsAnswer` is true: `relation none`, HIGH confidence, not cancel/return/interrupt, and the owner's affordance has not rejected it |
| Skip | A declined **optional** question produces `skip` |
| Yes/no question | A HIGH `accept`/`decline` is the answer → `proceed` (Claire confirmation) |
| `acceptsQuestions` | The room's question invites a question as its answer, so a HIGH `ask` proceeds. Used by Board intake's first step and the Strategy Chamber opening. |
| `hasCorrectionSpecialist` | A HIGH `correct` goes to the room's own correction specialist. Used by Claire's confirmation contract ("modified"). |
| `acceptsUnknown` (+ `unknownWithHelp`) | The room's own answer affordance accepts "I don't know" as information. The gate returns an **`unknown` verdict** (with a `helpRequested` flag) and the room applies its own semantics. **Board meeting:** a settled unknown the Directors reason with, with help riding along (R3F-5B, Founder-certified). **Events:** pause the question and come back later; a help request still holds and helps. |
| `openingInvitation` | An opening invitation (Strategy Chamber's first question, Board intake's "decision, situation, or question") accepts anything the member offers. It holds only for a request to explain the invitation, or for distress. |
| Room question + "No, <content>" | A room asked a question, not an offer, so "No, I don't have savings set aside." answers it. `decline_with_content` proceeds. It stays LOW (check) in main chat, where offers exist. |
| Everything else | `hold`, with `explain_own_last_contribution`, `answer_question`, `help_with_pending`, `apply_or_confirm_correction`, `acknowledge_and_release`, `pause_for_person` or `check_meaning` |

**`permitsFor` changes** (the contract is unchanged; these are additive):
- `mayStoreAsAnswer` also holds when `pendingQuestionOwnsInput`, meaning the text arrived in the room's dedicated answer box. There, a substantive answer often *looks* like a transition "switch", and that must not block it. Cancel, return and interrupt still block.
- A declined optional question gets `mayAdvance` (skip). A decline always releases the pending item.
- The new obligation `pause_for_person` applies when the transition is `interrupt_and_suspend` with `relation none` (distress or detour).

**The gate never decides from room vocabulary. Boundary never contains a domain explanation.** Every explanation string lives in the room's own module (§6).

## 6. Rooms converged

| Room | Entry now gated | Specialist copy (owned by the room) | Also changed |
|---|---|---|---|
| Main chat (Boundary) | `resolveConversationBoundary` reconciliation | — (the model answers in chat) | Turn claim, legacy-clear guard, Create grant |
| Claire — confirmation pending | `resolveClaireConfirmationTurn` → Claire's contract | "I'm checking before I save anything…" | A question no longer falls into the decline branch that dropped the candidate |
| Board intake | `boardIntakeTurn` (and `answerBoardIntakeStep` delegates to it) | Per step: decision / why now / options / concerns | The UI shows the hold reply under the question. The chat sticky-intake route returns the hold reply. "Start with decision only" is gated. |
| Board meeting | `applyBoardMemberAnswers` | The asking **Director** replies through the existing `memberAskedYou` seam | The Board's local clarification/correction detection is replaced (legacy only with the switch off). "I don't know" stays a **settled unknown** through One Brain's `unknown` verdict. Questions embedded beside a real answer still travel with the answer (3F-5B); One Brain judges the statement part. |
| Events | `applyEventConversationalAnswer` (entrance, chat and Current Focus all call it) | Per foundation section (event type, purpose, audience, …), with a section-label fallback | A hold writes **nothing** to the event record. A plain "I don't know (yet)" is One Brain's `unknown`, which Events applies as its certified defer (pause, next question). "…help me figure it out" holds and helps. Events keeps only its domain dispositions. |
| Strategy Apply | `processStrategyApplyTurn` | Per question (problem / better / constraints), with a strategy fallback | The local `isWorkflowConceptQuestion` is replaced |
| Strategy Chamber | `applyGuidedJourneyAnswer` | Opening vs. later questions | A hold changes only Shari's reflection. A held opening is no longer handed to chat. |
| Day Designer (Plan My Day) | `dayDesignerTurn` / `processDayDesignerMessage` | Per step (time / energy / environment / priorities) | The chat shows the hold reply; a hold never builds a plan |
| Create entrance | `advanceEntranceUnderstanding` | Per discovery slot (goal / obstacle / outcome / context) | Create's `signalPatterns` pass through as owner affordances |
| Work Recognition | Inherits Create entrance (same step function) | Create's slot copy | — |

**Verified green and not rewritten:** Claire conversation (write path), Reminder intake, Rhythm offer pending, VTS menu.

## 7. Divergence before and after

| Matrix | Cells | Diverging |
|---|---|---|
| OB-1 baseline (8 situations × 15 rooms) | 120 | **61** |
| OB-2, same 8 situations | 120 | **8** |
| OB-2, plus "I don't know. Help me…", "No, that's not what I meant." and distress | 165 | **4** |
| OB-2 with `NEXT_PUBLIC_BOUNDARY_MEANING_HOLD=0` | 120 | **Every observed room behavior identical to OB-1, cell for cell** (asserted) |

**One documented room expectation.** Board meeting declares `acceptsUnknown`. For the two unsure situations, its expected outcome is therefore "stored as a settled unknown and moved on", not a hold (R3F-5B, Founder-certified). In the drivers this is declared as data (`acceptsUnknown: true`), not inferred.

The OB-2 matrix, with One Brain on:

| Room | clarify | ask | unsure | don't-know+help | correct | not-what-I-meant | bare yes | decline | frustrated+clarify | distress | real answer |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Main Boundary | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Claire conversation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Claire confirmation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Board intake | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Board meeting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Strategy Apply | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Strategy Chamber | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Day Designer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reminder intake | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rhythm — offer pending | ✅ | ✅ | ✅ | ✅ | ❌ P | ❌ P | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rhythm — just executed | ✅ | ✅ | ✅ | ✅ | ❌ XP | ❌ XP | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create entrance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Work Recognition | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| VTS menu | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 8. Remaining divergences and why

- **Rhythm owner, corrections (4 cells).** "No, that's wrong. I said Tuesday." and "No, that's not what I meant." are still read by the Remember owner's own decline rule. The pending offer is released and the executed Rhythm is not corrected. **This is intentionally OB-4** (brief §4). Fixing it needs the receipt/correction execution path, not a hold.
- **An observer correction, not a behavior claim.** The OB-1 Work Recognition driver counted "advanced" as "the reply text changed". It now checks whether the stored journey session changed, which is structural and language-free.
  - With the switch off, the corrected observer still reproduces the OB-1 baseline exactly, because the old behavior really did change the session.
  - With the switch on, Work Recognition stores nothing and keeps the same question (also shown in `roomHold.ob2.test.ts`).

## 9. Duplicate-authority audit (modified room paths)

| Room / path | Local decision still present | Class | Note |
|---|---|---|---|
| Boundary transition | Emotional precedence over a relation | **REPLACED** | A HIGH relation now wins; affect is a modifier |
| Main chat | Legacy clear of the armed offer on "not a yes/no" | **REPLACED** on holds | Still clears on genuinely unrelated turns (OB-3 unifies it) |
| Main chat | ~20 fast-path "yes" binders (`isBareGenericAcceptance`, invites, VTS menu…) | **DEFER → OB-3** | They cannot take a held turn (`boundaryClaimedTurn` covers holds). Binding unification is OB-3. |
| Main chat | Decision Ledger "yes" skipped when Boundary claims the turn (OB-0 B-10) | **DEFER → OB-3** | Unchanged; still unreproduced |
| Create (chat) | `DETOUR_QUESTION_RE` ("?" ⇒ not an answer) beside the grant | **DEFER → OB-3** | Only ever more restrictive (it can hold, never store) |
| Create (chat) | `bareContinue` (a bare yes continues the Create flow) | **DEFER → OB-3** | Create-flow continuation, not storage of "yes" as a discovery answer |
| Claire confirmation | `memberChangedSubjectDuringConfirmation` runs before the gate | **DEFER → OB-3** | A topic switch is transition/pending territory |
| Claire confirmation | `parseMemberConfirmationResponse` (yes/no/partial/modify) | **KEEP** (specialist) after the gate | Claire's write-contract semantics; runs only when One Brain says `proceed` |
| Claire prototype | `/unsure\|not sure…/ → setMemberCameInUncertain` | **DEFER** | A tone flag only; stores and advances nothing |
| Board intake | `isSubstantiveBoardAdvisoryQuestion` | **KEEP** | Domain routing of a stored decision |
| Board meeting | `detectConversationalMove`, `detectHelpRequest` | **REPLACED** | Used only when the kill switch is `0` |
| Board meeting | `extractMemberQuestion` (which Director is named) | **KEEP** | Specialist referent resolution; One Brain judges the remainder |
| Board meeting | `classifyMemberBoardResponseKind` (factual unknown: "no revenue yet") | **KEEP** | Runs only on `proceed`; a factual unknown is a real answer |
| Board meeting | Treating "I don't know" as a settled unknown | **KEEP (affordance), meaning REPLACED** | One Brain decides the member doesn't know (`unknown` verdict); the Board decides what an unknown means for the Directors |
| Board meeting | Sentence-punctuation split (embedded question beside an answer) | **KEEP** | 3F-5B structure; no vocabulary; One Brain judges the statement part |
| Events | "I don't know (yet)" → defer | **Meaning REPLACED, semantics KEPT** | One Brain's `unknown` verdict; Events applies its certified defer |
| Events | `detectDisposition` "I don't know" → defer, "later/not now" → skip | **REPLACED** | Used only when the kill switch is `0` |
| Events | organizer-holds-info / not-my-responsibility / redirect-to-work | **KEEP** | Event-domain meanings, run only on `proceed` |
| Events | `applyCorrections` (duration/headcount/"moved from X to Y") | **KEEP** | Domain correction of values inside an answer |
| Strategy Apply | `isWorkflowConceptQuestion` | **REPLACED** | Used only when the kill switch is `0` |
| Strategy Chamber | `answerIntake` epistemic tagging | **KEEP** | Specialist |
| Day Designer | `parseMinutes/Energy/Environment` | **KEEP** | Domain value parsing |
| Create entrance | `SOP_TEXT_RE`, `signalPatterns` | **KEEP** | Domain routing / owner affordances |
| Work Recognition | `isSimpleAffirmation` (typed ready-line yes), `isExplicitNavigationIntent` | **DEFER → OB-3** | Binding and navigation |
| **Current Focus — non-event Create path** | `applyAnswerToRuntimeCreationRecord` stores any reply | **DEFER — gap** | Not in OB-2 scope and not in the OB-1 baseline. **It still stores a clarification as an answer.** Recommended for OB-3 or an OB-2.1 add-on (the same one-call gate). |

`oneBrainConsumers.test.ts` enforces the structure:
- only the room gate calls `permitsFor` or reads the meaning fields;
- rooms import the meaning module only for the kill switch;
- every converged room entry calls `roomTurnVerdict`;
- production never imports the certification harness or the evaluation-only model read.

## 10. Adversarial results

Pending context as noted. "Room verdict" is what a converged room does.

| Member turn | Context | relation | stance | affect | conf. | obligation | store | advance | pending kept | exec | room verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Yes, but what do you mean by that? | open Q | clarify | none | none | high | explain | ✗ | ✗ | ✓ | ✗ | hold · explain |
| No, wait — why are you asking me that? | open Q | ask | none | none | high | answer_question | ✗ | ✗ | ✓ | ✗ | hold · answer |
| I don't know, but I think maybe women over 50. | open Q | unsure | none | none | **low** | check_meaning | ✗ | ✗ | ✓ | ✗ | hold · "is that your answer?" |
| I'm overwhelmed, but can you explain this first? | open Q | clarify | none | strained | high | explain | ✗ | ✗ | ✓ | ✗ | hold · explain (gentle) |
| That's not what I said. Why did you change it? | executed | ask | none | none | high | answer_question | ✗ | ✗ | ✓ | ✗ | hold · answer |
| Okay, maybe. What happens if I say yes? | exec. offer | ask | none | none | high | answer_question | ✗ | ✗ | ✓ | ✗ | (main chat) hold |
| Yes. | open Q | accept | act | none | **low** | check_meaning | ✗ | ✗ | ✓ | ✗ | hold · check |
| Yes. | confirmation | accept | act | none | high | — | — | — | — | ✗ | **proceed** (it is the answer) |
| Not now. | optional Q | decline | none | none | high | release | ✗ | ✓ (skip) | ✗ | ✗ | **skip** |
| Not now. | exec. offer | decline | none | none | high | release | ✗ | ✗ | ✗ (released) | ✗ | (main chat) |
| Can you help me figure that out? | open Q | unsure | none | none | high | help | ✗ | ✗ | ✓ | ✗ | hold · help |
| I was thinking about doing that. | open Q | none | talk_about | none | high | domain | ✓ | ✓ | ✗ | ✗ | proceed (an answer) |
| Do it. | exec. offer | accept | act | none | high | execute | ✗ | ✗ | ✗ | **✓** (fresh armed offer) | (main chat) |
| What would happen if I did it? | exec. offer | ask | talk_about | none | high | answer_question | ✗ | ✗ | ✓ | ✗ | (main chat) hold |

**Reader refinements found by this pass and the full-suite run.** Each is structural and certified with a paraphrase family in `OB2_ADDITIONS` (37 cases). No room vocabulary was added.

| Refinement | Example | Reading |
|---|---|---|
| A tentative answer inside uncertainty | "…, but I think / maybe / probably <3+ words>" | **LOW** — check meaning; don't discard it and don't store it |
| A help request put as a question while something is pending | "Can you help me figure that out?" | **unsure** |
| The loose decline tokens ("no", "later", "stay", "not yet") only decline when they are the clause | "**No revenue yet** — we launch in March." | an answer, not a decline |
| A decline token plus real content | "Nope, never been to one before." | **LOW** (in a room's answer box it proceeds as the answer) |
| A pseudo-cleft statement is not a question | "What I'm doing isn't working." / "What we need is…" | **none** (an answer) |
| A weak "no, I …" correction (turnRecovery's broad pattern only) yields to an explicit decline clause | "No, I don't have savings set aside." | Not a HIGH correction of Spark |

## 11. False-execution proof

| Gate | Result |
|---|---|
| OB-1 corpus (145): every HIGH reading equals the human label | **Green (100% HIGH precision)** |
| OB-1 holdout (43) | **Green (100%)** |
| OB-2 additions (37) | **Green (100%)** |
| False execution authorizations: corpus / holdout / OB-2 additions, with and without transition gating | **0 / 0 / 0** |
| Adversarial set | The only `mayExecute` is "Do it." to a fresh, armed offer, which is correct |
| Rooms | **No room executes anything new.** A hold writes nothing (Events record unchanged, asserted). `permitsFor` still authorizes only a fresh armed offer, which no room in OB-2 has. |
| Model tier | None. Approach A only; production never imports the evaluation read (enforced). |

## 12. Kill switch — `NEXT_PUBLIC_BOUNDARY_MEANING_HOLD`

- **Default (unset or anything but `0`):** One Brain hold/store/advance is on.
- **`=0`: restores the previous behavior.** It bypasses exactly these:
  1. Boundary transition reconciliation, so the transition is OB-1 byte-identical;
  2. the page's hold turn claim and legacy-clear guard (`isMeaningHold` is never true);
  3. Create's hold refusal;
  4. `roomTurnVerdict`, which always returns `proceed`;
  5. the three rooms' legacy readers come back: Board meeting `detectConversationalMove`/`detectHelpRequest`, Events `detectDisposition` (unsure/skip), Strategy Apply `isWorkflowConceptQuestion`.
- **Proof:** with the switch at `0`, every room's observed behavior equals the committed OB-1 baseline exactly (120/120 cells), and `roomHold.ob2.test.ts` checks the switch per room.
- **It does not bypass:** the six OB-2 reader refinements. They only change *meaning* readings, which are consumed only by the gate and the reconciliation, and both are bypassed.
- **Scope:** one environment variable, read in one function (`isBoundaryMeaningHoldEnabled`). No flag system.

## 13. Test, typecheck and lint evidence

| # | Check | Result |
|---|---|---|
| 1–3 | OB-1 corpus, holdout, HIGH-precision gate | **Green** (plus OB-2 additions) |
| 4 | False executions | **0** |
| 5 | Real-room divergence baseline | **Updated deliberately:** 61/120 → 8/120 (4/165 with extras); OB-1 reproduced exactly with the switch off |
| 6 | Boundary snapshot purity (`conversationBoundaryPreTurnSnapshot`) | **Green** (full suite) |
| 7 | Existing Boundary suites | **Green** (full suite) |
| 8 | Directly affected room suites | Board, Events, Strategy, Day Designer, Create entrance, Work Recognition, Claire, continuity, executable intent — see the full-suite row |
| 9 | **Full suite, OB-1 base vs OB-2** | OB-1: 20,665 tests, 459 failing. OB-2: **20,683 tests, 459 failing. Failing-id set identical: 0 new, 0 fixed.** (The first OB-2 run found 17 new failures in converged rooms; all were resolved, see §15, before this final run. 13 corpus cases were added afterwards and pass their own gate suite.) |
| 10 | `tsc --noEmit` | **353 vs 353; identical (file, code) multiset, 0 new** |
| 11 | ESLint on every changed file | **Identical to OB-1 per file and rule** (175 vs 175 pre-existing findings in large files such as `CompanionPageClient`, 0 new). New files are clean. |
| 12 | Duplicate-authority audit | §9 (enforced by `oneBrainConsumers.test.ts`) |
| 13 | Kill-switch tests | Green (§12) |
| 14 | Transition differential for cases OB-2 is **not** meant to change | 202/300 identical; all 98 changes carry OB-2 markers; **0 unexplained** |

`next build` was not run. `next.config.ts` ignores type errors at build time, so `tsc` is the stronger check, and no build configuration changed.

## 14. Founder preview test (after you authorize a push)

**Sentence:** "I don't know what you mean. Can you explain that before we keep going?"

| Where | How to get to the pending question | Expect |
|---|---|---|
| Main chat | Ask Spark to "help me write an email to my client"; wait for "Who is receiving this email?" | Spark explains in chat; the email stays in progress; answering next ("my accountant") continues the email |
| Claire | Profile → My Business Profile; say "My workshop costs $150."; wait for Claire's confirmation question | Claire explains that she's checking before saving; **nothing is saved or dropped**; "Yes" next turn saves |
| Board intake | Welcome Home → Guidance → Board Room → start a discussion; answer step 1; at "Why does it matter now?" type the sentence | A Board explanation appears under the question; still Step 2 of 4; your text is not in the draft |
| Events | Events entrance → "I'm hosting an online event." → at the first foundation question | Events explains that question; the same question is asked again; nothing is added to the event |
| Strategy | Strategy Chamber → start → answer the opening → at the next question | Shari's reflection explains the question; the same question remains |
| Create | Create entrance → "I want to create a client onboarding guide" → at the first discovery question | Create explains the question; same question; nothing recorded |
| Plan My Day | In chat say "plan my day" → at any Day Designer question | Plan My Day explains; the same step remains; no plan is built |
| Reminder intake | "Remind me to call Susan" → at "When would you like me to remind you?" | Holds and re-asks; nothing saved (already green in OB-1) |

In every room:
1. Spark treats it as a request for clarification.
2. It explains **its own** question.
3. It doesn't save the words.
4. It doesn't move on.
5. The question stays.
6. The next turn can answer it.

Also try "I'm falling apart. I can't do this.": the pause is kept and the place is saved.

## 15. Not verified

- **No live browser or preview run.** Not pushed (§2). The React surfaces were changed minimally (a hold message and early returns), but they were not rendered in a browser this round.
- The main-chat `handleSend` ordering was not replayed end to end. Its seams are covered by unit tests and the Boundary differential.
- Deterministic rooms (Board intake, Day Designer, Strategy, Events, Create) **cannot answer arbitrary factual questions**. For `answer_question` they answer from their own "why this question" copy and hold. Main chat and Board meeting answer through the model and the Directors.
- **Current Focus non-event Create path** still stores any reply (§9 gap).
- **A design tension resolved in favor of Founder-certified behavior (Founder may wish to confirm):**
  - The brief's generic rule is "unsure → help, don't store".
  - Two rooms have certified designs where "I don't know" *is* meaningful information: the Board (settled unknown, R3F-5B) and Events (pause and come back).
  - One Brain still decides that the member doesn't know. Those two rooms declare `acceptsUnknown` and apply their own semantics.
  - Every other room holds and helps.
- **The first full-suite run found 17 new failures,** all in converged rooms (Board R3F-5/5B/5C, Events defer/skip, Strategy Chamber opening, Board intake fixture). All 17 were resolved:
  - by the affordance options above;
  - by the two structural reader refinements (pseudo-cleft, weak correction yields to decline);
  - by the two inline-documented test updates (§3).

## 16. Adversarial self-review

| Question | Answer |
|---|---|
| Did I create nine new brains? | No. One gate function; rooms pass plain data and render their own copy. No room reads meaning fields (enforced). |
| Did Boundary absorb domain explanations? | No. Every explanation string is in the room module; the renderer only frames. |
| Does any room still decide meaning on its own? | Only where listed as KEEP (domain) or DEFER (OB-3/OB-4, §9). The three replaced readers run only with the switch off. |
| Did I phrase-patch? | No room vocabulary was added. Six reader refinements are structural and certified with paraphrase families plus negative controls, and HIGH precision stayed at 100%. |
| Could a hold lose work? | No. Held turns store nothing and keep the question. The page's legacy clear no longer drops an armed offer on a hold. Events writes nothing. |
| Could a hold trap the member? | No. A real answer on the next turn proceeds (tested per room). An optional question can be declined (skip). Cancel and return still leave. Low confidence asks one short check. |
| Did emotion become exclusive again? | No. Relation wins; `distressed` + no relation still interrupts. |
| Can LOW confidence store, advance or execute? | No. |
| False execution? | 0 across all gates. |
| Is the kill switch real? | Yes. OB-1 is reproduced exactly with it off. |
| Did unrelated behavior change? | The transition changes only where OB-2 markers say so (differential). Full suite: see §13. |

## 17. Recommended OB-3 scope — not implemented

**OB-3 — One pending authority (binding unification).**
1. **Generalize the Boundary snapshot** into `pendingOwnerSnapshot`, reading the spine's `ownership.expectedReply`, with an optional `items[]` for enumerated offers.
2. **Route every "yes / modification / partial / decline" binder** through Boundary + `permitsFor.mayExecute` / `executableScope`:
   - the ~20 main-chat fast paths;
   - Board/Chamber invites;
   - the VTS menu;
   - Work Recognition's ready-line;
   - Create's `bareContinue`.
3. **Arm pending offers only on the spine**, with turn provenance and expiry. Stop regex-arming from model text.
4. **Fold in:**
   - Claire's subject-change check and the Decision Ledger B-10 case (reproduce it first);
   - the remaining legacy confirmation clear;
   - the Current Focus non-event Create gap, which is the same one-call gate if it stays in OB-2.x.

**Not in OB-3:** the Rhythm Tuesday correction and receipts (OB-4), capabilities (OB-5), the KNOW lens (OB-6).

**Founder proof:**
- offer → unrelated turn → "yes" does nothing;
- offer → "yes, but at 4" modifies;
- offer → "what does that mean?" → "yes" still works;
- after a reload, "yes" does nothing.

---

*OB-2 complete. Certified locally. Not pushed. Not merged. Not deployed. OB-3 not started.*
