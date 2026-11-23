# Monthly fact check — Cut Adrift and Not Redundant

Run on the 1st of each month, in the evening (NZ time), by a scheduled Claude task. It moved from weekly to monthly in November 2026; the first monthly run is 1 January 2027. The goal is that every figure, deadline, name and phone number on both sites and in both tools stays correct, with Wayne approving each change by merging a pull request.

## Repos

- `waynemstevens-lab/cut-adrift`: cutadrift.org. Guide pages are in `Public/*/index.html`, and the three tools' instructions (bereavement, incapacity, diagnosis) are in `worker.js` (`SYSTEM_PROMPTS`).
- `waynemstevens-lab/not-redundant`: notredundant.com. Pages are in `Public/*.html`, and the plan generator's instructions are in `worker.js`. `applyOutputFixes()` also rewrites known-stale figures in output.

Each repo has `FACTS.md`, the register of every time-sensitive figure with its official source, its change cycle and where it appears. It is generated from `tools/facts/facts_data.py` by `python3 tools/facts/gen_facts.py . tools/facts/facts_data.py "<Site name>" <dirs|files>`, using `dirs` for Cut Adrift and `files` for Not Redundant.

## Procedure

1. **Look for changes first.** Search the news for each country (NZ, AU, UK, IE, CA, US) covering the past month: benefit rate changes, budgets, new laws commencing, fee changes, renamed agencies and new or ended programs relevant to bereavement, serious illness, incapacity and caring, and job loss.
2. **Check due items in the register.** Re-verify every entry whose change date fell in the past 32 days, or falls in the next 31 (see "Key change dates" in FACTS.md), plus anything step 1 flagged. Use the official source listed. Every run, spot-check a rotating sixth of the remaining entries.
3. **Verify before editing.** Only change a figure when an official source, or two independent reputable sources, confirm the new value and its effective date. If a change is announced but not yet in effect, add a dated note ("from 1 April 2027 …") rather than replacing the current value. Because runs are a month apart, add notes for anything taking effect before the next run, and once a noted change has taken effect, replace the old value.
4. **Fix every location.** Use the register's search pattern across `Public/` **and** `worker.js` in both repos (a fact can appear in pages, tool instructions and Not Redundant's `applyOutputFixes`). Keep each site's tone. Change the "current as of / Last updated" line, `dateModified` and the sitemap `lastmod` **only on pages you actually edited**.
5. **Update the register.** Edit `tools/facts/facts_data.py` (value, notes) and regenerate `FACTS.md`. Add new entries for any new time-sensitive figure you find on the sites.
6. **Check your work.** Run `node --check worker.js` and parse every edited HTML file. Re-read each diff hunk against its source.
7. **Open pull requests, never push to main.** For each repo with changes, create a branch `monthly-check-YYYY-MM-DD` (first check for still-open `weekly-check-*` or `monthly-check-*` PRs and don't duplicate their changes), commit and open a PR. The PR description lists each change as old → new, effective date and source link, plus anything uncertain that needs Wayne's judgement. Merging the PR deploys automatically through GitHub Actions.
8. **Report.** Finish with a short summary: what changed (with PR links), what was checked and unchanged, and anything flagged for Wayne. If nothing changed, say so in one line.

## Rules

- Never merge, deploy, delete branches or touch Cloudflare yourself.
- Never invent a figure or phone number. If a source can't be reached, flag the item instead of guessing.
- Leave `.DS_Store` and unrelated files alone.
