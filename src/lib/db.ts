import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 5,
  });
}

/**
 * Lazily creates the pg pool on first real use rather than at module import
 * time. This matters because Next.js imports every API route module during
 * `next build` to collect page data, and would otherwise fail the build in
 * any environment (CI, a fresh clone) where DATABASE_URL isn't set yet.
 */
function getPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = createPool();
  }
  return global.__pgPool;
}

export const pool = {
  query: <T extends QueryResultRow = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> =>
    getPool().query(text, params),
  end: (): Promise<void> => getPool().end(),
};

/** Format a JS number[] embedding as the literal pgvector expects, e.g. "[0.1,0.2,...]" */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
