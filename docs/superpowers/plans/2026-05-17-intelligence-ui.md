# Intelligence UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Bills page, Subscriptions page, Bills Calendar, and update the Dashboard with intelligence cards that surface the data from the Phase 3 backend.

**Architecture:** Four frontend-only pages using the existing `api.get()` client, dark Tailwind theme, and `"use client"` pattern already established in the codebase. No new backend endpoints needed — all data comes from `GET /bills`, `GET /subscriptions`, and `GET /transactions`. No unit tests — verification is manual in browser.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, `@/lib/api` fetch client, Supabase Auth session

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/app/(app)/bills/page.tsx` | Create | Bills list with urgency colors + monthly total card |
| `frontend/app/(app)/bills/calendar/page.tsx` | Create | Monthly calendar grid with bills on due dates |
| `frontend/app/(app)/subscriptions/page.tsx` | Create | Subscriptions list with price creep badges + monthly total |
| `frontend/app/(app)/dashboard/page.tsx` | Modify | Add Upcoming Bills, Subscriptions, Spending vs Last Month cards |

---

## Conventions (follow these exactly)

Every page file must start with:
```tsx
"use client";

export const dynamic = "force-dynamic";
```

API calls use:
```tsx
import { api } from "@/lib/api";
const data = await api.get<{ bills: Bill[] }>("/bills");
```

Dark theme class reference:
- Page background: `p-8`
- Card container: `bg-gray-900 rounded-2xl border border-gray-800`
- Card label: `text-xs text-gray-500 uppercase tracking-wider mb-1`
- Card value: `text-2xl font-bold text-white`
- Body text: `text-sm text-white`
- Muted text: `text-xs text-gray-500`
- Urgency: `text-red-400` (≤7 days), `text-yellow-400` (≤14 days), `text-emerald-400` (safe)
- Accent: `text-indigo-400`, `bg-indigo-900/40`, `border-indigo-800/50`
- Loading skeleton: `animate-pulse bg-gray-800 rounded`

---

## Task 1: Bills Page

**Files:**
- Create: `frontend/app/(app)/bills/page.tsx`

- [ ] **Step 1: Create the bills page**

```tsx
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
        <Link
          href="/bills/calendar"
          className="text-sm text-indigo-400 hover:underline"
        >
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
```

- [ ] **Step 2: Verify the page directory exists, then commit**

```bash
ls "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/frontend/app/(app)/"
```

Expected: `accounts  bills  dashboard  layout.tsx  settings  transactions`
If `bills/` directory does not exist, Next.js will create it automatically when the file is written.

```bash
git add "frontend/app/(app)/bills/page.tsx"
git commit -m "feat: add bills page with urgency colors and monthly summary"
```

---

## Task 2: Subscriptions Page

**Files:**
- Create: `frontend/app/(app)/subscriptions/page.tsx`

- [ ] **Step 1: Create the subscriptions page**

```tsx
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
                <div className="flex items-center gap-3">
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
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/(app)/subscriptions/page.tsx"
git commit -m "feat: add subscriptions page with price creep badges and monthly total"
```

---

## Task 3: Dashboard Intelligence Cards

**Files:**
- Modify: `frontend/app/(app)/dashboard/page.tsx`

The existing dashboard fetches accounts and 5 transactions. We extend `Promise.all` to also fetch bills and subscriptions, then add 3 new cards below the existing row.

- [ ] **Step 1: Replace the full dashboard file**

```tsx
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

type Bill = {
  id: string;
  merchant: string;
  avg_amount: number;
  next_due_date: string;
};

type Subscription = {
  id: string;
  avg_amount: number;
};

function spendingThisMonth(transactions: Transaction[]): number {
  const now = new Date();
  return transactions
    .filter((t) => {
      const d = new Date(t.timestamp);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.amount > 0;
    })
    .reduce((s, t) => s + t.amount, 0);
}

