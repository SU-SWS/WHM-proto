// Where the site and its workflows live. next.config.ts reads BASE_PATH too.

export const REPO = "SU-SWS/WHM-proto";
export const BASE_PATH = "/WHM-proto";

/** The data run workflow (task 5). "Start data run" opens it in GitHub (Option A). */
export const REFRESH_WORKFLOW = "refresh-data.yml";
export const REFRESH_WORKFLOW_URL = `https://github.com/${REPO}/actions/workflows/${REFRESH_WORKFLOW}`;
