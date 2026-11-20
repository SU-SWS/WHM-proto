# Project docs

## Start here

| Doc | What it is |
| --- | --- |
| [how-it-works.md](how-it-works.md) | Plain-language overview of the prototype: data sources, how it decides what matters, privacy, prototype vs. MVP |
| [decisions.md](decisions.md) | Dated decision log, plus the open questions. **It wins where it disagrees with any other doc**, including the exports below |

## For building and running WHM

| Doc | What it is |
| --- | --- |
| [data-contract.md](data-contract.md) | The JSON files every part of WHM reads or writes, and their fields |
| [siteimprove-endpoints.md](siteimprove-endpoints.md) | Each Siteimprove endpoint: what's verified against a saved response, field notes, and rules for the fetch |
| [verdict-rules.md](verdict-rules.md) | How a live site's state, verdict and lede are worked out, including the low-engagement rule. Draft for SWS review |
| [ga4-setup.md](ga4-setup.md) | Setting up the GA4 Apps Script export, the GitHub token, and doing it by hand |

## Exported project docs

These live in Claude Docs. After any change there, export again: open the menu under the doc's name, choose **Export**, then **Markdown**, and save over the file below (not the default filename).

| Doc | Save as |
| --- | --- |
| [WHM Requirements](https://claude.ai/artifact/GSUPnwH12SYFXNmabCQB2i) | `docs/requirements.md` |
| [WHM Prototype Plan](https://claude.ai/artifact/Nfs6VkeSqgZG9xckVUphPs) | `docs/prototype-plan.md` |
| [WHM Roadmap](https://claude.ai/artifact/FHQrJbt2DQdmtpWiHAoQ2Z) | `docs/roadmap.md` |
| [WHM Personas](https://claude.ai/artifact/HC3VUxnrg1zL4Ds8B46Y5L) | `docs/personas.md` |

Diagrams in these docs come through as text placeholders. Some exported wording is out of date; `decisions.md` records what replaced it (for example, live GA4 data and the revised TR-1 and TR-2).

The original clickable demo is at https://claude.ai/artifact/CqAhjXJWekFfpv6rVwRooa, with a copy in `reference/whm-demo.html`.
