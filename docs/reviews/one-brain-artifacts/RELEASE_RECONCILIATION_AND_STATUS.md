# Spark Estate: Release Reconciliation and Consolidated Status

**Verdict: production stays on HOLD.**
- The code side is ready: AR1–AR2 and the newer One Brain work are reconciled with the release candidate on one branch, and every check I can run here passes.
- Three checks need you or access I don't have:
  - the preview link;
  - real Spark replies and live research;
  - your real phone.

The exact steps are in [§6](#6-exactly-what-i-need-from-you).

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| **Final branch** | **`integration/one-brain-release-ar`** |
| **Final commit** | **`303bceec1`** |
| Vercel preview build of `303bceec1` | **Succeeded** (2026-10-03 14:07 UTC). Deployment page: `vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/6dZPz86Vfm865dZAeCzKdUQwdLiF`. I can't see the preview link itself (§4). |
| Production app | unchanged: `main` at `b25f96dcb` |
| Previous release candidate | `integration/one-brain-member-persistence` at `901057b6e`, **left untouched** |

---

## 1. One-screen status

| | What | State |
|---|---|---|
| **Live** | Production app (`main`) | Unchanged |
| **Live** | Production database: member-isolation rules, backup, verification (earlier round) | Applied and verified |
| **Ready** | `integration/one-brain-release-ar` @ `303bceec1`: release candidate + newer One Brain work + AR1–AR2 + 3 fixes found here | All checks below pass; Vercel built it |
| **Blocked** | Confirm the preview link serves `303bceec1` | Needs §6.1 |
| **Blocked** | Key flows with **real Spark replies** and **live research** | Needs §6.2 |
| **Blocked** | **Your real phone** | Needs you (§7) |
| **Decision** | Make `integration/one-brain-release-ar` the release candidate | Needs your yes (§6.4) |
| **Proposed only** | AR3–AR10 | Not started; held until this release is verified |

---

## 2. What was reconciled (newer work preserved)

**The starting point:**
- The release candidate had not moved: `901057b6e`.
- Your other sessions had pushed newer One Brain work that wasn't in it:

| Brought in | Commits not in the candidate | What it is |
|---|---|---|
| `atomic/one-brain-convergence-r1` @ `f61754765` | 8 | Boundary work: a short reply to Spark's question continues the work; "What does that mean?" explains the pending question; lists keep the member's numbering; a background strategy session never swallows an explicit new request; "research that" researches the actual work. |
| `atomic/research-r8-convergence-recon` @ `9483b265d` | 2 | One saved-research authority per turn (one gate, one rendering); R8's separate hint retired. |
| `feat/artifact-r1-sources-vts` @ `f657b710f` | 2 | AR1 (sources into Create) and AR2 (Visual Thinking reopens where you left it). |

**How it was done:**
- Merge commits only: no rebase, no force-push, and no original branch was changed.
- Each conflict was resolved by keeping both sides' intent:

| Merge | Conflict | Resolution |
|---|---|---|
| R1 → candidate | `CompanionPageClient`: both sides added code right after the One Brain decision | Kept both. The candidate's strategic-thread context comes first, then R1's "explicit new request wins" guard, which reads it. |
| R8 reconciliation → candidate | Page imports, page hint list, read-back detector | Took the reconciliation side; that commit *is* the stated resolution of exactly these hunks. |
| AR1–AR2 → candidate | none | — |

**Found during verification and fixed on the branch:**

| # | Problem | Fix | Commit |
|---|---|---|---|
| 1 | **Read-back source links stopped being clickable.** The candidate wrote them as markdown links; R8's single rendering writes `(https://…)`, which chat showed as plain text. The browser check F2.2 caught it. | Chat now also makes bare `http(s)` links clickable (new tab, safe). The text is unchanged, so R8's wording holds. | `303bceec1` |
| 2 | **R8 test expected an outdated claim.** It wanted "3 separate sources point the same way". Your Research-truth commit `983270f7b` replaced that with "3 separate current sources, not independently verified", and two tests forbid the old claim. | The test now follows the newer wording. Its real point, that a listed-only source isn't counted (3, not 4), is kept. | `7fe0ad75f` |
| 3 | **Create's links didn't match the read-back.** R8 cleans links (http/https only, no tracking). | Create's source links use the same cleaning. | `1c1af5f47` |

---

## 3. The unexplained Create title: found and fixed

**Symptom:** research turned into a guide showed up in Continue My Work as *"Example Com/pricing-per-seat (retrieved 2026-10-01) Workshop"*.

**Cause:**
- When Research hands work to Create, the text ends with a block: *"Sources (current web, unverified): – … — https://… (retrieved …)"*.
- Create named the work by running the **whole** text through its title generator, and it picked up the last source line.
- I reproduced this exactly in a test.
- **It predates AR1.** The Sources block comes from the candidate's own research-links work; AR1 didn't cause it.

**Fix (`1c1af5f47`):**
- Create from a Creation Workspace hand-off now keeps **the name the work already had** in the Creation Workspace.
- The title generator ignores a trailing Sources block wherever research text reaches it.

**Test:** a seed with sources never produces a title containing a link, a date or brackets.

**Still imperfect (not changed):** when there is no workspace name, the generic generator can still produce a clumsy name from a request, e.g. *"Purpose Organize Findings Into an Ordered Guide"*. That's existing behaviour outside this round.

---

## 4. Preview: built, link not visible to me

- GitHub shows Vercel built each commit I checked successfully (`901057b6e`, `f657b710f`, `1c1af5f47` and the final `303bceec1`).
- This session can't open `vercel.com`, `*.vercel.app` or the production site: the environment's network policy denies them.
- Vercel's long branch names are shortened with a hash, so I can't work out the exact link and I won't guess it.

**To find it:** Vercel → *adhd-business-companion-vs3* → **Deployments** → filter branch **`integration/one-brain-release-ar`** → the newest should say **`303bceec1`** → **Visit**. Keep Deployment Protection on.

Sign-in on a preview also needs the preview host under **Supabase → Authentication → URL Configuration → Redirect URLs**, e.g. `https://*-shari-hudsons-projects.vercel.app/**`.

---

## 5. Verification on the reconciled code

| Check | Result |
|---|---|
| TypeScript | errors identical to the release candidate (no new ones) |
| **Full unit suite** on `1c1af5f47`: 20,400 tests | 594 failing tests. Each was re-run on all four parents (candidate, R1, R8, AR): **593 fail on a parent too, so they're pre-existing**. The 1 new failure was fix #2 above; Research suites are now **436/436**. The later link fix has its own tests (3/3). I didn't re-run the full suite after it. |
| Browser: founder speech → visual aids → Susan reminder → return; refresh; phone-sized window; sign-out/in; research read-back with **clickable** sources; research → visual → back | **15/15** |
| Browser: account isolation and persistence (two accounts, two browsers, failed saves, concurrent edits, server auth) | **24/24** |
| Browser: Strategy Remove/Undo across two browsers | **5/5** (the first two attempts hit dev-server slowness after many runs and passed on a fresh server) |
| Browser: AR1 sources into Create (focus, account copy, reload, phone-sized window) | **5/5** |
| Browser: AR2 Visual Thinking reopens on the map you left (computer closed, phone-sized window reopens) | **3/3** |

**How this was tested:**
- Chromium; one context desktop-sized, one phone-sized. **Not a physical phone.**
- A local server against a local database with the same rules as production.
- Spark's model replies were **stubbed**; routing, stores, Create, sync and the account were real.

---

## 6. Exactly what I need from you

1. **The preview link.**
   - Open Vercel as in §4 and check the newest deployment for `integration/one-brain-release-ar` says **`303bceec1`**.
   - Send me its link. A link isn't a secret.
2. **Access for real replies and live research.** Do one of the following in this cloud environment's settings (the environment menu in the session title bar → **Edit**):
   - **(a)** under **Network access**, choose Custom and add `vercel.com`, `*.vercel.app`, `api.vercel.com`; then add the preview's **Protection Bypass for Automation** secret as an environment variable named `VERCEL_AUTOMATION_BYPASS_SECRET`. I'll then run the key flows on the real preview, with real Spark and live research.
   - **(b)** add an environment variable `OPENAI_API_KEY` (the key the app uses). I'll then run the same flows locally with real replies and live research.

   A new session picks either up. **Please don't paste keys or secrets into the chat.**
3. **Your real-phone test** (§7, about 12 minutes), on the preview link from step 1.
4. **One decision.** Should `integration/one-brain-release-ar` replace `integration/one-brain-member-persistence` as the release candidate? It carries everything the old one does, plus the newer One Brain work and AR1–AR2.

---

## 7. Real-phone test (about 12 minutes)

Use the preview link on your computer **and** your phone, signed in to the same account.

1. **Speech + reminder (computer).** Type one at a time:
   1. *"I have a speech in two weeks."*
   2. *"Help me with unusual visual aids."*
   3. Pick one of the ideas.
   4. *"Remind me tomorrow to call Susan about the venue."* → expect *"What time tomorrow should I remind you?"*
   5. *"OK, back to the speech."* → expect Spark to say the reminder isn't set yet and return to the speech.
   6. *"9am"* → expect the reminder confirmed for 9:00 AM.
2. **Phone.** Open the link and sign in.
   - Expect *"Picking up where we left off…"*.
   - Answer there, then open Reminders and find the Susan reminder.
3. **Research (phone).** *"Research pricing for one-day ADHD workplace workshops."*
   - When it finishes, on the computer: *"What did my research find?"*
   - Expect findings with **links you can tap**, and *"not independently verified"* wording.
4. **Sources into Create (computer).**
   - Open the research → **What to do with this** → **Create a Step-by-Step Guide** → **Use This Work** → **Open as a Guide in Create**.
   - Under the section, expect *"Sources this section is built on"* with links and *"retrieved"* dates.
   - The work's name should be the guide's name: **no link or date in the title**.
   - Type a line, then **Save this section**.
5. **Phone.** Create → *More options* → **Continue My Work** → **Continue Editing**. Expect the same sources.
6. **Visual Thinking.**
   - On the computer: research → **Show This Visually** → **Help me see this**.
   - Close the computer's tab.
   - On the phone, open Visual Thinking: it should open **on that map**, not an empty page.
7. **Strategy.** On the computer, *My Strategies* → a strategy → **Remove** → confirm. On the phone it disappears. Press **Undo**; it comes back on the phone.
8. **Separation.** In a private window, sign in with a test account: none of your work, and Spark knows nothing about your business.

Note anything unexpected with a screenshot and the time.

---

## 8. Release gate

| Gate | Status |
|---|---|
| Database migration applied, verified, backed up | ✅ (earlier round) |
| Account separation enforced by the production database | ✅ (earlier round) |
| Reconciled code: types, unit tests vs all parents, browser checks | ✅ `303bceec1` |
| Vercel preview built for `303bceec1` | ✅ |
| Preview link confirmed serving `303bceec1` | ⛔ §6.1 |
| Key flows with real Spark replies and live research | ⛔ §6.2 |
| Real-phone test | ⛔ §6.3 |
| New release candidate accepted | ⛔ §6.4 (your decision) |
| Merge to `main` | not started (your decision, after the above) |

AR3–AR10 stay **proposed** until this gate is all green. They are unchanged from *AR1_AR2_SOURCES_AND_VISUAL_CONTINUITY_REPORT.md* §6.
