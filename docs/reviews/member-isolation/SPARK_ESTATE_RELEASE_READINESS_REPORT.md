# Spark Estate: Release Readiness for Account Persistence and Member Isolation

**Release verdict: HOLD. Production stays as it is.**

Here is where this round ended up:

- **Done.** The database migration is complete in production, with a backup and full verification.
- **Done.** Every check that could run here passes. That includes Strategy Remove/Undo and account separation, on the real production database.
- **Not done.** Three of the checks you asked for cannot be done from this session:
  - deploying and verifying the protected preview;
  - Spark's real replies;
  - live research.

  They need access this environment doesn't have; the exact steps are in [§5](#5-what-is-blocked-and-the-exact-step-to-unblock-it).

Release when the [release gate in §7](#7-release-gate) is all green.

Builds on the earlier report, *BRAIN_SPARK_ESTATE_MEMBER_ISOLATION_PERSISTENCE_REPORT.md*.

| | |
|---|---|
| Repository and branch | `ShariLHudson/adhd-business-companion-vs3` · `integration/one-brain-member-persistence` |
| Branch head | **`901057b6e`** |
| Includes | `f4c833c79` (previous round) + your newer work `983270f7b` (Strategy repairs, Research truth, resume-point rules), merged with nothing lost · `371424bef` reconciled migration · `901057b6e` slow-connection fix |
| Production app | unchanged (`main`, ecosystem.visualsparkstudios.com) |
| Production database | migration **applied** (details in §2) |

---

## 1. Newer work preserved

While I worked, eight commits from your other sessions landed on the branch (`983270f7b`). They were merged, not overwritten.

- TypeScript errors: identical to baseline.
- The tests they touch pass: 57/57. Those test files previously could not run here because a declared package (`unpdf`) was missing; it is now installed in this environment.
- All live browser checks were re-run on the merged code (§4).

## 2. Database migration (production project `weercszpdcxjxauxrhmj`)

**What production already had:**
- row-level security on, on both member tables, with owner-only policies.

**What was wrong:**
- signed-out visitors (`anon`) held `TRUNCATE`, `TRIGGER` and `REFERENCES` on member records;
- signed-in users held `TRUNCATE` on both tables.

Row-level security does **not** stop `TRUNCATE`, so these privileges were a real gap.

**What was done:**

| Step | Result |
|---|---|
| Backup before changing anything | Schema `backup_member_isolation_20261002`: copies of both tables (15 and 24 rows), plus every policy and grant (50 rows). Not readable by members or anonymous visitors. |
| Migration reconciled with the live state | It keeps the existing policies (no duplicates) and only removes the excess privileges. Applied twice to a local copy of production's exact state first: clean, idempotent, and the RLS tests passed 11/11. |
| Applied to production | Recorded as migration `20261002_member_isolation_rls`. |
| Verified after | RLS on; 7 owner-only policies intact. Members can select/insert/update their own rows; signed-out visitors have none. Every original row is unchanged (compared to the backup). |
| Ownership probe, in a rolled-back transaction (writes nothing) | The owner sees their rows. **A different member sees 0, changes 0, and cannot write as the owner.** Nobody has TRUNCATE. Signed-out access is **denied**. |
| Supabase security advisor | No issues on these tables. Pre-existing, unrelated follow-ups: 3 trigger functions without a fixed `search_path`; leaked-password protection is off. |
| Rollback | One statement, kept in the migration file; it restores the previous privileges exactly. |

**Live evidence a branch preview is already running.**
- Since 18:37 UTC the production database has received `member_store` records, the new account-sync records that only this branch writes.
- They come from **one account (yours)**, and all original records were left untouched.
- So a deployment of this branch is live and in use, writing through the new security rules. I can't see which commit it serves (§5).

## 3. Strategy Remove / Undo across two browsers (same account)

| # | Check | Result |
|---|---|---|
| F3.1 | A saved strategy reaches the second browser | PASS |
| F3.2 | Remove asks to confirm, hides it, and offers *"Removed 'My Protect Your Baseline'. You can bring it back. Undo"* | PASS |
| F3.3 | The removal reaches the second browser (soft: kept, hidden) | PASS |
| F3.4 | Undo restores the same strategy | PASS |
| F3.5 | The restore reaches the second browser (same id) | PASS |

## 4. Everything re-run on the merged code

**How this was tested:**
- Chromium, separate browser contexts, one of them phone-sized. This is not a physical phone.
- A local server against a local Supabase that carries the same schema and policies as production.

| Suite | Result |
|---|---|
| Founder speech → visual aids → choice → development → Susan reminder → return; refresh; second browser; sign-out/sign-in | 10/10 PASS |
| Research → grounded answer with sources → VTS comparison of chosen findings → back → on the other browser | 5/5 PASS |
| Two accounts, one browser: screens, stores, chat context, late answers; same account in two browsers; migration; failed saves; concurrent edits; server auth | 24/24 PASS |
| Strategy Remove/Undo across browsers | 5/5 PASS |

**Final clean run on `901057b6e`: 44/44.** That is flows 15/15, Strategy 5/5 and isolation/persistence 24/24, run one after another on a freshly started server.

Earlier runs on this machine were disturbed twice: the local dev server ran out of memory, and once the test script clicked before the screen had rendered. Neither was an app fault; the script now waits for each control.

**One intermittent failure: fixed and re-checked.**
- In 1 of 5 runs, the second browser opened without the resumed conversation.
- Six separate sign-ins could not reproduce it.
- The plausible cause is the bounded wait on the first account pull: on a slow first load, the workspace opened before your data arrived, and it was only shown once you came back to the page.
- `901057b6e` now shows late-arriving data the moment it lands (once, never while you're typing). The re-runs above are on that commit.

## 5. What is blocked, and the exact step to unblock it

| Asked for | Status | Why | Exact step |
|---|---|---|---|
| Deploy to a protected Vercel preview and verify the deployed commit | **Not verifiable from here** | This environment's network policy refuses `vercel.com` and `*.vercel.app`, and there is no Vercel credential in the session. Vercel's Git integration builds a preview on every push (evidence in §2), but I can't see its URL or commit. | Either (a) in this cloud environment's settings, **Network access → allow `vercel.com`, `*.vercel.app`, `api.vercel.com`**, and add a Vercel token as an environment secret; or (b) open **Vercel → adhd-business-companion-vs3 → Deployments**, filter branch `integration/one-brain-member-persistence`, and confirm the newest says **`901057b6e`**. Keep **Deployment Protection** on. |
| Key flows with **real Spark replies and live research** | **Not run** | Real replies need the model key, which lives only on the deployed server (not in this session) or a key provided here. Live research uses the same key. | After (a) above, add the preview's **Protection Bypass for Automation** secret (Vercel → Settings → Deployment Protection) as an environment secret so I can drive the protected preview. *Or* add `OPENAI_API_KEY` as an environment secret so I can run the same flows locally with real replies. |
| Preview link | **Not available to me** | As above | The link is on the deployment in Vercel (step b). Preview sign-in needs the preview host in **Supabase → Authentication → URL Configuration → Redirect URLs**, e.g. `https://*-shari-hudsons-projects.vercel.app/**` (see `VERCEL.md`). |

## 6. Real-phone test (about 10 minutes)

Use the preview link from Vercel on your computer **and** your phone, signed in to the same account.

1. **Computer.** In chat type, one at a time:
   1. *"I have a speech in two weeks."*
   2. *"Help me with unusual visual aids."*
   3. Pick one of the ideas Spark gives you.
   4. *"Remind me tomorrow to call Susan about the venue."* → expect **"What time tomorrow should I remind you?"**
   5. *"OK, back to the speech."* → expect Spark to say the reminder **isn't set yet**, and to return to the speech's last question.
   6. *"9am"* → expect *"I'll remind you … tomorrow at 9:00 AM."*
2. **Phone.** Open the link and sign in. Expect **"Picking up where we left off — you were working on 'I have a speech in two weeks'…"**. Answer the question there. Open Reminders and check that the Susan reminder is listed.
3. **Computer.** Switch back to the tab. It should refresh and show the answer you gave on the phone.
4. **Strategy.** On the computer open *My Strategies* → a strategy → **Remove** → confirm. On the phone it disappears. Press **Undo** on the computer; it comes back on the phone.
5. **Research.** On the phone: *"Research pricing for one-day ADHD workplace workshops."* When it finishes, on the computer: *"What did my research find?"* → expect the findings with clickable sources.
6. **Sign out on the computer.** The phone stays signed in.
7. **Separation.** In a private/incognito window, sign in with a second account (a test account). You should see **none** of your work, and Spark should know nothing about your business.

Note anything unexpected with a screenshot and the time.

## 7. Release gate

Production stays on **HOLD** until all of these are ✅:

| Gate | Status |
|---|---|
| Database migration applied, verified, backed up | ✅ |
| Account separation enforced by the production database | ✅ (rolled-back probe) |
| Browser-context checks on the merged code (flows, isolation, Strategy Undo) | ✅ 44/44 on `901057b6e` |
| Protected preview deployed **and its commit verified as `901057b6e`** | ⛔ needs §5 step (a) or (b) |
| Key flows with real Spark replies and live research on that preview | ⛔ needs §5 |
| Real-phone test (§6) | ⛔ needs you |
| Merge to `main` (your decision) | not started |

**Verdict: HOLD.** The code and database side is ready. The release now depends on the preview check, the real-reply run and your phone test.
