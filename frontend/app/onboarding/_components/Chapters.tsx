"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePlaidLink, type PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { CheckCircle2, Landmark, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Field, NumberField, SelectField, ChoiceCard, ChipMultiSelect, RepeatableRows } from "./fields";
import type { OnboardingState } from "./types";

function ConnectingDots() {
  return (
    <span style={{ display: "flex", gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: [0.45, 0, 0.55, 1] }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}
        />
      ))}
    </span>
  );
}

type ChapterProps = {
  state: OnboardingState;
  setState: (s: OnboardingState) => void;
  errors: Partial<Record<keyof OnboardingState, string>>;
  // Prefetched at page mount (well before this chapter is reached) so the
  // button never has to show its own loading state on a normal walkthrough.
  plaidLinkToken?: string | null;
  plaidPrefetchFailed?: boolean;
};

export function ChapterIncome({ state, setState, errors }: ChapterProps) {
  return (
    <>
      <Field label="Monthly income" required hint="Gross income, before taxes" error={errors.income}>
        <NumberField
          value={state.income}
          onChange={(v) => setState({ ...state, income: v })}
          placeholder="5000"
          error={!!errors.income}
        />
      </Field>
      <Field label="Pay schedule" required error={errors.pay_schedule}>
        <SelectField
          value={state.pay_schedule}
          onChange={(v) => setState({ ...state, pay_schedule: v })}
          options={[
            { value: "weekly", label: "Weekly" },
            { value: "biweekly", label: "Biweekly" },
            { value: "monthly", label: "Monthly" },
          ]}
          error={!!errors.pay_schedule}
        />
      </Field>
    </>
  );
}

export function ChapterIncomeDetails({ state, setState }: ChapterProps) {
  return (
    <>
      <Field label="Income stability">
        <div style={{ display: "flex", gap: 8 }}>
          <ChoiceCard
            selected={state.income_stability === "fixed"}
            onClick={() => setState({ ...state, income_stability: "fixed" })}
            title="Fixed"
            desc="Same amount every paycheck"
          />
          <ChoiceCard
            selected={state.income_stability === "variable"}
            onClick={() => setState({ ...state, income_stability: "variable" })}
            title="Variable"
            desc="Freelance, tips, or commission"
          />
        </div>
      </Field>
      <Field label="Other income sources?">
        <div style={{ display: "flex", gap: 8 }}>
          <ChoiceCard selected={state.other_income === true} onClick={() => setState({ ...state, other_income: true })} title="Yes" />
          <ChoiceCard selected={state.other_income === false} onClick={() => setState({ ...state, other_income: false })} title="No" />
        </div>
      </Field>
    </>
  );
}

export function ChapterExpenses({ state, setState }: ChapterProps) {
  return (
    <>
      <Field label="Monthly rent / mortgage">
        <NumberField value={state.rent} onChange={(v) => setState({ ...state, rent: v })} placeholder="1500" />
      </Field>
      <Field label="Other fixed expenses (car, utilities, etc.)">
        <RepeatableRows
          rows={state.major_expenses}
          onChange={(rows) => setState({ ...state, major_expenses: rows })}
          fields={[
            { key: "name", placeholder: "e.g. Car payment", label: "What" },
            { key: "amount", placeholder: "320", numeric: true, label: "Monthly $" },
          ]}
          addLabel="Add expense"
        />
      </Field>
    </>
  );
}

