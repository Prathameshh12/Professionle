# Professionle 

A game where you are secretly assigned a random job. Your goal is to figure out what it is.

Ask yes/no questions to narrow it down — anything from "do you work outdoors?" to "do you need a degree for this?" You've got ten "no" answers before you lose, and two hints unlock automatically along the way to help you out. Guess the exact job correctly at any point, and you win instantly, no matter how early.

Every question gets a real, thought-out answer — and once something new gets asked, it's remembered, so the same question always gets the same answer for whoever asks it next.

Inspired by "That's My Job" - a show on Suhani Shah Youtube.

## Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind
- **Backend**: Next.js API routes
- **Database**: Postgres with the `pgvector` extension (Supabase's free tier works well)
- **LLM**: Google Gemini (`gemini-1.5-flash`) by default, free tier, no card required. Groq is a
  drop-in alternative. Embeddings always go through Gemini's `text-embedding-004`, since Groq has
  no embeddings endpoint.

## How a question gets answered

`src/lib/pipeline.ts` implements this exactly, in order:

1. **Guess detection** — is the message actually a guess at the job title (e.g. "is it a
   dentist?"), rather than a yes/no attribute question? Obvious attribute-style openers ("do you
   / does it / can you...") skip this for free; only ambiguous phrasing ("is it a...", "are
   you...") goes to a cheap LLM classification call. A correct guess wins immediately; a wrong
   guess is logged but does **not** count against the 10 "no" limit.
2. **Tag shortcut** — "is it in [field] work?" style questions are checked straight against the
   job's tag list before anything else. Instant, no LLM or embedding needed.
3. **Override check** — admin-entered corrections (via `/admin`) are checked first, via embedding
   similarity, so a bad answer can be fixed without waiting for its cache entry to be replaced.
4. **Cache check** — the question is embedded and compared (cosine similarity via pgvector) against
   every previously answered question for this job, seeded or learned. A close-enough match reuses
   that answer.
5. **LLM fallback** — only if nothing above matched. The LLM sees the job's full prose profile, its
   tags, and the session's question history so far (for internal consistency), and returns strict
   JSON: `{"answer": "yes" | "no" | "sometimes" | "not_really" | "irrelevant"}`. The new
   (question, answer) pair is cached immediately, so the next person who asks something similar
   never reaches the LLM at all.
6. The resolved answer is logged, and the session's no-count/hints/status are updated.

## Tuning

- **Similarity thresholds** live at the top of `src/lib/pipeline.ts`
  (`CACHE_SIMILARITY_THRESHOLD`, `OVERRIDE_SIMILARITY_THRESHOLD`), currently 0.90 and 0.92. Loosen
  them if too many near-duplicate questions are missing the cache and hitting the LLM; tighten
  them if the cache is returning answers for questions that aren't really equivalent.
- **Tag shortcut heuristic** (`checkTagShortcut` in the same file) is a simple keyword check, not
  an embedding match — it's deliberately conservative (only fires "yes" on a positive tag hit) so
  it can't confidently answer "no" for a field a job _isn't_ tagged with. Extend it if you find
  patterns worth hard-coding from real `question_log` data.
- **Guess-detection patterns** (`GUESS_CANDIDATE` / `ATTRIBUTE_LEAD` regexes) decide which
  messages are ambiguous enough to warrant an LLM classification call. Add phrasing you see
  players actually use.
- Swap LLM providers with the `LLM_PROVIDER` env var (`gemini` or `groq`) — no other code needs to
  change, since everything talks to the `LlmProvider` interface in `src/lib/llm/types.ts`. To add
  a new provider (Claude, GPT, etc.), implement that interface in a new file and add one branch to
  `src/lib/llm/index.ts`.
- Add more jobs by extending `scripts/jobs-data.ts` (profile prose, tags, two hints, ~20 FAQ
  pairs) and re-running `npm run seed` — it upserts by job title, so it's safe to re-run.

## Notes

- Sessions are anonymous by default (`user_id` is nullable in `game_sessions`), but the schema
  already has the column so login/leaderboards can be layered on later without a migration.
- The `/ask` endpoint rate-limits to one request per 2 seconds per session
  (`src/lib/rateLimit.ts`), in-memory. If you deploy multiple server instances behind a load
  balancer, swap this for a Redis `INCR` + TTL check — the function signature is deliberately
  tiny to make that a drop-in change.
- LLM JSON output is validated before being trusted, with one retry on malformed output
  (`generateWithRetry` / `chatWithRetry` in the provider files).
- `/admin` is intentionally basic (plain HTML forms, a shared-secret bearer token) rather than a
  full auth system — swap in real authentication before using this in production.
