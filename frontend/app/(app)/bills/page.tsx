"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type Bill = {
  id: string;
  merchant: string;
  recurrence_pattern: string;
  avg_amount: number;
  next_due_date: string;
  last_seen: string;
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
              <div key={bill.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{bill.merchant}</p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
