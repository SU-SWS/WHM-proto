import { getStatus } from "@/lib/data/load";

// Publishes data/published/status.json at /status.json, so the admin page can
// check for a newer run after a deploy without a full page reload (AD-3).
export const dynamic = "force-static";

export function GET() {
  return Response.json(getStatus());
}
