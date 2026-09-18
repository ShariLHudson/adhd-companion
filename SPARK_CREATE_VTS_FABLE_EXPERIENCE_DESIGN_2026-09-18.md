# Spark Estate: Create + Visual Thinking Studio Experience Design Report

**Deliverable type:** Member experience design report (Founder Experience-Design Round)
**Prepared for:** Shari Hudson, Founder, Visual Spark Studios and Spark Estate
**Prepared by:** Claude Code, acting as independent senior product-experience designer (session "Create + VTS design", 2026-09-18)
**Approval Status:** Proposed
**Decision Owner:** Founder (UX recommendations from this report; architecture untouched)
**Scope:** Member experience for Create, Visual Thinking Studio (VTS), and the movement between them. No architecture, agent, data, API, privacy, or V1-scope changes are proposed.

---

## How to read this on a phone

Every numbered section stands alone. If you read only three things, read:

1. Section 1 (the concept in one page)
2. Section 26 (the twelve scenarios, which show the whole experience in use)
3. Section 30 (the decisions only you can make)

Screen descriptions use the same shape every time: what the member sees, what dominates, what controls appear, what is hidden, what Spark says, what happens next, then phone / tablet / desktop.

Throughout, **"the thread"** means the ongoing conversation with Spark about a piece of work, and **"the stage"** means the area showing the thing being made. Those are report words, not member-facing labels. The member sees no new vocabulary.

---

## Contents

