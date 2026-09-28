# BRAIN SPARK ESTATE™ — OB-5 Connection Completion
## Return report (OB-5C: continue the One Brain loop)

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Branch | `ob5/one-brain-capability-connect` (pushed; **not merged, no production deploy**) |
| OB-5 certified SHA | `0877243b` (pushed first, as asked) |
| OB-5C SHA | **`a51f7229`** (on top of `0877243b`, pushed) |
| Base for comparisons | OB-5 `0877243b` (suite / lint), OB-1 baseline multiset (TypeScript) |
| Kill switches | `NEXT_PUBLIC_ONE_BRAIN_CAPABILITY_CONNECT=0`, `NEXT_PUBLIC_BOUNDARY_MEANING_HOLD=0` (unchanged) |

**The rule this round kept.** No new router, catalog, classifier, registry or brain. Every repair either
(a) makes the One Brain read path read an owner's **existing** recognizer,
(b) calls an owner's **existing** entry point with the member's words, or
(c) makes an existing return reader visible in chat.
When Create captured another owner's request, the repair was in **capability selection** (Create yields to any other recognizing owner), never more Create phrases.

---

## 1. Preview / browser proof of the four OB-5 connections

**The Vercel preview could not be reached from this environment.** The branch was pushed and Vercel builds its preview, but the session's network policy blocks `*.vercel.app` (proxy `CONNECT 403`). To let a future session drive the preview, allow that host under the environment's **Network access** settings.

**What was done instead.** The same code was driven in a real Chromium (Playwright) against `next dev`:
- on the **certified SHA `0877243b`** (detached worktree) for the OB-5 proof;
- on the **OB-5C working tree** for everything new.

**Honest limits.** This environment has no OpenAI or Supabase keys. Three model-backed steps cannot run here, and were replaced by records written with the repo's **own builders**, into the exact storage the real step writes:
- Claire's reasoning write (`/api/claire-reasoning`) → the return was written to sessionStorage exactly as `recordClaireChatReturn` writes it;
- Board deliberation → a certified `chat_invite` Board record built with the Board builders;
- live research (`/api/research-live`) → a saved research record in the Research Library store.

Everything before and after each of those steps is the real UI.

