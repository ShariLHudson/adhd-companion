# BRAIN SPARK ESTATE™ — OB-5 Final Connection Cleanup
## Return report

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Branch (isolated) | `ob5/final-connection-cleanup`, cut from the OB-5C commit; **not merged, not deployed** |
| Starting SHA | `a51f7229` (OB-5C, certified 326/326) |
| Ending SHA | **`2dca87e4`** (pushed to `ob5/final-connection-cleanup`) |
| OB-6 | **Not started** |

**Scope kept.** This round built no new room, capability, router, catalog, specialist, agent or knowledge system. Every repair is one of three kinds:
- a structural fix inside an **existing owner's** recognizer;
- the One Brain read path reading an existing owner signal;
- a Founder ownership rule in capability selection.

The read-path guard test ("no member vocabulary in the read path") still passes. In this round it caught a regex I had first placed in the read path, and that regex was moved into its owner.

---

## 1. Visual Thinking: root cause and repair

**Root cause.** Visual Thinking's intent lived in four overlapping literal-phrase regexes, and none of them models the meaning:

| Regex | File |
|---|---|
| `VISUAL_RECOMMEND_INTENT_RE` | `lib/visualRecommendationEngine.ts` |
| `PATH_B_RECOMMEND_RE` (a duplicate of the first) | `lib/visualThinkingOverreach.ts` |
| `VISUAL_THINKING_ALLOW_RE` | `lib/visualThinkingOverreach.ts` |
| `CONVERSION_RE` | `lib/visualThinkingStudio.ts` |

Each regex listed exact wordings ("show me this visually", "organize this visually", "help me see this more clearly"). So "I need to see **this** visually" and "Help me think this through visually" matched nothing: the verb was "see"/"think" instead of "show"/"organize", or a word sat in between.

**Repair (structural, in the owner).** In `lib/visualThinkingOverreach.ts`, the file whose stated job is "Visual Thinking only when the user wants to SEE something", I added `expressesVisualThinkingIntent()`. It recognizes the meaning in four shapes:

| Shape | Examples |
|---|---|
| **visual manner**: a thinking / seeing / arranging verb + `visually` | see / think / organize / lay out … visually |
| **spatial layout** of the member's own material | lay / map / sketch this out |
| **seeing relations** between parts | see how these pieces fit / connect / relate |
| **the member's way of thinking** | I think / work / understand better when I can see it |

The manner adverb must attach to a thinking verb. So "my website looks visually cluttered" (a description of content) and "create a visual for my post" (an asset request) never match.

- `isExplicitVisualThinkingRequest()`, the owner's canonical allow check, now includes this meaning. So the studio's **own** recommendation gate (`detectVisualRecommendationIntent`) agrees with One Brain; nothing downstream is special-cased.
- The One Brain read path reads the same function and tags it `manner: "visual"`. That makes the visual intent *specific* for ranking, so it competes fairly with other specific owners.

**Paraphrase family: all 10 recognized, offered, and "yes" hands off (certified).**
- "I need to see this visually."
- "Help me think this through visually."
- "Can you help me think this through visually?"
- "Can you show this to me visually?"
- "I think better when I can see it."
- "Can we map this out?"
- "Help me visualize this."
- "I need to organize this visually."
- "Could we lay this out visually?"
- "I'd like to see how these pieces fit together."

**Negative controls: none reach Visual Thinking (14, certified with the expected owner).**

