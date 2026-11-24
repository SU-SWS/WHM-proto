# Getting the data ready for the demo

*For whoever presents WHM at the innovation fair on Tuesday, December 8, 2026. Follow it in order.*

The site shows what the last **data run** published. A data run pulls fresh Siteimprove data and reads the GA4 export that's in the repo at that moment, so the GA4 export has to be committed **before** the data run that matters. A data run is scheduled **every day at about 3 a.m. Pacific**, an hour after the nightly GA4 export (1 to 2 a.m.), so each morning the site shows the previous night’s export and fresh Siteimprove data. The run on the morning of the fair, **Tue, Dec 8**, is the one people will see.

| Thing | Where it comes from | How it gets updated |
| --- | --- | --- |
| Siteimprove scores, issues, policies, check date | Siteimprove API | Every data run |
| Page views, trend, most visited pages, engagement, site search | `data/ga4/sitesuserguide.json`, made by the GA4 Apps Script | The Apps Script: daily on its trigger, or by hand through Google Drive |
| The published site | `data/published/`, written by the data run | The data run commits it and deploys the site |

## 1. A week before (by Tue, Dec 1)

1. **Check the GA4 export is current.** In GitHub, open `data/ga4/sitesuserguide.json` and look at the latest commit (“GA4 export for sitesuserguide, …”), or open the file and check `generatedAt`.
   - **Daily trigger working:** there's a commit from each night. Nothing else to do. (The GitHub token was approved and the first `exportAndCommit` ran Nov 24.)
   - **No commit for a day or more:** in Apps Script, check **Executions** for errors and **Triggers** for the daily trigger. An HTTP 401 or 403 means the token expired or lost access (see `docs/ga4-setup.md`). Until it's fixed, update the export by hand (section 4).
   - **Token expiry:** check the token's expiry date in GitHub (**Settings → Developer settings → Fine-grained tokens**). If it expires before Dec 8, renew it and paste the new one into the script's **Script properties**.
   - Open the file and check `"schemaVersion": 2`. Version 1 files have no page views, and the site will show sample page views.
