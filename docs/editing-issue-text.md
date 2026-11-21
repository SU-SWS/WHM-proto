# Editing WHM's issue text

*For the SWS owner of WHM's plain-language issue library (roadmap: OT-04). No coding needed.*

Every issue WHM shows a site owner has a title and three short explanations: **what it is**, **why it matters**, and **what to do**. Some issues also have a note from the SWS accessibility specialist. You own that wording. This guide covers where it lives, how to change it safely, and how your change reaches the site.

Right now all of the text is a **draft written for the prototype**. It hasn't been reviewed by SWS, and reviewing it is the first job.

## 1. What you can change, and where

| What | File | Shown on |
| --- | --- | --- |
| Issue titles and explanations | `data/issue-types.json` | Issue rows on each site page; the issue page; the email preview; the share summary |
| Notes from the accessibility specialist | `data/annotations.json` | The issue page (“Note from the SWS accessibility specialist”); the Admin page |
| Verdict and summary sentences (“Needs attention: …”) | `docs/verdict-rules.md` | The top of each live site's page |

**Verdict sentences are different:** they also live in code (`scripts/lib/verdict.mjs`). Edit the wording in `docs/verdict-rules.md` and ask a developer to make the same change in the code. Change both together, or not at all.

Other words on the site, such as headings and buttons, live in the page code. Send requests for those to a developer.

## 2. Issue text: `data/issue-types.json`

The file is a list of issue types. Each one looks like this:

```json
{
  "key": "a11y-h1-missing",
  "title": "Pages don’t start with a main heading",
  "category": "Accessibility",
  "fixer": "owner",
  "editorial": false,
  "what": "These pages don’t begin with a level 1 heading.",
  "why": "The main heading tells visitors and screen readers what the page is about before they read further.",
  "todo": "Make sure each listed page starts with one level 1 heading that names the page.",
  "siteimproveIds": ["a11y-rule:61"],
  "reviewedBySws": false
},
```

| Field | Edit it? | What it is |
| --- | --- | --- |
| `title` | **Yes** | The issue's name. A short statement of the problem, in sentence case. |
| `what` | **Yes** | What the problem is, in one or two sentences. |
| `why` | **Yes** | Why it matters to visitors. One or two sentences. |
| `todo` | **Yes** | What the owner does about it. Starts with a verb. For issues SWS handles, say no action is needed. |
| `reviewedBySws` | **Yes** | Change to `true` once you've reviewed the type. It's recorded for tracking; issue text doesn't show a “draft” label on the site. |
| `category` | Ask first | Groups issues in “Show everything plainly”. Use one of: Accessibility, Content quality, Content freshness, Findability, Stanford standards. A new category name creates a new group. |
| `key` | **No** | The type's ID. Pages and data refer to it, so changing it breaks the site. |
| `fixer` | **No** | Who fixes it: `owner` or `sws`. Changing it moves the issue between lists. Ask a developer. |
| `editorial` | **No** | Whether owners can mark pages “still correct” or “set aside”. That's a product decision. |
| `siteimproveIds` | **No** | Links the type to Siteimprove rules or policies. Changing it changes which data shows up. |

### Which types appear where

The live site (sitesuserguide) shows types driven by real Siteimprove data. The sample sites show the original demo types. **Review the live ones first.**

| Shown on the live site | Key |
| --- | --- |
| Links lead to pages that don’t exist | `broken` |
| Links in the shared footer are reported broken | `broken-template` |
| Pages don’t start with a main heading | `a11y-h1-missing` |
| Some headings have nothing under them | `a11y-content-after-heading` |
| Headings skip levels | `a11y-heading-order` |
| Some buttons or links are too small to tap easily | `a11y-target-size` |
| Buttons and links are smaller than the recommended size | `a11y-target-size-enhanced` |
| Lines of text are close together | `a11y-line-height` |
| Some text doesn’t meet the higher contrast level | `a11y-contrast-enhanced` |
| Link text doesn’t say where the link goes | `linktext` (also used for the Vague Link Text policy) |
| Pages not updated in over a year (simulated) | `stale` |
| Stanford policies: 15 types | keys starting with `policy-` |

The rest (`alt`, `pdf`, `contrast`, `titles`, `searchdesc`, `policy`) appear only on the sample sites.

