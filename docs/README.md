# Project docs

## Start here

| Doc | What it is |
| --- | --- |
| [demo-prep.md](demo-prep.md) | Getting the data ready for the fair: what to check and when, updating the GA4 export by hand through Google Drive, running and checking a data run |
| [how-it-works.md](how-it-works.md) | Plain-language overview of the prototype: data sources, how it decides what matters, privacy, prototype vs. MVP |
| [decisions.md](decisions.md) | Dated decision log, plus the open questions. **It wins where it disagrees with any other doc** |

## For building and running WHM

| Doc | What it is |
| --- | --- |
| [data-contract.md](data-contract.md) | The JSON files every part of WHM reads or writes, and their fields |
| [siteimprove-endpoints.md](siteimprove-endpoints.md) | Each Siteimprove endpoint: what's verified against a saved response, field notes, and rules for the fetch |
| [verdict-rules.md](verdict-rules.md) | How a live site's state, verdict and lede are worked out, including the low-engagement rule. Draft for SWS review |
| [ga4-setup.md](ga4-setup.md) | Setting up the GA4 Apps Script export, the GitHub token, and doing it by hand |
| [editing-issue-text.md](editing-issue-text.md) | For the SWS owner of the issue wording: which files to edit, writing rules, and making the change on GitHub |

## Project docs

These started in Claude Docs. **Since Nov 23, the files here are the place of record**: edit them in the repo, not in Claude Docs. The Claude Docs copies are no longer kept in step.

| Doc | What it is |
| --- | --- |
| [requirements.md](requirements.md) | Use scenarios and requirements, with IDs (SP-, TR-, AC-, AD-, CT-, Q-) |
| [prototype-plan.md](prototype-plan.md) | Architecture, components, the run button, and how live data was added |
| [roadmap.md](roadmap.md) | Phases, dates and gates from the prototype to the MVP |
| [personas.md](personas.md) | The six personas and the survey evidence behind them |

Diagrams from the original export appear as text placeholders. When a decision changes one of these docs, update the doc and log the reason in `decisions.md`.

The original clickable demo is at https://claude.ai/artifact/CqAhjXJWekFfpv6rVwRooa, with a copy in `reference/whm-demo.html`.
