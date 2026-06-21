"use client";

import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

export const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: 17,
  color: "#1C1815",
  background: "#FFFFFF",
  border: "1px solid rgba(20,17,13,0.14)",
  borderRadius: "var(--r-md)",
  padding: "13px 15px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .15s ease, box-shadow .15s ease",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "#6B6052",
  marginBottom: 8,
};

const errorStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "#B5462F",
  marginTop: 6,
};

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: "var(--amber-700)" }}> *</span>}
      </label>
      {children}
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

/** Numeric input that physically cannot contain a negative sign or non-numeric characters. */
export function NumberField({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  function handleChange(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const firstDot = cleaned.indexOf(".");
    const safe = firstDot === -1 ? cleaned : cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
    onChange(safe);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: error ? "var(--negative-bright)" : "var(--surface-3)" }}
    />
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: error ? "var(--negative-bright)" : "var(--surface-3)" }}
    />
  );
}

export function SelectField({
  value,
  onChange,
  options,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, borderColor: error ? "var(--negative-bright)" : "var(--surface-3)" }}
    >
      <option value="">Select…</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function ChoiceCard({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      style={{
        ...inputStyle,
        cursor: "pointer",
        textAlign: "left",
        border: selected ? "1.5px solid var(--amber-600)" : "1px solid rgba(20,17,13,0.14)",
        background: selected ? "#EFDFCB" : "#FFFFFF",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 16.5 }}>{title}</div>
      {desc && <div style={{ fontSize: 14, color: "#6B6052", marginTop: 3 }}>{desc}</div>}
    </motion.button>
  );
}

export function ChipMultiSelect({
  selected,
  onToggle,
  options,
}: {
  selected: string[];
  onToggle: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <motion.button
            key={opt.value}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(opt.value)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              fontWeight: 600,
              padding: "9px 16px",
              borderRadius: "var(--r-pill)",
              border: active ? "1px solid var(--amber-600)" : "1px solid rgba(20,17,13,0.14)",
              background: active ? "var(--amber-600)" : "#FFFFFF",
              color: active ? "#fff" : "#6B6052",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

/** Generic add/remove row list for expenses, goals, debts. */
export function RepeatableRows<T extends Record<string, string | number>>({
  rows,
  onChange,
  fields,
  addLabel,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  fields: { key: keyof T; placeholder: string; numeric?: boolean }[];
  addLabel: string;
}) {
  function updateRow(i: number, key: keyof T, raw: string) {
    const next = [...rows];
    next[i] = { ...next[i], [key]: raw };
    onChange(next);
  }

  function addRow() {
    const blank = Object.fromEntries(fields.map((f) => [f.key, f.numeric ? 0 : ""])) as T;
    onChange([...rows, blank]);
  }

  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      {rows.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}
        >
          {fields.map((f) =>
            f.numeric ? (
              <div key={String(f.key)} style={{ flex: f.key === fields[0].key ? 2 : 1 }}>
                <NumberField
                  value={String(row[f.key] ?? "")}
                  onChange={(v) => updateRow(i, f.key, v)}
                  placeholder={f.placeholder}
                />
              </div>
            ) : (
              <div key={String(f.key)} style={{ flex: f.key === fields[0].key ? 2 : 1 }}>
                <TextField
                  value={String(row[f.key] ?? "")}
                  onChange={(v) => updateRow(i, f.key, v)}
                  placeholder={f.placeholder}
                />
              </div>
            )
          )}
          <button
            type="button"
            onClick={() => removeRow(i)}
            aria-label="Remove"
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgba(20,17,13,0.14)",
              background: "transparent",
              color: "#877B6B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </motion.div>
      ))}
      <motion.button
        type="button"
        onClick={addRow}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        style={{
          ...inputStyle,
          cursor: "pointer",
          color: "var(--amber-400)",
          fontWeight: 600,
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--surface-0)",
          border: "1px solid var(--amber-700)",
        }}
      >
        <Plus size={16} /> {addLabel}
      </motion.button>
    </div>
  );
}
