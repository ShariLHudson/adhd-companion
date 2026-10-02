# BRAIN SPARK ESTATE™ — OB-6 Final
## Section 1: Cross-Device Truth Audit (interim findings)

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Base verified | `e5c53e73` (matches `origin/ob6/unified-knowledge-access`; both OB-6 reports present) |
| Branch | `ob6/final-truth-integrity`, created from exactly `e5c53e73` |
| Status | **Audit only. No code changed.** Nothing merged, nothing deployed, `main` untouched |
| Brief | The OB-6 Final brief was cut off in section 2 ("The chat model must not receive stale/unlabel…"). Sections 2 onward wait for the rest of the brief. |

---

## Verdict

**There is no cross-device One Brain today. One Brain is single-device and single-browser.**

- Only three kinds of member data are saved on the server and follow the member to another device:
  1. Create's current-focus work;
  2. Saved Spark;
  3. billing.
- Every business knowledge source lives only in the browser it was entered on. That covers the business profile, ideal clients, decisions, projects, Board, research, events, strategy, visual maps, rhythms, reminders and the conversation itself.
- **The chat server reads nothing of its own.** Everything the chat model knows arrives from the browser on each turn. On a new device it starts knowing nothing about the business. It does not pretend otherwise; it simply has no context.
- **There is no existing server copy that the read path could switch to.** Making One Brain cross-device needs migration or new persistence, which is a **Founder decision**. Nothing was built.

## A more serious finding: members aren't kept apart on a shared browser

- **No browser store is tied to the signed-in member.** Signing out removes only the login token.
- **So on a shared browser, a second member inherits the first member's knowledge.** If someone else signs in, the first member's business profile, decisions, research, Board discussions, projects and conversation stay in that browser and are **sent into the second member's chat prompt**.
- **Only Create's cache is protected.** It already checks which member owns it and clears itself if the member changes.

This is a **trust problem for beta**, not only a cross-device one. The fix touches many stores (clear on sign-out, or a separate store per member), so it needs your decision before anything is changed.

---

## Classification of every knowledge source

| Knowledge | Where it lives | Server copy? | Separate per member? | Class |
|---|---|---|---|---|
| Business profile (canonical facts + old summary) | Browser (`companion-business-profile-v1`) | None | No | **Browser-only** |
| Business-profile write history | Browser | None | No | **Browser-only** |
| Ideal client avatars | Browser (`companion-ideal-clients-v1`) | None | No | **Browser-only** |
| Decision Ledger | Browser (`companion-decision-ledger-v1`) | None | No | **Browser-only** |
| Projects and project items | Browser (`companion-projects-v1`) | None (a founder-only server option exists, switched off) | No | **Browser-only** |
| Board discussions | Browser (`spark.board.director-discussions.v1`) | None; the Board server route only checks sign-in | No | **Browser-only** |
| Research library (sessions, collections, questions) | Browser | None | No | **Browser-only** |
| Research observations | Browser | None | No | **Browser-only** |
| Evidence bank | Browser (`companion-evidence-bank-v1`) | Built but **switched off** by default | Browser copy: no | **Browser-only** (mixed if switched on) |
| Events | Browser (`companion-events-intelligence-v1`) | None | No | **Browser-only** |
| Strategy work, strategic memory, Strategy conclusion | Browser | None | No | **Browser-only** |
| Visual Thinking maps | Browser (`companion-visual-focus-maps-v1`) | None | No | **Browser-only** |
| Rhythms | Browser (`companion-rhythms-v1`) | None | No | **Browser-only** |
| Reminders | Browser (`companion-reminders-v1`) | None | No | **Browser-only** |
| Attention holds | Browser | None | No | **Browser-only** |
| Day state | Browser | None | No | **Browser-only** |
| Preferences | Browser; name, email and language refreshed from the account at sign-in | Partly | Partly | **Mixed** |
| Relationship memory and discovery (what Spark has learned about the member) | Browser; its "member id" is a random id per browser, not the account | None | No | **Browser-only** |
| Estate memory | This browser tab only | None | No | **Session-only** |
| Active topic ("what *this* refers to") | This browser tab only | None | No | **Session-only** |
| Conversation transcript | Browser (`companion-conversation-v1`) | None | No | **Browser-only** |
| Conversation state (receipts, pending offers) | Browser | None | No | **Browser-only** |
| Active work | Browser (`spark:active-work-context:v1`) | None | No | **Browser-only** |
| **Create current focus** | Server (`companion_creation_workspaces`) + guarded local cache | **Always on when signed in** | **Yes** (owner check, clears if the member changes) | **Server-persisted / cross-device** |
| **Saved Spark** | Server (`companion_member_records`) | **On by default** | Server: yes (local favourite cache is not) | **Server-persisted** |
| Saved Work | Server table exists | Switched off by default | Server: yes | **Browser-only by default** |
| **Billing (voice plan)** | Server | Yes | Yes | **Server-persisted** |