| Sentence | Owner instead |
|---|---|
| "I need to see the doctor tomorrow." | Reminders |
| "Show me my projects." | — (navigation seam) |
| "Can you show me my reminders?" | — (discussion) |
| "I want to create an image for my Instagram post." | Create |
| "Create a visual for my social media post." | Create |
| "Our brand visuals need a refresh." | — |
| "Let me see what I can do." | — |
| "Take me to the Board Room." | — (navigation seam) |
| "The board wants to see the numbers." | Board |
| "I can't see the button on my screen." | — |
| "My website looks visually cluttered." | — |
| "I need a map of the venue for my event." | — |
| "What is a mind map?" | Research (learn, not build) |
| "Write a blog post about visual thinking." | — (Create's Work Recognition seam) |

**Remaining Visual Thinking break (reported, not built around).** See §7: the studio opens, but the conversation's content does not arrive in it.

---

## 2. Business model: ownership proof

**Previous break.**
- "Let's look at / Show me my business model" was taken by the Visual Thinking recommendation rule `business-ecosystem-map`.
- "I want to work on / update my business model" was taken by Claire's navigation regex, because "work on / update my **business**" is a *prefix* of "my business model".
- Nothing gave the Living Model Canvas its own object.

**Repair.**
- **The LMC's object noun comes from the canonical terminology registry.** The entry is `concept.living-business-model` = "Living Business Model"; the object noun is that term without "Living", i.e. "business model". It is derived, not typed.
- **Naming that object makes the LMC the named owner.** Named precedence beats both Claire's prefix and the Visual Thinking rule.
- **Exploring instead goes to Claire.** Exploring means One Brain's own meaning: `UNSURE_RE`, `MEMBER_HELP_REQUEST_RE`, or the new lexicon entry `TALK_IT_THROUGH_RE`. It applies when the subject is the business itself:
  - one of Claire's *identity* topics (My Business, People I Help);
  - the member's business as the grammatical subject of a state or change (`namesOwnBusinessAsSubject`, in Claire's entry recognizer `lib/businessEstateNavIntent.ts`);
  - or the business model itself in doubt.
- **Claire's shared topics keep their other owners.** Pricing, offers and direction still go to the Strategy Chamber and others.
- **Claire's own topic patterns now cover other grammatical forms of the same subject.** "who I'm really serving" joins "who do I help"; "what my business really is" joins "what my business does". This is the same kind of inflection fix as the Events one in OB-5C.
- **Claire → LMC.** After Claire's confirmed change in an area the canvas itself projects (the LMC's own `LMC_TO_PROFILE_AREA` map), Spark offers "Want to see how that fits in your Living Model?" and arms `capability:lmc`. People I Help keeps its Avatar Builder offer. Inside Claire, her existing continuation (`resolveContinuationOffer` → `lmc`) and the canvas's "Back to Claire" already carried the hand-off both ways.

| Member says | Result (certified) |
|---|---|
| Let's look at my business model. | **LMC** opens (execute `lmc_open`) |
| I want to work on my business model. | **LMC** |
| Show me my business model. | **LMC** |
| I need to update my business model. | **LMC** |
| Can you update my business model with the new offer? | **LMC** (offered: a question form gives low meaning) |
| I'm not sure what my business really is anymore. | **Claire**, My Business, purpose explore |
| Help me figure out what my business does. | **Claire**, My Business, explore |
| I don't know who I'm really serving. | **Claire**, People I Help, explore |
| I think my business is changing and I need to talk it through. | **Claire**, My Business, explore |
| I'm not sure my business model works anymore. | **Claire** (business model + uncertainty = exploring) |

**Duplicate authority retired.** "Business model" is no longer claimed by Visual Thinking's `business-ecosystem-map` rule or Claire's navigation prefix. The rule stays inside the studio for its own recommendations.

---

## 3. Big decision: ownership proof

**Previous break.**
- "I can't decide whether I should do this." is held as discussion (stance `talk_about`), so no owner was ever considered.
- No Board recognizer covered deliberation.
- "Strategy" words always produced a Chamber-vs-library ask. The Strategies library's patterns include a bare `/\bstrateg(y|ies)\b/`, yet the Strategies panel holds **both** doors (ADHD Strategies and Business Strategies), and the Chamber *is* the business door.

