# Spark Estate: Create + VTS Founder Decision Round 2

**Deliverable type:** Experience-design decision analysis (no implementation)
**Prepared for:** Shari Hudson, Founder, Visual Spark Studios and Spark Estate
**Prepared by:** Claude Code, acting as independent senior product-experience designer (session "Create + VTS design", 2026-09-18)
**Continues from:** `SPARK_CREATE_VTS_FABLE_EXPERIENCE_DESIGN_2026-09-18.md` (the Round 1 report)
**Approval Status:** Proposed. Nothing in this document is locked except Founder Decisions 56 and 57, which the Founder locked.
**Decision Owner:** Founder

---

## How to read this on a phone

- Section 1: what Decisions 56 and 57 change (two minutes).
- Section 4: the only decision left for you to answer (one minute).
- Section 2: the reasoning behind each of the nine items, if you want it.

Short version: of the nine remaining items, **eight are already answered by rules Spark Estate already has.** One genuine preference remains, and it is small.

---

## Contents

- [1. How Decisions 56 and 57 change the specification](#1-how-decisions-56-and-57-change-the-specification)
- [2. Decision analysis for the nine remaining items](#2-decision-analysis-for-the-nine-remaining-items)
- [3. FALSE / ALREADY-RESOLVED FOUNDER DECISIONS](#3-false--already-resolved-founder-decisions)
- [4. TRUE FOUNDER DECISIONS REMAINING](#4-true-founder-decisions-remaining)
- [5. Corrections to the Round 1 report](#5-corrections-to-the-round-1-report)
- [6. Final cross-device check](#6-final-cross-device-check)
- [Evidence Matrix](#evidence-matrix)
- [Decision Record](#decision-record)

---

## 1. How Decisions 56 and 57 change the specification

### Founder Decision 56 (LOCKED): client context confirmation

**What changes.** The Round 1 design already chose "ask only when ambiguous", but it hedged, left strictness open, and in two places drifted toward confirmation at the start of threads. Decision 56 removes the hedge and the drift.

The specification now reads:

- When the working thread establishes the client unambiguously (the member names them, the material is theirs, or the thread was re-entered from that client's work), that boundary is active for the whole thread and across legitimate re-entry. Spark does not re-confirm it. The provenance line still names the context in use (*using what I know about Northwind*), which is information, not a question.
- Spark asks the smallest question only when no client is established, more than one is materially plausible, or the available context conflicts. It asks **before** using any client-specific information, phrased as recognition with a one-tap answer: *This is for Kerry at Northwind, right?*
- Cross-client information is never inferred across an ambiguous boundary. If Spark cannot resolve the boundary and the member does not answer, Spark proceeds without client-specific context and says so in one line.
- No reassurance confirmations. No "still working on Northwind?" on re-entry.

**Where the Round 1 report is corrected:** Section 21 (client boundaries), Section 27 (cross-client contamination), Section 28 item 6, Section 30 item 1, Section 31 recommendation 12. Details in Section 5 below.

### Founder Decision 57 (LOCKED): Save to Drive destination

**What changes.** Round 1 left the destination open. Decision 57 settles it, and also tightens the honesty rule on what Spark claims to do inside Drive.

The specification now reads:

- The first time a member explicitly saves to Drive, Spark establishes a default destination in one exchange: *I'll put Spark creations in My Drive / Spark Estate. Fine, or somewhere else?* with **Fine** as the one-tap answer and *somewhere else* opening the member's folder picker (through the proven connection only). That is the only time the member is asked.
- Every later save goes to the default. Spark says where in the confirmation: *Copied to Spark Estate in your Drive as "Workshop handout".*
- A one-time instruction (*put this in my Workshop folder*) does exactly that, once, and does not change the default. Spark confirms the one-time nature: *Put it in Workshop this time. Spark Estate stays your usual spot.*
- An ongoing preference (*from now on put these in Workshop*) changes the default if the proven Drive capability supports it. Spark confirms the change once.
- Spark never creates folder hierarchies. One folder, unless the member chooses otherwise.
- Spark never says "replaced", "updated", "synced", or "moved" about a Drive file unless the proven connection does that thing. If replacing an earlier copy is not proven, a second save creates a new copy and Spark says so. If it is proven, the default is still a new copy and *replace the earlier copy* is offered as the secondary choice.
- Deleting in Spark never touches the Drive copy. Spark says so at delete time.

**Where the Round 1 report is corrected:** Section 15 sheet description, Section 16 (Save to my Drive), Scenario H, Section 30 item 3.

---

## 2. Decision analysis for the nine remaining items

Each item uses the same eight-part shape: problem, why a decision is needed, cognitive burden, options, member experience of each, conflicts, whether Founder judgment is truly required, recommendation.

### Item 2: Deleted-work grace period

**Member-experience problem.** A member says *delete this* and either (a) meant it and wants it gone, or (b) tapped the wrong thing, or (c) meant "get it out of my way" and will want it back next week. The design must make Delete understandable without a trash can to manage.

**Why a decision seemed necessary.** Round 1 left open whether Delete has a recovery window and how long.

**Cognitive burden.** A trash system adds a place to remember, a retention rule to understand, and periodic cleanup. Permanent immediate deletion adds fear at the moment of deleting, which either causes hoarding (never deleting, growing clutter) or regret. Both are executive-function taxes.

**Options.**

- **A. Delete is intentional, confirmed, and then immediately undoable like any other change.** Confirmation states the scope and what is not affected. Right after, *undo* or *put it back* works exactly as it does for any change, until the member moves on to something else. After that, it is gone. No trash, no retention setting.
- **B. Delete moves the item out of sight for a period, then it disappears.** Requires a place to see deleted items, a period to explain, and a rule the member has to hold in mind.

**Member experience.**

- A: *Delete this?* → *Just this version* → *Deleted. Your Drive copy stays.* A wrong tap is fixed by *undo*. A week later, it is simply gone, which is what "delete" means. The member never visits a trash screen.
- B: the same first steps, then a lingering "recently deleted" area that has to exist somewhere, and a question in the member's head about whether things they deleted are truly gone.

**Conflicts.** B conflicts with "no trash-management dashboards" and with "the member should not manage version clutter". A conflicts with nothing: the brief already defines DELETE as intentional deletion and UNDO as reversing a change.

**Founder judgment required?** No. The brief's vocabulary already defines Delete as intentional and Undo as reversing a change. "Mistakes should be cheap" is satisfied by the confirmation plus immediate undo. "Avoid trash-management dashboards and retention settings" rules out B.

**Recommendation.** A. The member model in one sentence: *Delete means gone, you'll be asked first, and you can undo it right away if you slip.* Praised states and Saved checkpoints get the same confirmation, with one added line (*You saved this one on Tuesday*) so the member knows what they are deleting. The immediate undo depends on structured history, which remains an implementation validation item; if that is unavailable, the confirmation alone is the protection and Spark does not offer an undo it cannot perform.

**Status: ALREADY RESOLVED BY CANONICAL RULE** (Undo / Delete vocabulary in the brief; Mistakes should be cheap; no trash or retention administration).

---

### Item 4: Tucking alternatives

**Member-experience problem.** After several *try another* rounds, the Set strip fills with near-identical thumbnails, and the member has to scan them to find the ones that matter.

**Why a decision seemed necessary.** Round 1 proposed an optional member action ("tuck away the ones you didn't like") and asked whether that is version management in disguise.

**Cognitive burden.** Any member-operated tucking is a sorting task the member must remember to do. Not tucking leaves visual noise that competes for attention.

**Options.**

- **A. Spark carries it.** The strip shows the current item, anything the member praised or saved, and the most recent alternative. Everything else stays in the Set and in Restore, reachable by *show me the others* or a small *and 4 more* affordance at the end of the strip. Nothing is deleted or hidden from Restore. The member never sorts.
- **B. Member tucks.** A per-thumbnail "tuck" action and an "untuck" list.

**Member experience.**

- A: the strip stays short by itself. The member sees what matters, and one tap shows the rest. Spark never asks them to tidy.
- B: the member has a small housekeeping chore and a second list to know about.

**Conflicts.** B conflicts with "the system carries that structure" and "the member should not manage version trees". A conflicts with nothing.

**Founder judgment required?** No. "The system carries that structure", "Recognition over recall", and "Information does not automatically deserve attention" together produce A. The Round 1 offer ("want me to tuck the rest away?") was the wrong shape: it moved a mechanical decision to the member.

**Recommendation.** A. Remove the tucking offer from the design. Spark folds the strip on its own using a rule the member never sees (current, praised, saved, most recent). Delete remains available for anything the member truly wants gone.

**Status: ALREADY RESOLVED BY CANONICAL RULE** (system carries structure; information does not automatically deserve attention).

---

### Item 5: Welcome threshold

**Member-experience problem.** When does one Create card on Welcome help someone regain where they were, and when is it noise or guilt?

**Why a decision seemed necessary.** Round 1 proposed a three-part bar and asked whether it should be higher or lower.

**Cognitive burden.** A card that reflects a live, half-finished intention removes reconstruction work. A card that reflects merely "something you opened" adds a decision (ignore or act) and a faint sense of obligation. Calendar-based thresholds ("touched this week") are dashboard logic wearing a friendly face.

**Options.**

- **A. Intention test, no calendar.** Welcome shows a Create card only when the thread holds an unfinished member intention that Spark can restate in one line (*you were making an editable version so you could move the pieces*), the member did not close it (*done*, *not now*, *forget it*), and nothing in the Estate is more pressing. Otherwise nothing. Age does not matter.
- **B. Recency test.** Show the most recently touched piece if within some number of days.

**Member experience.**

- A: the card appears only when it would save the member from asking "where was I?" Sometimes Welcome shows nothing from Create for weeks, and that is correct. A thread paused three weeks ago with a clear intention can still appear once, and *not now* silences it.
- B: predictable but hollow; a card appears because time passed, not because returning helps.

**Conflicts.** B conflicts with "Information does not automatically deserve attention" and "Sometimes the correct recommendation is nothing". A conflicts with nothing.

**Founder judgment required?** No. The reframed question ("when does returning meaningfully help regain cognitive context?") is answered by "Return without reconstruction" and "Information does not automatically deserve attention". The answer is a test of intention, not a threshold number. Round 1 was wrong to present it as a tunable bar.

**Recommendation.** A. Drop "recently" from the rule. The three conditions are: a restatable unfinished intention, not closed by the member, and no shame language. One card maximum remains.

**Status: ALREADY RESOLVED BY CANONICAL RULE** (Return without reconstruction; Information does not automatically deserve attention; no shame-based work management).

---

### Item 6: Try Another default

**Member-experience problem.** When the member says *try another*, how many alternatives should appear?

**Why a decision seemed necessary.** Round 1 assumed one and asked whether tablet and desktop should show two.

**Cognitive burden.** One alternative next to the current one is a comparison of two, which is the cheapest possible reaction. Two new alternatives make three things on screen and turn a reaction into a selection.

**Options.**

- **A. One alternative.** On any device. The member reacts, says *another* again, or says *show me a few* to get more on purpose.
- **B. Two alternatives on larger screens.**

**Member experience.**

- A: *Try another* → one new version appears, current one a tap away, Spark says what differs in one line. Desktop and tablet may show both side by side as presentation, but there are still only two things to compare.
- B: a mini-gallery on tablet and desktop, a different behavior on phone, and a comparison of three every time.

**Conflicts.** B conflicts with "One strong first attempt is generally preferable to an overwhelming gallery" and with cross-device consistency of meaning. A conflicts with nothing.

**Founder judgment required?** No. "Show before asking" and "one strong attempt over a gallery" already answer it. The device difference is presentation (side by side), not count.

**Recommendation.** A. Screen size changes how two things are shown, not how many things Spark makes.

**Status: ALREADY RESOLVED BY CANONICAL RULE** (one strong attempt; show before asking; minimum necessary decisions).

---

### Item 7: Phone VTS scope

**Member-experience problem.** Round 1 proposed that phone VTS be an ordering-and-grouping list with a read-only spatial view. Re-examined against the binding cross-device rule, that design **removes capability, not just adapts interaction.** The list preserves groups, order, and connections, but it loses spatial meaning: placing a card *near* another, placing something *at month two* on a timeline, or leaving two things apart on purpose. Scenario F (placing Offer B at month two) cannot be done in a list. That is the meaningful visual-thinking task, and the phone must be able to do it.

**Why a decision seemed necessary.** Round 1 framed it as a tradeoff between precision risk and capability. On re-examination, it is not a tradeoff the Founder needs to weigh; the cross-device rule already decides it. What remained was a design problem: how to place cards on a phone without finger-drag frustration.

**Cognitive burden.** Free finger-drag on a small canvas causes accidental moves, lost cards off-screen, and pan/drag confusion. A list removes those but forces the member to think in a different structure on one device than on another, which is its own discontinuity.

**Options.**

- **A. Full canvas on phone with select-then-place interaction.** The same canvas as tablet and desktop, zoomable. One-finger drag on empty space pans; pinch zooms. Tapping a card selects it (large target) and shows a compact chip: **Move** · **Into group** · **Connect** · **Words**. Moving happens in one of three phone-shaped ways, all equivalent in meaning:
  - **Tap-to-place:** with a card selected, tap **Move**, then tap where it should go. The card lands there. No drag.
  - **Zoomed local drag:** double-tap a region to zoom into it; inside a zoomed region, dragging a selected card is precise because targets are large. Two-finger drag still pans.
  - **Conversational placement:** *put pricing under offers*, *move the timeline to the right of kickoff*, *B goes at month two*. Spark moves the card and marks it.
  Plus **Before / After** on the chip when the card is inside an ordered group, and **Into group…** which lists groups by name. The list view from Round 1 survives as the accessibility view (Section 22 of Round 1), not as the phone's primary view.
- **B. The Round 1 list with read-only spatial view.** Rejected as a capability reduction.

**Member experience of A.** A phone member in Scenario B taps "Onboarding", taps Move, taps the spot before "Kickoff"; the card moves and Spark says *Onboarding is now before Kickoff.* To connect, they tap Timeline, tap Connect, tap Kickoff, and Spark asks its one meaning question (*Timeline leads to Kickoff?*). To group, Into group… shows the existing groups and *new group*. Nothing requires precision under a finger, nothing is off-limits, and a member who prefers to talk can do all of it by voice.

**Conflicts.** B conflicts with the binding cross-device requirement. A conflicts with nothing; it satisfies parity, touch accessibility (44pt targets, no drag required), and non-hover controls.

**Founder judgment required?** No. The binding rule ("important capability must not disappear because the member changes devices") already decides that phone VTS must support spatial placement. The remaining question was a design one, answered above.

**Recommendation.** A. Replace Round 1's phone VTS with select-then-place on the full canvas, with tap-to-place, zoomed local drag, and conversational placement as three equivalent paths. Retire the read-only spatial view. Apply the same select-then-place model to moving elements in Create artifacts on phone (Round 1 Section 9 had the same flaw).

**Status: ALREADY RESOLVED BY CANONICAL RULE** (capability parity across phone, tablet, desktop; accessibility), with a corrected design.

---

### Item 8: Demo voice and style

**Member-experience problem.** The five optional demos need a form. Captions are required regardless (accessibility). The open question is whether they also carry a spoken narration, and if so, in what voice.

**Why a decision is necessary.** This is a brand and tone preference. Nothing in the canonical rules says whether Spark's demos speak aloud.

**Cognitive burden.** A narrated demo asks the member to listen and watch at once and often plays in a place where sound is off (phone in a waiting room). A caption-only demo asks the member to read while watching, which is lighter for some and heavier for others. Both are short.

**Options.**

- **A. Captioned, no narration.** Silent screen recordings with short on-screen captions and a subtle highlight on the control in use. Plays correctly muted. Cheapest to produce, easiest to keep current when the product changes.
- **B. Narrated plus captions.** A human voice (or a consistent synthetic one) explains while the recording plays. Warmer, more "someone sitting beside you". Higher production cost and a voice-consistency question every time a demo is re-recorded.

**Member experience.**

- A: tap *Show me*, watch 30 seconds, read four or five captions, close. Works on a muted iPhone without a headphone hunt.
- B: the same, with a voice. On a muted phone the member falls back to captions anyway.

**Conflicts.** None for either. Accessibility requires captions in both.

**Founder judgment required?** Yes, but small. It is a brand-voice preference and a production-cost tradeoff, not an experience-principle question.

**Recommendation.** A for V1. Members will most often reach a demo in the middle of work, on a phone, possibly muted. Captions plus a highlighted control communicate the task without sound, and demos must be re-recorded whenever the product changes, so the cheaper form keeps "Spark knows how Spark works" true. Narration can be added later without changing the experience design. Whose voice, if B is chosen, is a brand decision outside this report.

**Status: TRUE FOUNDER DECISION** (see Section 4).

---

### Item 9: Capture-and-hold relationship to other Estate areas

**Member-experience problem.** A member in Create says *idea for the retreat… don't make it yet, just hold it.* Spark must preserve the words and the intention without turning a thought into a task, project, artifact, reminder, or commitment, and without inventing a new holding area.

**Why a decision seemed necessary.** Round 1 asked whether the held thought should also be reachable from Parking Lot or Clear My Mind.

**Cognitive burden.** If the thought disappears, the member has to remember it. If it becomes a task or project, the member has an obligation they did not ask for. If it lives in two places, the member has two records to reconcile.

**Options.**

- **A. The conversation simply stays what it is.** Spark says *Got it. I'll hold it.* Nothing is created. The thread holds the member's words and the one line of intention Spark understood (*retreat idea, three days, evenings; you didn't want it made yet*). It is reachable by describing it (*what was that retreat idea?*) and appears under Continue something only because the member themselves signaled a return (*hold it* is a return intent). If the member later says *forget that*, it stops appearing. No copy anywhere else.
- **B. Also mirror it into another Estate area.** Creates a second record of the same thought.

**Member experience.**

- A: the member speaks, hears *I'll hold it*, and moves on. Days later, *what was that retreat thing?* brings it back with their own words. Nothing nagged them in between.
- B: the thought appears in two places, and the member may wonder which is "real" or whether acting on one clears the other.

**Conflicts.** B conflicts with "One coordinated system: avoid parallel conflicting records" and with "Consent before commitment". A conflicts with nothing: it obeys "business topic ≠ work intent", "a thought is allowed to remain a thought", and "Return without reconstruction".

**Founder judgment required?** No, not for Create/VTS. The canonical conversation law answers it: nothing is converted, one record exists, it is found by memory. Whether the Estate's existing continuity mechanisms (Parking Lot, Clear My Mind) also surface a thought spoken inside Create is a question about those areas' current behavior, which this session could not inspect. It is marked **Unknown**, not manufactured into a decision.

**Recommendation.** A. Round 1 already described this behavior; the correction is to be explicit that *hold it* creates nothing and that Continue something lists it only because the member asked Spark to hold it. If the member says *hold it* without any return intent (*just so you know*), it does not appear under Continue something at all; it remains findable by description.

**Status: ALREADY RESOLVED BY CANONICAL RULE** (Business topic ≠ work intent; Consent before commitment; one coordinated system, no parallel records).

---

### Item 10: "Looks good" semantics

**Member-experience problem.** After an attempt, the member taps **Looks good**. What should that do: just stop alternatives, or also create a Save checkpoint?

**Why a decision seemed necessary.** Round 1 chose "stop offering alternatives, move toward finishing" and flagged that auto-saving would blur Save with approval.

**Cognitive burden.** If *Looks good* silently saves, the member has two things that mean "keep this" and may not know which one they did. If it does nothing protective, a later *make it warmer* could change the thing they just approved of, and they would have to know to press Save first, which is a hidden executive-function demand.

**Options.**

- **A. Looks good is a reaction that protects, not a Save.** It marks the state as praised (Round 1 already protects praised states from whole-scope changes and shows them in Restore), stops Spark from offering alternatives, and brings the finishing actions forward. Save remains the member's explicit checkpoint with their own words.
- **B. Looks good creates a Save checkpoint automatically.**

**Member experience.**

- A: tap Looks good → Spark: *Good. Want to finish up, or keep going?* The approved state is safe from being redesigned. If the member later says *save this*, that is a named checkpoint. Two concepts, both understandable: "I like this" and "keep this".
- B: tap Looks good → a checkpoint appears in Restore with a label the member did not choose. Save now means two things.

**Conflicts.** B conflicts with "Save is different from autosave" (Save is a member-selected checkpoint) and with "Respond to the person before advancing the process" (a reaction should not silently advance state). A conflicts with nothing.

**Founder judgment required?** No. The Round 1 protection of praised work already gives the safety that B was reaching for, without confusing Save. The canonical distinction settles it.

**Recommendation.** A. Keep the button, keep it a reaction, keep praised-state protection doing the safety work.

**Status: ALREADY RESOLVED BY CANONICAL RULE** (Save ≠ autosave; Respond to the person before advancing the process; Protect work the member likes).

---

### Item 11: Brand promotion path

**Member-experience problem.** The member tries navy in one creation, likes it, and says *make this my new brand color.* Spark must not change canonical brand truth from inside a creative experiment, but must not make the member walk to the Brand Profile and re-enter a color Spark just helped them find.

**Why a decision seemed necessary.** Round 1 asked whether Spark may pre-fill the Brand Profile confirmation or only navigate there.

**Cognitive burden.** Manual reconstruction (find the Brand Profile, find the color field, remember or look up the value) is exactly the kind of mechanical burden Spark exists to carry. Silent promotion is a canonical-truth risk and a contamination risk across every future creation.

**Options.**

- **A. Spark carries the proposed change into the Brand Profile's own confirmation, pre-filled; nothing changes until the member confirms there.** The confirmation is the Brand Profile's experience, presented as a sheet over the Create thread so no work is lost. It shows current versus proposed, what it affects (*every new creation using your Studio brand*), and one-tap confirm or cancel. On confirm, the Brand Profile changes. On cancel, the creation keeps navy locally (*Trying navy, just here* stays on the chip).
- **B. Spark navigates the member to the Brand Profile and leaves them to enter it.**

**Member experience.**

- A: *Make this my new brand color* → sheet: *Change your Studio brand's main color from teal to navy? This affects new creations, not old ones.* → **Change it** / **Not now** → back to work. Ten seconds, no reconstruction, canonical truth changed only where it lives.
- B: the member leaves their work, hunts, types a color value, and returns. Some will not bother and will keep re-applying navy by hand forever.

**Conflicts.** B conflicts with "Spark carries mechanical burden" and "Recognition over recall". A conflicts with nothing: LOCAL APPLICATION ≠ CANONICAL TRUTH CHANGE is preserved, because the change happens only through the Brand Profile's confirmation, with explicit consent.

**Founder judgment required?** No. "Consent before commitment" plus "Spark carries mechanical burden" plus "Temporary style experiments must not silently overwrite canonical Brand Profiles" together produce A. Pre-filling a confirmation is not changing truth.

**Recommendation.** A. One safeguard: the confirmation always states the scope of effect in plain words and never offers "apply to all my old creations", which would be a separate, larger action.

**Status: ALREADY RESOLVED BY CANONICAL RULE** (Consent before commitment; Brand authority protected; Spark carries mechanical burden).

---

## 3. FALSE / ALREADY-RESOLVED FOUNDER DECISIONS

These were listed in Round 1 Section 30 but do not require Founder judgment. Each is answered by a rule Spark Estate already has.

| Item | Resolved by |
|---|---|
| 2. Deleted-work grace period | Delete = intentional deletion and Undo = reverse a change (brief vocabulary); Mistakes should be cheap; no trash or retention administration. Result: confirm, then immediately undoable, then gone. |
| 4. Tucking alternatives | The system carries structure; Information does not automatically deserve attention; Recognition over recall. Result: Spark folds the strip itself; no member tucking. |
| 5. Welcome threshold | Return without reconstruction; Information does not automatically deserve attention; no shame-based work management. Result: an intention test, not a time threshold. |
| 6. Try Another default | One strong first attempt over a gallery; Show before asking; minimum necessary decisions. Result: one alternative on every device. |
| 7. Phone VTS scope | Capability parity across phone, tablet, desktop; accessibility. Result: full canvas on phone with select-then-place; Round 1 design corrected. |
| 9. Capture-and-hold | Business topic ≠ work intent; Consent before commitment; one coordinated system without parallel records. Result: the thought stays a conversation, one record, found by memory. |
| 10. "Looks good" semantics | Save ≠ autosave; Respond to the person before advancing the process; Protect work the member likes. Result: a protecting reaction, not a Save. |
| 11. Brand promotion path | Consent before commitment; Brand authority protected; Spark carries mechanical burden. Result: pre-filled Brand Profile confirmation, truth changes only on confirm there. |

Also closed by this round's locked decisions:

| Item | Resolved by |
|---|---|
| 1. Client-context confirmation | Founder Decision 56 (LOCKED). |
| 3. Drive destination | Founder Decision 57 (LOCKED). |

One thing is neither a decision nor resolved: whether Parking Lot or Clear My Mind also surface a thought spoken inside Create depends on those areas' current behavior, which this session could not inspect. Status: **Unknown**, outside Create/VTS scope, no decision manufactured.

---

## 4. TRUE FOUNDER DECISIONS REMAINING

Only one.

**FOUNDER DECISION 58 (proposed number; not locked)**

**Question:** Should the five optional Create/VTS demos be silent with captions, or narrated with captions?

**Option A:** Captioned only. Silent screen recordings, short captions, the control in use highlighted. Plays correctly on a muted phone.

**Option B:** Narrated plus captions. A consistent voice explains over the recording. Voice choice would be a separate brand decision.

**Experience-design recommendation:** Option A for V1.

**Why:** Members most often reach a demo mid-task on a phone that may be muted, so captions do the real work either way. Demos must be re-recorded whenever the product changes to keep Spark's help truthful, and the caption-only form is far cheaper to keep current. Narration can be layered on later without changing anything else in the design.

**What changes depending on the answer:** Only demo production and the demo player (a mute control appears for B). No screen, flow, or principle changes.

---

## 5. Corrections to the Round 1 report

These conflict with Decisions 56 or 57, or with an existing canonical rule, and have been applied to the Round 1 file on the same branch. The Round 1 file's Section 30 now marks items 1 and 3 as locked and points the rest here.

1. **Section 21, client boundaries.** Removed "how firmly client context is confirmed at thread start is a FOUNDER DECISION". Replaced with Decision 56's rule: established boundaries persist through the thread and re-entry, Spark asks only when genuinely ambiguous, and never infers across an ambiguous boundary.
2. **Section 28, item 6.** Removed "adds one question at the start of some threads". Under Decision 56 the question occurs only on ambiguity, not at thread start by default.
3. **Section 31, recommendation 12.** Removed "pilot the client-confirmation question to choose strictness". Strictness is locked. Replaced with: validate that Spark's detection of ambiguity (multiple plausible clients, conflicting context) is reliable, since the rule depends on it.
4. **Section 16, Save to my Drive.** Replaced the open destination with Decision 57: one-time default of My Drive / Spark Estate (or the member's choice), one-time instructions do not change it, ongoing preferences may, no hierarchies, and no claims of replace/update/sync beyond proven capability. "Replace the Drive copy" is now offered only if proven, with new copy as the default.
5. **Section 15, sheet description line.** Aligned the Drive description with Decision 57 wording.
6. **Scenario H.** Rewritten Drive lines to show the one-time default exchange and the honest second-save behavior.
7. **Section 6, VTS on phone, and Section 23, VTS on phone.** Replaced the ordering-and-grouping list with read-only spatial view by the full canvas with select-then-place (tap-to-place, zoomed local drag, conversational placement). The list remains as the accessibility view in Section 22. Reason: capability parity.
8. **Section 9, direct editing on phone.** Replaced "dragging is replaced by nudge arrows" and the suggestion to use a bigger device with select-then-place and zoomed local drag for elements, keeping nudge and Bigger/Smaller as extra precision tools. Reason: capability parity.
9. **Section 17, phone line.** Removed "or open this on your tablet or laptop, where you can drag pieces here in Spark". The phone can move pieces; the escalation offer is about editable external continuation, not about the phone lacking capability.
10. **Section 27, version clutter.** Removed the "tuck the rest away?" offer and the related FOUNDER DECISION reference. Replaced with Spark folding the strip on its own.
11. **Section 16, Delete.** Replaced the open "grace period" with the resolved model: confirm, immediately undoable, then gone; no trash.
12. **Section 30.** Items 1 and 3 marked resolved by Founder Decisions 56 and 57. Items 2, 4, 5, 6, 7, 9, 10, 11 marked resolved by canonical rule with a pointer to this document. Item 8 remains open as proposed Decision 58.
13. **Scenario I, phone capture.** Clarified that *hold it* creates nothing and that Continue something lists it only because the member asked Spark to hold it.

No other Round 1 material was changed.

---

## 6. Final cross-device check

The test: does each important capability exist on every device, with interaction adapted rather than removed?

### Phone

- **Start from mess:** yes. Text, voice, attach, paste, previous creation. Mic is the largest control.
- **First attempt and reaction:** yes. Stage collapses to a strip when the keyboard opens so the work stays visible.
- **Conversational editing:** yes, identical to other devices; voice favored.
- **Direct editing:** now yes in full. Select-then-place for moving elements, zoomed local drag for precision, Bigger/Smaller and nudge as extra tools. Text editing in place. Corrected this round.
- **VTS arrangement:** now yes in full. Full canvas, tap-to-place, zoomed local drag, Before/After, Into group, Connect, and conversational placement. Nothing read-only. Corrected this round.
- **Create ↔ VTS:** yes, as a scroll-position change with a sticky one-line label.
- **Try another, Undo, Restore:** yes, all as labeled buttons plus words; Restore shows thumbnails.
- **Finding:** yes, cards in a vertical list, voice input pinned.
- **Finishing:** yes. Print and Export go through the system share/print sheet, announced in advance. Drive save uses the Decision 57 default.
- **Brand promotion:** yes, as a bottom sheet over the thread.
- **Help and demos:** yes; demos play in a sheet and return exactly to the work.
- **Keyboard, Back, sheets, targets:** input pinned above the keyboard; Back never loses the thread; all overlays are dismissible sheets; 44pt targets; no horizontal page scroll (the Set strip is the only intentional horizontal scroll, and no control depends on it).

### Tablet / iPad

- Everything above, plus free drag with snapping, enclosure-gesture grouping, Pencil grouping strokes, and two-finger tap Undo.
- Landscape splits stage or canvas and thread; the keyboard pushes the thread, not the stage.
- Split-view drag-and-drop for material.
- Split and floating keyboards flagged for early testing (unchanged from Round 1).

### Laptop / desktop

- Everything above, plus keyboard shortcuts (Enter, Shift+Enter, Cmd/Ctrl+Z, Escape, arrows, Tab order), true-size viewing, and on-request side-by-side comparison of two Set items.
- Extra width is not filled with panels; tray and strip expand only when opened.
- Sheets become anchored popovers or side panels; nothing opens a new window.

### Parity result

After this round's corrections, no important capability is absent on any device. The one remaining device difference is interaction style: phone places by selecting then tapping or speaking, tablet and desktop may also drag freely. The meaning produced (position, groups, order, relationships, edits) is identical, so a thread moves between devices without loss.

Cross-device persistence itself remains an unproven technical assumption, as in Round 1. The honesty rule stands: if Spark cannot guarantee the latest state, it says *last saved from your tablet at 9:40* rather than showing stale work silently.

---

## Evidence Matrix

**Sources Available:** this round's assignment (Founder Decisions 56 and 57, and special-attention notes); the Round 1 report on branch `claude/spark-create-vts-design-adzo9q`; the Spark Estate Master Architect skill references.

**Sources Used:** the Round 2 assignment; `SPARK_CREATE_VTS_FABLE_EXPERIENCE_DESIGN_2026-09-18.md`; skill references 01, 02, and 04 (operating principles, founder context, ADHD founder experience).

**Sources Missing:** no implementation of Create, VTS, Welcome, Parking Lot, Clear My Mind, Brand Profile, Business Understanding, Canva, or Drive was available. The behavior of Parking Lot and Clear My Mind with respect to thoughts spoken in Create is Unknown.

**Confidence Can Be Raised By:** inspecting the current Welcome and Parking Lot continuity behavior; validating the proven Drive capability (folder creation, member folder choice, replace-in-place); validating structured history sufficient for immediate undo of a delete; usability testing select-then-place on iPhone.

**Confidence Level:** Moderate for the analysis (Documented brief and Documented principles agree). Low for anything depending on implementation, labeled as such.

**Approval Status:** Proposed, except Founder Decisions 56 and 57, which are Locked by the Founder.
**Decision Owner:** Founder.

---

## Decision Record

```
Decision:        Incorporate Founder Decisions 56 and 57 into the Create + VTS
                 experience specification; treat Round 1 Section 30 items 2, 4,
                 5, 6, 7, 9, 10 and 11 as resolved by existing canonical rules;
                 correct the phone VTS and phone direct-editing designs for
                 capability parity; leave one decision (demo narration,
                 proposed 58) open for the Founder.
Reason:          Reduce decisions rather than create them. Eight of nine items
                 were answered by rules Spark Estate already holds.
Date:            2026-09-18
Approved by:
Supersedes:      Round 1 Section 30 items 1 through 11 as an open list;
                 Round 1 phone VTS design (Sections 6 and 23) and phone
                 direct-editing design (Section 9).
Related systems: Create, Visual Thinking Studio, Welcome Home, Brand Profile,
                 Business Understanding, Drive connection, Canva connection.
                 Evidence Vault: explicitly none.
Evidence used:   Round 2 assignment (Founder Decisions 56, 57); Round 1 report;
                 Spark Estate Master Architect references 01, 02, 04.
```