| Connection | Browser run (member's words → what happened) | Result |
|---|---|---|
| **Chat → Claire → confirmed change → return** | "I need to update what my business does." → My Business Estate opens with Claire on the right area and the member's words already in front of her (handoff flag set). Claire's confirmed write (simulated as above) → close → back in chat, Spark's receipt names what Claire changed. **Correction:** "No, make it one-to-one coaching instead." → the OB-4 correction goes **back to Claire** with the new words, and nothing is written in chat. | ✅ connected, return visible |
| **Chat → Board Room → result → return** | "What does the board think about hiring a VA while cash is tight?" → invite. **Clarification:** "What would they actually do?" → answered, and the **invite is kept** (OB-3 hold). "yes" → intake in chat → "Okay, let's start." → **the Board Room opens** on the seeded decision. Before this round the intake stopped at *review* (§2). Back to chat → the smallest return: the Board's decision status and the open question. | ✅ connected (**break found and fixed in the browser**) |
| **Board → Research → result returns to the Board** | **Detour/continuation:** after the Board return in chat, "Okay, let's do that." accepts the Board's research offer → Research Library labelled *"From your Board discussion"* with the Board's bounded question. Board Brief path: **"Research this"** is enabled → Library → **"Back to the Board"** → the Board shows the **"Research came back"** card (research record injected). | ✅ connected |
| **Chat → Project → next step → Project Home** | Saved project "Spring Launch" (next step "Email the ten warm leads"). "Help me figure out what to do next on my launch project." → the grounded next step in chat. **Clarification:** "What would that do?" → answered, and the offer is kept. "Okay, let's do that." → **Project Home** for Spring Launch opens. | ✅ connected (certified SHA `0877243b`) |

Screenshots of these runs are in `docs/reviews/ob5c/browser/`.

---

## 2. Corrections to earlier audit conclusions

| Earlier conclusion | What the code/browser actually showed | Now |
|---|---|---|
| OB-5 audit: "Claire unreachable from chat" (pre-OB-5 matrix) | Claire was already reachable by `detectBusinessEstateNavIntent` (commit `54be533c`); what was missing was **context** (props `onClose` only) and **return**. | OB-5 added both; confirmed here. |
| Earlier audits: "chat → Research → chat works" | `stageConversationResearch` had **zero production callers**; the chat-origin return reader needed an active project. Research from chat opened an empty Library. | **Connected in OB-5C** (§3.8). |
| OB-5: "Board invite → Board Room connected" | In the browser the chat intake reached **review / ready to begin** and **stopped** — `route_to_owner` never called `openBoardroomCore`. | **Fixed in OB-5C**: at review the Board Room opens on the seeded decision. |
| Inventory: Ideal client has "three owners" | They are **one store** (`companion-ideal-clients-v1`): Claire reads it (`personsFromAvatars`), the Builder writes it. The duplication was in **recognition**, not data. | Split by purpose (§4). |
| OB-5: "Research return without a project: disconnected" | True, and it was the chat-launch gap above, not a return-store gap. | Return by **provenance** (§3.8). |

---

## 3. Each remaining capability: previous break → repair → owner → return

Each was traced **UNDERSTAND → CONNECT → DECIDE → ACT → RETURN → CONTINUE** before coding. The six questions (who owns it · how chat reaches it · what it receives · what it decides/does · where its result goes · how the member continues) are answered in the "owner / reach / carries / returns" columns of `lib/oneBrainCapability/connections.ts`, which the prompt projection reads.

### 3.1 Events
- **Previous break.** `detectEventIntent` existed and worked, but its only consumer (`resolveUniversalCreationEntrypoint`) had **0 production callers**. The Events doorway (`openCreateEventsDoorwayCore`) was **menu-only**. "I'm planning an event…" went to the model or Create. The owner's own `EVENT_GOAL_RE` matched "plan" but not "planning".
- **Repair.** The read path reads `detectEventIntent`. Handoff `events_doorway` calls the existing doorway and passes the member's words to `EventsEstateEntrancePanel` (`initialRequest`, one-shot) → the panel's own `beginStartEventUnderstanding`. `EVENT_GOAL_RE` inflections fixed in the owner (`plan(?:ning)?`, …); the 106 Events tests pass.
- **Owner.** Events (`eventsEntranceUnderstanding`). **Duplicate retired.** Create no longer captures event planning (Create yields).
- **Handoff proof.** Browser: "I'm planning an event and don't know where to start." → offer → "yes" → Events opens with the sentence and asks its **own** first question.
- **Return / continue.** The member continues inside Events; Events' result stays in Events/Create (**not yet summarized back to chat** — see §6).

### 3.2 Strategy Chamber
- **Previous break.** Reachable **only by a button** (`beginChamberEntry`). "I need to rethink my pricing" got a silent finance hint; "Ask someone about my pricing" went to the *Chamber of Momentum*.
- **Repair.** The read path reads `matchStrategyTypesFromText` (owner) and the registry's own family nouns (catalog). Handoff `strategy_entry` does what the button does — `createStrategyWorkItem` + `applyGuidedJourneyAnswer(member's words)` — and opens `StrategiesPanel` on `chamber-entry` for that work item (`openCommand.chamberWorkItemId`).
- **Owner.** Strategy Chamber. **Decision.** "Can we work through my strategy?" is recognized by the Chamber *and* the ADHD Strategy Library (`strategy_library`, from `appFeatureKnowledge`), so Spark **asks which** instead of guessing.
- **Handoff proof.** Browser: "I need to rethink my pricing." → offer → "yes" → the Chamber opens with the question on the table.
- **Return.** The existing `onAsk → handlePlaybookAsk` path. A conclusion comes back only when the member asks (unchanged; §6).

### 3.3 Plan My Day
- **Previous break.** Work Recognition captured "Help me plan today" / "design my day" as a Create document; the continuity destination opened `openPlanMyDayCore` **without** the context.
- **Repair.** The read path reads `resolveIntentRouting` (category `plan`), the `plan-my-day` feature match and `shouldStartDayDesigner`. Handoff `day_designer` runs the **existing** in-chat Day Designer (`beginDayDesignerFlow` + `questionForStep("time")`); if already dismissed today, the existing Plan My Day surface opens. **Work Recognition now yields** to any One Brain owner selection (`oneBrainOwnerSelected`, a guard added after the Chamber guard).
- **Owner.** Day Designer. **Duplicate retired.** Create/Work Recognition no longer captures day planning.
- **Handoff / return proof.** Browser: "I need to figure out what to work on today." → the Day Designer's first question, in chat; the result stays in the conversation.

### 3.4 Visual Thinking Studio (VTS)
- **Previous break.** The universal `visual-thinking` route dropped the member's words; "Make a mind map" was captured by Work Recognition; the recommendation engine's `business-ecosystem-map` rule claims "business model".
- **Repair.** The read path reads `isExplicitVisualStructureRequest` / `isVisualConversionRequest` (owner). `needsVisualStructureRecommendation` is read as **catalog only** (it over-claimed, e.g. "client onboarding guide"). Handoff `visual_open` calls `completeVisualThinkingOpen` with `purposeAnswer` = the member's words and `resolveContextTransfer`.
- **Owner.** Visual Thinking Studio. **Create yields.**
- **Proof.** Browser: "Let's look at my business model." → offer → "yes" → VTS opens with the purpose carried.
- **Gap (not fixed, honest).** "I need to see this visually." and "Can you help me think this through visually?" are **not recognized by any existing VTS recognizer** (§6). Adding phrases to make them pass would be a phrase list, which the brief forbids.

### 3.5 Rhythm "this" reference
- **Previous break.** "I want to do this every month" created a Rhythm titled **"I want to do this"**; "Change this to every Tuesday" after a receipt could not tell what "this" was.
- **Repair (in the Remember owner, not in One Brain).**
  - The frictionless layer now accepts `conversationReferent` (passed from the page's active topic). A title that is only a reference (`subjectIsReferenceOnly` from `extractRememberSlots`, or `namesOnlyAReference`) takes the referent.
  - With **no** referent it **asks** ("Happy to make that a Rhythm. What should it be…?") and writes nothing.
  - "Change this to every Tuesday" right after a Rhythm receipt uses the OB-4 receipt correction (fresh receipt only).
- **Proof (tests).** Fresh receipt → the Rhythm moves to Tuesday. "Change that Rhythm." → asks what to change. A **stale** receipt writes nothing. A named Rhythm is untouched.

### 3.6 Living Model Canvas (LMC)
- **Previous break.** No route; the canvas only opened from inside Claire's destination (`lmcOpen`).
- **Repair.** The read path reads Claire's own member-control recognizer (`detectMemberControlKind(t) === "lmc"`). Handoff `lmc_open` uses the existing Claire handoff with `openLmc`; `BusinessProfileBp2aPrototype` opens the canvas on arrival.
- **Owner.** Claire / My Business Estate. **Proof.** Browser: "I want to work on my Living Model Canvas." → My Business Estate opens **on the canvas**.
- **Duplicate (reported, not retired).** "Let's look at my business model." is claimed by both VTS (`business-ecosystem-map`) and the LMC. Today VTS wins because the LMC recognizer needs the canvas name. Founder decision needed (§6).

### 3.7 Claire ↔ Ideal Client Avatar Builder — see §4.

### 3.8 Research return without an active project
- **Previous break.** `completeImmediateResearchOpen` staged nothing; the Library auto-started only with `selectedText`; the chat return needed `activeWorkProjectId + topicId`.
- **Repair.**
  - Research is a One Brain connection (`research_launch`) that calls the existing `stageConversationResearch` with the question.
  - "What 'this' refers to" comes from the offer turn's active topic, carried in the armed handoff (so the accepting "yes" is never the question — a browser-found bug, fixed and re-verified).
  - The Library auto-starts a conversation-origin request with its question.
  - On leaving the Library, `researchReturnForConversation` finds the saved result **by provenance** (since the handoff + the question) and posts it in chat (`formatResearchReturnMessage`, which says so plainly when the result is unsourced).
- **Proof.** Browser: "Research this for me." → "yes" → Research Library shows *"this: Research this for me"* (before: *"this: yes"*). Live research itself cannot run here (no key). The return message is proven in tests with a saved record.
- **Limit.** Without the chat model, the page's active topic is not populated locally, so the browser run fell back to the member's request. With a topic, the referent is carried (unit-tested).

### 3.9 The three narrow / duplicated recognizers

| Recognizer | Previous break | Repair |
|---|---|---|
| **Projects** (`extractProjectQuery`) | False positives ("launch project" matched any sentence) | Counted only when `searchProjects` finds a saved project (`scoreProjectMatch ≥ 85`) → `anchored: "saved"`, which outranks topic signals ("Events vs my launch project" resolved) |
| **Ideal client** (`EXPLORATORY_AVATAR_RE`, universal `client-avatars`, Claire `people-i-help`) | Three recognizers, the Strategy Chamber's `market_customer` also claimed it; `specific` ranking dropped the Builder | Split by **purpose** (§4) + the ownership rule that drops Strategy's `market_customer` when an ideal-client owner is recognized |
| **Board naming** | A Strategy topic outranked "the board" ("What does the board think about hiring…" went to Strategy) | The member **naming** an owner (`addressed: "named"`) outranks every topic signal; regression test added |

Also fixed in selection: a **mixed connected + deferred** owner no longer produces a choice One Brain cannot complete (the old choice loop); the deferred owner (Remember/Create) keeps its seam.

---

## 4. Claire ↔ Avatar Builder (Founder decision, by purpose)

| The member… | Owner | Evidence |
|---|---|---|
| is exploring / unsure / talking it through ("I'm not sure who my ideal client is anymore.") | **Claire**, area People I Help | `detectClientAvatarExploration` → `claire {area:"people-i-help", purpose:"explore"}` |
| names the structured avatar to build / finish / edit / review ("Help me build my client avatar.") | **Avatar Builder** | `feature("client-avatars").match` / universal `client-avatars` → `client_avatars {purpose:"build", addressed:"named"}` → `startClientAvatarBuilderKickoff` |

**Handoffs both ways, context intact.**
- **Claire → Builder.** After Claire's confirmed People-I-Help change returns to chat, Spark adds *"Want to put that into your client avatar too?"* and arms `capability:client_avatars`; "yes" opens the Builder. The Builder reads the **same store** Claire just wrote, so nothing is re-asked.
- **Builder → Claire.** While the Builder is open, a turn One Brain would send to Claire becomes an **offer** (`offerClaireFromAvatarBuilder`), not a jump: the member's work in the Builder is not torn down unasked. "yes" → Claire opens on People I Help with the member's words.
- **The member never has to choose.** Purpose decides; neither path is exclusive.

Browser: the exploring sentence opened Claire on People I Help, and the building sentence opened the Builder kickoff (screenshots `own-claire-pih.jpg`, `own-avatar.jpg`). The two cross-handoffs (Claire → Builder offer, Builder → Claire offer) are proven in `connectionCompletion.ob5c.test.ts`. They were not clicked through in the browser because Claire's write needs the model.

---

## 5. Discussion vs action; estate self-knowledge

**Discussion reuses the One Brain stance contract** (`stance: talk_about` → not eligible), plus `questionAboutCapability`: generic question shapes **parametrized by the projected capability names** (no per-room phrases). It answers from the projection and offers ("Would you like to use it now?") only when connected.

**Estate self-knowledge** is the OB-5 projection plus `buildEstateSelfKnowledgeBlock()`, which reads:
- rooms from `getCanonLiveRooms`;
- Board directors from `DIRECTOR_IDENTITIES`;
- the Chamber of Momentum from `CHAMBER_MEMBERS`.

For each capability it says where it lives, what it needs, what it returns and how the member continues (`RETURN_LINE`, "Result: …"). **No new knowledge registry was created.** The capability block is 4,407 characters (limit 4,500; the test was not loosened).

---

## 6. Remaining disconnected / duplicated capabilities

1. **VTS recognition gap:** "I need to see this visually." / "Can you help me think this through visually?" → no existing recognizer. **Next step:** consolidate the ~8 VTS recognizers into the owner's one detector (then these pass without new phrases).
2. **"Business model" duplicate:** VTS `business-ecosystem-map` vs the LMC. **Founder decision needed.**
3. **Big decision:** Decision Compass (`whenToRecommend: "big decision"`) vs Board (`impliedEstatePlaceMatch` → round-table); "I need help making a big business decision." has no owner recognition. **Founder decision needed.**
4. **Claire coverage:** "I need to change how I describe my business." is not in Claire's topic patterns (`what-business-does` covers "what my business does"). Fix belongs in Claire's recognizer.
5. **Rhythm cadence duplicate:** "Every Monday…" is also captured by `attentionObligation`.
6. **Events result → chat:** no return summary (Events' result stays in Events/Create).
7. **Strategy Chamber result → chat:** only via `onAsk`.
8. **Research referent without the model:** the page's active topic is empty locally; the member's request is used instead.

## 7. TRUE MISSING CAPABILITY

After this round's search, **none new**. Still missing (unchanged from OB-5, not built):

| What | Evidence | Why connection can't solve it | Smallest build |
|---|---|---|---|
| External calendar / email write | No calendar write scope or email account connection anywhere | Nothing exists to connect | OAuth + one write adapter, out of scope |
| Chat file upload into research | Library accepts text only | No upload path exists | One upload control feeding `stageConversationResearch` |

---

## 8. Certification results

**One Brain certification suite (`lib/oneBrainCertification`): 8 files, 326 / 326 pass.**

| File | Tests |
|---|---|
| bakeoff.ob1 | 15 ✓ |
| roomDivergence.ob1 — **room divergence 0 / 285**; the committed OB-4 baseline is unchanged | 3 ✓ |
| roomHold.ob2 | 49 ✓ |
| oneBrainConsumers (+5 OB-5C authority guards) | 19 ✓ |
| pendingBinding.ob3 | 85 ✓ |
| receiptCorrection.ob4 | 66 ✓ |
| capabilityConnect.ob5 | 45 ✓ |
| **connectionCompletion.ob5c (new)** | 44 ✓ |

**False actions: 0.** Every discussion sentence and every stale/ambiguous case leaves all member stores byte-identical; asserted in `connectionCompletion.ob5c`.

### The certification sentences (the production chain, turn 1, then "yes" where Spark offered)

| Member says | One Brain selection | Plan | Spark's reply (start) | "yes" executes |
|---|---|---|---|---|
| I'm planning an event and don't know where to start. | route: events | offer | "Events is built for exactly this — it takes an event one step at a time. Want me to open it with what you just said?" | Events doorway with the sentence ✅ |
| Help me figure out my event. | route: events | offer | same | Events doorway ✅ |
| I need to rethink my pricing. | route: strategy_chamber (pricing) | offer | "The Strategy Chamber works through this kind of decision with structure…" | Strategy Chamber entry ✅ |
| Can we work through my strategy? | **ask**: Strategy Chamber / Strategies library | choice | "I can help with that two ways — Strategy Chamber or Strategies (strategy library). Which would you like?" | the chosen one ✅ |
| Help me plan my day. | route: plan_my_day | execute | Day Designer's first question | — ✅ |
| I need to figure out what to work on today. | route: plan_my_day | execute | Day Designer's first question (Create no longer captures it) | — ✅ |
| I need to see this visually. | none (no existing recognizer) | — | the model answers | ❌ **gap** (§6.1) |
| Can you help me think this through visually? | none (no existing recognizer) | — | the model answers | ❌ **gap** (§6.1) |
| Change that Rhythm. | defer → Remember owner | owner | asks *what* to change; writes nothing | — ✅ |
| Change this to every Tuesday. | defer → Remember owner | owner | after a fresh Rhythm receipt: the Rhythm moves to Tuesday; stale receipt: asks, writes nothing | — ✅ |
| Let's look at my business model. | confirm: visual_thinking | offer | "Seeing it laid out could help. Want me to open the Visual Thinking Studio…?" | VTS with purpose ✅ (owner decision pending, §6.2) |
| I want to work on my Living Model Canvas. | route: lmc | execute | "Opening your Living Model in My Business Estate." | — ✅ |
| Research this for me. | confirm: research | offer | "That deserves real sources rather than my best guess. Want me to open the Research Library with your question?" | Research Library with the question + referent ✅ |

**Discussion, not action** (nothing is opened, nothing is written):

| Member says | Selection | What Spark does |
|---|---|---|
| What does the Strategy Chamber do? | explain | answers from the projection ("Structured strategy thinking: …"), then "Would you like to use it now?" |
| What could Events help me with? | explain | answers ("Gatherings, experiences & logistics … only after you confirm"), offers |
| Tell me about Plan My Day. | explain | answers ("Daily decision workspace …"), offers |
| Would Visual Thinking help with this? | explain | answers ("Make abstract ideas tangible …"), offers |
| I'm thinking about changing my Rhythm. | none: **discussion** (stance `talk_about`) | talks it through; no Rhythm change |

**Founder decision and regression checks:**

| Member says | Result |
|---|---|
| I'm not sure who my ideal client is anymore. | Claire, People I Help (explore) |
| Help me build my client avatar. | Avatar Builder (build) — "Anything Claire already knows … is already there." |
| What does the board think about hiring a VA while cash is tight? | Board invite (naming the Board outranks the Strategy topic) |

**Variations on every new owner offer (`connectionCompletion.ob5c`, Events / Strategy Chamber / Visual Thinking):**
- a clarification ("What would that do?") keeps the offer, and "yes" next turn still opens it;
- "Not right now." releases it and nothing opens;
- a detour followed by a late "yes" never opens the stale offer.

Plus the OB-5 families, which run through the same bind path:
- decline;
- stale;
- active work is not replaced;
- kill switches.

**One lexicon fix, found by these variation tests.** "Not right now." was **not** a decline: the offer stayed armed. It was added to the One Brain `DEFERRAL_SUPPLEMENT_RE` (`lib/conversationBoundaryLexicon.ts`), which is the single universal decline lexicon, not a room list. "Not now." was already covered.

---

## 9. Full suite / TypeScript / lint comparison

| Check | OB-5 base (`0877243b`) | OB-5C | Delta |
|---|---|---|---|
| Full Vitest suite (final code) | 20,931 tests · 459 failing | 20,978 tests · 460 failing | **0 new failures caused by OB-5C** (see note) · 0 fixed · +47 tests |
| TypeScript (`tsc --noEmit`, file + code multiset) | 353 | 353 | **identical multiset** |
| ESLint (all changed files) | 180 | 180 | **0 per file/rule changes** |
| Room divergence | 0 / 285 | 0 / 285 | unchanged |

- The 459 pre-existing failures are the same test IDs as the OB-5 base.
- **Note on the one extra failure in the final run:** `lib/pendingChoice/numberedChoiceResolution.test.ts › new set replaces old`.
  - **Root cause:** `lib/pendingChoice/manager.ts:65` builds the choice ID as `${type}-${Date.now()}`. Two menus registered in the same millisecond therefore get the **same ID**, which happens under full-suite load.
  - **Why it isn't this round's:** OB-5C does not touch `lib/pendingChoice`. The test passes in isolation (14/14) and passed in the previous full OB-5C run (459 failing, 0 new).
  - **Status:** reported as a pre-existing timing defect and not changed here. The smallest fix is a monotonic counter in the ID.
- The suite writes into `docs/verification`, `docs/create-experience` and `test.pdf`; these were restored after each run.

**Found and fixed during this round's runs:**
- Four layout / authority tests failed mid-round: `continuityGateAuthorityWedge` ×2, `eventsFrontDoor`, `ecosystemRouting096`.
- These tests pin **source order** and **forbidden identifiers**. The code was changed to satisfy them: the Work Recognition guard now sits after the Chamber guard, and the state was renamed to `eventsEntranceSeed`.
- None of these tests was edited.

**No test was weakened.** The OB-5 tests that pinned the **old gaps** (e.g. "LMC has no route", "event planning → none") were replaced with the stronger new-owner expectations, because those gaps are now closed; every other OB-1…OB-5 assertion is unchanged.

---

## 10. Files changed (OB-5C)

`lib/oneBrainCapability/{readPath,connections,projection,selectCapability,handoffs,returns}.ts` · `lib/conversationBoundaryLexicon.ts` (one decline phrase) · `lib/companionPrompt.ts` · `lib/frictionlessActionLayer.ts` · `lib/eventsIntelligence/detectEventIntent.ts` · `lib/businessProfileFounder/claireChatHandoff.ts` · `app/companion/CompanionPageClient.tsx` · `components/companion/{EventsEstateEntrancePanel,StrategiesPanel}.tsx` · `components/companion/researchLibrary/ResearchLibraryPanel.tsx` · `components/prototype/businessProfileBp2a/BusinessProfileBp2aPrototype.tsx` · tests: `lib/oneBrainCertification/{capabilityConnect.ob5,oneBrainConsumers}.test.ts`, new `connectionCompletion.ob5c.test.ts`.

Patch: `docs/reviews/ob5c/ob5c-connection-completion.patch`.

---

## 11. Exact next-round recommendation

**OB-6 (do not start without the Founder):**
1. **Founder decisions first (15 minutes):** "business model" → VTS or LMC; "big decision" → Decision Compass or Board.
2. **Consolidate the VTS recognizers** into the owner's one detector and let the read path read only that. This closes the two "visually" sentences without new phrases.
3. **Return summaries** for Events and the Strategy Chamber via their existing stores (same projection pattern as the Board return).
4. **Retire `attentionObligation`'s cadence capture** in favour of the Remember owner.
5. **Preview proof:** allow `*.vercel.app` in the environment's Network settings and re-run the four browser scripts against the preview with real keys, so Claire's write, Board deliberation and live research run for real.
