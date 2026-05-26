"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type BillEnrichment = {
  ai_confidence: number;
  merchant_context: string;
  classification_note: string;
  is_subscription_candidate: boolean;
};

type Bill = {
  id: string;
  merchant: string;
  recurrence_pattern: string;
  avg_amount: number;
  next_due_date: string;
  last_seen: string;
  ai_enrichment: BillEnrichment | null;
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyColor(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days <= 7) return "text-red-400";
  if (days <= 14) return "text-yellow-400";
  return "text-emerald-400";
}

function urgencyLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    api
      .get<{ bills: Bill[] }>("/bills")
      .then((d) => setBills(d.bills))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const thisMonthBills = bills.filter((b) => {
    const due = new Date(b.next_due_date);
    return due >= now && due <= endOfMonth;
  });
  const monthlyTotal = thisMonthBills.reduce((s, b) => s + b.avg_amount, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bills</h1>
          <p className="text-gray-500 text-sm">Recurring charges detected from your transactions</p>
        </div>
        <Link href="/bills/calendar" className="text-sm text-indigo-400 hover:underline">
          Calendar view →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Due This Month</p>
          <p className="text-2xl font-bold text-white">
            ${monthlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-600 mt-1">{thisMonthBills.length} bills remaining</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Tracked</p>
          <p className="text-2xl font-bold text-white">{bills.length}</p>
          <p className="text-xs text-gray-600 mt-1">Recurring bills detected</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">All Bills</h2>
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
        ) : bills.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No recurring bills detected yet.</p>
            <p className="text-xs text-gray-600 mt-1">Sync your accounts to detect patterns.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {bills.map((bill) => (
              <button
                key={bill.id}
                onClick={() => setSelectedBill(bill)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white">{bill.merchant}</p>
                    {bill.ai_enrichment && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-400 border border-indigo-800/40">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {bill.recurrence_pattern.charAt(0).toUpperCase() +
                      bill.recurrence_pattern.slice(1)}{" "}
                    &middot;{" "}
                    <span className={urgencyColor(bill.next_due_date)}>
                      {urgencyLabel(bill.next_due_date)}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    ${bill.avg_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(bill.next_due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enrichment drawer */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedBill(null)}
          />
          <div className="relative w-full max-w-sm bg-gray-900 border-l border-gray-800 h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div>
                <p className="text-sm font-semibold text-white">{selectedBill.merchant}</p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">
                  {selectedBill.recurrence_pattern} bill
                </p>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
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
                  <p className="text-xs text-gray-500 mb-1">Avg Amount</p>
                  <p className="text-lg font-bold text-white">
                    ${selectedBill.avg_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gray-800/60 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Next Due</p>
                  <p className="text-lg font-bold text-white">
                    {new Date(selectedBill.next_due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {selectedBill.ai_enrichment ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">AI Analysis</p>
                    <div className="space-y-3">
                      <div className="bg-gray-800/40 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Merchant Context</p>
                        <p className="text-sm text-gray-200">{selectedBill.ai_enrichment.merchant_context}</p>
                      </div>
                      <div className="bg-gray-800/40 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Classification Note</p>
                        <p className="text-sm text-gray-200">{selectedBill.ai_enrichment.classification_note}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">AI Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${selectedBill.ai_enrichment.ai_confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {Math.round(selectedBill.ai_enrichment.ai_confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    {selectedBill.ai_enrichment.is_subscription_candidate && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-purple-900/40 text-purple-300 border border-purple-800/40">
                        Subscription candidate
                      </span>
                    )}
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