function spendingLastMonth(transactions: Transaction[]): number {
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return transactions
    .filter((t) => {
      const d = new Date(t.timestamp);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && t.amount > 0;
    })
    .reduce((s, t) => s + t.amount, 0);
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [acctsData, txnData, allTxnData, billsData, subsData] = await Promise.all([
          api.get<{ accounts: Account[] }>("/plaid/accounts"),
          api.get<{ transactions: Transaction[] }>("/transactions?limit=5"),
          api.get<{ transactions: Transaction[] }>("/transactions?limit=200"),
          api.get<{ bills: Bill[] }>("/bills"),
          api.get<{ subscriptions: Subscription[] }>("/subscriptions"),
        ]);
        setAccounts(acctsData.accounts);
        setTransactions(txnData.transactions);
        setAllTransactions(allTxnData.transactions);
        setBills(billsData.bills);
        setSubscriptions(subsData.subscriptions);
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
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse">
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
          <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to ArgusAI</h1>
        <p className="text-gray-500 text-sm max-w-sm mb-8">
          Connect your bank accounts to unlock financial intelligence — cashflow forecasts, risk alerts, and AI-powered insights.
        </p>
        <Link href="/accounts" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors">
          Connect your first account
        </Link>
      </div>
    );
  }

  const totalBalance = accounts.filter((a) => a.account_type !== "credit").reduce((s, a) => s + a.balance, 0);
  const totalDebt = accounts.filter((a) => a.account_type === "credit").reduce((s, a) => s + a.balance, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);
  const upcomingBillsTotal = bills
    .filter((b) => { const d = new Date(b.next_due_date); return d >= now && d <= in30Days; })
    .reduce((s, b) => s + b.avg_amount, 0);

  const subMonthlyTotal = subscriptions.reduce((s, sub) => s + sub.avg_amount, 0);

  const thisMonth = spendingThisMonth(allTransactions);
  const lastMonth = spendingLastMonth(allTransactions);
  const spendingChangePct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Your financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            <Link href="/accounts" className="text-indigo-400 hover:underline">Manage accounts →</Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Upcoming Bills</p>
          <p className="text-2xl font-bold text-white">
            ${upcomingBillsTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <Link href="/bills" className="text-indigo-400 hover:underline">Due in next 30 days →</Link>
          </p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Subscriptions</p>
          <p className="text-2xl font-bold text-white">
            ${subMonthlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <Link href="/subscriptions" className="text-indigo-400 hover:underline">
              {subscriptions.length} active &middot; View all →
            </Link>
          </p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Spending This Month</p>
          <p className="text-2xl font-bold text-white">
            ${thisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${spendingChangePct > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {spendingChangePct > 0 ? "▲" : "▼"} {Math.abs(spendingChangePct).toFixed(1)}% vs last month
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
          <Link href="/transactions" className="text-xs text-indigo-400 hover:underline">View all →</Link>
        </div>
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No transactions yet.</p>
            <Link href="/accounts" className="text-xs text-indigo-400 hover:underline mt-1 block">
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
                    {new Date(txn.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <p className={`text-sm font-medium ${txn.amount < 0 ? "text-emerald-400" : "text-white"}`}>
                  {txn.amount < 0 ? "+" : ""}${Math.abs(txn.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/(app)/dashboard/page.tsx"
git commit -m "feat: add intelligence cards to dashboard — bills, subscriptions, spending trend"
```

---

## Task 4: Bills Calendar

**Files:**
- Create: `frontend/app/(app)/bills/calendar/page.tsx`

Builds a simple monthly calendar grid. No external library — pure JS date math.

- [ ] **Step 1: Create the calendar page**

```tsx
"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type Bill = {
  id: string;
  merchant: string;
  avg_amount: number;
  next_due_date: string;
};

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BillsCalendarPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  useEffect(() => {
    api
      .get<{ bills: Bill[] }>("/bills")
      .then((d) => setBills(d.bills))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function billsOnDay(date: Date): Bill[] {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return bills.filter((b) => b.next_due_date === iso);
  }

  const calendarDays = buildCalendarDays(viewYear, viewMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bills Calendar</h1>
          <p className="text-gray-500 text-sm">Upcoming bills by due date</p>
        </div>
        <Link href="/bills" className="text-sm text-indigo-400 hover:underline">← List view</Link>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white px-2 py-1 text-sm">←</button>
          <h2 className="text-sm font-semibold text-white">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white px-2 py-1 text-sm">→</button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-800">
          {DAY_NAMES.map((d) => (
            <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="h-4 w-32 bg-gray-800 rounded animate-pulse mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="border-b border-r border-gray-800/50 min-h-[80px]" />;
              }
              const dayBills = billsOnDay(date);
              const isToday = date.getTime() === today.getTime();
              return (
                <div key={date.toISOString()} className="border-b border-r border-gray-800/50 min-h-[80px] p-2">
                  <p className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? "bg-indigo-600 text-white" : "text-gray-400"
                  }`}>
                    {date.getDate()}
                  </p>
                  <div className="space-y-1">
                    {dayBills.map((bill) => (
                      <div key={bill.id} className="text-xs px-1.5 py-0.5 rounded bg-red-900/30 text-red-300 border border-red-800/30 truncate" title={bill.merchant}>
                        {bill.merchant.length > 12 ? bill.merchant.slice(0, 12) + "…" : bill.merchant}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/(app)/bills/calendar/page.tsx"
git commit -m "feat: add bills calendar with monthly grid view"
```

---

## Task 5: End-to-End Verification

No automated tests — verify manually in browser.

- [ ] **Step 1: Start the frontend dev server**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/frontend" && npm run dev
```

Expected: Server starts on `http://localhost:3000`

- [ ] **Step 2: Start the backend (separate terminal)**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- [ ] **Step 3: Verify each page loads correctly**

Open `http://localhost:3000` and check:

| Page | URL | What to verify |
|---|---|---|
| Dashboard | `/dashboard` | 6 cards visible — balance, credit, accounts, upcoming bills, subscriptions, spending trend |
| Bills | `/bills` | Bills list with urgency colors, monthly total card |
| Bills Calendar | `/bills/calendar` | Monthly grid, bills appear on their due dates |
| Subscriptions | `/subscriptions` | Subscription list, price creep badges (if any), monthly total |

- [ ] **Step 4: Check browser console for errors**

Open DevTools → Console. No red errors should appear.

---

## Task 6: Merge Feature Branch

- [ ] **Step 1: Confirm all files committed**

```bash
git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 2: Merge to phase branch**

```bash
git checkout phase/3-intelligence-layer
git merge feature/intelligence-ui --no-ff -m "feat: intelligence UI — bills page, subscriptions page, calendar, dashboard cards"
git push origin phase/3-intelligence-layer
```

---

## Self-Review

**Spec coverage:**
- ✅ Bills page with urgency colors (red ≤7d, yellow ≤14d, green safe) — Task 1
- ✅ Total upcoming bills this month summary card — Task 1
- ✅ Bills Calendar monthly grid — Task 4
- ✅ Bills plotted on `next_due_date` — Task 4
- ✅ Subscriptions page with monthly total card — Task 2
- ✅ Price creep badge on subscriptions with >5% increase — Task 2
- ✅ Dashboard "Upcoming Bills" card — Task 3
- ✅ Dashboard "Subscriptions" card — Task 3
- ✅ Dashboard "Spending vs Last Month" with % arrow — Task 3

**Placeholder scan:** None found. All steps contain complete code.

**Type consistency:**
- `Bill` type: `id, merchant, recurrence_pattern, avg_amount, next_due_date, last_seen` — consistent across Tasks 1, 3, 4
- `Subscription` type: `id, merchant, avg_amount, billing_cycle, price_change_pct, is_active` — consistent across Tasks 2, 3
- `daysUntil`, `urgencyColor`, `urgencyLabel` defined in Task 1 and only used in Task 1 — no cross-task type drift
