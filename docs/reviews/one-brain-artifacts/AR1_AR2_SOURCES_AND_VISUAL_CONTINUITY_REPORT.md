# One Brain Artifacts: Rounds AR1–AR2 Results and the Next Rounds

**In one line:** research sources now reach Create intact, and Visual Thinking work reopens where you left it, on any device. Both are on a feature branch and are **not merged**, because the release is still on HOLD.

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Branch | `feat/artifact-r1-sources-vts` (built on the release candidate `901057b6e`) |
| Commits | `617b36344`, `f657b710f` |
| Production | unchanged; still on HOLD |
| Builds on | *ONE_BRAIN_INGEST_TRANSFORM_ARTIFACT_ARCHITECTURE_AUDIT.md* |

**How to read the status words:**
- **IMPLEMENTED**: the code is written and committed on the branch.
- **TESTED**: what actually ran, and where.
- **PROPOSED**: not started. It is planned, with the check that would certify it.

All browser testing was done in Chromium browser contexts: a desktop window and a phone-sized window. That is **not a physical phone**. Spark's model replies were stubbed; everything else was real (routing, stores, Create, account sync, a local copy of the production database rules).

---

## 1. Your decisions, as recorded

1. **WorkBody becomes the shared semantic core.** There is no new model. The existing visual models become producers and views of it.
2. **Health shares only a written contract.** It is implemented separately and has no connection to Spark Estate.
3. **All six first-level verbs show on day one:** `/visualize /write /plan /learn /present /transform`.
4. **`+` brings information in; `/` creates or transforms it.**
5. **Natural language and slash commands go through the same One Brain decision.** A slash is a shortcut, never a gate.
6. **Inferred information is labelled.**
7. **Health:** close the emergency-detection gap before any new health visuals.

---

## 2. AR1: research sources survive into Create

**Problem:** sources were flattened into text on the way from Research to Create. Links and retrieval dates could be lost or mangled, and nothing structured reached Create.

**IMPLEMENTED (by reference, never copied):**
- When a Creation Workspace is built from saved research, each piece remembers **which findings** it rests on, as finding ids.
- At hand-off to Create, those ids are looked up in the saved research. That gives each source's title, link, publisher, retrieval date and verification state.
  - Sources are deduplicated by link.
  - A finding you excluded never comes along.
- Create keeps them **per section**.
  - Under the section you're working on, it shows *"Sources this section is built on"*: each source is a link that opens in a new tab, with its retrieval date, plus "not yet verified" where that applies.
  - When no single section is in focus (for example "Ready for a draft"), it shows *"Sources this work is built on"*.
  - The section text also gets a plain source line: `site — link — retrieved date`.
- The sources are saved with the Create work in your account. They come back after a reload, on reopen from **Continue My Work**, and on another device.
- A vague source title such as "Spark Estate stable knowledge" is replaced by the site the link points to (e.g. `shrm.org`).

**TESTED:**

| Check | Result |
|---|---|
| Unit: resolve, deduplicate, respect exclusions; label vague titles; link workspace items; hand-off carries refs; Create gets structured sources + plain lines; database round-trip; reopen path | **6/6** (`researchSources.test.ts`) |
| AR1.1 Research → "Create a Step-by-Step Guide" → Creation Workspace pieces name the 3 sourced findings | PASS |
| AR1.2 → "Open as a Guide in Create" → the section shows 3 sources: working links, new tab, "retrieved 2026-10-01" | PASS |
| AR1.3 After the first answer, your account's copy of the Create work holds the sources | PASS |
| AR1.4 Reload → Create → Continue My Work → Continue Editing → sources shown | PASS |
| AR1.5 Phone-sized window, same account → Continue My Work → sources shown | PASS |

**Not changed (existing behaviour, same on the release candidate):**
- Create first saves to your account when you answer or save a section, not when it opens.
- A reload returns you to the conversation, not to Create; you reopen Create from Continue My Work.

