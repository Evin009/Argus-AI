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
          position: "relative",
          zIndex: open ? 31 : "auto",
          borderColor: error ? "var(--negative-bright)" : open ? "var(--amber-600)" : "rgba(20,17,13,0.14)",
          borderBottomLeftRadius: open ? 0 : "var(--r-md)",
          borderBottomRightRadius: open ? 0 : "var(--r-md)",
          color: selected ? "#1C1815" : "#6B6052",
        }}
      >
        <span>{selected ? selected.label : "Select…"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", flexShrink: 0 }}
        >
          <ChevronDown size={17} strokeWidth={1.5} color="#6B6052" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.92 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.92 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 30,
              transformOrigin: "top",
              // Blur lives on this static shell only, never on the scrolling
              // content below — backdrop-filter on a scrolling element forces
              // a re-composite every frame while scrolling.
              background: "rgba(40,28,18,0.85)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid var(--amber-600)",
              borderTop: "none",
              borderBottomLeftRadius: "var(--r-md)",
              borderBottomRightRadius: "var(--r-md)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 6,
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
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      color: isSelected ? "var(--amber-400)" : "#F0EAE0",
                      border: "none",
                      borderRadius: "var(--r-sm)",
                      padding: "10px 12px",
                      marginBottom: i === options.length - 1 ? 0 : 2,
                      fontFamily: "var(--font-sans)",
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
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
type RowField<T> = { key: keyof T; placeholder: string; label: string; numeric?: boolean; newLine?: boolean };

/** Splits a flat field list into visual lines wherever `newLine` is set. */
function toLines<T>(fields: RowField<T>[]): RowField<T>[][] {
  const lines: RowField<T>[][] = [[]];
  for (const f of fields) {
    if (f.newLine) lines.push([]);
    lines[lines.length - 1].push(f);
  }
  return lines;
}

export function RepeatableRows<T extends Record<string, string | number>>({
  rows,
  onChange,
  fields,
  addLabel,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  fields: RowField<T>[];
  addLabel: string;
}) {
  const lines = toLines(fields);

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
      {rows.length === 0 ? (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "#6B6052", margin: "0 0 10px" }}>
          Nothing added yet — every entry helps Argus reason more precisely.
        </p>
      ) : (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, letterSpacing: ".04em", color: "var(--amber-700)", margin: "0 0 8px" }}>
          {rows.length} {rows.length === 1 ? "entry" : "entries"} added
        </p>
      )}
      {/* Fixed (not max) height from the very first row — height alone would let
          the box shrink-to-fit below the cap and still grow row by row. A true
          fixed height reserves the full space immediately, so the box is the
          same size whether it holds 1 row or 20; only the scroll position
          changes, never the chapter card's size. */}
      <div
        style={{
          height: rows.length > 0 ? 190 : 0,
          overflowY: rows.length > 0 ? "auto" : "hidden",
          paddingRight: rows.length > 0 ? 4 : 0,
          marginBottom: rows.length > 0 ? 8 : 0,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(20,17,13,0.25) transparent",
        }}
      >
        {rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 10,
              padding: 10,
              background: "rgba(20,17,13,0.03)",
              border: "1px solid rgba(20,17,13,0.08)",
              borderRadius: "var(--r-md)",
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {lines.map((line, lineIdx) => (
                <div key={lineIdx} style={{ display: "flex", gap: 8 }}>
                  {line.map((f) => (
                    <div key={String(f.key)} style={{ flex: f.numeric ? 1 : 1.6 }}>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          color: "#877B6B",
                          marginBottom: 3,
                        }}
                      >
                        {f.label}
                      </span>
                      {f.numeric ? (
                        <NumberField
                          value={String(row[f.key] ?? "")}
                          onChange={(v) => updateRow(i, f.key, v)}
                          placeholder={f.placeholder}
                        />
                      ) : (
                        <TextField
                          value={String(row[f.key] ?? "")}
                          onChange={(v) => updateRow(i, f.key, v)}
                          placeholder={f.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <motion.button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="Remove"
              whileTap={{ scale: 0.9 }}
              whileHover={{ borderColor: "#B5462F", color: "#B5462F" }}
              style={{
                flexShrink: 0,
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "1px solid rgba(20,17,13,0.14)",
                background: "transparent",
                color: "#6B6052",
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
      </div>
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
