"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, X } from "lucide-react";

export const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontWeight: 600,
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
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "#4A433B",
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
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: "var(--amber-700)" }}> *</span>}
      </label>
      {hint && <p style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13, color: "#6B6052", margin: "-2px 0 8px" }}>{hint}</p>}
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

/** Custom dropdown — native <select> can't be styled or animated, so this
 * builds the trigger + panel by hand. The open panel intentionally goes dark
 * (ink-900) against the light cream form, like a tooltip lifting off the page,
 * rather than matching the light trigger.
 */
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.99 }}
        style={{
          ...inputStyle,
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          borderColor: error ? "var(--negative-bright)" : open ? "var(--amber-600)" : "rgba(20,17,13,0.14)",
          boxShadow: open ? "0 0 0 3px rgba(168,104,56,0.16)" : "none",
          color: selected ? "#1C1815" : "#877B6B",
        }}
      >
        <span>{selected ? selected.label : "Select…"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", flexShrink: 0 }}
        >
          <ChevronDown size={17} strokeWidth={1.5} color="#877B6B" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 30,
              background: "#3E2B20",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "var(--r-md)",
              padding: 6,
              boxShadow: "0 16px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.25)",
              maxHeight: 168,
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileHover={{ x: 2, backgroundColor: isSelected ? undefined : "rgba(255,255,255,0.07)" }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: isSelected ? "var(--amber-600)" : "transparent",
                    color: isSelected ? "#fff" : "#F0EAE0",
                    border: "none",
                    borderRadius: "var(--r-sm)",
                    padding: "10px 12px",
                    marginBottom: i === options.length - 1 ? 0 : 2,
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      style={{
        ...inputStyle,
        cursor: "pointer",
        textAlign: "left",
        border: selected ? "1.5px solid var(--amber-600)" : "1px solid rgba(20,17,13,0.14)",
        background: selected ? "#EFDFCB" : "#FFFFFF",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 16.5 }}>{title}</div>
      {desc && <div style={{ fontWeight: 500, fontSize: 14, color: "#4A433B", marginTop: 3 }}>{desc}</div>}
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
      {rows.length === 0 && (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "#877B6B", margin: "0 0 10px" }}>
          Nothing added yet — every entry helps Argus reason more precisely.
        </p>
      )}
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
          <motion.button
            type="button"
            onClick={() => removeRow(i)}
            aria-label="Remove"
            whileTap={{ scale: 0.9 }}
            whileHover={{ borderColor: "#B5462F", color: "#B5462F" }}
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
            <X size={14} strokeWidth={1.5} />
          </motion.button>
        </motion.div>
      ))}
      <motion.button
        type="button"
        onClick={addRow}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        animate="rest"
        style={{
          ...inputStyle,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          color: "var(--amber-700)",
          fontWeight: 700,
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#EFDFCB",
          border: "1px solid var(--amber-600)",
        }}
      >
        {/* Glass-glance sweep — a light streak passes across the button on hover,
            like glare crossing glass, instead of the button itself scaling. */}
        <motion.span
          variants={{ rest: { x: "-130%" }, hover: { x: "230%" } }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            width: "45%",
            background: "linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent)",
            pointerEvents: "none",
          }}
        />
        <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} strokeWidth={1.5} /> {addLabel}
        </span>
      </motion.button>
    </div>
  );
}
