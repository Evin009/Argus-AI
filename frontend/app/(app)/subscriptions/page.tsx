"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type SubscriptionEnrichment = {
  service_category: string;
  duplicate_flag: boolean;
  duplicate_note: string | null;
  price_trend_interpretation: string;
  cancel_recommendation: boolean;
  cancel_reasoning: string | null;
};

type Subscription = {
  id: string;
  merchant: string;
  avg_amount: number;
  billing_cycle: string;
  price_change_pct: number | null;
  is_active: boolean;
  ai_enrichment: SubscriptionEnrichment | null;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  useEffect(() => {
    api
      .get<{ subscriptions: Subscription[] }>("/subscriptions")
      .then((d) => setSubscriptions(d.subscriptions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthlyTotal = subscriptions.reduce((s, sub) => s + sub.avg_amount, 0);
  const creepCount = subscriptions.filter(
    (s) => s.price_change_pct !== null && s.price_change_pct > 5
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Subscriptions</h1>
        <p className="text-gray-500 text-sm">Active recurring monthly services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Total</p>
          <p className="text-2xl font-bold text-white">
            ${monthlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-600 mt-1">Across all active subscriptions</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active</p>
          <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
          <p className="text-xs text-gray-600 mt-1">Subscriptions tracked</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price Creep</p>
          <p className={`text-2xl font-bold ${creepCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {creepCount}
          </p>
          <p className="text-xs text-gray-600 mt-1">Subscriptions up &gt;5%</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">All Subscriptions</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-800 rounded" />
                  <div className="h-3 w-20 bg-gray-800 rounded" />
                </div>
                <div className="h-4 w-16 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No subscriptions detected yet.</p>
            <p className="text-xs text-gray-600 mt-1">Sync your accounts to detect monthly charges.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {subscriptions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSub(sub)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-white">{sub.merchant}</p>
                    {sub.price_change_pct !== null && sub.price_change_pct > 5 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/40">
                        +{sub.price_change_pct.toFixed(1)}% creep
                      </span>
                    )}
                    {sub.ai_enrichment?.cancel_recommendation && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/40 text-orange-400 border border-orange-800/40">
                        Cancel?
                      </span>
                    )}
                    {sub.ai_enrichment?.duplicate_flag && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-400 border border-yellow-800/40">
                        Duplicate
                      </span>
                    )}
                    {sub.ai_enrichment && !sub.ai_enrichment.cancel_recommendation && !sub.ai_enrichment.duplicate_flag && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-400 border border-indigo-800/40">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {sub.billing_cycle} &middot; {sub.ai_enrichment?.service_category ?? "—"}
                  </p>
                </div>
                <p className="text-sm font-medium text-white">
                  ${sub.avg_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  <span className="text-xs text-gray-500">/mo</span>
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enrichment drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedSub(null)}
          />
          <div className="relative w-full max-w-sm bg-gray-900 border-l border-gray-800 h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div>
                <p className="text-sm font-semibold text-white">{selectedSub.merchant}</p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">
                  {selectedSub.billing_cycle} subscription
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/60 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Monthly Cost</p>
                  <p className="text-lg font-bold text-white">
                    ${selectedSub.avg_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gray-800/60 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Price Change</p>
                  <p className={`text-lg font-bold ${
                    selectedSub.price_change_pct !== null && selectedSub.price_change_pct > 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}>
                    {selectedSub.price_change_pct !== null
                      ? `${selectedSub.price_change_pct > 0 ? "+" : ""}${selectedSub.price_change_pct.toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
              </div>

              {selectedSub.ai_enrichment ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">AI Analysis</p>
                    <div className="space-y-3">
                      <div className="bg-gray-800/40 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Price Trend</p>
                        <p className="text-sm text-gray-200">{selectedSub.ai_enrichment.price_trend_interpretation}</p>
                      </div>

                      {selectedSub.ai_enrichment.cancel_recommendation && (
                        <div className="bg-orange-900/20 border border-orange-800/40 rounded-xl p-4">
                          <p className="text-xs text-orange-400 font-medium mb-1">Cancel Recommendation</p>
                          <p className="text-sm text-gray-200">{selectedSub.ai_enrichment.cancel_reasoning}</p>
                        </div>
                      )}

                      {selectedSub.ai_enrichment.duplicate_flag && (
                        <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-4">
                          <p className="text-xs text-yellow-400 font-medium mb-1">Possible Duplicate</p>
                          <p className="text-sm text-gray-200">{selectedSub.ai_enrichment.duplicate_note}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-500 capitalize">
                      Category: <span className="text-gray-300">{selectedSub.ai_enrichment.service_category}</span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800/40 rounded-xl p-5 text-center">
                  <p className="text-sm text-gray-500">No AI enrichment yet.</p>
                  <p className="text-xs text-gray-600 mt-1">Enrichment runs after the next sync.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
