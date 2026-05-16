"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  subcategory: string | null;
  timestamp: string;
  is_recurring: boolean;
};

const PAGE_SIZE = 50;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: offset.toString(),
      });
      if (category) params.set("category", category);
      const data = await api.get<{ transactions: Transaction[]; total: number }>(
        `/transactions?${params}`
      );
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [offset, category]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategory(e.target.value);
    setOffset(0);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Transactions</h1>
          <p className="text-gray-500 text-sm">{total} total</p>
        </div>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All categories</option>
          <option value="FOOD_AND_DRINK">Food &amp; Drink</option>
          <option value="TRANSPORTATION">Transportation</option>
          <option value="SHOPPING">Shopping</option>
          <option value="ENTERTAINMENT">Entertainment</option>
          <option value="UTILITIES">Utilities</option>
          <option value="HEALTHCARE">Healthcare</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-20 bg-gray-800 rounded" />
                <div className="h-4 flex-1 bg-gray-800 rounded" />
                <div className="h-4 w-24 bg-gray-800 rounded" />
                <div className="h-4 w-16 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 text-sm">No transactions found</p>
            {!category && (
              <p className="text-gray-600 text-xs mt-1">
                Connect a bank account and sync to import transactions.
              </p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {new Date(txn.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-white">
                    <div className="flex items-center gap-2">
                      {txn.merchant}
                      {txn.is_recurring && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-400 border border-indigo-800/40">
                          Recurring
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">
                      {txn.category?.replace(/_/g, " ") || "Other"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    <span className={txn.amount < 0 ? "text-emerald-400" : "text-white"}>
                      {txn.amount < 0 ? "+" : ""}$
                      {Math.abs(txn.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= total}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
