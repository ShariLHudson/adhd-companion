# BRAIN SPARK ESTATE™ — OB-1 Return Report
## Boundary Meaning Shadow + One Brain Certification Baseline + Interpretation Bake-off

**Status:** Complete. **Shadow only.** Not merged, not deployed, `main` untouched. OB-2 not started.

**What OB-1 did:** Boundary (S4) now computes the OB-0.5 minimum meaning contract, and nothing reads it yet. A human-labelled corpus and a real-room divergence baseline now exist. Two ways of reading the member's turn were measured head to head:

- **A** — deterministic rules only.
- **C** — hybrid: the rules first, with one structured model read for cases the rules find ambiguous.

**Recommendation: A.** Section 9 gives the reasons, which follow from the measurements. C is kept as a measured, evaluation-only option. The contract does not depend on the approach, so C can be added later without changing any consumer.

---

## 1. Verified base

| Check | Result |
|---|---|
| `origin/main` | `7e2efec6144c5f1872aa1062b8802cb75c2cd2cf` (unchanged; last commit 2026-09-23) |
| `origin/claude/spark-r0-release-gate-l7edvu` | `0e35402438b91ee0e2124f7832db13da5c1652ae` |
| Ancestry | `main` **is an ancestor** of the R0 candidate (`merge-base --is-ancestor` rc=0); R0 = `main` + 107 commits (fast-forward) |
| Newer authoritative R0 candidate? | **None.** `claude/spark-r0-foundation-landing-l7edvu` (`a4ef163a`) is its ancestor. No other R0 heads exist. |
| R0 landed on `main`? | **No.** |
| Starting branch / SHA | `claude/spark-r0-release-gate-l7edvu` @ `0e354024` |

## 2. OB-1 branch

| | |
|---|---|
| Branch | `ob1/boundary-meaning-shadow` (created from `0e354024`) |
| Ending SHA | `c1110a89fadfb676313cf91b40b67906b912a72c` (local commit on `ob1/boundary-meaning-shadow`) |
| Pushed | **No.** Pushing any branch in this repository triggers a Vercel preview build (`VERCEL.md`). The R0 precedent kept branches local until the Founder authorized a push. The complete change set ships as `OB1_boundary_meaning_shadow.patch` alongside this report. |

## 3. Files changed

**New (production code, shadow):**
- `lib/conversationBoundaryMeaning.ts` — the deterministic certain-tier reader (`readBoundaryMeaning`), `bindingTargetFor`, and `permitsFor`. Boundary is its only production caller.
- `lib/conversationBoundaryLexicon.ts` — a single leaf module with no imports. It holds the member-turn vocabulary the reader consumes.

**Changed (production code):**
- `lib/conversationBoundary.ts`
  - Contract types were added. All new decision fields are optional, so every existing constructor compiles unchanged.
  - The body of `resolveConversationBoundary` became `resolveTransition`, byte-for-byte.
  - The exported function now returns the unchanged transition, plus the meaning fields, plus `meaning:*` evidence appended at the end.
- `lib/pendingAcceptanceAuthority.ts`, `lib/conversationConfirmationGate.ts`, `lib/memberIntent/executableRequest.ts`, `lib/board/reconstructed/orchestration/classifyMemberBoardResponse.ts`
  - Their proven vocabularies were **moved verbatim** into the lexicon, and these modules now import them.
  - Behavior is identical (their own suites were run; see §12).
- `lib/internalAgent/types.ts` — one union member was added: `"member_meaning_read_eval"`. This is type-only, so the evaluation read is typed rather than cast.

**Why the vocabulary moved.** Importing the original modules into Boundary would have pulled about 2,378 modules and created a cycle back to Boundary (measured with `madge`). The leaf keeps Boundary small and cycle-free, and it means no vocabulary exists twice.

**New (certification and evaluation only; never imported by production, enforced by test):**