function PlaidConnectButton({
  linkToken,
  prefetchFailed,
  onConnected,
}: {
  linkToken?: string | null;
  prefetchFailed?: boolean;
  onConnected: (accountCount: number) => void;
}) {
  const [fallbackToken, setFallbackToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Page-level prefetch is the normal path. This only fires if that prefetch
  // actually failed — not while it's merely still in flight — so the common
  // case never makes a redundant second request.
  useEffect(() => {
    if (!prefetchFailed || linkToken) return;
    api
      .post<{ link_token: string }>("/plaid/link-token")
      .then((d) => setFallbackToken(d.link_token))
      .catch((e: Error) => setError(e.message));
  }, [prefetchFailed, linkToken]);

  const resolvedToken = linkToken ?? fallbackToken;

  const handleSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setConnecting(true);
      setError(null);
      try {
        await api.post("/plaid/exchange-token", {
          public_token: publicToken,
          institution_id: metadata.institution?.institution_id ?? "",
          institution_name: metadata.institution?.name ?? "",
        });
        const { accounts } = await api.get<{ accounts: unknown[] }>("/plaid/accounts");
        onConnected(accounts.length);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't connect that account. Try again.");
      } finally {
        setConnecting(false);
      }
    },
    [onConnected]
  );

  const { open, ready } = usePlaidLink({ token: resolvedToken ?? "", onSuccess: handleSuccess });

  return (
    <div>
      {/* Button-in-button CTA matching the Continue button's pattern — trailing
          icon nested in its own circular badge, magnetic hover via framer-motion
          variant propagation, grain texture on the copper/red gradient fill. */}
      <motion.button
        type="button"
        onClick={() => open()}
        disabled={!ready || connecting}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        animate="rest"
        className="grain"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: "var(--r-pill)",
          cursor: ready && !connecting ? "pointer" : "default",
          padding: "8px 8px 8px 22px",
          opacity: !ready ? 0.7 : 1,
          background: "var(--grad-accent)",
        }}
      >
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", color: "#fff" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16 }}>
            {connecting ? "Connecting" : "Connect a bank account"}
          </span>
          {!connecting && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 11.5, opacity: 0.85 }}>
              <ShieldCheck size={12} strokeWidth={2} /> Secured by Plaid
            </span>
          )}
        </span>
        <motion.span
          variants={{ rest: { x: 0, y: 0, scale: 1 }, hover: { x: 2, y: -1, scale: 1.06 } }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {connecting ? <ConnectingDots /> : <Landmark size={18} strokeWidth={1.75} color="#fff" />}
        </motion.span>
      </motion.button>
      {error && <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#B5462F", margin: "8px 0 0" }}>{error}</p>}
    </div>
  );
}

export function ChapterConnectAccounts({ state, setState, errors, plaidLinkToken, plaidPrefetchFailed }: ChapterProps) {
  const [showManual, setShowManual] = useState(false);
  const connected = state.connectedAccountsCount > 0;

  return (
    <>
      <Field label="Connect your accounts" required error={errors.connectedAccountsCount}>
        {connected ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 15px",
              background: "#EFDFCB",
              border: "1px solid var(--amber-600)",
              borderRadius: "var(--r-md)",
              marginBottom: 10,
            }}
          >
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex" }}
            >
              <CheckCircle2 size={20} strokeWidth={1.75} color="var(--amber-700)" />
            </motion.span>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, color: "#1C1815" }}>
              {state.connectedAccountsCount} {state.connectedAccountsCount === 1 ? "account" : "accounts"} connected
            </span>
          </motion.div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 15px",
              marginBottom: 10,
              color: "#6B6052",
            }}
          >
            <Landmark size={18} strokeWidth={1.5} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13.5 }}>
              Connect at least one bank or credit card to continue — this is how Argus reasons about your real numbers.
            </span>
          </div>
        )}
        <PlaidConnectButton
          linkToken={plaidLinkToken}
          prefetchFailed={plaidPrefetchFailed}
          onConnected={(count) => setState({ ...state, connectedAccountsCount: count })}
        />
      </Field>

      <button
        type="button"
        onClick={() => setShowManual((s) => !s)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          marginBottom: showManual ? 10 : 0,
          fontFamily: "var(--font-sans)",
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--amber-700)",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {showManual ? "Hide manual entry" : "Have a debt Plaid can't see? Add it manually"}
      </button>

      {showManual && (
        <Field label="Other debts (private loans, cards Plaid can't reach)" hint="One entry per card or loan — balance, interest rate, and minimum payment">
          <RepeatableRows
            rows={state.debts}
            onChange={(rows) => setState({ ...state, debts: rows })}
            fields={[
              { key: "name", placeholder: "e.g. Family loan", label: "Card or loan name" },
              { key: "balance", placeholder: "1200", numeric: true, label: "Balance owed $" },
              { key: "interest_rate", placeholder: "22.5", numeric: true, label: "Interest rate %", newLine: true },
              { key: "minimum_payment", placeholder: "35", numeric: true, label: "Min. payment $" },
            ]}
            addLabel="Add debt"
          />
        </Field>
      )}
    </>
  );
}

