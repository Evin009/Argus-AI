"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ArrowUp } from "lucide-react";

import { streamChat } from "@/lib/api";

import { ArgusCard, type ArgusCardModel } from "./_components/Cards";

type ChatMessage = {
  id: string;
  role: "user" | "argus";
  text: string;
  cards: ArgusCardModel[];
  pending: boolean;
};

export default function ArgusChatPage() {
  return (
    <Suspense fallback={null}>
      <ArgusChat />
    </Suspense>
  );
}

function ArgusChat() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialQuery = useRef(searchParams.get("q"));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialQuery.current) {
      const q = initialQuery.current;
      initialQuery.current = null;
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function send(query: string) {
    const trimmed = query.trim();
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
      () => {
        // Card JSON streams in fenced blocks mid-flight — not shown raw;
        // the "thinking" indicator covers it until the parsed cards land.
      },
      (fullText, cards) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === argusId
              ? { ...m, text: fullText, cards: cards as ArgusCardModel[], pending: false }
              : m
          )
        );
        setStreaming(false);
      }
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
    <div className="flex flex-col h-full p-8 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles size={20} color="rgb(255, 103, 0)" />
          Argus
        </h1>
        <p className="text-gray-500 text-sm">
          Ask about your spending, bills, or what&apos;s coming.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 px-6 py-16 text-center">
            <p className="text-sm text-gray-500">No messages yet.</p>
            <p className="text-xs text-gray-600 mt-1">Ask Argus anything about your money.</p>
          </div>
        ) : (
          messages.map((m) =>
            m.role === "user" ? (
              <div
                key={m.id}
                className="rounded-2xl border px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap bg-indigo-900/30 border-indigo-800/40 text-indigo-100 ml-auto max-w-[80%]"
              >
                {m.text}
              </div>
            ) : (
              <div key={m.id} className="max-w-[85%] space-y-3">
                {m.pending ? (
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 px-5 py-3.5 text-sm text-gray-500">
                    Argus is thinking…
                  </div>
                ) : m.cards.length > 0 ? (
                  m.cards.map((card, ci) => <ArgusCard key={ci} card={card} />)
                ) : (
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap text-gray-200">
                    {m.text}
                  </div>
                )}
              </div>
            )
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          placeholder="Ask Argus..."
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-600"
        />
        <button
          onClick={() => send(input)}
          disabled={streaming || !input.trim()}
          className="rounded-full w-8 h-8 flex items-center justify-center bg-indigo-600 disabled:opacity-40 transition-opacity"
        >
          <ArrowUp size={15} color="#fff" />
        </button>
      </div>
    </div>
  );
}
