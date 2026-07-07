class ReportBuilderService:
    def build_final_report(self, state: dict) -> dict:
        return {
            "caseId": state.get("case_id"),
            "runId": state.get("run_id"),
            "eligibility": state.get("eligibility"),
            "delay": state.get("delay"),
            "financial": state.get("financial"),
            "strategy": state.get("strategy"),
            "thirdOpinion": state.get("third_opinion"),
            "finalReport": state.get("final_report")
        }

report_builder = ReportBuilderService()