export function ChapterGoals({ state, setState }: ChapterProps) {
  return (
    <Field label="Financial goals" hint="List the most important one first — Argus protects it first when money's tight">
      <RepeatableRows
        rows={state.goals}
        onChange={(rows) => setState({ ...state, goals: rows })}
        fields={[
          { key: "title", placeholder: "e.g. Emergency fund", label: "Goal" },
          { key: "target_amount", placeholder: "5000", numeric: true, label: "Target $" },
        ]}
        addLabel="Add goal"
      />
    </Field>
  );
}

export function ChapterSpendingHabits({ state, setState }: ChapterProps) {
  return (
    <Field label="Do you consider yourself an impulse spender?">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { v: "never", l: "Never", d: "I stick to what I plan to spend" },
          { v: "sometimes", l: "Sometimes", d: "It happens occasionally" },
          { v: "often", l: "Often", d: "I buy things I didn't plan for regularly" },
        ].map((o) => (
          <ChoiceCard
            key={o.v}
            selected={state.impulse_spender === o.v}
            onClick={() => setState({ ...state, impulse_spender: o.v })}
            title={o.l}
            desc={o.d}
          />
        ))}
      </div>
    </Field>
  );
}

export function ChapterSpendingTriggers({ state, setState }: ChapterProps) {
  return (
    <Field label="What usually triggers extra spending? (pick any)">
      <ChipMultiSelect
        selected={state.spending_triggers}
        onToggle={(v) =>
          setState({
            ...state,
            spending_triggers: state.spending_triggers.includes(v)
              ? state.spending_triggers.filter((t) => t !== v)
              : [...state.spending_triggers, v],
          })
        }
        options={[
          { value: "stress", label: "Stress" },
          { value: "boredom", label: "Boredom" },
          { value: "social", label: "Social events" },
          { value: "sales", label: "Sales / deals" },
          { value: "none", label: "None of these" },
        ]}
      />
    </Field>
  );
}

export function ChapterSpendingPreferences({ state, setState }: ChapterProps) {
  return (
    <>
      <Field label="How often do you check your balance?">
        <SelectField
          value={state.balance_check_frequency}
          onChange={(v) => setState({ ...state, balance_check_frequency: v })}
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "rarely", label: "Rarely" },
          ]}
        />
      </Field>
      <Field label="Preferred payment method">
        <SelectField
          value={state.payment_preference}
          onChange={(v) => setState({ ...state, payment_preference: v })}
          options={[
            { value: "credit", label: "Credit card" },
            { value: "debit", label: "Debit card" },
            { value: "bnpl", label: "Buy now, pay later" },
          ]}
        />
      </Field>
    </>
  );
}

export function ChapterRiskTolerance({ state, setState, errors }: ChapterProps) {
  return (
    <Field label="How do you think about financial risk?" required error={errors.risk_tolerance}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { v: "conservative", l: "Conservative", d: "I prefer safety over growth" },
          { v: "moderate", l: "Moderate", d: "I'm comfortable with some risk" },
          { v: "aggressive", l: "Aggressive", d: "I prioritize growth over safety" },
        ].map((o) => (
          <ChoiceCard
            key={o.v}
            selected={state.risk_tolerance === o.v}
            onClick={() => setState({ ...state, risk_tolerance: o.v })}
            title={o.l}
            desc={o.d}
          />
        ))}
      </div>
    </Field>
  );
}

export function ChapterRiskDetails({ state, setState }: ChapterProps) {
  return (
    <>
      <Field label="How often have you overdrafted in the last 6 months?">
        <SelectField
          value={state.overdraft_frequency}
          onChange={(v) => setState({ ...state, overdraft_frequency: v })}
          options={[
            { value: "never", label: "Never" },
            { value: "rarely", label: "Rarely (1-2 times)" },
            { value: "sometimes", label: "Sometimes (3-5 times)" },
            { value: "often", label: "Often (6+ times)" },
          ]}
        />
      </Field>
      <Field label="How do you feel about your cash buffer?">
        <SelectField
          value={state.buffer_preference}
          onChange={(v) => setState({ ...state, buffer_preference: v })}
          options={[
            { value: "thin", label: "Comfortable running thin" },
            { value: "moderate", label: "Want a moderate cushion" },
            { value: "large", label: "Want a large cushion" },
          ]}
        />
      </Field>
    </>
  );
}
