"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp, X } from "lucide-react";

import { streamChat } from "@/lib/api";
import { ArgusCard, type ArgusCardModel } from "../argus/_components/Cards";

type ChatMessage = {
  id: string;
  role: "user" | "argus";
  text: string;
  cards: ArgusCardModel[];
  pending: boolean;
};

export function ArgusSidePanel({
  open,
  onClose,
  page,
}: {
  open: boolean;
  onClose: () => void;
  page: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function send() {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
      cards: [],
      pending: false,
    };
    const argusId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: argusId, role: "argus", text: "", cards: [], pending: true },
    ]);
    setInput("");
    setStreaming(true);

    streamChat(
      trimmed,
      () => {},
      (fullText, cards) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === argusId
              ? { ...m, text: fullText, cards: cards as ArgusCardModel[], pending: false }
              : m
          )
        );
        setStreaming(false);
      },
      page
    ).catch((err) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === argusId
            ? { ...m, text: `Couldn't reach Argus: ${err.message}`, pending: false }
            : m
        )
      );
      setStreaming(false);
    });
  }

  return (
    <aside
      style={{
        position: "fixed",
        top: 14,
        right: open ? 14 : -396,
        bottom: 14,
        width: 380,
        background: "var(--surface-1)",
        border: "1px solid var(--surface-3)",
        borderRadius: "var(--r-xl)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        transition: "right 220ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles size={16} color="rgb(255, 103, 0)" />
          <span className="text-sm font-semibold text-white">Argus</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-600 text-center mt-8">
            Ask Argus anything — it knows you&apos;re on {page}.
          </p>
        ) : (
          messages.map((m) =>
            m.role === "user" ? (
              <div
                key={m.id}
                className="rounded-xl border px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-indigo-900/30 border-indigo-800/40 text-indigo-100 ml-auto max-w-[85%]"
              >
                {m.text}
              </div>
            ) : (
              <div key={m.id} className="max-w-[90%] space-y-2">
                {m.pending ? (
                  <div className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-2.5 text-xs text-gray-500">
                    Argus is thinking…
                  </div>
                ) : m.cards.length > 0 ? (
                  m.cards.map((card, ci) => <ArgusCard key={ci} card={card} />)
                ) : (
                  <div className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-gray-200">
                    {m.text}
                  </div>
                )}
              </div>
            )
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-gray-800 px-3 py-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Ask Argus..."
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-600 px-2"
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="rounded-full w-7 h-7 flex items-center justify-center bg-indigo-600 disabled:opacity-40 transition-opacity flex-shrink-0"
        >
          <ArrowUp size={13} color="#fff" />
        </button>
      </div>
    </aside>
  );
}
