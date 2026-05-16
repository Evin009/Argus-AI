"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Account = {
  id: string;
  institution: string;
  account_type: string;
  balance: number;
  credit_limit: number | null;
};

type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  timestamp: string;
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [acctsData, txnData] = await Promise.all([
          api.get<{ accounts: Account[] }>("/plaid/accounts"),
          api.get<{ transactions: Transaction[] }>("/transactions?limit=5"),
        ]);
        setAccounts(acctsData.accounts);
        setTransactions(txnData.transactions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-7 w-32 bg-gray-900 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse"
            >
              <div className="h-3 w-20 bg-gray-800 rounded mb-4" />
              <div className="h-8 w-28 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-gray-800">
          <svg
            className="w-10 h-10 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to ArgusAI</h1>
        <p className="text-gray-500 text-sm max-w-sm mb-8">
          Connect your bank accounts to unlock financial intelligence — cashflow forecasts, risk
          alerts, and AI-powered insights.
        </p>
        <Link
          href="/accounts"
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors"
        >
          Connect your first account
        </Link>
      </div>
    );
  }

  const totalBalance = accounts
    .filter((a) => a.account_type !== "credit")
    .reduce((sum, a) => sum + a.balance, 0);

  const totalDebt = accounts
    .filter((a) => a.account_type === "credit")
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Your financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-white">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-600 mt-1">Depository accounts</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Credit Balance</p>
          <p className="text-2xl font-bold text-white">
            ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-600 mt-1">Across all credit cards</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Linked Accounts</p>
          <p className="text-2xl font-bold text-white">{accounts.length}</p>
          <p className="text-xs text-gray-600 mt-1">
            <Link href="/accounts" className="text-indigo-400 hover:underline">
              Manage accounts →
            </Link>
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
          <Link href="/transactions" className="text-xs text-indigo-400 hover:underline">
            View all →
          </Link>
        </div>
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No transactions yet.</p>
            <Link
              href="/accounts"
              className="text-xs text-indigo-400 hover:underline mt-1 block"
            >
              Sync your accounts to import transactions →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {transactions.map((txn) => (
              <div key={txn.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{txn.merchant}</p>
                  <p className="text-xs text-gray-500">
                    {txn.category?.replace(/_/g, " ") || "Other"} &middot;{" "}
                    {new Date(txn.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p
                  className={`text-sm font-medium ${
                    txn.amount < 0 ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {txn.amount < 0 ? "+" : ""}$
                  {Math.abs(txn.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
