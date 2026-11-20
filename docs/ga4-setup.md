# Setting up the GA4 export (Apps Script)

The data run gets GA4 engagement and site search for sitesuserguide from a small Google Apps Script that you run as yourself. There's no service account and no Cloud Console setup (decisions, Nov 20). The script is `scripts/apps-script/ga4-export.gs`. It commits `data/ga4/sitesuserguide.json` to this repo, and the next data run uses it.

You need:

- A Google account that can view the sitesuserguide GA4 property (ID **331314616**).
- A GitHub account with write access to SU-SWS/WHM-proto.

## 1. Create the GitHub token

1. In GitHub, open **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Resource owner:** SU-SWS. **Repository access:** Only select repositories → **WHM-proto**.
3. **Repository permissions:** **Contents: Read and write**. Leave everything else as No access.
4. **Expiration:** pick a date after the fair, such as 90 days.
5. Generate it and copy it. If the SU-SWS organization requires approval for fine-grained tokens, an org owner has to approve it before it works.

## 2. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com) and create a **New project**. Name it something like “WHM GA4 export”.
2. Replace the contents of `Code.gs` with the contents of `scripts/apps-script/ga4-export.gs`, then save.
3. In the left sidebar, next to **Services**, select **+**, choose **Google Analytics Data API**, and add it. The identifier must be `AnalyticsData`.
4. Open **Project settings** (the gear). Under **Script properties**, add:
   - `GA4_PROPERTY_ID` = `331314616`
   - `GITHUB_TOKEN` = the token from step 1

   Only people who can edit this script can see these properties. Don't share the project with others.

## 3. Dry run, then review

1. In the editor, choose the function **dryRun** and select **Run**. Google asks you to authorize the script: allow it to view your Analytics data and to connect to an external service.
2. Open **Execution log**. It shows the file the script would commit, and a line like “Dry run: 412 pages, 9 search terms kept, 37 dropped. Nothing was committed.”
3. Check it before going further:
   - `pages` should list sitesuserguide paths with an `engagementRate` between 0 and 1.
   - `searchTerms` should hold nothing that looks personal: no names, email addresses or phone numbers. The filter drops terms with an @, with 5 or more digits in a row, or with a web address, and keeps only terms searched at least 5 times. If something personal gets through, don't commit. Tell Claude what slipped through so the filter can be tightened.
   - If `searchTerms` is empty and `dropped` is 0, GA4 may not be recording site search for this site. Enhanced measurement detects searches from query parameters like `q`, `s` or `search`; Stanford Sites may use a different one. Check in GA4 under **Admin → Data streams → Enhanced measurement → Site search**.
4. Send the log output to Claude to review if you'd like a second check.

## 4. Commit, then run weekly

1. Choose **exportAndCommit** and select **Run**. The log says “Committed: …”, and a commit titled “GA4 export for sitesuserguide …” appears in the repo.
2. Choose **installWeeklyTrigger** and select **Run** once. The script then exports every Sunday evening, ahead of Monday's data run.
3. Run **Data run** in GitHub Actions (or wait for Monday). The site page should then show engagement rates and search terms labeled “From Google Analytics 4, as of [date]. Live data.”

## If something goes wrong

- **“Set the script property …”**: a property in step 2.4 is missing or misspelled.
- **“GitHub commit failed: HTTP 401 or 403”**: the token is wrong, has expired, lacks Contents write access, or is waiting for org approval.
- **“GitHub commit failed: HTTP 409”**: someone else committed the file at the same moment. Run it again.
- **A GA4 error mentioning permission**: your Google account can't view property 331314616.
- **The site still shows sample data after a data run**: the export is more than 14 days old, or it's for a different property than the registry lists. The data run's reason in `status.json` (shown on the admin page) says which.