2. **Check Siteimprove has a recent complete check** of sitesuserguide (Siteimprove, the site's dashboard). WHM skips checks that covered noticeably fewer pages than usual.
3. **Do a practice data run** (section 5) and check the site (section 6). Fix anything now, not on Dec 7.
4. **Rehearse** the demo path once, using the site as it is.

## 2. The weekend before (Sat, Dec 5 or Sun, Dec 6)

1. Make sure the GA4 export in the repo is from the last day or two. If not, update it by hand (section 4).
2. If anything changed in the code or wording that week, make sure it's merged to `main`.

## 3. The day before (Mon, Dec 7)

1. The scheduled data run starts about 3 a.m. Pacific. In the morning, check it finished: in GitHub, **Actions → Data run**.
2. **Check the site** (section 6).
3. If something's wrong:
   - GA4 out of date or missing: update it by hand (section 4), then run a data run (section 5).
   - Siteimprove part failed: the Admin page says which part and why. Run a data run again; temporary errors usually clear.
   - Still wrong: run a data run with **Publish** unticked, so nothing changes on the site, and look at the result before trying again.
4. Once it's right, **leave it alone.** Don't merge changes before the demo. The 3 a.m. run on Dec 8 still happens; if any part of it fails, that part keeps the data from Dec 7 (and the Admin page says so).

## 4. Updating the GA4 export by hand (through Google Drive)

Use this if a nightly export fails, or if the token stops working.

**In Apps Script** ([script.google.com](https://script.google.com), the “WHM GA4 export” project):

1. Make sure the project has the latest code from `scripts/apps-script/ga4-export.gs`. If the file in the repo changed since you last pasted it, select all in `Code.gs`, paste the new contents, and save.
2. Choose **dryRun** and select **Run**. In the **Execution log**, check:
   - the period ends yesterday;
   - the first 10 pages have page views, an engagement rate and a name;
   - “Page views by month” lists 8 months;
   - no search term looks personal (names, email addresses, phone numbers). If one does, **stop**: don't commit it, and get the filter fixed.
3. Choose **exportToDrive** and select **Run**. The log ends with a link to `whm-ga4-sitesuserguide.json` in your Google Drive.

**Download it:**

4. Open the link (or find `whm-ga4-sitesuserguide.json` in Google Drive), then **⋮ → Download**.
5. Check the downloaded name. If your Downloads folder already had a copy, the browser may call it `whm-ga4-sitesuserguide (1).json`. Use the newest one.

**Put it in the repo and commit** (in Terminal, in your WHM-proto folder):

6. Get the latest from GitHub first. The data run and the GA4 script commit on their own, so your copy is often behind:

   ```
   git pull --rebase
   ```

7. Replace the file. Adjust the name if the browser added `(1)`:

   ```
   mv ~/Downloads/whm-ga4-sitesuserguide.json data/ga4/sitesuserguide.json
   ```

8. Check it's the new one: the `generatedAt` date should be today.

   ```
   grep -m1 generatedAt data/ga4/sitesuserguide.json
   ```

9. Commit and push:

   ```
   git add data/ga4/sitesuserguide.json
   git commit -m "GA4 export for sitesuserguide"
   git push
   ```

   If the push is rejected, run `git pull --rebase` and push again.

Pushing redeploys the site, but **it doesn't change the numbers yet**. The site's numbers come from the data run, so start one next (section 5).

## 5. Running a data run

1. Go to the site's **Admin** page and select **Start data run**. GitHub opens at **Actions → Data run**. (Or go there directly.)
2. Select **Run workflow**. Leave **Site** as `all` (or choose `sitesuserguide`) and **Publish** ticked. Select the green **Run workflow** button.
   - To look at the result without changing the site, untick **Publish**. The files are saved under the run's **Artifacts** instead.
3. Go back to the Admin page. It follows the run step by step and says when the new data is live, usually within 5 minutes. Reload the site page after that.

You need write access to the repo to start a run.

## 6. Checking the site

**On the Admin page**, under “Last result for each site”: sitesuserguide should say **Complete**. Read the “Notes from this run” under it:

- Notes that a policy “has no WHM issue type” are expected and harmless.
- Anything starting with `traffic:`, `scores:`, `brokenLinks:`, `accessibilityIssues:`, `policies:` or `searchDescriptions:` means that part fell back to last good or sample data. Fix it before the demo.
- “GA4 export is … days old” or “no GA4 export found”: update it by hand (section 4).

**On the sitesuserguide page** (https://su-sws.github.io/WHM-proto/sites/sitesuserguide/):

- Near the top: “Siteimprove check of [date]” is recent, and “Checked N days ago” is small.
- **No warning boxes** saying “haven’t been updated since … may be out of date” or “the latest data run couldn’t update this site.”
- **Most visited pages:** real sitesuserguide paths (links), not `/add-a-page` or `/update-a-menu`, which are sample paths. The note says “From Google Analytics 4, as of [yesterday or so]. Live data.”
- **Trends:** page views per month run up to last month.
- **Issues:** most say whether they’re on your busiest pages (“Includes 2 of your 5 busiest pages.”). If none do, page views didn’t load.
- **What visitors search for:** a short list of terms, labeled live.
- The AI report, speed check, content freshness and the other two sites are **labeled samples**. That's expected.

## 7. The morning of the fair (Tue, Dec 8)

1. **Check the 3 a.m. data run** finished (Admin page, or **Actions → Data run**), then look at the site (section 6). Don't start another run unless something is broken.
2. On the demo laptop, **clear the browser's site data** for `su-sws.github.io`, so “Viewing as” starts at SWS administrator and no tracking or notes from rehearsals are left. In Chrome: the icon to the left of the address → **Cookies and site data → Manage on-device site data**, then delete `su-sws.github.io`.
3. Open the site and walk the demo path once.
4. Keep this page handy. If the site looks wrong during the day, see section 6 for what to check, and remember the last good data stays up even when a run fails.

## Things that catch people out

- **A pushed GA4 file doesn't change the numbers on its own.** The data run has to run after it.
- **Old Apps Script code** makes a version 1 file, with no page views. Re-paste the script whenever it changes in the repo.
- **Dates:** GA4 numbers say “as of” the day before the export; Siteimprove says the date of its last check. Both are normal.
- **WHM never swaps in Siteimprove's visitor numbers** for sitesuserguide. If GA4 data is missing, the site shows the last good GA4 numbers with a warning, or labeled samples (decisions, Nov 23).
