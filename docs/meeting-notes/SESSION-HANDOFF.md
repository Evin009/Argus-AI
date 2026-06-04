# Session Handoff — Read This First

**Last session:** 2026-05-29
**Full notes:** `docs/meeting-notes/2026-05-29-product-vision-and-ui-session.md`

---

## Where we are

ArgusAI = a **personal financial analyst**, not a budgeting app. It watches all of a user's finances, reasons about their specific situation, warns before problems happen, and gives goal-tailored action plans. Phases 1–3.5 are built and deployed (Plaid sync, categorization, bill/subscription detection, LangGraph + Claude intelligence pipeline). Phases 4–9 not started.

The dashboard was rebuilt this session with the new copper design system (Framer Motion, NumberTicker, CardSpotlight) BUT it still shows generic banking widgets (wallets, transfer buttons). It needs to be rebuilt around intelligence surfaces: Health Score, Safe to Spend, Risk Radar, due-this-week, latest AI signals.

## Decided this session

1. **Three-layer product model:** Hub (all accounts/cards/bills in one place) + Brain (AI reasoning/patterns/forecasts) + Guide (goal-based action plans: credit building, debt payoff, saving, overspending, understanding).
2. **Onboarding questionnaire** (~12 questions, 4 chapters, 5 min) before bank linking — seeds AI context so first insight is personal on day 1. Lives in `user_financial_profiles` table.
3. **Behavioral refinement loop** target: 3–4 weeks to a usable behavioral fingerprint.
4. The product's most important moment is the **first insight** — first time Argus says something specific, true, and useful the user didn't know.

## OPEN — discuss next session (user raised these, NOT yet answered)

These are the live questions when the next session starts:

1. **"Isn't this just a Claude wrapper?"** — User is concerned the AI layer is thin. Need to articulate the real moat: the data pipeline, the financial-profile system, the RAG memory, the goal-conditioned reasoning, the deterministic financial math that grounds the LLM. Discuss what makes it defensible vs. a thin wrapper.

2. **Context window overflow / hallucination risk** — As a user's history and profile grow over months/years, the context handed to Claude will eventually exceed the window and risk hallucination. Need an architecture answer: summarization/rolling-profile compression, tiered memory (hot recent + distilled long-term), RAG retrieval of only relevant slices instead of dumping everything, deterministic math done in code (not by the LLM), confidence/grounding checks.

3. **Would fine-tuning Claude for financial analysis help?** — User asked whether a fine-tuned model is worth it. Need to weigh fine-tuning vs. the current retrieval+prompt approach: cost, when it actually helps (tone/format/domain consistency) vs. when RAG+tools is strictly better (factual grounding on per-user data, which fine-tuning cannot provide). Likely answer: RAG + tool-use + good prompts beats fine-tuning for per-user financial facts, but worth discussing properly.

## Not yet done

- Main docs NOT updated yet (CLAUDE.md, ROADMAP.md, PRODUCT.md still reflect old framing). Update them AFTER the architecture questions above are resolved.
- Dashboard still needs the intelligence-first rebuild.
- Credit card DB fields missing: closing date, minimum payment (needed for payment-timing/credit-building features).
