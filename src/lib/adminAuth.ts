import { NextRequest } from "next/server";

/** Simple shared-secret check: `Authorization: Bearer <ADMIN_TOKEN>`. */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token === expected;
}