## 3. Specialist notes: `data/annotations.json`

Each note attaches to an issue type, on all sites or one site, and carries over from one Siteimprove check to the next.

```json
{
  "issueType": "alt",
  "appliesTo": "all",
  "note": "If you already added alt text when uploading an image and it’s still flagged, the description may be on the media item but not on this placement. Check the image settings on the page itself.",
  "swsHandling": false,
  "author": "SWS accessibility specialist",
  "reviewedBySws": false
}
```

- `issueType`: the `key` of an issue type from section 2.
- `appliesTo`: `"all"`, or one site's key: `"sitesuserguide"`, `"webservices"` or `"decanter"`.
- `note`: the text owners see.
- `swsHandling`: `true` if SWS is fixing it, as the Admin page shows; otherwise `false`.
- `author`: a **role, never a name**. The repo and site are public.
- `reviewedBySws`: while it's `false`, the note shows a “Draft, not yet reviewed by SWS” label. Set it to `true` when the note is final.

To add a note, copy an existing one, paste it after it with a comma between the two, and change the values.

## 4. Writing rules

- **Plain language, about an 8th-grade reading level.** Short sentences and common words. Explain any technical term, or leave it out.
- **Talk to the site owner.** Write “you” and “your pages”, and say what they can do.
- **Say “check”, not “crawl”.** For example, “the next Siteimprove check”.
- **Use curly quotes and apostrophes:** ’ “ ”. Never use a straight double quote (") inside the text, because it breaks the file. On a Mac, Option-] types ’, Option-[ types “, and Shift-Option-[ types ”.
- **No names, email addresses or phone numbers.** Everything is public.
- **Keep the same meaning as the Siteimprove rule or policy.** If you're not sure what a rule checks, ask before changing what the text claims.

## 5. Making the change on GitHub

You need a GitHub account with write access to **SU-SWS/WHM-proto**. Ask the project lead to add you. If you can't get write access, GitHub offers to put your change in your own copy (a fork) and send it as a request; the steps are the same from step 5 on.

1. Go to https://github.com/SU-SWS/WHM-proto and open the file, for example `data/issue-types.json`.
2. Select the **pencil** (Edit this file) at the top right of the file.
3. Make your changes. Press **⌘F** (Mac) or **Ctrl+F** (Windows) in the editor to find the issue by its title or key.
4. Select **Preview** to check that only the lines you meant to change are marked.
5. Select **Commit changes…**
   - Write a short message, such as “Review accessibility heading issues”.
   - Choose **Create a new branch for this commit and start a pull request**. Don't commit straight to `main`: a pull request lets the site be checked first.
   - Select **Propose changes**, then **Create pull request**.
6. **Wait for the check.** A check called **Check** runs on the pull request in a minute or two.
   - **Green check mark:** the files are valid and the site builds.
   - **Red X:** select **Details**. The message usually names the file and the problem, often a missing comma, a missing quote mark, or a straight double quote inside the text. Go back to your branch, fix it, and commit again; the check reruns.
7. **Merge.** Once it's green, select **Merge pull request**, then **Confirm merge**. Or ask the project lead to review and merge it.
8. **See it live.** Merging starts a deploy. After 2 to 3 minutes, your text is on https://su-sws.github.io/WHM-proto/. Reload the page to see it. Progress is under the repo's **Actions** tab, in the run named **Deploy to GitHub Pages**.

You don't need to run a data run: issue text is read when the site is built.

### If something goes wrong after merging

- **The site didn't change:** check the **Actions** tab. A red run means the change didn't publish, and the site keeps the previous version. Open the run to see why, fix the file, and merge again.
- **You merged a mistake:** open the pull request and select **Revert**. GitHub makes a new pull request that undoes it; merge that one.

## 6. A good first review

1. Read each live-site type in section 2 against the Siteimprove rule or policy it maps to.
2. Fix the wording, then set `reviewedBySws` to `true` for each type you've signed off.
3. Do the same for the two specialist notes in `data/annotations.json`.
4. Read `docs/verdict-rules.md`, especially the “Questions for SWS” at the end, and send your answers to the project lead.

To see how the text reads in place, open the live site's issues from https://su-sws.github.io/WHM-proto/sites/sitesuserguide/.
