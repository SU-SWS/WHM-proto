# Setting up the GA4 export (Apps Script)

The data run gets GA4 engagement and site search for sitesuserguide, over a rolling 90 days, from a small Google Apps Script that you run as yourself. There's no service account and no Cloud Console setup (decisions, Nov 20). The script is `scripts/apps-script/ga4-export.gs`. It commits `data/ga4/sitesuserguide.json` to this repo, and the next data run uses it.

You need:

- A Google account that can view the sitesuserguide GA4 property (ID **331314616**).
- A GitHub account with write access to SU-SWS/WHM-proto.

## 1. Create the GitHub token

1. In GitHub, select your **profile picture** (top right), then **Settings**.
2. At the bottom of the left sidebar, select **Developer settings**.
3. Select **Personal access tokens → Fine-grained tokens → Generate new token**.
4. Fill in the form:
   - **Token name:** `WHM GA4 export`
   - **Description:** `Apps Script commits data/ga4/ to WHM-proto`
   - **Resource owner:** **SU-SWS**. A token owned by your personal account can't write to the org's repo.
   - **Expiration:** a custom date after the fair, such as Feb 28, 2027.
   - **Repository access:** **Only select repositories**, then **SU-SWS/WHM-proto**.
   - **Permissions → Repository permissions:** set **Contents** to **Read and write**. GitHub adds **Metadata: Read-only** by itself; that's required. Leave everything else at **No access**.
5. Select **Generate token** (it may say **Generate token and request access** if the org requires approval).
6. **Copy the token now.** It starts with `github_pat_`, and GitHub shows it only once. It goes only into the Apps Script's Script properties (step 2.4): never into the repo, email or chat.

If **SU-SWS isn't in the Resource owner list**, the org has turned off fine-grained tokens; an org owner can turn them on under the org's **Settings → Personal access tokens**. If the token shows as **pending**, an org owner approves it under the org's **Settings → Personal access tokens → Pending requests**; until then commits fail with HTTP 403. Don't use a classic token instead: it can write to every repo you have access to.

When the token nears expiry, GitHub emails you. Generate a new one the same way and replace `GITHUB_TOKEN` in Script properties. If it's ever exposed, delete it on the same GitHub page and make a new one.

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

## Without the token (by hand)

While the GitHub token is waiting for approval, or if you'd rather not use one:

1. Run **exportToDrive**. It builds the same file as **exportAndCommit**, with the same filters, and saves it to your Google Drive as `whm-ga4-sitesuserguide.json`. The log shows its link. Running it again overwrites the same file.
2. Download it and save it in the repo as `data/ga4/sitesuserguide.json`, replacing any older copy.
3. Commit and push it, then run **Data run**.

The data run accepts the file for 14 days from when it was made, so repeat this at least every two weeks until the weekly trigger takes over.

## If something goes wrong

- **“AnalyticsData is not defined”** (or “Add the Google Analytics Data API service”): the advanced service is missing or has a different identifier. Under **Services**, add **Google Analytics Data API** with identifier exactly `AnalyticsData`. The similarly named **Google Analytics API** (`Analytics`) and **Google Analytics Admin API** (`AnalyticsAdmin`) are different services. If it isn't listed, turn on **Show "appsscript.json" manifest file** in Project settings and add `"dependencies": { "enabledAdvancedServices": [ { "userSymbol": "AnalyticsData", "serviceId": "analyticsdata", "version": "v1beta" } ] }` at the top level.
- **“Set the script property …”**: a property in step 2.4 is missing or misspelled.
- **“GitHub commit failed: HTTP 401 or 403”**: the token is wrong, has expired, lacks Contents write access, or is waiting for org approval.
- **“GitHub commit failed: HTTP 409”**: someone else committed the file at the same moment. Run it again.
- **A GA4 error mentioning permission**: your Google account can't view property 331314616.
- **The site still shows sample data after a data run**: the export is more than 14 days old, or it's for a different property than the registry lists. The data run's reason in `status.json` (shown on the admin page) says which.
