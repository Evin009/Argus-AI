"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type Subscription = {
  id: string;
  merchant: string;
  avg_amount: number;
  billing_cycle: string;
  price_change_pct: number | null;
  is_active: boolean;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

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
              <div key={sub.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white">{sub.merchant}</p>
                    {sub.price_change_pct !== null && sub.price_change_pct > 5 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/40">
                        +{sub.price_change_pct.toFixed(1)}% creep
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sub.billing_cycle.charAt(0).toUpperCase() + sub.billing_cycle.slice(1)}
                  </p>
                </div>
                <p className="text-sm font-medium text-white">
                  ${sub.avg_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  <span className="text-xs text-gray-500">/mo</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