---

## The seven questions for each browser-only or session-only source

The answers are the same for every browser-only business source above:

1. **What knowledge is affected?** All business and member knowledge, all previous work, all decisions and all conversation continuity.
2. **Which rooms depend on it?** Main chat; the Board; the Strategy Chamber; the Chamber of Momentum; Create; Research; Claire / My Business Estate; the Living Model; Events; Visual Thinking; Plan My Day; Rhythms; Reminders; Project Homes.
3. **What happens on a new device?** Spark knows nothing about the business, the decisions or previous work. The member effectively starts over. Only Create work, Saved Spark and billing come with them.
4. **Does One Brain wrongly behave as if it still knows it?**
   - **On a new device: no.** The data simply isn't there, so One Brain's KNOW answers honestly ("I don't have that saved yet"). The chat model has no business context to misuse.
   - **On a shared browser: yes, and that is the real danger.** The previous member's data is present and is treated as this member's truth.
5. **Is there an existing server copy?** Only for Create, Saved Spark, billing, and the switched-off evidence / Saved Work options. None for business truth, decisions, Board, research, events, strategy, maps, rhythms, reminders or the conversation.
6. **Can the read path use a server copy instead?** No; none exists for these sources.
7. **Classification:** a **real persistence gap**. Fixing it needs migration or new persistence, which is a **Founder decision**. Nothing was migrated or built in this round.

**Session-only sources (estate memory, active topic):**
- They are lost when the tab closes and never reach another device. They are context, not business truth, so this is expected.
- They are also not cleared on sign-out within the same tab.

---

## What reaches the chat model, and from where

The chat server route (`app/api/companion-chat/route.ts`) uses **no database, no sign-in check and no stored data**. Every piece of member context is built in the browser and sent with each message:

| Sent to the model | Built from |
|---|---|
| Business context (the old business summary and relationship-memory prose) | Browser |
| Gated shared context (the KNOW read: active work, decisions, projects, Board, evidence, business facts, research, events, maps) | Browser |
| Active work line | Browser |
| Strategy and Chamber context blocks | Browser |
| Day state and daily context (rhythms, reminders, time blocks) | Browser |
| Guided field help | This tab |
| Intent hints (project, research return, decisions, Board return, estate memory, saved patterns, and others) | Browser and tab |
| The member's name | Browser copy, refreshed from the account at sign-in |
| The conversation history | Browser |

---

## What sign-out clears today

- **Cleared:** the login token, a "signed out" marker, and Create's sign-in binding.
- **Not cleared:** every browser-only store in the table above.

**Existing member-protection logic:**
- **Create's cache:** checks its owner and clears itself when the member changes. This is the only store that does.
- **Evidence and Saved Work:** a per-account marker stops a second account from absorbing the first member's local entries into the server. The local list is still shown and still used in chat.
- **Per-account flags:** only the first-login welcome and first-time-experience flags.

---

## Single-device vs cross-device One Brain

| | Single device, one member | Cross-device | Shared browser, two members |
|---|---|---|---|
| Finds the right source | ✅ (OB-6 certified) | ✖ Nothing to find except Create, Saved Spark and billing | ✖ Finds the *other* member's data |
| Right status and version | ✅ | — | ✖ The labels are right, but for the wrong person |
| Honest when it doesn't know | ✅ | ✅ (says it has nothing) | ✖ It "knows" things that aren't this member's |
| Ready for beta | **Yes**, within OB-6's stated limits | **No.** Persistence gap (Founder decision) | **No.** Member-isolation gap (Founder decision) |

---

## Founder decisions needed (nothing done yet)

1. **Member isolation on shared browsers.** Choose one:
   - clear the member stores on sign-out and account switch, the smallest change; or
   - give each store its own space per signed-in member.
   This is recommended **before beta**.
2. **Cross-device persistence.** Choose one:
   - accept single-device for beta and tell members clearly; or
   - approve moving business truth (at minimum the business profile, decisions and ideal clients) to the server.
3. **The rest of the OB-6 Final brief.** It was cut off at section 2; please resend it.
