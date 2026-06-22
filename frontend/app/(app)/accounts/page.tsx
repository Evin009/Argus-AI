"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink, PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import Link from "next/link";
import { api } from "@/lib/api";

const SKIP_KEY = "argus-onboarding-skipped";

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "incomplete" | "skipped" | "complete">("loading");

  useEffect(() => {
    api
      .get<{ completed: boolean }>("/onboarding/status")
      .then((d) => {
        if (d.completed) {
          setStatus("complete");
        } else {
          setStatus(localStorage.getItem(SKIP_KEY) === "true" ? "skipped" : "incomplete");
        }
      })
      .catch(() => setStatus("complete")); // fail open — don't block linking on a status-check error
  }, []);

  function handleSkip() {
    localStorage.setItem(SKIP_KEY, "true");
    setStatus("skipped");
  }

  if (status === "loading") return null;

  if (status === "incomplete") {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300 flex items-center gap-3">
        <span>Finish onboarding for Argus to ground its insights in your real numbers.</span>
        <Link href="/onboarding" className="text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap">
          Complete onboarding
        </Link>
        <button onClick={handleSkip} className="text-gray-500 hover:text-gray-300 whitespace-nowrap">
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {status === "skipped" && (
        <Link href="/onboarding" className="text-xs text-amber-400 hover:text-amber-300 whitespace-nowrap">
          Reminder: finish onboarding
        </Link>
      )}
      {children}
    </div>
  );
}

type Account = {
  id: string;
  institution: string;
  account_type: string;
  balance: number;
  credit_limit: number | null;
  last_synced: string;
};


function AccountCard({ account }: { account: Account }) {
  const isCredit = account.account_type === "credit";
  const utilization =
    isCredit && account.credit_limit
      ? Math.round((account.balance / account.credit_limit) * 100)
      : null;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {account.institution}
          </p>
          <p className="text-sm text-gray-400 capitalize">{account.account_type}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isCredit
              ? "bg-purple-900/30 text-purple-400 border border-purple-800/40"
              : "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40"
          }`}
        >
          {isCredit ? "Credit" : "Depository"}
        </span>
      </div>
      <p className="text-2xl font-bold text-white">
        ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
      {utilization !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Utilization</span>
            <span>{utilization}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                utilization > 70
                  ? "bg-red-500"
                  : utilization > 30
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      )}
      <p className="text-xs text-gray-600 mt-3">
        Synced {new Date(account.last_synced).toLocaleDateString()}
      </p>
    </div>
  );
}

function PlaidLinkButton({ onSuccess }: { onSuccess: () => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .post<{ link_token: string }>("/plaid/link-token")
      .then((d) => setLinkToken(d.link_token))
      .catch((e: Error) => setError(e.message));
  }, []);

  const handleSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      try {
        await api.post("/plaid/exchange-token", {
          public_token: publicToken,
          institution_id: metadata.institution?.institution_id ?? "",
          institution_name: metadata.institution?.name ?? "",
        });
        onSuccess();
      } catch (e) {
        console.error("Token exchange failed", e);
      }
    },
    [onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: handleSuccess,
  });

  if (error) return <p className="text-sm text-red-400">{error}</p>;

  return (
    <button
      onClick={() => open()}
      disabled={!ready || !linkToken}
      className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
    >
      + Connect Bank
    </button>
  );
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await api.get<{ accounts: Account[] }>("/plaid/accounts");
      setAccounts(data.accounts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  async function handleSync() {
    setSyncing(true);
    try {
      await api.post("/plaid/sync");
      setTimeout(fetchAccounts, 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  }

  const totalBalance = accounts
    .filter((a) => a.account_type !== "credit")
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Accounts</h1>
          <p className="text-gray-500 text-sm">
            {accounts.length} linked account{accounts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {accounts.length > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
            >
              {syncing ? "Syncing..." : "Sync"}
            </button>
          )}
          <OnboardingGate>
            <PlaidLinkButton onSuccess={fetchAccounts} />
          </OnboardingGate>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse"
            >
              <div className="h-3 w-24 bg-gray-800 rounded mb-4" />
              <div className="h-7 w-32 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 border border-gray-800">
            <svg
              className="w-8 h-8 text-gray-600"
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
          <h2 className="text-lg font-semibold text-white mb-2">No accounts connected</h2>
          <p className="text-gray-500 text-sm max-w-xs mb-6">
            Connect your bank or credit card to start tracking your finances with ArgusAI.
          </p>
          <OnboardingGate>
            <PlaidLinkButton onSuccess={fetchAccounts} />
          </OnboardingGate>
        </div>
      ) : (
        <>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-white">
              ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-600 mt-1">Depository accounts only</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