| File | Purpose |
|---|---|
| `lib/oneBrainCertification/corpus.ts` | Human-labelled corpus: 145 cases in 17 families, plus a 43-case holdout |
| `lib/oneBrainCertification/evaluate.ts` | Scoring. Contains no language rules |
| `lib/oneBrainCertification/modelMeaningRead.ts` | Hybrid tier: prompt, strict validator, hybrid composition, evaluation invoker |
| `lib/oneBrainCertification/roomDrivers.ts` | Drivers for real rooms plus a generic state-diff observer |
| `lib/oneBrainCertification/bakeoff.ob1.test.ts` | Corpus coverage; A and C measurements |
| `lib/oneBrainCertification/roomDivergence.ob1.test.ts` | Divergence baseline, compared against a committed snapshot |
| `lib/oneBrainCertification/shadowIsolation.test.ts` | Proves no production code consumes the contract |
| `lib/conversationBoundaryMeaning.test.ts` | Required readings, `permitsFor` fail-safe invariants, and a check that the lexicon stays a leaf |
| `scripts/ob1-model-meaning-bakeoff.ts` | **Live** gpt-4o-mini measurement, run wherever a key and network exist |

**Supporting data in `docs/reviews/ob1/`:**
- `divergence_baseline.json`
- `bakeoff_results.json`
- the archived blind model reads, with the prompt and id map used to produce them.

## 4. Final contract

Added to the **existing** `ConversationBoundaryDecision`. The existing `decision` (transition), `confidence`, `evidence`, `returnTargetId` and `suspend` fields are reused and unchanged:

```ts
relation?:  "ask" | "clarify" | "unsure" | "correct" | "decline" | "accept" | "none"
stance?:    "act" | "talk_about" | "none"
affect?:    "none" | "strained" | "distressed"
binding?:   { target: "pending" | "executed" | "referent";
              include?: string[]; exclude?: string[]; amended?: true }
meaningConfidence?: "high" | "low"
```

**Not added:** `move`, obligation or grant fields, `truthLens`, `pendingPreserved`, `command`, `hypothetical`, `think_aloud`, `pause`, `resume`, `switch`, an emotional move, or an answer move.

**One correction to OB-0.5, made deliberately: meaning certainty is a separate `meaningConfidence` field.**
- OB-0.5 proposed reusing `confidence`.
- But `confidence` is the **transition's** certainty, and the continuity and Create gates already read Boundary decisions.
- Overloading it would either change live behavior in a shadow round, or merge two different certainties: a transition can be high-confidence while the relation is ambiguous.
- `evidence` **is** reused. Meaning signals are appended as `meaning:*`, and nothing in production reads `evidence` (checked by grep).

**Two inputs added to `BoundaryTurnInput`, both optional and not yet fed by production:**
- `armedItems` — the enumerated items of an offer.
- `lastExecuted` — a receipt id.

In production shadow, partial acceptance therefore fails safe to LOW until OB-3 arms enumerated items on the spine's `expectedReply`.

**`permitsFor(decision, snapshot)`** is one pure function. **No production code calls it** (enforced). It derives:
- `mayExecute`, `executableScope` and `requiresAmendmentParse`;
- `mayHandNewRequestToCapability`;
- `mayModifyExecuted`;
- `mayStoreAsAnswer` and `mayAdvance`;
- `preservesPending`;
- the immediate `obligation`: `check_meaning`, `explain_own_last_contribution`, `answer_question`, `help_with_pending`, `apply_or_confirm_correction`, `acknowledge_and_release`, `execute_authorized_scope` or `domain_turn`.

**Fail-safe rules:**
- LOW confidence, a missing meaning, or a transition away from the thread grants nothing.
- `accept` authorizes only when all of these hold:
  - the offer was armed on the **immediately previous turn**;
  - every include and exclude id is armed and the two do not overlap;
  - stance is not `talk_about`;
  - Boundary has not switched, cancelled or returned.
- `mayExecute` is authorization meaning only. The action chain still owns slot checks, execution and read-back.

## 5. Deterministic HIGH-confidence rules

The reader picks one relation by the OB-0.5 precedence order (`clarify > ask > correct > unsure > decline > accept > none`). It returns HIGH only when the winning signal is strong **and** no safety downgrade fires.

