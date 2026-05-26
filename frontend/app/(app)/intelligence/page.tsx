"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type AnalystDecision = {
  id: string;
  summary: string;
  created_at: string;
  structured_output_json: {
    signal_type: "behavioral" | "risk" | "opportunity" | "anomaly" | "subscription";
    severity: "info" | "warning" | "critical";
    title: string;
    reasoning: string;
    recommendation: string;
    simulation: string;
    confidence: number;
    sources: string[];
  };
};

const SIGNAL_TYPES = ["behavioral", "risk", "opportunity", "anomaly", "subscription"] as const;

const severityStyles: Record<string, string> = {
  info: "bg-blue-900/30 text-blue-300 border-blue-800/40",
  warning: "bg-yellow-900/30 text-yellow-300 border-yellow-800/40",
  critical: "bg-red-900/30 text-red-300 border-red-800/40",
};

const signalDot: Record<string, string> = {
  behavioral: "bg-purple-400",
  risk: "bg-red-400",
  opportunity: "bg-emerald-400",
  anomaly: "bg-orange-400",
  subscription: "bg-blue-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "Just now";
}

export default function IntelligencePage() {
  const [decisions, setDecisions] = useState<AnalystDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const params = filter ? `?signal_type=${filter}&limit=50` : "?limit=50";
    api
      .get<AnalystDecision[]>(`/insights${params}`)
      .then(setDecisions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const criticalCount = decisions.filter(
    (d) => d.structured_output_json?.severity === "critical"
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Intelligence Feed</h1>
        <p className="text-gray-500 text-sm">
          AI analyst decisions generated from your financial data
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Signals</p>
          <p className="text-2xl font-bold text-white">{decisions.length}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Critical</p>
          <p className={`text-2xl font-bold ${criticalCount > 0 ? "text-red-400" : "text-white"}`}>
            {criticalCount}
          </p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Showing</p>
          <p className="text-2xl font-bold text-white capitalize">{filter ?? "All"}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Latest</p>
          <p className="text-sm font-medium text-gray-300">
            {decisions[0] ? timeAgo(decisions[0].created_at) : "—"}
          </p>
        </div>
      </div>

      {/* Signal type filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => { setFilter(null); setLoading(true); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            filter === null
              ? "bg-indigo-900/40 text-indigo-300 border-indigo-800/50"
              : "text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white"
          }`}
        >
          All
        </button>
        {SIGNAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setFilter(t); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              filter === t
                ? "bg-indigo-900/40 text-indigo-300 border-indigo-800/50"
                : "text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-gray-700 mt-1.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-gray-800 rounded" />
                  <div className="h-3 w-full bg-gray-800 rounded" />
                  <div className="h-3 w-1/2 bg-gray-800 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : decisions.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 px-6 py-16 text-center">
            <p className="text-sm text-gray-500">No analyst decisions yet.</p>
            <p className="text-xs text-gray-600 mt-1">
              Sync your accounts to trigger the intelligence pipeline.
            </p>
          </div>
        ) : (
          decisions.map((d) => {
            const soj = d.structured_output_json ?? {};
            const isOpen = expanded === d.id;
            return (
              <div
                key={d.id}
                className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : d.id)}
                  className="w-full px-6 py-5 flex items-start gap-3 text-left hover:bg-gray-800/40 transition-colors"
                >
                  <span
                    className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${signalDot[soj.signal_type] ?? "bg-gray-500"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white">{soj.title}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wide ${severityStyles[soj.severity] ?? ""}`}
                      >
                        {soj.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{soj.reasoning}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    <span className="text-xs text-gray-600">{timeAgo(d.created_at)}</span>
                    <span className="text-xs text-gray-600 capitalize">{soj.signal_type}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-800 px-6 py-5 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reasoning</p>
                      <p className="text-sm text-gray-300">{soj.reasoning}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recommendation</p>
                      <p className="text-sm text-white">{soj.recommendation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Simulation</p>
                      <p className="text-sm text-gray-300">{soj.simulation}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence</span>
                        <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(soj.confidence ?? 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {Math.round((soj.confidence ?? 0) * 100)}%
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {(soj.sources ?? []).map((s: string) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-500"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
