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
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
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
        <Link href="/bills" className="text-sm text-indigo-400 hover:underline">
          ← List view
        </Link>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="text-gray-400 hover:text-white px-2 py-1 text-sm transition-colors"
          >
            ←
          </button>
          <h2 className="text-sm font-semibold text-white">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            className="text-gray-400 hover:text-white px-2 py-1 text-sm transition-colors"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-800">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
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
                return (
                  <div
                    key={`empty-${idx}`}
                    className="border-b border-r border-gray-800/50 min-h-[80px]"
                  />
                );
              }
              const dayBills = billsOnDay(date);
              const dateAtMidnight = new Date(date);
              dateAtMidnight.setHours(0, 0, 0, 0);
              const isToday = dateAtMidnight.getTime() === today.getTime();
              return (
                <div
                  key={date.toISOString()}
                  className="border-b border-r border-gray-800/50 min-h-[80px] p-2"
                >
                  <p
                    className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                  <div className="space-y-1">
                    {dayBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="text-xs px-1.5 py-0.5 rounded bg-red-900/30 text-red-300 border border-red-800/30 truncate"
                        title={`${bill.merchant} — $${bill.avg_amount.toFixed(2)}`}
                      >
                        {bill.merchant.length > 12
                          ? bill.merchant.slice(0, 12) + "…"
                          : bill.merchant}
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
