"""
LangGraph Multi-Agent Supervisor for ArgusAI Copilot.
Routes user query to specialist agents (Cashflow, Risk, Debt) via SupervisorAgent.
Full agentic RAG + tools + memory.
"""

from typing import Dict, Any, Annotated, Sequence
from langgraph.graph import END, StateGraph, START
from langgraph.prebuilt import create_react_agent
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import BaseMessage, HumanMessage
import operator
from rag_retriever import RAGRetriever
from tools import (
    get_balance_summary, get_cashflow_forecast, get_spending_patterns,
    run_debt_simulation, get_risk_alerts
)
import os
from dotenv import load_dotenv

load_dotenv()

# Global state
class AgentState(Dict[str, Any]):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_id: str
    rag_context: str = ""

llm = ChatAnthropic(
    model="claude-3-5-sonnet-20240620",
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    temperature=0.1
)

# Tools (shared)
tools = [get_balance_summary, get_cashflow_forecast, get_spending_patterns, run_debt_simulation, get_risk_alerts]

# RAG
rag = RAGRetriever(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

async def retrieval_node(state: AgentState) -> AgentState:
    """Inject RAG context."""
    context = await rag.retrieve(state["user_id"], state["messages"][-1].content)
    state["rag_context"] = context.summary
    return state

def route_to_agent(state: AgentState) -> str:
    """Supervisor decides next agent."""
    last_msg = state["messages"][-1].content.lower()
    if any(word in last_msg for word in ["cashflow", "forecast", "balance", "month"]):
        return "cashflow"
    elif any(word in last_msg for word in ["risk", "overdraft", "alert", "danger"]):
        return "risk"
    elif any(word in last_msg for word in ["debt", "payoff", "avalanche", "snowball"]):
        return "debt"
    else:
        return "supervisor"  # Default

# Placeholder specialist agents (expand later)
def create_cashflow_agent():
    return create_react_agent(llm, tools, state_modifier_system="You are CashflowAgent. Use RAG context and tools for forecasts.")

def create_risk_agent():
    return create_react_agent(llm, tools, state_modifier_system="You are RiskAgent. Focus on threats and alerts.")

def create_debt_agent():
    return create_react_agent(llm, tools, state_modifier_system="You are DebtAgent. Simulate payoffs.")

# Supervisor agent (routes + aggregates)
supervisor_agent = create_react_agent(
    llm,
    [],
    state_modifier_system="""
You are SupervisorAgent. Route to specialists or answer directly.
Agents: cashflow (forecasts), risk (alerts), debt (payoffs).
Aggregate responses if multi-agent needed.
Context: {rag_context}
Disclaimer: Not financial advice.
""".format(rag_context="{rag_context}")
)

# Build graph
workflow = StateGraph(AgentState)

# Nodes
workflow.add_node("retrieval", retrieval_node)
workflow.add_node("supervisor", supervisor_agent)
workflow.add_node("cashflow", create_cashflow_agent())
workflow.add_node("risk", create_risk_agent())
workflow.add_node("debt", create_debt_agent())

# Edges
workflow.add_edge(START, "retrieval")
workflow.add_edge("retrieval", "supervisor")
workflow.set_conditional_edges(
    "supervisor",
    route_to_agent,
    {
        "cashflow": "cashflow",
        "risk": "risk",
        "debt": "debt",
        "supervisor": END
    }
)
workflow.add_edge("cashflow", END)
workflow.add_edge("risk", END)
workflow.add_edge("debt", END)

graph = workflow.compile()

async def invoke_copilot(user_id: str, messages: list) -> Dict[str, Any]:
    """Invoke full multi-agent graph."""
    state = {"messages": [HumanMessage(content=messages[-1])], "user_id": user_id}
    result = await graph.ainvoke(state)
    return {"messages": [msg for msg in result["messages"]]}
