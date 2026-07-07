from langgraph.graph import StateGraph, END
from app.graph.state import JusticeState

from app.agents.core.intake_agent import run_intake_agent
from app.agents.specialists.eligibility_agent import run_eligibility_agent
from app.agents.specialists.delay_agent import run_delay_agent
from app.agents.specialists.financial_agent import run_financial_agent
from app.agents.specialists.strategy_agent import run_strategy_agent
from app.agents.review.merge_node import run_merge_node
from app.agents.review.third_opinion_agent import run_third_opinion_agent
from app.agents.review.final_report_agent import run_final_report_agent

def build_graph() -> StateGraph:
    workflow = StateGraph(JusticeState)

    # Core Nodes
    workflow.add_node("intake_node", run_intake_agent)
    
    # Specialists Nodes
    workflow.add_node("eligibility_agent", run_eligibility_agent)
    workflow.add_node("delay_agent", run_delay_agent)
    workflow.add_node("financial_agent", run_financial_agent)
    workflow.add_node("strategy_agent", run_strategy_agent)
    
    # Review Nodes
    workflow.add_node("merge_node", run_merge_node)
    workflow.add_node("third_opinion_agent", run_third_opinion_agent)
    workflow.add_node("final_report_agent", run_final_report_agent)

    # Wiring
    workflow.set_entry_point("intake_node")
    
    # Sequential execution to bypass LangGraph 0.0.26 fan-out limitations
    workflow.add_edge("intake_node", "eligibility_agent")
    workflow.add_edge("eligibility_agent", "delay_agent")
    workflow.add_edge("delay_agent", "financial_agent")
    workflow.add_edge("financial_agent", "strategy_agent")

    # Merge node receives all completed states sequentially
    workflow.add_edge("strategy_agent", "merge_node")

    # Review sequence
    workflow.add_edge("merge_node", "third_opinion_agent")
    workflow.add_edge("third_opinion_agent", "final_report_agent")
    workflow.add_edge("final_report_agent", END)

    return workflow