**Where each strong signal comes from:**

| Relation | Strong signal (source) |
|---|---|
| clarify | Board `CLARIFICATION_RE` (moved), or the Create repair trigger detection's `what-do-you-mean` / `doesnt-make-sense` / explain-with-referent. "Can you explain *new content*" is weak. |
| ask | A sentence ending in "?" that is not a polite request, not a help request riding on "unsure", not a question about what a word means, and not an ability/opinion question to Spark (each of those is weak) |
| correct | Board `CORRECTION_RE`, `STATED_WRONG_RE`, `REFERENT_CORRECTION_RE`, or "I said/meant" with a "no/actually" opening or an executed/pending target. A `turnRecovery`-only correction is weak. |
| unsure | `UNSURE_RE` or Board `HELP_REQUEST_RE`, only while something is pending or Spark asked a question |
| decline | Any clause opening with the canonical decline or deferral vocabulary or "don't do X" while something is pending. Inside an acceptance, a "don't add David" clause that names an **armed** item is an exclusion, not a decline. |
| accept | A whole-message canonical yes; or, with an **armed** offer, a clause opening with an acceptance lead or an ordinal/name scope. Every part of the tail must be recognized (scope, amendment, affect, or another yes). |

**Downgrades to LOW:**
- a weak signal;
- accept + `talk_about`;
- a weak acknowledgement with affect ("Okay, I'm overwhelmed" — Round 1's rule);
- a correction with no target;
- a correction while thinking aloud;
- clarify with nothing Spark said;
- confusion-shaped text that no clarify rule matched;
- a new "act" request while an offer is armed (accept, or a new request?);
- scope not in the armed items, or include/exclude overlap;
- an unrecognized acceptance tail;
- acceptance with no armed offer.

**Affect:** `distressed` = the crisis subset of Boundary's `EMOTIONAL_URGENCY_RE` and adhdEmotionalFriction's `CRISIS_DISTRESS_RE`. `strained` = ordinary strain. Both must be the member's own (first-person or exclamative framing). Affect never replaces a relation.

**Stance:** the moved `executableRequest` restraint reasons (hypothetical, past tense, negated, thinking aloud, capability question), plus one supplement ("I'm just thinking"). The stance is `act` for an acceptance, or for a direct/imperative instruction or request to Spark at the start of any clause.

**Required examples (all pass, `conversationBoundaryMeaning.test.ts`):**

| Member | Reading |
|---|---|
| "No, I said Tuesday." | `correct` → `executed`, HIGH (never decline) |
| "I don't know what you mean. Can you explain?" | `clarify` → `pending`, HIGH (never unsure/defer/answer) |
| "I'm thinking about it, but what would it cost?" | `ask` + `talk_about` |
| "I'm frustrated, but yes, do the first one." | `accept` + `strained` + `include:[first]`, HIGH |
| "I'm falling apart. I can't do this." | `distressed`, `relation: none`; the transition stays `interrupt_and_suspend` |

## 6. Labelled corpus

- **145 cases in 17 families**, each with at least 5 paraphrases and at least 3 negative controls (enforced by test).
- The families: ask Spark · clarification · unsure + help · correction · acceptance · modified acceptance · partial acceptance · decline · discuss vs act · hypothetical · compound request · interruption · return · stale reference · current vs historical KNOW · unsupported capability · emotion combined with another relation.
- **Sources:**
  - the OB-0/OB-0.5 Founder examples;
  - the ASEA transcript (Round 1 §4.1);
  - R0 §17 executable-intent scenarios;
  - Board round-3F-5C conversational-move cases;
  - new paraphrases.
- **Labels were written from intended meaning, never by running production code.**
- **Holdout:** 43 further cases, written and labelled **after** the rules were tuned on the corpus, and never used for tuning before first contact.
- **Honesty note:** the same author wrote the labels and the rules. The labels should get a Founder / Command Center review; the corpus file is plain data and easy to review.

## 7. Real-room divergence baseline (production code, observed)

- **Method:** each room's **real exported step function** runs from its own "question/offer pending" state. The harness observes state diffs only: advanced? stored as answer? executed (store changed)? pending preserved?
- **Expected outcomes** are a human-defined table taken from the OB-0.5 contract.
- **Committed baseline:** `docs/reviews/ob1/divergence_baseline.json` (15 rooms × 8 turns = 120 cells). **61 cells diverge today.**

Key: A = advanced, S = stored as answer, X = executed/wrote, P = pending not preserved.

| Room (entry) | clarify | ask | unsure | correct | bare "Yes." | "Not now." | "I'm frustrated. What do you mean?" | real answer |
|---|---|---|---|---|---|---|---|---|
| Main Boundary (transition) | ✅ | ✅ | ✅ | ❌ ASP | ❌ ASP | ❌ S | ✅ | ✅ |
| Claire — conversation (write path only) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Claire — confirmation pending | ❌ P | ❌ P | ❌ P | ✅ | ✅ | ✅ | ❌ P | ✅ |
| Board intake | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ S | ❌ ASP | ✅ |
| Board meeting | ✅ | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ S | ✅ | ✅ |
| Events | ❌ AP (`defer`) | ❌ ASXP | ❌ ASXP | ❌ ASXP | ❌ ASXP | ✅ | ❌ ASXP | ✅ |
| Strategy Apply | ✅ | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ S | ❌ ASP | ✅ |
| Strategy Chamber | ❌ ASP | ❌ SP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ S | ❌ SP | ✅ |
| Day Designer (Plan My Day) | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ S | ❌ ASP | ✅ |
| Reminder intake | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rhythm owner — offer pending | ✅ | ✅ | ✅ | ❌ P | ✅ | ✅ | ✅ | ✅ |
| Rhythm owner — just executed | ✅ | ✅ | ✅ | ❌ XP (**Tuesday defect, observed**) | ✅ | ✅ | ✅ | ✅ |
| Create entrance | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ S | ❌ ASP | ✅ |
| Work Recognition | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ ASP | ❌ S | ❌ ASP | ✅ |
| VTS menu | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**What the baseline proves (observed, not inferred):**
- **Seven rooms store "What do you mean?" or a bare "Yes." as the member's answer and move on:** Board intake, Events, Strategy Apply, Strategy Chamber, Day Designer, Create entrance, Work Recognition. **Events also writes it to the event record.**
- **Board meeting holds a clarification but stores "Wait, why does that matter?" as the answer.**
- **Claire's confirmation parser returns `unrecognized` for a question.** The prototype then takes its decline branch (`BusinessProfileBp2aPrototype.tsx:598-607`), and the candidate is dropped.
- **The Rhythm owner (just executed) releases the item on "No, that's wrong. I said Tuesday."** and changes nothing. This is the OB-0 Tuesday defect, now observed in production code.
- **Boundary's own transition misreads the member:**
  - With an active topic, it reads every clarification/ask/unsure turn as `switch_topic`, which would park the work.
  - It treats "Yes." and "No, that's wrong…" as `answer_pending_question` for an open question.
  - It ignores `pendingOffer` entirely, so "Sounds good, go ahead" to an armed offer reads as `switch_topic`.
  - `permitsFor` correctly refuses to authorize across a switch, so safety holds. But **OB-2 must reconcile transition with relation inside Boundary.**
- **Limits:**
  - Claire's *response path* (whether she coaches on uncertainty or re-explains her question) is text-only and is **not** interpreted by the observer. Only her write path is measured.
  - The main-chat `handleSend` ordering is not driven here. The Round 1 / R0 Playwright replay method remains the tool for that.

## 8. A vs C measurements (same labelled corpus)

- **A:** the deterministic tier exactly as Boundary computes it.
- **C:** A's HIGH readings stand; A's LOW cases take one validated structured model read.
- **Model-only (reference):** every case read by the model; not a candidate.

**Model reads:**
- The build environment **could not reach `api.openai.com`** (proxy `connect_rejected`), and no key exists.
- C was therefore measured with **archived blind reads** by a separate small model (Claude Haiku 4.5). It was given only the exact production prompt and payload, with anonymized, shuffled ids and no labels.
- **gpt-4o-mini latency, tokens and live invalid-output rate are NOT measured.** `scripts/ob1-model-meaning-bakeoff.ts` produces them in one command wherever a key exists. Run without a key, it recorded 188/188 failed calls and a clean fail-safe fallback.

### 8.1 Headline (combined 188 = corpus 145 + holdout 43)

| Metric | A (deterministic) | C (hybrid) | Model-only (uncapped, reference) |
|---|---|---|---|
| Relation accuracy | **95.2%** | 94.7% | 85.1% |
| Full-contract accuracy | **94.1%** | **94.1%** | 63.8% |
| Stance accuracy | **98.4%** | 95.7% | 85.6% |
| Affect accuracy | 99.5% | 99.5% | 97.3% |
| HIGH-confidence precision | **100%** (168/168) | 95.1% (9 wrong HIGH) | 64.2% |
| Cases left LOW (Spark checks meaning) | 20 (10.6%) | **5 (2.7%)** | 1 |
| **False execution authorizations** | **0** | **0** (with the write cap, §8.4) | **5** |
| … with transition gating removed (meaning-only) | **0** | **0** | 5 |
| Missed authorizations (of 29 expected) | 7 (3 meaning-only) | 7 (3 meaning-only) | 8 |
| Fraction sent to the model under C | — | 20/188 (10.6%) | 100% |
| Routed model reads under C (20) | — | 15 used · 4 capped LOW (write-readings) · 1 invalid (restraint veto) | — |
| Model invalid-output rate (validator) | — | 1/20 (restraint veto) | 1/188 (restraint veto) |
| Latency p50/p95, tokens per read | 0 / 0 | **not measured** | **not measured** |

### 8.2 Corpus vs holdout (generalization)

| | Corpus A | Corpus C | Holdout A (**first contact**) | Holdout A (after narrowing) | Holdout C |
|---|---|---|---|---|---|
| Relation accuracy | 96.6% | 95.2% | 90.7% | 90.7% | 93.0% |
| HIGH precision | 100% | 95.1% | **94.9% (2 wrong HIGH)** | 100% | 95.1% |
| LOW cases | 13 | 3 | 4 | 7 | 2 |
| False executions | 0 | 0 | 0 | 0 | 0 |

- **First contact is the honest generalization number for A.** On unseen phrasings, rules alone were HIGH-and-wrong twice:
  - "What does 'audience' mean here?" was read as `ask`;
  - "I don't get what you mean by a Rhythm." was read as `none`.
- Both rules were then **narrowed to fail safe, not extended with phrases**:
  - a question about what a word means → LOW;
  - confusion-shaped text that no clarify rule matched → LOW.
- On novel text, A's and C's HIGH precision are therefore about the same (about 95%). C's advantage is fewer LOW turns.

### 8.3 By relation (combined; precision / recall)

| Relation (support) | A | C | Model-only |
|---|---|---|---|
| ask (37) | 0.947 / 0.973 | 0.902 / 1.000 | 0.786 / 0.892 |
| clarify (14) | 0.923 / 0.857 | 1.000 / 0.857 | 1.000 / 0.786 |
| unsure (10) | 1.000 / 0.900 | 1.000 / 0.900 | 0.800 / 0.400 |
| correct (12) | 0.923 / 1.000 | 1.000 / 1.000 | 1.000 / 0.833 |
| decline (11) | 0.917 / 1.000 | 1.000 / 1.000 | 1.000 / 0.909 |
| accept (37) | 0.947 / 0.973 | 0.941 / 0.865 | 0.824 / 0.757 |
| none (67) | 0.969 / 0.940 | 0.942 / 0.970 | 0.842 / 0.955 |

**The confusions that matter (rows = label, combined):**

| Confusion | A | C |
|---|---|---|
| clarify → ask | 1 | 2 |
| clarify → none | 1 | 0 |
| unsure → ask | 1 | 1 |
| correct → decline | **0** | **0** |
| decline → correct | 0 | 0 |
| accept → none | 1 | 4 |
| none → accept | 2 (all LOW, no armed offer) | 2 |

The full matrices are in `docs/reviews/ob1/bakeoff_results.json`.

### 8.4 The finding that decided the safety design

- In C's first run, the blind model read **"Okay, I'm overwhelmed."**, with a fresh offer armed, as a **well-grounded acceptance**. Its evidence quotes were exact, so it **passed the strict validator**.
- `permitsFor` would have **authorized execution**. This is exactly the Round 1 trap.
- Validation alone cannot make a model safe to authorize with. **Fix (kept):** a model reading that would unlock a write is capped at LOW. That covers an `accept`, a `correct` of an executed item, or a new `act` request. **Only the deterministic tier authorizes writes.**
- Under the cap, C has 0 false executions. Uncapped, the model alone produced 5.
- The binding **target** for non-accept relations is also now derived from the snapshot (`bindingTargetFor`), never taken from the model.

## 9. Recommendation: **A — consolidated deterministic**

## 10. Why

1. **Safety is decided by the deterministic tier either way.** §8.4 proved a model read cannot be allowed to authorize anything. So C's model can only raise confidence on relations that *hold* (clarify / ask / unsure / decline / plain statements). For those, A's LOW outcome is already safe and member-visible as "Spark checks what you meant". Nothing runs and nothing is stored.
2. **C buys fewer checks and pays with confident mistakes.** C cuts LOW turns from 10.6% to 2.7%. But its HIGH precision drops from 100% to 95.1%: 9 wrong HIGH readings, such as clarify read as ask, or a scoped acceptance read as none. A confident wrong reading is worse than a check, because the member cannot see it happen.
3. **No accuracy gain.** Full-contract accuracy is identical (94.1% vs 94.1%), and relation accuracy is 95.2% vs 94.7%. On novel holdout text C's relation accuracy is higher (93.0% vs 90.7%), but its HIGH precision is the same as A's first contact (about 95%).
4. **Architecture cost of C is real and measured:**
   - Boundary is **synchronous and client-side** (`CompanionPageClient.tsx:16586`), before about 180 local fast-path returns.
   - C would need an async pre-step and a **new authenticated server route**; the unauthenticated `/api/claire-reasoning` is the standing lesson.
   - It would also need a latency budget on every ambiguous turn and a network/key failure path.
   - The live gpt-4o-mini latency and cost are **unmeasured** here, and the proxy model is not the production model.
5. **A is testable and deterministic.** It is unit-certified: HIGH precision is an enforced test, not a statistic. The corpus and holdout become regression gates for every convergence round.
6. **Nothing is foreclosed.**
   - The contract is tier-agnostic, and consumers read only `meaningConfidence` and `permitsFor`.
   - C's validator, write cap, prompt and live script are in the repo.
   - **Revisit C only if** Founder testing shows the LOW "check meaning" rate is too high in real transcripts; for example, more than about 10% of turns while something is pending. Measure it live first with `scripts/ob1-model-meaning-bakeoff.ts`. Even then, keep the write cap.

**What A must not become:** a growing phrase list. OB-1 narrowed rules to **fail safe** (LOW) when evidence was ambiguous, instead of adding phrases. Future misses go to LOW and a certification row, never to a new regex alternative, unless the pattern is structural and proven across a paraphrase family.

## 11. False-execution proof

| Proof | Result |
|---|---|
| Corpus, A: `permitsFor(...).mayExecute` where the label says no | **0** |
| Holdout, A | **0** |
| Corpus + holdout, C (validator + write cap + `permitsFor`) | **0** |
| Same, with the transition neutralized (proves the zero is not an artifact of today's `switch_topic` misreads) | **0** (A and C) |
| LOW confidence can execute? | **No.** `permitsFor` returns nothing for LOW or missing meaning (unit-tested) |
| Partial acceptance of an item not in the armed offer? | **No.** Unarmed ids or include/exclude overlap → no execution (unit-tested); no enumerated items → LOW |
| Stale offer (not armed on the previous turn)? | **No** (unit-tested; corpus `stale_reference` family) |
| Can the model authorize? | **No.** Model write-readings are capped at LOW; the model never outputs permissions (forbidden keys are rejected) |
| Does any production path call `permitsFor`? | **No** (`shadowIsolation.test.ts`) |

## 12. Tests, build, typecheck

| Check | Result |
|---|---|
| Boundary pre-turn snapshot purity (`conversationBoundaryPreTurnSnapshot.test.ts`) | **Green** |
| Existing Boundary suites (`conversationBoundary`, `…SlotFill.s4_1`, `…PreTurnSnapshot`) | **Green** (38/38) |
| Transition unchanged: old vs new `resolveConversationBoundary` on 252 inputs (the whole corpus plus every situation in every context) | **Identical** decision, confidence, return target, suspend flag and original evidence |
| Owners of the moved vocabulary (16 files, 250 tests: confirmation gate, pending acceptance, `executableRequest`, `executableIntent.round1`, R0 subject/cadence, Board round-3F-5B/5C, acceptance-compliance suites) | 247 pass. The **3 failures are identical on the untouched base** (2 in `pendingAcceptanceAuthority.test.ts`, 1 Board 20 s timeout) |
| New OB-1 suites | **Green**: `conversationBoundaryMeaning.test.ts`, `bakeoff.ob1`, `roomDivergence.ob1`, `shadowIsolation` |
| **Full suite, base vs OB-1** (same environment) | Base: 20,634 tests, 459 failing (464 failing ids, all pre-existing). OB-1: 20,665 tests (+31 new), 459 failing. **Failing-id set identical → 0 new failures, 0 fixed** |
| **TypeScript** (`tsc --noEmit`) | **353 errors on both; identical (file, code) multiset → 0 new** |
| ESLint on every changed or new file | **0 errors, 0 warnings** |
| `next build` | Not run. `next.config.ts` sets `ignoreBuildErrors`, and no build-affecting config changed; typecheck is the stronger signal here |

## 13. Zero member-visible behavior change

- **No consumer reads the new fields.**
  - `shadowIsolation.test.ts` scans `app/`, `components/`, `lib/` and `proxy.ts`.
  - It asserts that no production file imports the meaning module or the harness, calls `permitsFor`/`readBoundaryMeaning`, or reads `relation`/`stance`/`affect`/`binding`/`meaningConfidence` off a Boundary decision.
  - Boundary is the only caller of the reader.
- **Transition is byte-identical** (the 252-input differential above).
- **Evidence gains `meaning:*` entries only at the end.** No production code reads Boundary `evidence` (grep across all consumers).
- **The moved vocabularies are the same regex literals**; their owning suites are unchanged.
- **No room behavior, workflow advancement, pending binding, action execution, knowledge retrieval, calendar, project/event capability or Tuesday runtime fix was changed.**
- **Runtime cost:** one pure regex pass per turn inside Boundary; no I/O.

## 14. Adversarial self-review

| Question | Answer |
|---|---|
| Did I create a second brain? | No. The reader is a component of Boundary (the only caller); its outputs are fields on the existing decision; `permitsFor` lives in the Boundary module. |
| Did I duplicate Boundary transition? | No. pause / resume / switch / cancel stay transitions. The meaning reader never emits them. Transition is byte-identical (differential). |
| Did I make emotion exclusive again? | No. `affect` is a modifier and co-exists with every relation ("I'm frustrated, but yes, do the first one" → accept + strained). The **existing** transition still makes "overwhelmed" an interruption; that is recorded as an OB-2 reconciliation, not changed in shadow. |
| Did I centralize a brittle pile of regexes? | Partly, and deliberately bounded. The vocabularies were **moved, not copied**; ten small structural patterns were added (listed in the lexicon's "New in OB-1" section). The holdout shows the brittleness honestly (94.9% first contact). The mitigation is fail-safe LOW, not more phrases. |
| Did the model gain authority? | No. It exists only in evaluation code. Its write-readings are capped at LOW, forbidden permission keys are rejected, and its binding target is replaced by the deterministic one. |
| Can LOW confidence ever execute? | No (unit-tested). |
| Can partial acceptance authorize an unarmed item? | No (unit-tested). With no enumerated items it is LOW. |
| Can "No, I said Tuesday" still become decline globally? | Not in the Boundary reading (`correct`, HIGH, tested). The **Rhythm owner still does it at runtime** (observed baseline row). Fixing it is OB-4 scope, not OB-1. |
| Can "what do you mean?" still become an answer? | Not in the Boundary reading (`clarify`). **Seven rooms still store it** (observed baseline); OB-2 flips those rows. |
| Did the harness simulate rather than observe production? | It observes. Drivers call real exported step functions and diff real state. The observer has no language rules. Two limits are stated in §7: Claire's response path is not interpreted, and `handleSend` ordering is not driven. |
| Did I change member behavior in a shadow round? | No (§13). |
| Is Boundary still small enough to be the parent? | Boundary + reader + lexicon = about 1,445 lines (553 + 685 + 207) against `handleSend`'s ~8,700. It holds no domain vocabulary, slots, answers or execution. |
| Anything I could not verify? | Live gpt-4o-mini behavior, latency and cost (network blocked). The corpus labels are single-author. Real-browser page ordering was not replayed in OB-1. |

## 15. Recommended OB-2 scope — **not implemented**

**OB-2 — Hold-and-answer through `permitsFor` (the first behavior change)**

- **Purpose:** no room advances over, or stores, a clarification, a question, "I don't know + help", a correction, or a bare "yes" to an open question. Spark answers first and the pending item survives.
- **Authority converged:** DECIDE (`permitsFor.mayStoreAsAnswer` / `mayAdvance` / `obligation`) — the OB-0.5 "Advancement Gate", generalized from D3.

**Scope:**

1. **Boundary transition reconciliation, inside Boundary only.** When `relation ∈ {clarify, ask, unsure, correct}` with HIGH meaning and a pending item, the transition must not be `switch_topic` or `answer_pending_question`; it becomes `continue_current_topic` (hold). A bare "yes" or a correction is never `answer_pending_question` for an open question. This one change flips the Main Boundary row and protects the continuity and Create gates that already read the transition.
2. **One room adapter.** Each listed room calls `resolveConversationBoundary` with its own pending question (the same entry point) and obeys `permitsFor` before advancing or storing:
   - Board intake;
   - Board meeting (ask/unsure/correct rows);
   - Events;
   - Strategy Apply;
   - Strategy Chamber;
   - Day Designer;
   - Create entrance;
   - Work Recognition;
   - Claire confirmation — a question during confirmation holds the candidate instead of taking the decline branch.

   Rooms keep their own domain answers and explanations. On `explain_own_last_contribution` the room re-explains its own question.
3. **Kill switch:** `NEXT_PUBLIC_BOUNDARY_MEANING_HOLD=0` restores the previous advance rules.

**Not in OB-2:** pending-binding unification (OB-3); the receipts log and the Rhythm correction fix (OB-4); new capabilities (OB-5); the KNOW lens (OB-6); any model tier.

**Tests:**
- in `divergence_baseline.json`, the clarify / ask / unsure / strained-clarify / bare-yes rows for every listed room flip to ✅, and the rows update deliberately;
- the corpus/holdout gates stay green (HIGH precision 100%, false executions 0);
- full-suite delta 0;
- `tsc` multiset unchanged.

**Founder proof (live preview):** the exact OB-0 sentence — "I don't know what you mean. Can you explain that before we keep going?" — in Main chat, Claire, Board intake, Events, Strategy, Create, Plan My Day and Reminder intake. In each, Spark explains, the process holds, and the next turn resumes the same question.

**Promotion gate:** the flipped baseline rows plus a Founder pass. **Rollback:** the kill switch, or a revert.

**Stop condition:** do not touch pending binding or action execution.

---

*OB-1 complete. Shadow only. Not merged. Not deployed. OB-2 not started.*
