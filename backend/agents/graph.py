from langgraph.graph import END, StateGraph

from agents.analyst_agent import analyst_node
from agents.enrichment_agent import enrichment_node
from agents.memory_agent import memory_node
from agents.state import IntelligenceState


def build_intelligence_graph():
    builder = StateGraph(IntelligenceState)

    builder.add_node("enrichment", enrichment_node)
    builder.add_node("analyst", analyst_node)
    builder.add_node("memory", memory_node)

    builder.set_entry_point("enrichment")
    builder.add_edge("enrichment", "analyst")
    builder.add_edge("analyst", "memory")
    builder.add_edge("memory", END)

    return builder.compile()


intelligence_graph = build_intelligence_graph()