**Repair.**
- **Deliberation belongs to the Estate's decision recognizer.** It lives in `lib/decisionCompassRouting.ts` as `isOwnDecisionDeliberation`, which is true when:
  - there is a decision signal, or uncertainty about deciding / whether to act;
  - it is about **this** (the conversation's subject) or the member's **own** affairs;
  - and it is **not** a two-option pick. "X or Y" stays with the Decision Compass seam, whose job that is.
- **This is a Board *offer* (catalog strength).** The invite is itself the short clarification. The Estate's "big decision" place (`impliedEstatePlaceMatch` → round-table) is tagged as a significant deliberation too.
- **Discussion exception, Board only.** When a turn is held as discussion *and* it is a deliberation, the Board may be **offered** (`confirm`): never routed, never executed. Every other owner stays silent in a discussion. "I'm thinking about changing my Rhythm." still produces nothing.
- **Strategy ownership.**
  - The member using the Chamber registry's own family noun ("… strategy") is **explicit strategy work** → Chamber.
  - The library keeps only its **ADHD-strategy** signal. A library pattern that also matches the neutral "business strategy" is the shared word; one that doesn't ("ADHD strategy", "playbook") is the library's own.
  - When the member names ADHD strategies, the Chamber yields.
- **Both explicit** (a big decision *about* a strategy) → one short choice between the Board and the Chamber.

| Member says | Result (certified) |
|---|---|
| I have a big decision to make. | **Board** offered (invite) |
| I need several perspectives on this. | **Board** |
| Help me think through a major business decision. | **Board** |
| I can't decide whether I should do this. | **Board** offered, from a discussion turn; never executed |
| I can't decide whether to raise my prices. | **Board** (Strategy's pricing *topic* yields to the decision) |
| I need a strategy for launching this. | **Strategy Chamber** (was a Chamber/library ask) |
| Let's work through my pricing strategy. | **Strategy Chamber** |
| Help me develop a growth strategy. | **Strategy Chamber** |
| I want to rethink my strategy. | **Strategy Chamber** |
| I have a big decision about my pricing strategy. | **Short choice**: Board or Strategy Chamber |
| I prefer ADHD strategies for focus. | **Strategies library** |
| *Controls:* I can't decide what to have for lunch. / I'm not sure whether this is the right file. / Should I hire a VA or a bookkeeper? | **not the Board** |

The OB-5C tests that pinned the old Chamber-vs-library *ask* were updated to the Founder decision (stronger ownership, documented in-line). The ask mechanism itself is still certified with a genuinely ambiguous sentence: "Can you help me see my pricing strategy visually?".

---

## 4. Precedence: adversarial results (all certified)

| Combination | Sentence | Result |
|---|---|---|
| Business model + uncertainty | I'm not sure my business model works anymore. | Claire (explore) |
| Business model + update | Can you update my business model with the new offer? | LMC |
| Strategy + big decision | I have a big decision about my pricing strategy. | Short choice: Board / Chamber; choosing plans exactly that owner; an owner not offered → never |
| Board named + strategy topic | What does the board think about my pricing strategy? | Board (named precedence) |
| Visual + strategy | Can you help me see my pricing strategy visually? | Short choice: Chamber / Visual Thinking |
| Visual + event | I'm planning a workshop and want to map it out visually. | Short choice: Events / Visual Thinking |
| Weak visual + event | Help me visualize my event timeline. | Events |
| Visual + saved project | Can we map out my Spring Launch project visually? | Projects (the saved object outranks) |
| Saved project + another topic | What's next on my Spring Launch project? | Projects |
| Visual + Create | Create a visual for my social media post. | Create (Visual Thinking never steals it) |
| Claire + ideal client | I'm not sure who my ideal client is anymore. | Claire |
| Avatar Builder + ideal client | Help me update my client avatar with what I learned. | Avatar Builder |
| No choice loop | a stale "yes" after a choice | never executes; the choice binds once |

**Precedence order (unchanged, now fully exercised):**
1. The member **names** an owner (the Board, the avatar, the Living Model, ADHD strategies).
2. A **saved object** (a named saved project).
3. **Specific** recognitions (event type, strategy type, Claire area, visual manner).
4. Topic / catalog signals.

Create yields to any other owner. Two specific owners that are both explicit → one short choice.

---

## 5. The connected capability set (certified matrix)

**Legend.**
- **U**nderstand = the selection.
- **C**onnect = the owner's existing entry point.
- **D**ecide = route / offer / defer.
- **H**andoff = what the owner receives.
- **R**eturn/continue = how the member comes back and carries on.
- ✅ proven here; ◐ proven with a fixture (no model locally); ✖ does not exist.

