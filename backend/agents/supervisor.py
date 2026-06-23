from typing import TypedDict

from langgraph.graph import END, StateGraph

from agents.tools import call_tool, get_registered_tools


class SupervisorState(TypedDict):
    user_id: str
    query: str
    selected_tools: list[str]
    tool_results: dict


def _select_tools_for_query(query: str, tools: dict[str, dict]) -> list[str]:
    query_lower = query.lower()
    matched = [
        name
        for name, tool in tools.items()
        if any(keyword in query_lower for keyword in tool["keywords"])
    ]
    return matched or list(tools.keys())


def route_and_execute_node(state: SupervisorState) -> dict:
    tools = get_registered_tools()
    selected = _select_tools_for_query(state["query"], tools)

    results: dict = {}
    for name in selected:
        results.update(call_tool(name, state["user_id"]))

    return {"selected_tools": selected, "tool_results": results}


def build_supervisor_graph():
    builder = StateGraph(SupervisorState)

    builder.add_node("route_and_execute", route_and_execute_node)

    builder.set_entry_point("route_and_execute")
    builder.add_edge("route_and_execute", END)

    return builder.compile()


supervisor_graph = build_supervisor_graph()