**Observed, not traced:** the Create work's title came out as *"Example Com/pricing-per-seat (retrieved 2026-10-01) Workshop"*. It looks like the title is taken from a source line. This round did not change titles. I haven't yet confirmed whether the release candidate does the same.

---

## 3. AR2: Visual Thinking work survives closing and reopening, across devices

**What I found first:**
- The older "Visual Thinking Studio" intake panel kept its work in tab-only storage, but it has **not been shown to members since 2026-08-21**. The member-facing studio is Visual Focus.
- Visual Focus maps were already saved to your account, so the work itself survived.
- **The real gap:** reopening the studio (a new tab, another device) always landed on the empty hub and **cleared which map you were in**. Your map existed, but you had to go and find it.

**IMPLEMENTED:**
- **Reopen where you left off.**
  - The studio keeps a small resume point in your account: the map open on screen, or "the hub".
  - Opening the studio on any device returns you there.
  - A research hand-off waiting to come in, or an explicit "open this map", always comes first.
  - Merely saving a map does not move the resume point.
- **The older studio's seven stores** now live in your account storage, as single "latest" documents:
  - a blank studio opening on a second device never overwrites real work;
  - **Start over** is recorded so it follows you, rather than old work coming back;
  - a copy saved in a tab by an older version moves across on first read.

  Nothing shows these today; they are ready if that panel returns.

**TESTED:**

| Check | Release candidate | This branch |
|---|---|---|
| AR2.1 Computer: Research → Show This Visually → Help me see this → the map is open (7 items) | PASS | PASS |
| AR2.2 Computer browser **closed**; phone-sized window signs in → the same map is on the account | PASS | PASS |
| AR2.3 Phone opens Visual Thinking → **lands back in that map** (7 items) | **FAIL** (empty hub) | **PASS** |
| Unit: all seven stores sync as "latest"; tab reopen; old tab copy moved; computer → phone; blank studio doesn't erase; Start over follows the member; resume point (a map, or the hub) reaches the other device | — | **5/5** (`studioStore.test.ts`) |

**Two defects found and fixed during testing:**
1. My first version treated "the last map saved" as "where you were".
   - In the browser, that jumped into a map the studio had *just* created, which emptied the research → Loose Thinking view.
   - In the unit tests, three existing tests (a saved map, then open the studio) expected the hub and correctly failed.
   - Fixed with the explicit resume point described above. It is read once, as the studio opens. The research → visual flow passes again (F2.3: 7 items compared), and those three tests pass.
2. Reopening Create from Continue My Work lost the sources. That path rebuilds the work from a second record that didn't carry them. Fixed (AR1.4 and AR1.5 above).

**Unit-tested, not browser-tested:** "left from the hub, so land on the hub" (resume point cleared on one device and read on the other).

**Harness note:** AR1 and AR2 pass when run separately (5/5 and 3/3). In one combined run, AR2 began while Create was still open, so its steps never reached Research. That is a script ordering problem; the app was not at fault.

---

## 4. Nothing else moved

| Check | Result |
|---|---|
| TypeScript errors | identical to the release candidate |
| Related unit suites (Creation Workspace, Create durable, Current Focus, Research, VTS and Visual Focus, member sync, member scope, companion components) | same pre-existing failures as the release candidate, **no new ones** |
| Earlier cross-device flows on this branch (founder speech/Susan reminder, refresh, phone-sized context, sign-out/in, research read-back with sources, research → VTS → back) | **15/15** |
| Account isolation and persistence suite on this branch (two accounts, same account in two browsers, sign-out, failed saves, concurrent edits, server auth) | **24/24** |

---

## 5. Coordination with the release

- This branch sits **on top of the release candidate `901057b6e`**, which is still on HOLD.
- Merge it **after** the release, as its own pull request.
- It touches:
  - the member sync registry (new keys);
  - the Create snapshot (one new field; older records keep working);
  - three small spots in the companion page.
- Nothing in it needs a database migration.

---

## 6. The next rounds (PROPOSED)

Each round is small, keeps existing behaviour, and is certified by its own unit tests plus a browser check across two contexts.