| Capability | Ordinary sentence (certified) | U·C·D·H | Return / continuation | Status |
|---|---|---|---|---|
| **Claire** | "I need to update what my business does." | ✅ Claire opens on the area with the member's words (browser) | ◐ Confirmed write → receipt in chat → correction goes back to Claire (OB-5/5C). New: offers the LMC or Avatar Builder afterwards | **Connected** |
| **Avatar Builder** | "Help me build my client avatar." | ✅ kickoff; shared store with Claire | Result stays in the Builder; ↔ Claire offers both ways (OB-5C). ✖ no chat summary | **Partially** |
| **Living Model Canvas** | "Let's look at my business model." | ✅ opens straight onto the canvas (browser) | ✅ "Back to Claire"; back to chat, the same conversation continues (browser). ✖ no chat summary | **Partially** |
| **Board** | "I have a big decision to make." | ✅ invite → clarification kept → "yes" → Board Room review with the member's words as the decision (browser) | ◐ Board return in chat and Board → Research → back to the Board (OB-5C, fixture: deliberation needs the model) | **Connected** |
| **Research** | "Research this for me." | ✅ Library with the question (browser, OB-5C) | ◐ provenance return in chat (tests); live research not exercised (no key) | **Connected** |
| **Projects / Project Home** | "What's next on my Spring Launch project?" | ✅ grounded next step in chat | ✅ Project Home (browser, OB-5) | **Connected** |
| **Events** | "I'm planning an event and don't know where to start." | ✅ Events opens with the words and asks its own question | ✖ Events' result is not summarized into chat | **Partially** |
| **Strategy Chamber** | "I need a strategy for launching this." | ✅ Chamber opens with "Thinking through: I need a strategy for launching this." (browser) | Back to chat, the conversation continues (browser); the conclusion returns only via the Chamber's `onAsk` | **Partially** |
| **Plan My Day** | "Help me plan my day." | ✅ Day Designer's first question in chat | ✅ runs in the conversation | **Connected** |
| **Visual Thinking** | "I need to see this visually." | ✅ recognized (new), offered, the studio opens (browser) | ✖ the studio does **not** receive the conversation ("Already brought in: Nothing yet"); back to chat, the conversation continues (browser) | **Partially** |
| **Rhythms** | "I want to review my numbers every Monday at 9am." | ✅ defers to the Remember owner (its seam acts) | ✅ receipt + correction + "this" referent (OB-4 / OB-5C) | **Connected** |
| **Create** | "Help me write a blog post about burnout." | ✅ defers to Create's Work Recognition seam; Create yields to every other owner | ✅ Create's own discovery in chat | **Connected** (through its own seam) |

The adapter rows for Events, Strategy Chamber, Visual Thinking, Avatar Builder and LMC now say `partially_connected` (they previously said `connected`). Visual Thinking's row, offer text and acknowledgement no longer promise "with what you're working through".

---

## 6. Browser proof

**Method.** Real Chromium (Playwright) driving `next dev --webpack` on the ending code. The Vercel preview (`*.vercel.app`) is still blocked by this environment's network policy (proxy 403), so the same local method accepted for OB-5C was used.

**Three kinds of proof, kept separate:**

1. **Routing / handoff: browser, real UI, no fixtures.**

   | Member says | What happened | Continuation after the handoff |
   |---|---|---|
   | "Let's look at my business model." | My Business Estate opened **directly on the Living Model Canvas** (all nine areas, "Back to Claire") | Closed → chat → "What else can we look at in my business?" → Spark answered in the same thread |
   | "I'm not sure what my business really is anymore." | **Claire** opened with the sentence already in her conversation and replied "Absolutely — let's look at my business. What comes to mind first?" | Back to chat → continued |
   | "I have a big decision to make." | **Board** invite in chat → "yes" → "Begin discussion" → "Okay, let's start." → **Board Room · Review**, Decision = "I have a big decision to make." | Board return to chat: see kind 2 |
   | "I can't decide whether I should do this." | **Board** invite. Clarification "What would that involve?" answered, **invite kept**; "yes" → Board Room review with the member's sentence | — |
   | "I need a strategy for launching this." | Offer → "yes" → **Strategy Chamber**: "Thinking through: I need a strategy for launching this." | Back to chat → continued in the same thread |
   | "I need to see this visually." / "Help me think this through visually." | Offer → "yes" → **Visual Thinking Studio** ("What are you working with?") | Back to chat → "Okay, where were we?" → answered in the same thread. **Studio intake was empty** (the §7 gap) |

   Screenshots: `docs/reviews/ob5-final/browser/`.

2. **Fixture-assisted downstream proof (from OB-5C, unchanged).** Records written with the repo's own builders, never presented as model output:
   - Claire's confirmed write → return → receipt → correction;
   - the Board's certified deliberation → return in chat → Board → Research → "Research came back";
   - research findings → provenance return.

