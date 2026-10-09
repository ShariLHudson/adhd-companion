# Production repair round A: B9 chat rename + D11 on the M1 preview

_2026-10-09 · Production · answers the execution request on [issue #482](https://github.com/ShariLHudson/adhd-business-companion-vs3/issues/482#issuecomment-6090522441)_

**Production: NO-GO.** Nothing was merged to `main` and nothing was deployed to production. The preview candidate is ready for founder signed-in testing (CP0).

## Summary

| | |
|---|---|
| Preview candidate | [`preview/research-m1`](https://github.com/ShariLHudson/adhd-business-companion-vs3/tree/preview/research-m1) @ [`893e49a27`](https://github.com/ShariLHudson/adhd-business-companion-vs3/commit/893e49a274e8f6f2e35be9636ca0bd9de40bd873) |
| Was | [`ec1d128a1`](https://github.com/ShariLHudson/adhd-business-companion-vs3/commit/ec1d128a1b60c25124b0da6a98c71363c7ae7c91). This is the rollback target |
| Preview URL | https://adhd-business-companion-vs3-git-p-532953-shari-hudsons-projects.vercel.app (the branch alias from MASTER_STATUS). **I did not confirm the Vercel deployment for `893e49a27`.** I have no Vercel access, so check that the deployment is READY before testing |
| First repair | **B9:** a rename made in chat could be undone by a later save |
| Integrated | **D11** language-prefs/login-loop fix [`963f0d567`](https://github.com/ShariLHudson/adhd-business-companion-vs3/commit/963f0d567), preview only (founder decision D-3) |
| Production | Unchanged at `06d6a279f` |

## 1. Which repair, and why B9

| Option | Root cause | Risk |
|---|---|---|
| **B9: Research rename made in chat** | **Confirmed in code.** See below | One field, one function |
| Create/Projects Continue (#485/#488/#491) | Unverified. These are hypotheses from the production UI audit, with no source trace yet | Spans several rooms, so higher |

**B9 root cause.**
- A rename made in chat goes through `retitleResearchRecord` ([`lib/researchLibrary/persistence.ts`](https://github.com/ShariLHudson/adhd-business-companion-vs3/blob/893e49a274e8f6f2e35be9636ca0bd9de40bd873/lib/researchLibrary/persistence.ts)). It wrote the new title but did not stamp `managedAt`.
- `saveResearchCollectionRecord` → `keepNewerManagement` protects the title only when the stored copy has a newer `managedAt`.
- So the next save from an older in-memory copy (any later research turn) put the old title back.
- A Library rename (`renameResearch` in `management.ts`) already stamped `managedAt`, so only chat renames were affected.

**Fix** ([`336fb688c`](https://github.com/ShariLHudson/adhd-business-companion-vs3/commit/336fb688c471cca99a1fa4be0ebcb6ce22a22919) on [`repair/b9-chat-rename-managed-at`](https://github.com/ShariLHudson/adhd-business-companion-vs3/tree/repair/b9-chat-rename-managed-at)):
- `retitleResearchRecord` now stamps `managedAt` together with `updatedAt`.
- **It differs from the INBOX Q-2 plan.** Q-2 proposed turning it into a wrapper over `renameResearch`. That would make `persistence` import `management`, which already imports `persistence` (a circular import). Stamping the field directly has the same effect.
- It still bumps `updatedAt`, which the cross-device sync merge (`lib/memberSync/merge.ts`) uses to decide which copy wins. `renameResearch` doesn't bump it.
- What doesn't change:
  - the record id
  - whether research is forwarded to the Brain
  - the active-research pointer
  - the return shape `{ previous }`
  - anything under `lib/brain`
- No data is migrated or rewritten. Records renamed before this fix keep whatever title they have now.

## 2. D11 integration (D-3, preview only)

- Merged into the preview as [`3ca81b033`](https://github.com/ShariLHudson/adhd-business-companion-vs3/commit/3ca81b0339985bee46005573f81ecf75ba9fedc9), with no conflicts. It changes 11 files: `CompanionAuthProvider`, `SettingsPanel`, `companionStore`, `companionUserLanguage`, i18n keys/locales and 2 test files.
- **D11's own test could not run on M1.** On the M1 preview, `CompanionAuthProvider`'s imports reach `getMemberScope`, and the test's mock of `storageShim` dropped that function. Test-only fix: [`893e49a27`](https://github.com/ShariLHudson/adhd-business-companion-vs3/commit/893e49a274e8f6f2e35be9636ca0bd9de40bd873), now 6 of 6 pass.
- **P0-AUTH-1 and the auth guards are kept:**
  - The D11 diff touches no `app/api/**`, no `supabase/**` and no `proxy.ts`.
  - Sign-up still uses `existingAccount: "refuse"` (`app/api/companion-auth/signup/route.ts`).
  - All six security commits are ancestors (gate S2): `0620aa0a8` `515d77f57` `c13fec292` `48c4c8af3` `d88a718ec` `06d6a279f`.
- **Behaviour change to check when signed in:** the auth-state listener no longer copies account prefs on every event. The account's prefs now load only on the initial session and on a session reload (`CompanionAuthProvider.tsx`, the two `syncUserToPrefs` calls).

## 3. Automated evidence

| Check | Result |
|---|---|
| B9 regression test (`management.test.tsx`, a chat rename survives a later save from an older copy) | **Fails before the fix, passes after** |
| `management.test.tsx` + `lib/brain/researchContinuity.test.ts` | 33 / 33 pass |
| D11 tests (`CompanionAuthProvider.languageAccountSync`, `SettingsPanel.languageAccountSave`) | 10 / 10 pass on the candidate |
| Full `vitest run` on the old preview `ec1d128a1` | 21,193 tests: 588 failed, 65 skipped, 5 files fail to load |
| Full `vitest run` on the candidate before the mock fix | 21,204 tests: 593 failed. **The only new failures, compared by test identity, are the 6 D11 tests**, fixed by `893e49a27` |
| Failures in both runs | Unrelated to this round, e.g. `SettingsPanel.darkContrast` and `languageEstatePropagation`. Both also fail on the old preview |
| Passed on the candidate, failed on the old preview | 1 (`numberedChoiceResolution`, nested menu). This round didn't touch that code, so it is probably a test that passes and fails at random |
| `tsc --noEmit` | 365 errors on both the old preview and the candidate, identical once line numbers are normalised. **None are new** |
| `eslint` on the changed B9 files | Clean |
| `next build` (R2) | **Not run locally.** The Vercel preview build for `893e49a27` is the evidence. Check it reads READY |

## 4. Still needs signed-in validation (CP0, D-1)

I have no signed-in access, so **no member-experience gate is claimed as passing**.

The founder signs in personally in the test tab. No credentials are shared.

1. Open the preview URL and sign in. Confirm a **single** sign-in with no repeated reloads and no burst of 429 errors (D11).
2. In chat: *"research coaches vs consultants for my workshop"*. Wait for findings, then save.
3. In chat: *"rename that research to Coaches or consultants"*.
4. Ask one more research question in the **same** conversation, so a newer save happens.
5. Open **My Research**. The title must still read **Coaches or consultants** (B9 / M5).
6. Rename the same research in the Library, reload, then sign out and back in. The name must stay. Continue the research (M9).
7. In Settings, change the language once, then change it back. Each change should save once, with no loop.
8. If possible, sign in to a second test account and confirm none of this research is visible (M10). Don't delete anything on the founder account.

Record a screenshot or notes for steps 1, 5, 6 and 7. The rest of the Round 1 journey (Correct → Visualize → Resume) is set out in the [Round 1 master handoff](SPARK_ESTATE_PRODUCTION_ROUND1_MASTER_HANDOFF.md) §6.

## 5. Known limits (not fixed this round)

- **Conversation titles.** A rename also updates the research's conversation titles. A save of an older session copy can still restore the old *conversation* title. A Library rename has the same limit. The research record's own title, shown in My Research, is protected.
- **Earlier renames.** Renames already lost before this fix are not recovered. Nothing rewrites member data.
- **Not covered here:** Create/Projects Continue (#485/#488/#491), B10 stuck uploads, and the other audit items.

## 6. Rollback

Preview only. Reset `preview/research-m1` to `ec1d128a1`, or revert the merge commits `bc8616195`, `3ca81b03` and `893e49a27`. No migrations, no data changes and no production impact.

## 7. GO / NO-GO

| | |
|---|---|
| Preview for CP0 testing | **GO** |
| Production / merge to `main` | **NO-GO.** CP0 is not run yet, and release needs a separate dated founder approval in DECISIONS.md |