| Round | What | Certified when |
|---|---|---|
| **AR3: Connect the visual models (no new model)** | WorkBody gains: owner, importance, timeframe with certainty, scope, assertion level. The Visual Focus map and the VTS knowledge package become **producers and lenses** of WorkBody. They stop being separate stores of meaning. Research stays referenced, never copied. | A map built from research and the same work's WorkBody hold the **same items with the same ids**. Editing a node's meaning updates WorkBody; moving it changes only the view. No research text is duplicated. Survives a second device. |
| **AR4: Label inferred information** | Every item and link carries where it came from: **from your sources**, **you said it**, or **suggested by Spark**. Suggestions show *"Suggested — not in your sources"* with **Keep** / **Remove**. A view that needs something missing (e.g. a timeline without dates) shows the gap instead of inventing it. | In a research → comparison → handout chain, every suggested item is labelled and needs your confirmation. Nothing suggested is shown as fact. Removing a suggestion leaves the sources untouched. |
| **AR5: One representation decision** | One decision inside One Brain (`resolveWorkIntent`) recognises when seeing it would help: impact, "how does this fit together", dependencies, comparison, sequence, evidence, learning. It offers **one** suggestion. | The implicit examples get one fitting offer. Emotional or overwhelmed turns get none. Every existing route is unchanged (adversarial set). |
| **AR6: Slash accelerators into the same decision** | `/visualize /write /plan /learn /present /transform` are all shown on day one. `/` = create or transform; `+` = bring in. Each slash maps into AR5's decision. Unknown or ambiguous slash text falls back to conversation. | Parity table: each slash form and its natural-language twin produce **the same decision**. `+` never transforms; `/` never ingests. |
| **AR7: Lens registry** | The existing views (mind map, timeline, comparison, decision tree, Living Business Model, path) are registered, each with what it **needs**, **may infer**, and **must not invent**. | A lens missing a required input shows the gap. |
| **AR8: Refine and return** | "Simpler / what matters now / focus this branch / show dependencies / more detail / whole picture" act on the open view. There is one return point. | Each refinement changes only the view, never the meaning. Return always lands on the work or question you came from. |
| **AR9: First transform chain** | Research → evidence map → comparison → handout, by reference, with AR4 labels. | Sources and retrieval dates survive to the handout. Every inference is labelled and confirmable. |
| **AR10: "+" consolidation** | One "+" over work attachments: camera/scan, paste/drag, link import. The separate upload paths are retired. | One pipeline; every item stamped with where it came from; nothing reaches Spark without its "attached source" label. |

**Order:**
1. AR3 comes first, because AR4's labels live on WorkBody's assertion field.
2. AR5 and AR6 follow; they are independent of the visuals.
3. AR7–AR10 come after those.

---

## 7. Health (separate codebase; PROPOSED; nothing implemented here)

My Total Health Companion is not in this session and shares no code with Spark Estate. It adopts only the written contract.

| Round | What | Certified when |
|---|---|---|
| **H0: Emergency-detection gate (first, before any new health visual)** | Register a safety interceptor in the existing (empty) hook. Red-flag phrases go to **Help Now** (911 / 988 / Poison Help) before anything else runs. It covers chest pain, stroke signs, trouble breathing, suicidal thoughts, overdose and poisoning, severe bleeding, and similar. | Every red-flag test phrase (including misspellings and indirect wording) reaches Help Now. No ordinary health question is caught (a false-positive set). Nothing else changes. Reviewed by you before it is enabled. |
| **H1: Contract + first lenses** | The contract on Health's own data model; symptom timeline, care-team map, question-prep board. | Time certainty is drawn honestly; every link shows its assertion level; nothing diagnostic. |
| **H2: Health transforms** | Timeline → appointment brief → question list → learning map (cited). | Each step lists its inferences and needs-review items; citations only from MedlinePlus. |

---

## 8. Still open from the release

These are unchanged: the release report's gate still needs the protected preview check, real Spark replies with live research, and your real-phone test before production moves.