3. **Needs a live model; not exercised here:**
   - Claire's reasoning write (`/api/claire-reasoning`);
   - Board deliberation;
   - live research (`/api/research-live`);
   - the chat model's own replies. Continuation replies above came from the local fallback; the *thread* continuity is what is proven.

   The page's active-topic tracker is also not populated without the model, so the "this" referent could not be shown in the browser.

**Unrelated UI defect found:** the global **wall-clock timer button sits over the Visual Thinking Studio's "Close" button**. A pointer click hits the clock. The browser proof used a DOM click. Recorded in §9 and not fixed.

---

## 7. Remaining connection gaps (first broken connection, why)

1. **Visual Thinking does not receive the conversation.** The studio's capture-first front door (`LooseThinkingCapture`, "Already brought in") reads sources from exactly one bridge: Research's visual handoff (`bridgeResearchVisualHandoff`). The chat path (`completeVisualThinkingOpen`) seeds either the Mind Map discovery interview, which is not rendered on the capture-first front door, or a `contextTransfer` map. **Neither populates the capture front door's sources**, so the conversation never arrives. Fixing this means a chat → studio source bridge on the pattern of the Research bridge. That is new construction, so it was not built around here.
2. **Result summaries into chat** do not exist for Events, the Strategy Chamber (except `onAsk`), the Avatar Builder, the LMC and Visual Thinking. The member continues, but Spark cannot say what came out.
3. **"This" referent without the model.** The active-topic tracker is model-fed, so locally "this" resolves to the member's request.

**Intentionally requires clarification (by design):**
- strategy + big decision;
- visual + strategy;
- visual + event;
- a deliberation about "this" (the Board offer *is* the clarification);
- low-confidence meaning (offer instead of jump).

**Still disconnected capabilities:** none of the twelve. Every one is reachable from ordinary conversation and hands off to its existing owner.

## 8. Genuinely missing

**None new.** Unchanged from OB-5C and not built:
- external calendar / email write;
- chat file upload into research.

---

## 9. Known unrelated defects (recorded, not fixed)

| Defect | Evidence |
|---|---|
| Timestamp-ID collision under load | `lib/pendingChoice/manager.ts:65` `${type}-${Date.now()}` (from OB-5C) |
| Wall clock covers the Visual Thinking "Close" | browser: `elementFromPoint` at Close returns `global-quick-timer__trigger` |
| "I'll see you tomorrow." / "I need to see the doctor tomorrow." are claimed by the Remember owner as reminders | pre-existing Remember classification |
| "I'm juggling a course launch, a podcast, and three client projects…" draws a Visual Thinking offer | pre-existing `course` recommendation rule; identical on `a51f7229` |
| "I want to see how my launch project is going." → Events | pre-existing Events goal detector ("launch") |
| Ten frictionless / report-writer tests | failing on the base too |

---

## 10. Certification

**One Brain certification (`lib/oneBrainCertification`): 9 files, 398 / 398 pass.**

| File | Tests |
|---|---|
| bakeoff.ob1 | 15 ✓ |
| roomDivergence.ob1 — **room divergence 0 / 285**; the committed baseline is unchanged | 3 ✓ |
| roomHold.ob2 | 49 ✓ |
| oneBrainConsumers (includes the "no vocabulary in the read path" guard) | 19 ✓ |
| pendingBinding.ob3 | 85 ✓ |
| receiptCorrection.ob4 | 66 ✓ |
| capabilityConnect.ob5 | 45 ✓ |
| connectionCompletion.ob5c | 44 ✓ |
| **finalConnection.ob5f (new)** | 72 ✓ |

**False actions: 0.** Every selection, offer, clarification and acceptance in `finalConnection.ob5f` leaves all member stores byte-identical, including discussion and negative controls.

## 11. Full suite / TypeScript / lint

| Check | Base `a51f7229` | Ending `2dca87e4` | Delta |
|---|---|---|---|
| Full Vitest suite | 20,978 tests · 460 failing | 21,050 tests · 456 failing | **0 new failures**; +72 tests |
| TypeScript (`tsc --noEmit`, file + code multiset) | 353 | 353 | **identical** |
| ESLint (all 13 changed files) | 152 | 152 | **0 per file/rule changes** |
| Room divergence | 0 / 285 | 0 / 285 | unchanged |

**Four base failures passed in this run.** They are **not claimed as fixes**; none is in code this round touches:
- `numberedChoiceResolution` is the known `Date.now()` ID collision, which passes when timing allows;
- `arrivalExperience` ×2 and `livingRoomChatCanvas` are time-dependent.

