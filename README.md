# WHM prototype: Claude Code starter kit

Website Health Monitoring prototype for the December 8, 2026 innovation fair (Stanford Web Services).

## Set up

1. Create the repo in the SU-SWS GitHub org, and clone it.
2. Copy everything in this kit into the repo root, including the hidden `.gitignore`.
3. Export the four project docs into `docs/`, using the names in `docs/README.md`.
4. Commit and push.
5. In the repo's Settings, set Pages → Source to "GitHub Actions". Add the Actions secrets `SITEIMPROVE_API_USER` and `SITEIMPROVE_API_KEY`.
6. Add the Siteimprove site ID for sitesuserguide.stanford.edu to `data/registry.json`.
7. Open the repo in VS Code with the Claude Code extension, or run Claude Code in a terminal from the repo root.

## First prompt for Claude Code

> Read CLAUDE.md, BUILD_PLAN.md and the docs folder. Then start task 1 in BUILD_PLAN.md. Before writing code, tell me anything in the plan that is unclear or that you can't do without guessing.

## What's here

| Path | What it is |
| --- | --- |
| `CLAUDE.md` | Project context and rules Claude Code reads at the start of every session |
| `BUILD_PLAN.md` | Ordered tasks with "done when" checks |
| `docs/` | Decisions, data contract, Siteimprove endpoint notes; exported project docs go here too |
| `reference/whm-demo.html` | The clickable demo: the UI and content reference |
| `data/registry.json` | Sites, owners (role labels), source IDs, which site is live |
| `data/issue-types.json`, `data/annotations.json` | Issue explanations and SWS notes. Draft text, not yet reviewed by SWS. |
| `data/sample/` | Sample data for all three demo sites, in the shape the live fetch will write |
| `data/fixtures/siteimprove/` | Empty for now; real API responses go here when endpoints are verified |