- [Evidence Matrix](#evidence-matrix)
- [1. Executive experience concept](#1-executive-experience-concept)
- [2. Create Home design](#2-create-home-design)
- [3. First-time experience](#3-first-time-experience)
- [4. Returning-member experience](#4-returning-member-experience)
- [5. Active Create workspace](#5-active-create-workspace)
- [6. VTS workspace](#6-vts-workspace)
- [7. Create ↔ VTS transitions](#7-create--vts-transitions)
- [8. Conversational editing](#8-conversational-editing)
- [9. Direct manipulation and editing](#9-direct-manipulation-and-editing)
- [10. Creation Sets](#10-creation-sets)
- [11. Undo, recovery, alternatives](#11-undo-recovery-alternatives)
- [12. Working-material experience](#12-working-material-experience)
- [13. Finding and retrieving creations](#13-finding-and-retrieving-creations)
- [14. Welcome re-entry](#14-welcome-re-entry)
- [15. Finishing actions](#15-finishing-actions)
- [16. Print, Save, Drive, Delete](#16-print-save-drive-delete)
- [17. Canva and editable escalation](#17-canva-and-editable-escalation)
- [18. Contextual capability discovery](#18-contextual-capability-discovery)
- [19. Spark product help](#19-spark-product-help)
- [20. Optional demos](#20-optional-demos)
- [21. Trust, quality, provenance](#21-trust-quality-provenance)
- [22. Accessibility behavior](#22-accessibility-behavior)
- [23. Phone design](#23-phone-design)
- [24. Tablet and iPad design](#24-tablet-and-ipad-design)
- [25. Laptop and desktop design](#25-laptop-and-desktop-design)
- [26. Required scenarios A–L](#26-required-scenarios)
- [27. Pressure-test findings](#27-pressure-test-findings)
- [28. Cognitive-load risks](#28-cognitive-load-risks)
- [29. What should be simplified](#29-what-should-be-simplified)
- [30. FOUNDER DECISION NEEDED](#30-founder-decision-needed)
- [31. Recommendations within binding architecture and V1](#31-recommendations-within-binding-architecture-and-v1)
- [Decision Record](#decision-record)

---

## Evidence Matrix

**Sources Available:** the assignment brief in this session; the Spark Estate Master Architect skill references (operating principles, founder and product context, ADHD founder experience standards); the `sharilhudson/adhd-companion` repository on branch `claude/spark-create-vts-design-adzo9q`.

**Sources Used:** the assignment brief (authoritative for Create/VTS behavior); `references/01-operating-principles.md`, `references/02-founder-and-product-context.md`, `references/04-adhd-founder-experience.md` from the skill; repository file `SPARK_ESTATE_FABLE_01_THE_BEAVER_WHO_KEPT_LOSING_THE_RIVER.md` (for deliverable conventions only).

**Sources Missing:** no Create, VTS, Welcome, Brand Profile, Business Understanding, Canva, or Drive implementation, route, screen, or test exists in this repository. No approved Create/VTS specification beyond the brief was available. No Drive documents were accessible in this session.

**Confidence Can Be Raised By:** reviewing this report against the current Welcome Home and VTS implementation (routes, components, persistence), against the approved Brand Profile and Business Understanding specifications, and against the proven Canva and Drive connection capabilities.

**Confidence Level:** Moderate for experience design (Documented brief plus Documented principles agree). Low for anything that depends on implementation, which is labeled throughout as intended behavior, never as existing behavior.

**Approval Status:** Proposed.
**Decision Owner:** Founder.

Every technical assumption the brief lists as unproven (structured visual-data binding, chart fidelity, automated semantic checking, export fidelity, persistent cross-device state, structured history, Canva and Drive specifics, external state visibility, provenance mechanics, large-document performance, context isolation, how Spark learns current capability) is treated here as **intended behavior to design around**, not as something that exists.

---

## 1. Executive experience concept

### The one-sentence promise

The member tells Spark what they have in mind, in whatever state it is in, and something useful appears that they can react to, change in plain words, see differently when they are stuck, come back to after a week, and finish with one honest action.

### The five moves that make the whole thing work

1. **Show before asking.** Spark produces one strong first attempt from whatever the member gave it, states at most two assumptions in one line, and invites reaction. Reaction is cheaper than specification.
2. **Requested scope sets editing scope.** "Make the title bigger" changes the title. Nothing else moves. Every change is visibly marked, so the member never has to hunt for what Spark did.
3. **Mistakes are one sentence away from fixed.** "No", "put it back", "I liked it before", and "keep the picture but not the headline" all work. Undo, Restore, Try Another, and Start Over stay distinct, and none of them destroys work the member liked.
4. **Meaning travels, not screenshots.** When the member cannot see how things fit, Spark lays the pieces out in VTS. When they say "put that in the report", the structure they arranged becomes the structure of the artifact. Nobody re-explains anything.
5. **Spark carries the filing cabinet.** No names, folders, versions, tags, statuses, or projects are asked for. Creation Sets, checkpoints, and descriptions are generated from the work and the conversation, and the member finds things by describing what they remember.

### What the member never sees

- A choice between Create and VTS before getting help
- A format, template, size, or style question at the start of ordinary work
- A version number, revision tree, or status pipeline
- A file manager, template gallery, or capability directory as the front door
- A checklist they must review before something counts as ready
- A "VERIFIED" badge for anything Spark did not actually check
- A mandatory tutorial, or a dashboard of unfinished work

### What the member always has

- One input that accepts text, voice, and material, on every device
- One clear next action after every Spark response
- The ability to say "no" and be understood
- Their earlier good states, protected
- Honest language about what Spark checked, what it used, and what a connection can really do

### The feeling at the end

"I didn't have to figure out the software. I just made what I needed."

---

## 2. Create Home design

Create Home is a creative entrance, not a place to manage anything.

### What the member sees

A calm, mostly empty screen. Near the vertical center, one line of large text:

**What would you like to make?**

Beneath it, smaller: *Tell Spark what you have in mind, even if it isn't figured out yet.*

Beneath that, the conversational input: a text field with a microphone button and an attach button. The field is tall enough to feel like a place for a paragraph, not a search box.

Beneath the input, three quiet text buttons in a row (stacked on phone):

**Create something** · **Continue something** · **Find something**

That is the whole first screen.

### What is visually dominant

The question and the input. Everything else is secondary by size, weight, and contrast.

### What controls appear

- Text input (multi-line, grows as typed)
- Microphone (large, always visible, not hidden in a menu)
- Attach (files, images, screenshots, pasted links, previous creations)
- The three optional paths
- Back to Welcome (standard Estate navigation, not a Create-specific control)

### What is intentionally hidden

- Templates, formats, categories, artifact types
- Recent files grid
- Brand and business settings
- Any mention of VTS as a separate place (the member can reach VTS intentionally through the Estate, but Create Home does not present a fork)
- Demos (they are offered in context, not on the front door; see Section 20)
- Tips, badges, streaks, counts

### What Spark says

Nothing extra. The question is the greeting. If the member has meaningful unfinished work, **Continue something** gains a one-line subtitle showing the most recent piece, in the member's own terms (for example, *Your workshop graphic, from Tuesday*). If there is nothing meaningful to continue, the subtitle is absent. The button never shows a count.

### What happens next

- Typing or speaking anything and sending it opens the thread. Spark begins work immediately (Section 5).
- **Create something** simply focuses the input. It exists for the member who wants a labeled door, not a different destination. It may also reveal three gentle example phrasings under the input (*a one-page handout for my workshop* · *something that explains this to a client* · *I don't know yet, help me think*) which disappear on first keystroke.
- **Continue something** opens the small recognition list (Section 4).
- **Find something** opens the conversational finder (Section 13).

### Phone

Question, input, and mic fill the first viewport. The three paths sit below the input. When the keyboard opens, the question shrinks to a single small line, the input stays pinned above the keyboard, and the mic remains visible inside the input bar. Attach opens a bottom sheet (camera, photo library, files, paste, "something I made before"). Nothing scrolls horizontally.

### Tablet

Same layout, centered, with more breathing room. The attach sheet becomes a side sheet in landscape. Drag-and-drop of images onto the input is supported in addition to the attach button, never instead of it.

### Desktop

Same single column, centered, max width around 720px so the eye is not asked to travel. The extra width is not filled with panels. Drag-and-drop and paste are supported. Keyboard: Enter sends, Shift+Enter adds a line, and a visible hint says so.

---

## 3. First-time experience

There is no onboarding. The first-time Create Home is identical to Section 2 with two small additions:

1. Under the input, a single line: *You can type, talk, or drop in anything you've got. Messy is fine.*
2. Under the three paths, one quiet link: *Watch a 30-second example* (Section 20, Demo 1). It is a link, not a card, and it never blocks.

The first-time member's first creation follows the same show-before-asking path as everyone else. The only first-time difference inside the thread: after the first attempt appears, Spark's one-line explanation includes, once, the sentence *You can tell me what to change in plain words, or tap anything to adjust it.* This line does not repeat on later creations.

If no Brand Profile exists yet, Spark does not ask for one. It makes a clean, neutral first attempt and says nothing about brand. Brand becomes relevant only when the member mentions colors, logo, or "make it look like mine" (Section 18), or when a Brand Profile already exists in the Estate.

No account setup, style quiz, or preference screen stands between the member and their first creation.

---

## 4. Returning-member experience

A returning member arrives at Create Home and sees Section 2, with **Continue something** carrying a subtitle if, and only if, there is meaningful unfinished work.

### The recognition list (Continue something)

Tapping it opens a sheet with at most three items. Each item is a recognizable card: a thumbnail of the work as it last looked, one line describing it in the member's language, and one line of meaning that Spark reconstructs from the thread.

Example card:

> *[thumbnail]*
> **Workshop graphic**
> You were making an editable version so you could move the individual pieces. Tuesday.

Tapping a card reopens the thread with the stage showing the last state and Spark saying the one line of meaning, then stopping. No summary of everything that ever happened. One next action is offered when it is obvious (*Want me to carry on with the editable version?*).

### Ordering

Most recently touched first. Never sorted by "overdue". No dates older than a week are shown as dates; they become *last week*, *a couple of weeks ago*, *in August*. Nothing shows a count of unfinished items.

### When nothing qualifies

The **Continue something** button stays, but tapping it says: *Nothing waiting on you. Start something new, or tell me what you're looking for.* No empty-state illustration, no encouragement.

### Phone / Tablet / Desktop

Phone: bottom sheet, one card per row, thumbnail left, text right. Tablet: same sheet, wider cards. Desktop: a small popover under the button. On all devices, Back or tapping outside closes the sheet without side effects.

---

## 5. Active Create workspace

This is where most time is spent. It has two parts: the thread (conversation with Spark) and the stage (the thing being made). On every device the member can reach both with one gesture.

### What the member sees (first attempt just landed)

The stage shows one artifact, large and legible. Directly under it, Spark's message, short:

> Here's a first version. I used your notes for the words and kept it to one page. Tell me what to change, or tap anything to adjust it.

Under Spark's message, three quiet actions:

**Try another** · **Change something** · **Looks good**

Then the input, with mic, pinned at the bottom.

### What is visually dominant

The artifact. Spark's text is secondary. The three actions are tertiary. There are no toolbars.

### What controls appear

- The input with mic and attach (always)
- Try another / Change something / Looks good (after each generation)
- Tap-to-select on the artifact (Section 9)
- A small **Undo** control that appears only after a change has been made, next to the input, and stays until the thread is left
- A quiet **Set** strip under the stage once a Creation Set has more than one item (Section 10)
- A quiet **Material** tray toggle once material has been added (Section 12)
- **Done for now** in the top corner, which opens finishing actions (Section 15)
- Back (Estate-standard) which returns to Create Home and never discards anything

### What is intentionally hidden

- Format, size, export settings, layer panels, alignment tools
- Version numbers and history trees
- A quality checklist
- Any list of other things Spark could make
- Any indication of which underlying capability (Create or VTS) is doing the work

### What Spark says

Always in this order: what it made, what it assumed (max two, one sentence), what to do next (one sentence). No preamble, no apology, no menu of options. When it cannot safely infer something that materially matters, it asks one question, after showing the attempt, never before.

### What happens next

The member reacts. Reactions can be words, taps, or voice. Every change produces a marked stage (Section 8) and a one-line statement of what changed.

**Looks good** does not finish anything. It tells Spark to stop offering alternatives and moves the thread toward finishing (Section 15), while keeping the work editable.

### Phone

Stacked. Stage on top, sized to fit the viewport width, pinch-to-zoom for detail. Spark's message and the three actions below. Input pinned at the bottom with a large mic. When the keyboard opens, the stage collapses to a thin strip showing a thumbnail of the current state and the name of any selected element, so the member can still see what they are talking about. The last Spark message stays visible above the input. Scrolling up reveals the thread history. No horizontal scrolling anywhere.

### Tablet

Portrait: same as phone with a larger stage. Landscape: stage left (about 60%), thread right, input under the thread. Touch selection on the stage, with a small floating chip showing what is selected. The keyboard, when open, pushes the thread up and leaves the stage in place.

### Desktop

Stage left, thread right, input under the thread. The stage may show the artifact at true size when it fits. A second artifact from the same Set can be shown side by side when the member asks to compare (*show me both*). Extra width is not used for panels the member did not ask for.

---

## 6. VTS workspace

VTS helps the member see it. It is a spatial canvas where ideas, pieces of material, and parts of an artifact become movable cards with visible relationships.

### What the member sees

A canvas with cards. Each card carries a short label, and optionally a thumbnail or a few words of content. Relationships appear as simple lines or grouped enclosures. Spark's message sits below the canvas (phone) or beside it (tablet/desktop). The same input with mic is present.

When Spark builds the first layout, it says what the layout represents:

> I laid out the six sections from your draft. The arrows show what leads to what, as far as your notes say. Two things (the pricing and the timeline) I couldn't tell how they connect, so they're off to the side. Move anything, or tell me.

### What is visually dominant

The cards and their arrangement. Not the tools.

### What controls appear

- Drag to move (touch or pointer)
- Tap to select a card; a small chip shows *Group* · *Connect* · *Edit words* · *Remove from view*
- Pinch/scroll to zoom, two-finger or drag-on-empty to pan
- **Tidy** (Spark re-spaces the cards without changing any relationship)
- **Put this into…** when the exploration came from or should go to an artifact (Section 7)
- Undo, input, mic, Done for now, Back (as in Section 5)

### What is intentionally hidden

- Shape libraries, color pickers, connector styles, layer controls
- Any diagram-type chooser (mind map vs flow vs matrix). Spark picks the arrangement from the meaning and the member changes it in words: *make it a timeline*, *group these by client*.

### Visual semantic integrity in VTS

- Uncertain relationships are drawn differently from certain ones (dashed, with a small "?" that also reads as text for screen readers). Spark never draws an uncertain link as a solid one to look tidy.
- Cause is drawn as a directed arrow; association is drawn as an undirected line; sequence is drawn as ordered position. Spark states which it used.
- If Spark cannot tell the relationship type, it asks that one question, on the canvas, next to the two cards, and only then.
- Tidy never changes an arrow's direction or a group's membership.

### What Spark says

Only what the layout means and what is uncertain. It does not narrate every card.

### What happens next

The member arranges, and Spark keeps up with the meaning: moving a card into a group changes its group, connecting two cards creates a relationship, and Spark restates any change that alters meaning in one line (*Now "Pricing" leads to "Timeline". Right?*). When the member is satisfied, the arrangement can return to the artifact (Section 7) or stand on its own as a saved visual.

### Phone

Full VTS arrangement on a phone is precision-hostile. The phone VTS view therefore offers the same meaning with a lighter interaction model: cards in a scrollable vertical list grouped by their current groups, with drag handles to reorder and a per-card **Move to…** action to change groups. Connections show as text on the card (*leads to: Timeline*). A **See the layout** button shows the spatial view zoomable and read-only for orientation. Spark says, once: *You can rearrange here, or open this on a tablet or laptop to move things around freely.* Nothing is lost on phone; the arrangement is simply done through ordering and grouping rather than free placement. Voice works fully: *put pricing under offers*.

### Tablet

The primary VTS device. Full-screen canvas, direct touch manipulation, Spark's message as a bottom sheet that can be collapsed to a single line. Apple Pencil, when present, can draw a rough enclosure to group cards. Two-finger tap is Undo. Large touch targets (minimum 44pt) on every card and handle.

### Desktop

Canvas with the thread beside it. Keyboard: arrow keys nudge a selected card, Cmd/Ctrl+G groups, Delete removes from view (never deletes the underlying item). The stage of the originating artifact can be shown in a collapsed strip so the member remembers where this came from.

---

## 7. Create ↔ VTS transitions

The rule: **meaning travels with the work.** No re-explaining, copying, exporting, or architecture talk.

### Create → VTS (member is stuck seeing the whole)

Triggers, any of which is enough:

- Member says something like *I can't see how this fits together*, *this is a mess*, *I don't know what goes where*, *help me think about this*
- Member asks to *map this out* or *lay it out*
- Spark, after a large messy input, judges that structure is the material problem (it may then offer, once: *Want me to lay the pieces out so you can see them?*)

What happens: the stage transitions to the VTS canvas. The cards are the parts of the artifact and the material already in the thread. The thread continues, unbroken. Nothing is renamed. The member does not leave a "room".

Spark says one line about what the cards are. The artifact remains one tap away (a collapsed strip labeled with its thumbnail).

### VTS → Create (member has arranged the meaning)

Triggers:

- *Okay, put that into the report*
- *Make this into a one-pager*
- *Now write it up like that*
- Tapping **Put this into…** which offers the originating artifact (if any) as the first choice and *something new* as the second

What happens: Spark translates the arrangement into artifact structure. Groups become sections, order becomes sequence, arrows become stated relationships in the text, uncertain links become hedged language rather than confident claims. The stage returns to the artifact. Spark says what it did in one line:

> I reordered the report to match your layout and moved pricing under offers. The timeline stayed separate because you left it separate.

### What travels

- Which cards exist and what they contain
- Groups, order, and relationships, with their certainty
- The member's words about the pieces, from the thread
- The original material references

### What does not happen

- No screenshot of the canvas pasted into the artifact (unless the member explicitly asks for the visual itself to appear)
- No new thread, no "open in VTS" that loses the conversation
- No question about which system to use

### Both directions on each device

Phone: the transition is a vertical scroll position change, with a sticky one-line label at the top saying *Laying it out* or *Back to your one-pager*. Tablet: a crossfade between stage and canvas, respecting reduced motion. Desktop: canvas replaces the stage in place; the artifact thumbnail sits in a collapsed strip above.

### The phrase the member learns without being taught

*Show me* takes them to seeing. *Put that in* takes them back to making. Spark also understands dozens of variants.

---

## 8. Conversational editing

### The scope ladder

Every edit request is interpreted at the smallest scope that satisfies it:

1. **Element**: *make the title bigger*, *change this picture*, *fix that typo*
2. **Region**: *less text in the middle section*, *the bottom is crowded*
3. **Whole**: *make it warmer*, *make it feel more professional*, *I don't like it*

Element requests never change anything outside the element. Region requests never change other regions. Whole requests change tone or style but keep content, structure, and any element the member previously touched or praised, unless told otherwise.

### Showing what changed

After every edit, the changed parts are marked on the stage: a soft outline that fades after a few seconds (or, with reduced motion, a static marker that stays until the next action). Spark says in one line what it changed and nothing else:

> Title is bigger. Nothing else moved.

If a small edit forces a knock-on change (a bigger title pushes a line of text), Spark says so and marks both:

> Title is bigger, which pushed the subtitle down a line. Want me to shorten the subtitle instead?

### Ambiguity

When a request could apply to more than one thing (*change the picture* on a piece with three pictures), Spark does not ask "which one?" in words first. It highlights the candidates on the stage with small numbered chips and asks the shortest question: *This one, or one of the others?* The member taps or says a number. If one candidate is far more likely (the one just discussed, the one selected), Spark acts on it and says which, so a wrong guess is one Undo away.

### Style words

*Warmer*, *cleaner*, *bolder*, *calmer*, *more like me* are accepted as whole-scope requests. Spark applies one coherent interpretation, shows it, and says the two or three things it did (*warmer: softer background, rounder corners, the photo with people*). The member reacts. No slider, no style picker.

### Protecting praised work

If the member said *I like that headline* earlier in the thread, the headline is protected from whole-scope changes until they say otherwise. Spark mentions the protection only if it matters: *Kept the headline you liked.*

### Phone / Tablet / Desktop

Identical behavior. Phone favors voice: the mic is the largest control and a spoken edit shows a transcript line the member can correct before Spark acts if Spark's confidence in the transcript is low. Tablet and desktop add tap-to-select then speak or type (Section 9), which removes most ambiguity.

---

## 9. Direct manipulation and editing

Direct editing coexists with conversation. It is for precision the member wants to do with their hands, and it is deliberately small.

### Selection

Tap or click any element (text block, image, shape, chart, section). A selection chip appears near it naming the element in plain words (*Headline*, *Photo*, *Section 2*). The chip carries at most four actions relevant to that element:

- Text: **Edit words** · **Bigger** · **Smaller** · **More…**
- Image: **Swap** · **Crop** · **Bigger** · **More…**
- Section: **Less text** · **Move up** · **Move down** · **More…**

**More…** opens a short list (color from the brand palette, alignment, remove). Never a property inspector.

Selection also sets conversational scope: with the headline selected, *make it blue* means the headline.

### Moving and resizing

Tablet and desktop: drag to move, drag corners to resize, with snapping that the member does not configure. Phone: dragging is replaced by nudge arrows on the chip and **Bigger / Smaller** steps, because finger-drag precision on a phone produces frustration and accidental changes. A phone member who wants free movement is offered the editable escalation (Section 17) or told, honestly, that a tablet or laptop allows free dragging.

### Text editing

**Edit words** puts the text in place with the keyboard open. On phone, the stage strip keeps the block visible above the keyboard. Done or tapping elsewhere commits; Undo reverses.

### Rules

- Direct edits are marked and stated exactly like conversational edits.
- Direct edits never trigger a Spark redesign. Spark may notice an overflow caused by the edit and offer one fix, once.
- Every direct-edit control has a text label or accessible name; no icon-only controls without labels.
- Nothing requires hover. Nothing requires long-press to discover.

---

## 10. Creation Sets

A Creation Set is Spark's grouping of related artifacts and alternatives: the one-pager, its "try another" versions, the social-sized cut, the VTS layout that fed it. The member never creates, names, or manages a Set.

### What the member sees

Once a thread contains more than one artifact, a thin **Set strip** appears under the stage: small thumbnails, the current one highlighted, each with a two-or-three-word label Spark wrote (*first version*, *warmer*, *square for Instagram*, *your layout*). Tapping a thumbnail shows it on the stage. Nothing is destroyed by switching.

The Set itself has a name Spark derives from the work and the thread (*Workshop graphic*). The member can rename it by saying so, and never has to.

### What is hidden

- Version numbers
- Tree or branch diagrams
- Parent/child relationships
- File names and formats

### How alternatives and versions differ, from the member's side

They don't need to. The strip shows "the ones that exist". Spark's labels carry the meaning. If a member asks *which one is the newest?* Spark answers in words and highlights it.

### Whole → Part → Many, without explosion

When a member says *make everything I need for the workshop*, Spark does not create ten artifacts. It proposes the smallest useful set, in words, and makes one:

> I'd start with the one-page handout, then a square version for social and a slide title. Here's the handout first. Say "next" when you want the square one.

The Set grows one item at a time, each visible in the strip. The member can stop at any point with nothing half-made.

### Phone / Tablet / Desktop

Phone: the strip scrolls horizontally, but only the strip (thumbnails are small, the strip is the one place horizontal scrolling is intentional and it is never required to reach controls). Tablet and desktop: the strip shows all items without scrolling in most cases; desktop can show two side by side on request.

---

## 11. Undo, recovery, alternatives

### The vocabulary, kept distinct

| Member says or does | What happens |
|---|---|
| Back (interface) | Leaves the screen. Never changes the work. |
| Undo / "undo that" / "put it back" | Reverses the last change only. Repeatable. |
| Restore / "I liked it before" / "go back to the one from this morning" | Shows two or three recognizable earlier states as thumbnails with Spark's labels; member picks one. The current state is kept in the Set, not destroyed. |
| Try another / "show me a different one" | Makes an alternative beside the current one. Current one untouched. |
| Start over / "let's try a totally different direction" | Opens a new direction in the same Set. Previous work stays in the strip. Spark says so: *Starting fresh. Your earlier versions are still here.* |
| Save / "keep this one" | Marks a checkpoint (Section 16). |
| Delete | Intentional, confirmed, scoped (Section 16). |

Spark never uses the words "revision", "version 3", "branch", or "history" unless the member does.

### Partial reversal

*Keep the new picture but put my old headline back* is an ordinary request. Spark restores the headline from the state before the change and leaves the picture. It marks both and says: *Old headline is back, new picture stays.*

*Not all of it* after an Undo means: Spark shows the two or three things the last change touched as chips, and the member taps what to keep.

*You changed too much* is treated as a scope complaint: Spark reverses everything outside the requested scope, keeps the requested change, and adjusts its interpretation for the rest of the thread.

### Recognition, not recall

Restore never asks "which version?" It shows thumbnails with when-ish labels (*this morning*, *before the warmer look*, *the one you said you liked*). The member points.

### What is protected

- Any state the member praised (*I like that*, *perfect*, *keep this*)
- Any Saved checkpoint
- The state before any whole-scope change

Protected states are never silently overwritten and always appear in Restore. Autosave protects everything else quietly.

### Technical honesty

Structured recovery/history is an unproven assumption per the brief. The experience above is designed for that intended capability. If history depth is limited in V1, the member-facing rule should be *Undo always works for the current session; Restore shows what Spark can truthfully restore*, and Spark says *I can take you back as far as this morning* rather than implying unlimited history.

---

## 12. Working-material experience

Material is anything the member brings: pasted text, documents, screenshots, images, URLs, voice notes, connected material (through supported connections only), previous Spark creations, or several at once.

### Bringing material in

Attach from the input, drag-and-drop (tablet/desktop), paste, or just describe it in words. Multiple items at once is normal. The member is never asked to classify an item as "source", "reference", "asset", or "inspiration".

### How Spark treats it

Spark reads everything, uses what is useful, and says how it used it in one line:

> I used your notes for the words, the screenshot for the colors, and skipped the PDF because it looked like last year's agenda. Want it in?

That sentence does the work of a source-management screen. Corrections are conversational: *no, the PDF is the important one* changes the roles.

### The material tray

Once material exists, a small **Material** toggle appears near the stage. Opening it shows the items as thumbnails with Spark's one-line note per item (*words came from here*, *not used*). From the tray the member can say or tap *use this more*, *ignore this*, *this is the main thing*, or *remove*. Removing material from the thread never deletes the original.

### URLs and connected material

A URL is read once, when added. Spark says that plainly if it matters: *I pulled the text from that page just now; if the page changes, this won't.* Connected material is reachable only through proven connections; Spark never implies it can see something it cannot.

### Previous creations as material

*Use the thing I made for Kerry* pulls in a previous creation through the finder (Section 13), with recognition previews if ambiguous.

### Phone

Attach sheet: camera, photos, files, paste, previous creation. Screenshots taken on the phone are the most common phone material, so the sheet shows the most recent screenshot as a one-tap option. The tray opens as a bottom sheet.

### Tablet / Desktop

Drop zone is the whole stage and input. The tray opens as a side panel that can be collapsed.

---

## 13. Finding and retrieving creations

This is work memory, not file search. Members find things by describing what they remember.

### Entry

**Find something** on Create Home, or simply asking Spark anywhere in Create: *where's that teal thing?*, *the one with the circles*, *Kerry's thing*, *the one I opened in Canva*, *the graphic where I said the text was too small*.

### What Spark matches on

Visual qualities (color, shapes, layout), people and client names, topic words, time-ish references, what happened in the thread (what the member said, what was exported, where it was opened), and Set labels. Exact names, folders, dates, formats, rooms, and Set names are never required.

### The result

At most three or four recognizable previews. Each preview: thumbnail, Spark's label, one line of memory-context (*you said the text was too small, last Thursday*, *opened in Canva on Monday*). No table of metadata.

Spark says: *Is it one of these?* The member taps. If none match, the member adds a detail (*it was for the retreat*) and the previews change. Spark never asks a multiple-choice interrogation.

If exactly one match is strong, Spark shows it on the stage directly and says *This one?* with the others one tap away.

### After retrieval

The thread reopens where it was, with the same one-line re-entry meaning as Section 4. The member can continue, make a copy for a new purpose (*make one like this for Dana*), or just look.

### Finding in Create only

The finder shows Spark creations and their Sets. It does not search the member's Drive, external tools, or other Estate areas. If the member asks for something that is not a creation, Spark says so and points to where it lives in the Estate, without pretending Create is a universal search.

### Phone / Tablet / Desktop

Phone: results are a vertical list of cards, the input stays pinned so the member can add detail by voice. Tablet: a two-column card grid. Desktop: cards in a row with the thread beside them.

---

## 14. Welcome re-entry

Welcome is not a Create dashboard. Create may contribute **at most one** recommendation to Welcome, and often contributes none.

### The rule for showing something

Show one Create re-entry card on Welcome only when all of these hold:

- there is a piece of work the member actively touched recently (not just opened)
- it was left mid-action (an edit in progress, an escalation started, a "next" pending)
- returning to it now is plausibly useful (not something the member said they were done with or parked)

If any fails, Welcome shows nothing from Create. Information does not automatically deserve attention.

### The card

> **Continue your workshop graphic**
> You were making an editable version so you could move the individual pieces.
> *[thumbnail]*

One tap resumes the thread. One quiet secondary action: *Not now*, which stops that card from returning for that piece of work unless the member touches it again. No "dismiss forever", no snooze menu.

### Language

Never *overdue*, *unfinished*, *pending*, *still waiting*, *you haven't*. Always what they were doing, in their terms.

### Phone / Tablet / Desktop

Same single card. It never becomes a carousel, a list, or a count.

---

## 15. Finishing actions

Every meaningful creation needs a clear ending. **Done for now** opens a sheet with distinct, non-interchangeable actions.

### Before the sheet: readiness in one line

When the member taps Done for now (or says *I think that's it*), Spark performs the checks it can reliably perform and speaks in one line:

- All clear: *Looks ready. Text fits, nothing's cut off, colors match your brand.*
- One issue: *One thing: the bottom line is getting cut off when printed. Fix it, or leave it?* with **Fix it** as the recommended action.
- Something not checkable: *Looks ready on screen. I can't check how the chart will export, so glance at it after.*

Never a checklist. Never "verified" for things not checked.

### The sheet

Primary (always present, in this order):

- **Continue editing** (closes the sheet)
- **Save in Spark** (checkpoint; Section 16)
- **Print**
- **Export** (get a file)
- **Save to my Drive** (only if a Drive connection is proven; otherwise absent, not greyed)
- **Delete**

Secondary (only when supported and the member has expressed the intent):

- **Share**, **Send**, **Publish**, **Continue in Canva** (Section 17)

Each action has a one-line description under it that states honestly what it does and does not do, for example *Save to my Drive: puts a copy in your Drive. Changes here won't update it.*

### What "done" means

Nothing changes state to FINAL. The work remains editable. The Set keeps its checkpoint. Spark's language after finishing: *Saved. It'll be here when you want it.* Not "completed", not "archived".

### Phone / Tablet / Desktop

Phone: bottom sheet, one action per row, large targets, descriptions visible. Tablet: same sheet. Desktop: a compact panel anchored to the Done for now button, same rows.

---

## 16. Print, Save, Drive, Delete

### Save

Autosave is silent and continuous. **Save** means *I want to keep this*: it creates a checkpoint that appears in Restore and is protected from whole-scope changes. Spark confirms in three words: *Saved this version.* The member may add words (*save this as the one I sent Kerry*) and Spark uses them as the label. Saving never creates a file the member has to manage and never touches Drive.

### Print

**Print** shows a print preview honest about page fit: the artifact on its intended page size, with any overflow or clipping marked before printing. If the artifact was made for a screen (a square social graphic), Spark says how it will place it on paper (*centered on a letter page*) and offers *fit to page* as one option, not a settings screen. The system print dialog handles printer choice. On phone, Print uses the device's print/share sheet (AirPrint on iPad and iPhone, the Android print service), and Spark says *This opens your phone's print options* so the transition is expected.

### Save to my Drive

Appears only when a proven Drive connection exists. Doing it places a copy in the member's Drive. Spark states the boundaries once, in the confirmation:

> Copied to your Drive as "Workshop handout". If you change it here, that copy stays as it is until you save it again.

Later Spark edits never overwrite the Drive copy silently. Saving again offers *replace the Drive copy* or *save a new copy*, and the default is a new copy. Deleting in Spark never deletes the Drive copy, and Spark says so at deletion time.

Where the copy goes inside Drive (folder choice) is a FOUNDER DECISION (Section 30).

### Export

Gets a file to the device (or the share sheet on phone). Spark names the format in plain words (*a PDF*, *an image*) and offers one sensible default with *other formats* behind it. Export fidelity is unproven; Spark says *check it once after export* only when it genuinely could not verify the output.

### Delete

Delete is intentional, confirmed, and scoped:

- If the artifact is one of several in a Set: *Delete just this version, or the whole set?* with *just this version* as default.
- The confirmation states what will not be affected: *Your Drive copy stays. Nothing else in Spark changes.*
- After deletion, Spark says *Deleted.* If structured history permits, a short *Put it back* option follows for a brief period. Whether deleted work has any grace period is a FOUNDER DECISION (Section 30).

### Status

There is no status field. The member never sees DRAFT, REVIEW, APPROVED, FINAL, or ARCHIVED. If the member asks *is this the final one?* Spark answers from behavior: *It's the one you saved and printed on Tuesday. Nothing has changed since.*

---

## 17. Canva and editable escalation

### The moment

Spark made a flat image. The member wants to move individual pieces and gets frustrated. Signals: *I can't move this*, *why can't I drag it*, *I want to change just this bit myself*, repeated nudge attempts, or *make this editable*.

### What Spark says

> You want to move the individual pieces yourself. I can help you continue with an editable version.

No file-format words. No "PNG", "SVG", "layers", "vector", "export as".

### What happens next depends on proven capability

Only one of these is true in a given deployment, and Spark presents only the true one.

**If a proven connected Canva capability supports creating an editable design:**

> I can open this in Canva as an editable design, with the pieces separate. Want me to?

On yes, Spark does it and says what is true afterward: *It's open in Canva. Changes you make there stay in Canva; if you want them back here, tell me and I'll bring the latest in.* (Only if bringing it back is also proven; otherwise: *Changes you make there stay in Canva.*)

**If only a URL handoff is supported:**

> I can send this to Canva for you to rebuild it there with movable pieces. It'll open as a picture you can build on, not as separate pieces. Want that, or want me to make the change for you here?

**If no external capability is proven:**

> I can't hand this to another editor yet. Tell me what to move and I'll do it here, or I can remake it with the pieces separate so each one is easier to change.

### Honesty rules

- Connection does not equal unlimited access: Spark names only the specific thing it can do.
- URL does not equal synchronization: Spark never says "synced" or "linked".
- Opening does not equal editing: if Canva opens a flat image, Spark says "picture", not "design".
- Exporting does not equal publishing: nothing is public until the member publishes it in the external tool, and Spark says nothing about publishing.

### After escalation

The Set records that this piece was continued in Canva, so the finder can answer *the one I opened in Canva* later, and Welcome re-entry can say *You took this into Canva on Monday.*

### Phone / Tablet / Desktop

Phone: escalation is most often triggered on phone, because dragging is hardest there. The offer includes the honest alternative *or open this on your tablet or laptop, where you can drag pieces here in Spark.* Tablet and desktop: same offer, without that line.

---

## 18. Contextual capability discovery

### The rule of one

Spark reveals a capability only when the member's words or actions show a need for it, and reveals one at a time. Completion is never an occasion for a list of other things Spark could make.

### Triggers and offers

| Member signal | Spark's single offer |
|---|---|
| *I can't understand this* / *it's all tangled* | *I can lay it out so you can see how it fits.* |
| *I want to move each piece myself* | Editable escalation (Section 17) |
| *Make it look like mine* / mentions logo or colors | *I can use your brand colors and logo.* (or, if no Brand Profile: *If you give me your colors or logo once, I'll keep using them.*) |
| *I need this for Instagram too* | *I'll make a square version in the same set.* |
| *Kerry needs to see this* | Share/Send only if proven; otherwise Export and a plain explanation |
| *Can I print this?* | Print, with page-fit honesty |
| *How do I…?* | Product help (Section 19) |

### After a completion

Spark says the readiness line and stops. If, and only if, the thread contains an unresolved intent (*I'll need a social version too* said earlier), Spark may add one line: *Want the square version now?* Otherwise nothing.

### Restraint tests

- No more than one offer per Spark turn.
- No offer repeats within a thread once declined.
- No offer is phrased as a feature name; it is phrased as an outcome (*see how it fits*, not *open VTS*).

---

## 19. Spark product help

Binding requirement: Spark answers *how do I…* from proven current product capability, never from generic software assumptions.

### The four answers

When the member asks how to do something, Spark answers in one line and offers the mode that fits:

**Do it for me** · **Tell me how** · **Walk me through it** · **Show me**

Example, *How do I make this editable?*:

> You can have me remake it with the pieces separate, or continue it in Canva if you'd rather drag things there.
> **Do it for me** · **Tell me how** · **Walk me through it** · **Show me**

- **Do it for me**: Spark performs the action in this thread.
- **Tell me how**: two to four short steps, in the member's terms, referring to controls as they appear on the member's current device.
- **Walk me through it**: Spark takes one step, waits for the member, takes the next. Each step highlights the relevant control on screen.
- **Show me**: plays the matching short demo (Section 20) if one exists; otherwise falls back to Walk me through it.

### Honesty about capability

If Spark cannot do the thing in the current product, it says so: *Spark can't print double-sided from here yet. You can export the PDF and print it from your computer.* It never invents a menu path.

Device awareness: *How do I get back to what I was doing?* on a phone is answered with the phone's controls (*Tap Continue something on the Create screen, or just tell me what you were working on*), not desktop instructions.

### The mechanism is not designed here

How Spark learns current capability is an unproven technical assumption per the brief. The experience requirement is simply: Spark's help text and demos are sourced from the same capability description that governs what Spark can actually do, so they cannot drift apart. That is an implementation requirement to be validated, not a member-facing feature.

### Common questions and their shape

- *How do I change my brand colors?* Spark points to the Brand Profile in the Estate (its real location), offers to take the member there, and clarifies that changing colors here in one creation does not change the brand.
- *How do I use VTS?* *You don't have to open anything. When something is hard to see, say "lay this out" and I'll show it as pieces you can move. Want to see a 30-second example?*
- *How do I print this?* Print with page-fit honesty, and device-specific steps.
- *How do I get back to what I was doing?* Continue something, or the Welcome card, or describe it.

---

## 20. Optional demos

Zero required tutorial, a few short optional demonstrations.

### The five demos

1. **Messy thought → useful creation** (about 30 seconds). A voice note becomes a one-pager. Shows reacting in words.
2. **Turn material into a visual** (about 30 seconds). Notes and a screenshot become a graphic.
3. **Change something Spark created** (about 25 seconds). *Make the title bigger*, *keep the picture but put my old headline back*, Undo.
4. **Continue in an editable environment** (about 30 seconds). The flat-image frustration and the honest escalation offer.
5. **Messy thought → lay it out → finished creation** (about 45 seconds). The Create → VTS → Create loop.

### Where they appear

- Create Home, first time only: one link to Demo 1.
- **Show me** in product help: the matching demo.
- After a decline of a capability offer, never.
- In the Estate's help area, as a list of five, for members who like to browse.

### Form

Each demo is a short captioned recording of the real product on the member's device class (phone demo on phone, tablet demo on tablet). Captions are on by default. Demos can be paused, scrubbed, and closed at any moment. They play in a sheet over the current work; closing returns exactly where the member was. No demo autoplays. No demo is a slideshow of tips.

Voice, captions, and narration style are a FOUNDER DECISION (Section 30).

---

## 21. Trust, quality, provenance

### The principle

The member is not Spark's quality-control department. Spark checks what it can, says what it checked, and never claims more.

### The readiness line

Every time Spark presents something as ready (after the first attempt and at Done for now), it states in one line what it checked and what it found. Three honest shapes:

- *Looks ready. Text fits, nothing's cut off, colors match your brand.*
- *One thing to look at: the second bullet repeats the first. Fix it?*
- *Looks ready on screen. I couldn't check the chart's export.*

Checks Spark performs when it reliably can: missing or duplicated content, text overflow, clipping, readability at intended size, layout integrity, data integrity against the material provided, brand consistency where a Brand Profile applies, contrast and accessibility, visual-meaning integrity in VTS-derived visuals, export fidelity where measurable.

### Language rules

- "Checked" for things checked. "Couldn't check" for things not checked. Never "Verified" as a blanket badge.
- Issues are surfaced smallest-first, one at a time, with the recommended fix as the first action.
- No score, no percentage, no traffic light.

### Provenance in one line

Under the stage, a quiet line states what the creation was made from: *Made from your notes and the retreat screenshot, using your Studio brand.* Tapping it opens the material tray (Section 12). This is the member's answer to *where did this come from?* without a provenance panel. Provenance mechanics are an unproven assumption; the line shows only what the thread can truthfully attribute.

### Brand and Business Understanding, protected

- **Brand chip**: when a Brand Profile is in use, a small chip under the stage reads *Using your Studio brand*. A style experiment (*try it in navy*) shows *Trying navy, just here*. Nothing about the Brand Profile changes. If the member wants the experiment kept as brand, they say so, and Spark takes them to the Brand Profile to confirm there. Local experiments never write to canonical brand.
- **Business context**: when Spark uses Business Understanding (a client name, an offer, a price), the provenance line names it (*using what I know about the Retreat offer*). Known does not mean relevant: Spark uses business context only when the thread makes it relevant, and says what it used so the member can correct it. Nothing said inside a creation rewrites Business Understanding.
- **Client boundaries**: a creation for one client never draws on another client's material or context. If the thread is ambiguous about which client (two clients named Kerry), Spark asks that one question before using either client's context, because the cost of getting it wrong is not cheap or reversible. How firmly client context is confirmed at thread start is a FOUNDER DECISION (Section 30).

### Uncertainty in visuals

If the material is uncertain (*I think pricing comes after the call, not sure*), the visual says so: hedged words in text, dashed links and a "?" in VTS, and no polished graphic that turns a guess into a fact. Meaning outranks aesthetics.

---

## 22. Accessibility behavior

Accessibility is structural.

### Text and hierarchy

- Body text at least 16px on phone, scalable with system text size without breaking layout.
- One heading level per screen; Spark's messages are plain paragraphs, not decorated cards.
- Every screen has one dominant thing.

### Contrast and color

- All member-facing UI meets WCAG AA contrast in light and dark themes.
- Meaning is never carried by color alone: changed elements get an outline and a label; uncertain links get a dash pattern and a "?"; brand and experiment chips have words.

### Motion

- Reduced motion honored system-wide: crossfades become cuts, fading change markers become static markers, demos do not autoplay.
- No motion is required to understand state.

### Controls

- No hover-only controls. Everything reachable by tap, click, and keyboard.
- Touch targets at least 44pt with spacing.
- Selection chips have accessible names matching their visible labels.
- The microphone is a labeled button with visible recording state and a text alternative (the transcript is shown and editable).

### Screen readers

- Artifacts carry a generated text description (*One-page handout: headline, three sections, one photo of a group*) that Spark also uses to describe changes.
- VTS canvases expose their cards and relationships as a structured list (the same list the phone VTS uses), so the arrangement is readable without sight.

### Cognitive

- Recognition over recall everywhere: thumbnails, labels, the member's own words.
- Progressive disclosure: More… behind the four chip actions, other formats behind one default, demos behind one link.
- Chunks: Spark says three things at most per turn.
- No time pressure, no countdown, no streak, no "you haven't".
- Tone: a capable colleague, not a cheerleader and not a manager.

---

## 23. Phone design

Phone is designed as its own thing, not a shrunk desktop. It emphasizes voice, capture, quick review, and small precise edits.

### Layout

- Single column, stacked: stage, Spark's message, actions, input.
- The input with mic is pinned to the bottom of every Create and VTS screen.
- When the keyboard opens, the stage collapses to a strip that keeps the current thumbnail and any selected element name visible. The last Spark message stays above the input. The member never loses sight of what they are editing.
- Sheets, not modals: attach, finishing, restore, and the tray all open as bottom sheets with a visible handle, dismissible by swipe, Back, or tapping outside. No full-screen modal ever hides the work.
- No horizontal page scrolling. The one intentional horizontal scroll is the Set strip.

### Controls

- Microphone: the largest control on the screen, with a hold-to-talk and a tap-to-toggle mode (system default is tap-to-toggle for accessibility).
- Undo: a labeled button beside the input, not a gesture only. Shake-to-undo may exist as an extra, never the sole path.
- Back: always the Estate-standard Back, always returns to Create Home without losing the thread.
- Dropdowns are replaced by sheets with large rows.
- Direct editing uses nudge and step controls (Section 9), not free drag.

### VTS on phone

Ordering-and-grouping list with a read-only spatial view (Section 6). Voice works fully.

### Capture-first behavior

A phone member often captures now and works later. After a voice note or a screenshot, Spark may say *Got it. Want a first version now, or keep this for later?* Both are one tap. "Keep for later" leaves it as material in a new thread that Continue something can find. It never becomes a task or a project.

### Finishing on phone

Print and Export use the system share/print sheet. Spark names the transition so it is expected.

---

## 24. Tablet and iPad design

Tablet is the richest visual-arrangement device.

### Layout

- Portrait: stacked like phone, with a larger stage.
- Landscape: stage or canvas left (about 60%), thread and input right. The thread can be collapsed to a single-line Spark message to give the canvas nearly the whole screen.
- The keyboard pushes the thread up; the stage stays put.

### VTS on tablet

Full direct manipulation: drag, pinch, group by enclosure gesture, connect by dragging from one card's edge to another. Two-finger tap for Undo in addition to the button. Pencil support for rough grouping strokes. Spark's messages appear as a bottom sheet that can be dropped to one line.

### Direct editing

Drag to move and resize elements with snapping. The selection chip follows the element. Long-press is never required; tap selects.

### Attach

Drag-and-drop from Split View apps onto the stage or input, in addition to the attach button.

### Continuity

Opening a thread on tablet after starting on phone shows the same thread and stage, with Spark's one-line re-entry meaning. Persistent cross-device state is an unproven assumption; the design requires it and marks it for validation.

---

## 25. Laptop and desktop design

Desktop provides more simultaneous space without more clutter.

### Layout

- Stage or canvas left, thread right, input below the thread. Max content width keeps line lengths readable.
- Optional side-by-side comparison of two Set items on request.
- The material tray and Set strip can be expanded into side panels, and collapse back with one click.
- No dashboard, no toolbar ribbon, no property inspector.

### Keyboard

- Enter sends, Shift+Enter newline, Cmd/Ctrl+Z undo (mirrors the button), Escape closes any sheet or clears selection, arrow keys nudge a selected element or card, Tab reaches every control in visual order.
- The mic remains a visible button; desktop members still speak.

### Precision

Drag, resize, snapping, and zoom to true size. Alignment guides appear during drag and disappear after; no alignment panel.

### Windows and sheets

Sheets become anchored popovers or side panels. Nothing opens a separate window. Back still means Create Home and never loses the thread.

### Restraint

The extra width is used for the artifact and the canvas, not for panels the member did not open. A desktop member who never opens a panel sees a screen nearly as calm as the phone.

---

## 26. Required scenarios

Each scenario shows the member's words, Spark's words, what appears, and how each device behaves. Spark's lines are written as they should sound.

### A. Messy thought → useful first creation

**Phone, voice.** Member taps the mic on Create Home: *"Okay so I've got this workshop on Thursday and I need, like, a thing people can take home, it's the three-part framework, you know the one, and I want it to not look boring."*

Stage shows a one-page handout: headline with the framework name pulled from Business Understanding, three sections, a warm but neutral style.

Spark: *Here's a first take. I used the three parts of your Momentum framework from what you've told me before, and made it one page so it works as a handout. Tell me what to change, or tap anything to adjust it.*

Actions: Try another · Change something · Looks good. Provenance line: *Made from what you said, using your Studio brand.*

Member: *"Less text."* Spark trims each section, marks them: *Shorter. Same three parts.*

Member: *"That's it."* Readiness line: *Looks ready. Text fits, nothing's cut off.* Sheet: Continue editing · Save in Spark · Print · Export · Delete.

What the member did not do: name it, choose a format, pick a template, choose a size, review a checklist.

Tablet/desktop: identical, with typing or voice, and the stage beside the thread.

### B. Existing material → visual understanding in VTS → finished artifact

**Tablet.** Member drops in a six-page PDF of rambling client notes and two screenshots. *"Turn this into something my client can actually follow."*

Spark makes a first attempt as a structured two-page summary. Spark: *Here's a first version. I pulled seven themes out of the notes and put the screenshots where they seemed to belong. Two themes overlapped, so I merged them. Tell me what's off.*

Member: *"I can't tell if this order is right. It's all tangled in my head."*

Spark: *Let me lay it out.* The stage becomes a canvas: seven cards, arrows where the notes said one thing led to another, dashed "?" links where Spark could not tell.

Member drags "Onboarding" before "Kickoff", groups two cards under "Pricing", and connects "Timeline" to "Kickoff". Spark, at the meaning change: *Now Timeline leads to Kickoff. Right?* Member: *"Yes."*

Member: *"Okay, put that into the summary."*

Stage returns to the two-page summary, reordered and regrouped. Spark: *Reordered to match your layout, pricing is now one section with two parts, and I wrote "Timeline sets the Kickoff date" where you connected them. The two "?" links stayed as "may relate to" so I didn't make anything up.*

Readiness line, finishing sheet. Nothing was copied, exported, or re-explained.

Phone: the canvas is the ordering list; the member reorders with handles and uses *Move to…* for grouping. Desktop: identical to tablet with pointer.

### C. Flat creation → member frustration → editable escalation

**Phone.** Spark made a social graphic. Member tries to drag the logo with a finger; nothing moves freely. *"Ugh, why can't I move this?"*

Spark: *You want to move the individual pieces yourself. I can help you continue with an editable version.*

If Canva editable creation is proven: *I can open this in Canva with the pieces separate. Want me to?* Member: *"Yes."* Spark: *It's open in Canva. Changes you make there stay in Canva.*

If only URL handoff is proven: *I can send this to Canva, where it'll open as a picture you can build on, not as separate pieces. Or tell me what to move and I'll do it here. Or open it on your tablet, where you can drag pieces in Spark.*

The Set records the Canva handoff. Later, *the one I opened in Canva* finds it.

### D. Interrupted work → Welcome → meaningful re-entry

Member was making an editable version of a workshop graphic on Tuesday, then a client call, then two days of nothing. Friday, Welcome shows one card:

> **Continue your workshop graphic**
> You were making an editable version so you could move the individual pieces.

Tap. The thread opens at the last state. Spark: *You were making an editable version so you could move the pieces. Want me to carry on with that?* Member: *"Yes."* Work resumes.

If the member had said *I'm done with that* on Tuesday, Welcome shows nothing from Create on Friday.

All devices: same card, same line.

### E. "Where's that thing?" → recognition → retrieval → continue

**Desktop.** *"Where's that teal thing with the circles I made for Kerry?"*

Spark shows three previews: a teal circle diagram (*for Kerry, last Thursday, you said the text was too small*), a teal one-pager (*for Kerry, two weeks ago*), a circle graphic in navy (*for the retreat*). *Is it one of these?*

Member clicks the first. Thread opens, stage shows it. Spark: *This one. You said the text was too small; want me to fix that now?* Member: *"Yes, and make it square for Instagram."* Spark enlarges the text, marks it, then adds a square version to the Set: *Text is bigger. Square version is in the set too.*

Phone: same three cards in a vertical list; voice throughout.

### F. Create → VTS → Create without re-explanation

**Desktop.** Member is writing a proposal. *"I don't know how the three offers relate to the timeline. Show me."*

Canvas: three offer cards, one timeline card, existing relationships from the draft. Member drags Offer B onto the timeline's "month two" position and says *"B only starts after A finishes."* Spark draws A → B: *A leads to B, and B sits at month two.*

Member: *"Great, put it back in the proposal."*

Proposal returns with the offers section restructured and one new sentence: *Offer B begins once Offer A is complete, in month two.* Spark: *Added the A-then-B sequence and placed B at month two. Nothing else in the proposal changed.*

At no point did the member explain what the proposal was, what the offers were, or open anything.

### G. Spark misunderstood → "No, I meant…" → recovery

Member: *"Change the picture."* The artifact has two pictures. Spark, judging the header photo most likely because it was discussed a moment ago, swaps it and says: *Swapped the header photo. If you meant the other one, say so.*

Member: *"No, I meant the small one at the bottom. Put the top one back."*

Spark restores the header photo, swaps the bottom one, marks both: *Top one's back. Bottom one is new.* One turn, no menu, no apology paragraph.

Variant: *"You changed too much."* Spark reverses everything outside the requested scope, keeps the requested change, and says: *Kept the new picture, put everything else back.* For the rest of the thread Spark stays at the narrower scope.

### H. Finish → Save / Print / Drive

Member: *"I think that's it."*

Spark: *One thing: the last line gets cut off when printed. Fix it, or leave it?* Member taps **Fix it**. Spark tightens spacing, marks it: *Fits now.*

Sheet opens. Member taps **Save in Spark**: *Saved this version.* Then **Print**: preview on a letter page, then the system print dialog. Then **Save to my Drive** (proven connection): *Copied to your Drive as "Workshop handout". Changes here won't update it unless you save it again.*

Later, the member changes the headline in Spark. Spark does not touch the Drive copy. If they Save to Drive again: *Replace the Drive copy, or save a new one?* Default: new one.

### I. Phone capture → tablet visual work → desktop completion

**Phone, in a car park.** Voice: *"Idea for the retreat: three days, day one is grounding, day two is the hard stuff, day three is planning. And some kind of evening thing each night. Don't make it yet, just hold it."*

Spark: *Got it. I'll hold it.* It sits as a thread with material only. No task, no project.

**Tablet, that evening.** Continue something shows *Retreat idea, from this afternoon.* Tap. Spark: *You gave me the three-day shape and the evening idea. Want a first version, or want to lay it out first?* Member: *"Lay it out."* Canvas: three day cards, three evening cards. Member drags evenings under days, groups "hard stuff" with two sub-cards they add by voice.

**Desktop, next morning.** Continue something shows *Retreat plan, laid out last night.* Spark: *You arranged the three days with evenings under each. Want me to make the one-pager from that?* Member: *"Yes."* Artifact appears. Finishing sheet. Print.

Every device kept the meaning, not just the file. Persistent cross-device state is an unproven assumption and is required for this scenario.

### J. "How do I do this?" → accurate explanation

Member: *"How do I change my brand colors?"*

Spark: *Your brand colors live in your Brand Profile, not in this creation. Changing them here would only change this piece.*
**Take me there** · **Tell me how** · **Try new colors just on this one**

Member taps **Tell me how**: *From Welcome, open My Business Estate, then Brand Profile. Change the colors there and every new creation uses them.* (Wording follows the real current route, which must be validated against the shipped Estate.)

If the member asked something Spark cannot do: *Spark can't do double-sided print settings from here. Export the PDF and print it from your computer's print dialog.*

### K. "Show me how." → optional contextual demonstration

Member: *"Show me how the lay-it-out thing works."*

Spark: *Here's a 45-second example.* Demo 5 plays in a sheet over the current work, captions on, pausable. Closing returns to exactly where the member was. Spark adds nothing after; the member's work is waiting unchanged.

### L. "I don't know. You choose." → useful reversible first attempt

Member: *"I need something for the newsletter. I don't know. You choose."*

Spark makes one thing: a short newsletter header graphic and a three-sentence blurb, using the most recent topic from Business Understanding if it is plausibly relevant. Spark: *I went with the Retreat, since it's coming up. Here's a header and a short blurb. If it's the wrong topic, just say what it should be.*

Member: *"Wrong topic, it's about the new workshop."* Spark remakes it: *Switched to the workshop. Same shape.* The retreat version stays in the Set strip in case they want it later.

No gallery, no "here are five directions", one reversible attempt.

---

## 27. Pressure-test findings

I tried to break the design. Each finding states the risk, where it bites, and the mitigation built into the design or a decision needed.

**Blank-slate freeze.** Risk: the empty Create Home still needs the member to say something. Mitigation: the question invites mess, the mic is one tap, **Create something** shows three example phrasings, and *I don't know* is an accepted input (Scenario L). Residual risk: a low-capacity member may still stall. Recommendation: allow a single voice fragment of any length; Spark never asks for more before making something.

**Excessive choice.** Risk: three actions after every attempt plus a Set strip plus a tray. Mitigation: the tray and strip appear only once they have content; the three actions are the only visible choices. Watch item: if "More…" in direct editing grows beyond five items, it has become a panel.

**Excessive suggestions.** Risk: capability discovery becomes upselling. Mitigation: the rule of one, no repeat after decline, completion offers only for stated intents.

**Source-role confusion.** Risk: Spark uses the wrong document as the main source. Mitigation: Spark states how it used each item; corrections are one sentence; the tray shows roles. Residual: a member who never reads the one-line note may not notice. Recommendation: when material is mixed and Spark's role choice is a coin toss, ask that one question after showing the attempt.

**Brand contamination.** Risk: a "try it in navy" experiment leaks into the Brand Profile. Mitigation: local experiments never write to canonical brand; the chip says *just here*; promotion requires going to the Brand Profile. Verified by design, not by implementation.

**Cross-client contamination.** Risk: Spark pulls client A's pricing into client B's proposal. Mitigation: one-question client confirmation when ambiguous before using any client context; provenance line names the client context used. This is the one place the design chooses asking over showing, because the mistake is not cheap. FOUNDER DECISION on strictness (Section 30).

**Conversational scope ambiguity.** Risk: *make it pop* redesigns everything. Mitigation: the scope ladder, marked changes, praised-work protection, and *you changed too much* as a recognized correction.

**Visual semantic drift.** Risk: Tidy or a style pass turns a causal arrow into decoration. Mitigation: Tidy never touches relationships; uncertain links are visibly different; Spark restates meaning changes. Automated semantic checking is unproven; until it exists, Spark should restrict itself to layout changes that provably preserve the relationship graph.

**False verification confidence.** Risk: a readiness line implies more than was checked. Mitigation: three honest shapes, "couldn't check" language, no badge. Residual: the phrase *looks ready* could still be read as a guarantee. Recommendation: pair it with the specific checks every time, never alone.

**Version clutter.** Risk: Try another used ten times produces a strip of ten near-identical thumbnails. Mitigation: Spark labels alternatives with what differs; after five alternatives Spark may offer, once, *want me to keep the two you liked and tuck the rest away?* (tucked items remain in Restore). FOUNDER DECISION on whether tucking exists in V1.

**Re-entry failure.** Risk: the re-entry line is generic (*You were working on a graphic*). Mitigation: the line must come from the last intent in the thread, not from the artifact type. If the thread has no clear last intent, Spark shows the thumbnail and asks nothing.

**Cross-device discontinuity.** Risk: the phone list view of VTS and the tablet canvas diverge. Mitigation: both are views of the same meaning (cards, groups, order, relationships); the list is the accessibility view too. Persistent state is unproven; if it cannot be guaranteed in V1, Spark must say *last saved from your tablet at 9:40* rather than silently showing stale work.

**Difficult mobile precision editing.** Risk: finger-drag editing on phone. Mitigation: no free drag on phone; nudge, steps, and voice; honest offer of a bigger screen or editable escalation.

**External-integration illusion.** Risk: "Continue in Canva" implies sync. Mitigation: Spark names only the proven action, uses "picture" vs "design" honestly, never says "synced". Absent connections are absent from the sheet, not greyed, so nothing advertises a capability that does not exist.

**AI-created cleanup burden.** Risk: Whole → Many leaves the member with artifacts to sort. Mitigation: one artifact at a time, the Set carries structure, nothing needs filing, Delete is scoped. Residual: a member may still feel clutter in the strip. See version clutter.

**Architecture leaking into member language.** Risk: "VTS", "Create", "Set", "checkpoint", "capability" appear in Spark's speech. Mitigation: Spark speaks in outcomes (*lay it out*, *keep this one*). The word "VTS" appears only if the member uses it or asks about it directly. The finishing sheet uses plain verbs.

**Hidden executive-function demands.** Risk: the member must remember to Save, must decide between Save and Export, must remember what a tucked alternative was. Mitigation: autosave means forgetting to Save loses nothing; sheet descriptions explain each action; Restore shows thumbnails. Residual: choosing between Print, Export, and Drive is still a decision. Recommendation: the sheet orders by likelihood from the thread (if the member said "print", Print is first).

---

## 28. Cognitive-load risks

Ranked by how likely they are to hurt a real member.

1. **The finishing sheet is the biggest single decision point.** Six primary actions is the maximum this design allows. Anything added there must remove something.
2. **Ambiguity resolution can feel like a quiz** if Spark asks more than one question per turn. The design caps it at one, after showing an attempt.
3. **Set strip growth** after many alternatives. Mitigated by labels and optional tucking.
4. **Reading Spark's one-line explanations.** Members will skim. Every important fact (what changed, what was used, what was checked) is also visible on the stage as a marker, chip, or provenance line, so skimming loses nothing critical.
5. **Phone keyboard covering the work.** Mitigated by the stage strip; must be tested with real on-screen keyboards, including split and floating keyboards on iPad.
6. **Client-context confirmation** adds one question at the start of some threads. It is the right trade, but it must be phrased as recognition (*This is for Kerry at Northwind, right?*) with a one-tap yes.
7. **VTS on phone** asks the member to think in lists rather than space. Voice keeps it usable; the honest bigger-screen suggestion keeps it from feeling like a dead end.

---

## 29. What should be simplified

- **Create something** should be a focus action, not a destination. If it ever becomes a screen, remove it.
- **Try another** should default to one alternative, not a gallery.
- **The finishing sheet** should hide Share, Send, and Publish entirely until the member has expressed that intent and the capability is proven.
- **Demos** should be five, not fifteen. Add one only if a new capability ships that changes what a member would do.
- **Direct editing "More…"** should stay at five items or fewer.
- **Provenance** should remain a line, never a panel with tabs.
- **The Welcome card** should remain one card. If a second Create item ever needs surfacing, it belongs in Continue something, not Welcome.
- **VTS diagram types** should not be exposed as a chooser. Arrangement comes from meaning and words.

---

## 30. FOUNDER DECISION NEEDED

These cannot be answered from the brief without inventing product truth.

1. **Client-context confirmation strictness.** When a thread plausibly concerns a client, should Spark always confirm the client once before using any client context (safest, one extra tap), or only when two or more clients are plausible (fewer questions, higher contamination risk)? This report's design assumes "only when ambiguous"; the safer choice is "always once".
2. **Deleted-work grace period.** Should Delete offer a short *Put it back* window, and for how long? Depends on structured history, which is unproven. Design assumes a brief window if history permits, otherwise immediate.
3. **Drive destination.** When the member says *save this to my Drive*, where does the copy go: a Spark-managed folder, the Drive root, or a member-chosen folder each time? Design assumes a single Spark folder with a one-time choice, but this touches the Drive capability boundary.
4. **Tucking alternatives.** Should the Set strip support tucking away unwanted alternatives in V1, or is that version management by another name? Design treats it as optional and offered once.
5. **Welcome threshold.** Is "actively touched, left mid-action, plausibly useful now" the right bar for the single Welcome card, or should the bar be higher (only work with a pending Spark action) or lower (any work touched this week)?
6. **Try another default.** One alternative (design assumption) or two side by side on tablet and desktop?
7. **Phone VTS scope.** Is the ordering-and-grouping list plus read-only spatial view the right V1 for phone, or should phone offer constrained free placement (large cards, snap-to-grid) despite precision risk?
8. **Demo voice and style.** Narrated, captioned only, or both? Whose voice? Length ceiling of 45 seconds is a design assumption.
9. **Capture-and-hold.** When a phone member says *just hold it*, the design keeps it as a material-only thread findable under Continue something. Should it also be reachable from Parking Lot or Clear My Mind, or is that a cross-area link that needs its own decision?
10. **"Looks good" semantics.** Design treats it as "stop offering alternatives, move toward finishing". Should it instead create a Save checkpoint automatically? That would blur Save and approval, so the design says no, but it is a product-feel call.
11. **Brand promotion path.** When a member wants a local style experiment to become brand, should Spark offer to open the Brand Profile with the values pre-filled, or only navigate there? Pre-filling touches Brand authority.

---

## 31. Recommendations within binding architecture and V1

Each of these improves the experience without new agents, rooms, dashboards, data models, or integrations.

1. **Adopt the readiness line with named checks as the only quality surface.** It replaces any future checklist and prevents "verified" inflation.
2. **Make marked changes plus one-line statements the universal edit contract**, for conversational and direct edits alike. It removes the "what did it do?" hunt, which is the most common trust break in AI creation tools.
3. **Treat the scope ladder as a written rule for Spark's editing behavior**, including the praised-work protection and the *you changed too much* correction. This is a behavior specification, not architecture.
4. **Ship the phone VTS list view as the accessibility view for all devices.** One structure serves phone, screen readers, and keyboard users.
5. **Order the finishing sheet by thread intent.** If the member mentioned printing, Print is first. No new capability, just ordering.
6. **Source help text and demos from the same capability description Spark acts on.** This is the smallest way to satisfy "Spark knows how Spark works" and should be an acceptance test: any help answer must correspond to an action Spark can perform or a route that exists.
7. **Make absence honest.** Unsupported connections are absent from the sheet, not greyed. Greyed controls advertise capabilities and invite "why can't I?".
8. **Write Spark's re-entry line from last intent, never from artifact type.** A one-line rule with outsized effect on the "return without reconstruction" promise.
9. **Cap Whole → Many at one artifact per turn** with a stated plan for the rest. Prevents explosion without limiting ambition.
10. **Use the member's own words as labels wherever they exist** (Set labels, Restore labels, finder context). Cheapest possible recognition aid.
11. **Validate the on-screen keyboard behavior early** on iPhone, Android, and iPad split/floating keyboards. It is the single most likely place phone continuity breaks in practice.
12. **Pilot the client-confirmation question with real members** before choosing strictness (Decision 1). It is the one deliberate exception to show-before-asking and deserves evidence.

### The 12/10 test, applied to this design

- How much did the member have to remember? The last thing they said. Everything else is shown.
- How many unnecessary decisions were transferred? Zero at the start; one at finishing (which action); one when client context is ambiguous.
- How much cleanup? None required. Optional tucking only.
- Did they need to know where a capability lived? No. Outcomes, not places.
- Did they need to understand architecture? No word of it reaches them.
- Could mistakes be recovered cheaply? One sentence, one tap, with earlier states protected.
- Could they return after interruption without reconstructing? One card, one line, one tap.
- Could they work in ordinary language? Every action in this report has a plain-language path.
- Could they move across phone, tablet, desktop? Same thread, same meaning, device-shaped interaction, honest about state.
- Did Spark preserve agency while carrying burden? The member decides what it means and when it is done. Spark carries the files, versions, checks, and structure.

### One best next action

Review Section 30 and decide item 1 (client-context strictness) and item 3 (Drive destination). Those two decisions unblock the trust and finishing designs; everything else in this report can proceed as proposed.

---

## Decision Record

```
Decision:        Adopt this Create + VTS member experience design as the
                 V1 experience specification, subject to the FOUNDER
                 DECISION items in Section 30.
Reason:          It makes the already-defined Create + VTS model feel
                 simple, human, and cognitively accessible without
                 changing architecture, agents, data, integrations, or
                 V1 scope.
Date:            2026-09-18
Approved by:
Supersedes:      None known. No prior Create/VTS experience specification
                 was available in this session.
Related systems: Create, Visual Thinking Studio, Welcome Home, Brand
                 Profile, Business Understanding, Canva connection,
                 Drive connection. Evidence Vault: explicitly none.
Evidence used:   Assignment brief (this session); Spark Estate Master
                 Architect references 01, 02, 04; repository
                 sharilhudson/adhd-companion, branch
                 claude/spark-create-vts-design-adzo9q (conventions only).
```