**Owner suites for every touched owner** (visual*, decisionCompass*, businessEstateNavIntent, businessProfileFounder, conversationBoundary, frictionlessActionLayer): 1,679 pass. The 10 failures there are all base failures.

---

## 12. Exact files changed (`a51f7229` → ending SHA)

| File | Change |
|---|---|
| `lib/visualThinkingOverreach.ts` | `expressesVisualThinkingIntent()` (structural meaning); read by `isExplicitVisualThinkingRequest` |
| `lib/oneBrainCapability/readPath.ts` | LMC object from the terminology registry; Claire exploring; visual-manner detail; ADHD-library signal; strategy `explicit`; Board deliberation (reads owner functions only) |
| `lib/oneBrainCapability/selectCapability.ts` | Founder rules: strategy library/Chamber, deliberation → Board, both explicit → ask; Board offer from a discussion turn |
| `lib/oneBrainCapability/handoffs.ts` | `lmcOfferAfterClaire()`; honest VTS offer text |
| `lib/oneBrainCapability/connections.ts` | honest `partially_connected` rows; VTS return and "cannot" |
| `lib/decisionCompassRouting.ts` | `isOwnDecisionDeliberation()` (the decision owner's structure) |
| `lib/businessEstateNavIntent.ts` | `namesOwnBusinessAsSubject()` (Claire's subject) |
| `lib/businessProfileFounder/claireTopicResponses.ts` | People I Help / What my business is: other grammatical forms of the same subject |
| `lib/conversationBoundaryLexicon.ts` | `TALK_IT_THROUGH_RE` (new export, used only by One Brain) |
| `app/companion/CompanionPageClient.tsx` | Claire return → LMC offer; VTS acknowledgement text |
| `lib/oneBrainCertification/finalConnection.ob5f.test.ts` | **new**, 72 tests |
| `lib/oneBrainCertification/capabilityConnect.ob5.test.ts`, `connectionCompletion.ob5c.test.ts` | pinned OB-5C gaps and the pre-decision ask updated to the Founder decisions |

Patch: `docs/reviews/ob5-final/ob5-final-connection-cleanup.patch`.

---

## 13. Can a member now reasonably talk to Spark without knowing which room to choose?

**Yes for getting to the right place. Not yet fully for coming back.**

Evidence from the certified matrix:
- **Reach and decision: 12 / 12 capabilities.** Each one is reached from ordinary sentences, with the Founder ownership decisions and precedence certified across 72 new tests, including negative controls and adversarial pairs.
- **Clarification only where both owners are explicit.** In those cases Spark asks one short question instead of guessing.
- **The member never names a room** in any certified sentence.
- **Return / continuation.**
  - **7 connected**: Claire, Board, Research, Projects, Plan My Day, Rhythms, Create.
  - **5 partially connected**: Avatar Builder, LMC, Events, Strategy Chamber, Visual Thinking. The member can always come back and carry on in the same conversation, but Spark cannot yet say what came out of those rooms.
- **Visual Thinking** is the one place where the member must **re-enter context**: the studio opens empty (first broken connection, §7.1).

## 14. Recommended OB-6 starting point (not started)

**OB-6 — Unified Knowledge Access (KNOW), audit first.**
1. Start from the one gap class this matrix leaves open: **results that exist in owner stores but that One Brain cannot read back**:
   - Events records;
   - Strategy work items (`strategyWorkItemStore`) and `strategicMemoryStore`;
   - Visual Focus maps and their sources;
   - the client avatars (`companion-ideal-clients-v1`);
   - the Living Business Model projection (`lib/profile/businessModelProjection`).
2. Take the existing situation reader **`retrieveRelevantSituation`**, which already reads Board handoffs and saved research, as the candidate single read path. Trace, store by store, what it reads, what it misses, and what the prompt projection already carries.
3. **Only then** decide the smallest connection per store. No new knowledge registry.

---

## 15. Intelligence Inventory

Updated where this round proved an earlier statement wrong or incomplete (`docs/reviews/ob5-final/BRAIN_SPARK_ESTATE_INTELLIGENCE_INVENTORY.md`):
- the Visual Thinking root cause and the capture front door's single bridge;
- "business model" and "big decision" resolved;
- Strategies = one panel with two doors;
- the OB-5C "connected" labels corrected to partially connected.
