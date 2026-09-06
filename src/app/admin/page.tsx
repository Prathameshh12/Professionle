"use client";

import { useEffect, useState } from "react";
import type { Answer } from "@/types";

interface LogRow {
  id: string;
  question_text: string;
  resolved_answer: Answer;
  was_guess_attempt: boolean;
  source: string;
  created_at: string;
  job_title: string;
  job_id: string;
}
interface JobOption {
  id: string;
  title: string;
}

const ANSWER_OPTIONS: Answer[] = ["yes", "no", "sometimes", "not_really", "irrelevant"];

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [overrideJobId, setOverrideJobId] = useState("");
  const [overridePattern, setOverridePattern] = useState("");
  const [overrideAnswer, setOverrideAnswer] = useState<Answer>("yes");
  const [savingOverride, setSavingOverride] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("tmj_admin_token");
    if (saved) {
      setToken(saved);
      setTokenInput(saved);
    }
  }, []);

  useEffect(() => {
    if (token) loadLogs(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadLogs(t: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/logs", { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load logs");
      setLogs(data.logs);
      setJobs(data.jobs);
      if (data.jobs[0]) setOverrideJobId((cur) => cur || data.jobs[0].id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function saveToken() {
    window.localStorage.setItem("tmj_admin_token", tokenInput);
    setToken(tokenInput);
  }

  async function addOverride(e: React.FormEvent) {
    e.preventDefault();
    if (!overrideJobId || !overridePattern.trim()) return;
    setSavingOverride(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          job_id: overrideJobId,
          question_pattern: overridePattern.trim(),
          forced_answer: overrideAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save override");
      setOverridePattern("");
      await loadLogs(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingOverride(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-paper font-body px-6 py-8 max-w-4xl mx-auto">
      <h1 className="font-case text-2xl mb-6">That&rsquo;s My Job — Admin</h1>

      <section className="mb-8 flex gap-2 items-center">
        <input
          type="password"
          placeholder="Admin token"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          className="bg-panel border border-wire rounded px-3 py-2 flex-1 max-w-xs"
        />
        <button onClick={saveToken} className="border border-manila text-manila px-4 py-2 font-case text-sm">
          CONNECT
        </button>
        {loading && <span className="text-paperDim text-sm">Loading…</span>}
      </section>

      {error && <p className="text-alert mb-4">{error}</p>}

      {token && (
        <>
          <section className="mb-10 border border-wire p-4">
            <h2 className="font-case text-sm text-manila mb-3">ADD ANSWER OVERRIDE</h2>
            <form onSubmit={addOverride} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-paperDim mb-1">Job</label>
                <select
                  value={overrideJobId}
                  onChange={(e) => setOverrideJobId(e.target.value)}
                  className="bg-panel border border-wire rounded px-3 py-2"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs text-paperDim mb-1">Question pattern</label>
                <input
                  value={overridePattern}
                  onChange={(e) => setOverridePattern(e.target.value)}
                  placeholder='e.g. "do you work with your hands"'
                  className="bg-panel border border-wire rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-paperDim mb-1">Forced answer</label>
                <select
                  value={overrideAnswer}
                  onChange={(e) => setOverrideAnswer(e.target.value as Answer)}
                  className="bg-panel border border-wire rounded px-3 py-2"
                >
                  {ANSWER_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={savingOverride}
                className="bg-manila text-ink font-case text-sm px-4 py-2 disabled:opacity-40"
              >
                SAVE
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-case text-sm text-manila mb-3">RECENT QUESTION LOG</h2>
            <div className="border border-wire divide-y divide-wire">
              {logs.map((row) => (
                <div key={row.id} className="px-4 py-3 flex flex-wrap gap-3 items-center text-sm">
                  <span className="text-paperDim w-40 shrink-0">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                  <span className="text-manila w-32 shrink-0">{row.job_title}</span>
                  <span className="flex-1 min-w-[200px] italic">&ldquo;{row.question_text}&rdquo;</span>
                  <span className="w-20 shrink-0 font-case">{row.resolved_answer}</span>
                  <span className="w-16 shrink-0 text-paperDim text-xs uppercase">{row.source}</span>
                  {row.was_guess_attempt && (
                    <span className="text-xs text-manila border border-manila px-1">guess</span>
                  )}
                </div>
              ))}
              {logs.length === 0 && <p className="px-4 py-6 text-paperDim text-center">No questions logged yet.</p>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
