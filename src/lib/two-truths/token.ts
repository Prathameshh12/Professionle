import { createHmac, timingSafeEqual } from "crypto";

// Reuses ADMIN_TOKEN as the signing secret if you haven't set a dedicated one —
// this token only protects "which of two jobs is secretly the answer to a
// trivia round," nothing sensitive, so reusing an existing secret is a
// reasonable default. Set TWO_TRUTHS_SECRET yourself if you'd rather they be
// fully independent.
const SECRET = process.env.TWO_TRUTHS_SECRET || process.env.ADMIN_TOKEN || "two-truths-dev-secret-change-me";

export interface RoundPayload {
  pairId: string;
  target: "A" | "B";
  nonce: string;
  exp: number; // unix ms
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input: string): Buffer {
  const pad = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  return Buffer.from(padded, "base64");
}

/** Signs a round's secret answer into an opaque, tamper-proof token the client can carry
 *  around statelessly — no server-side session storage needed, which matters because this
 *  app can run as multiple short-lived serverless instances that don't share memory. */
export function signRound(payload: RoundPayload): string {
  const body = base64url(JSON.stringify(payload));
  const sig = base64url(createHmac("sha256", SECRET).update(body).digest());
  return `${body}.${sig}`;
}

/** Verifies a round token's signature and expiry. Returns null if it's been tampered
 *  with, is malformed, or has expired. */
export function verifyRound(token: string): RoundPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expectedSig = base64url(createHmac("sha256", SECRET).update(body).digest());
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(body).toString()) as RoundPayload;
    if (payload.target !== "A" && payload.target !== "B") return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (typeof payload.pairId !== "string" || typeof payload.nonce !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}