from datetime import datetime

MAX_SENTENCE_TABLE = {
    "theft": 3 * 365,
    "murder": 99 * 365,
    "assault": 1 * 365,
    "fraud": 7 * 365,
    "drug possession": 10 * 365,
    "default": 3 * 365
}

def get_statutory_threshold(case_data: dict) -> float:
    """
    Rule engine to determine the Section 436A threshold based on law version or case properties.
    CrPC: 0.5 (half)
    BNSS (First time offender): 1/3
    """
    law_version = case_data.get("law_version", "CrPC")
    if law_version == "BNSS_First_Time":
        return 1/3
    return 0.5

def calculate_eligibility(case_data: dict) -> dict:
    detention_start_str = case_data.get("detentionStartDate")
    charges_str = case_data.get("charges", "").lower()
    
    if not detention_start_str:
        return {
            "eligible": False,
            "reason": "Missing detention start date.",
            "days_in_custody": 0,
            "maximum_sentence_days": 0,
            "threshold_days": 0
        }
        
    try:
        detention_start = datetime.strptime(detention_start_str, "%Y-%m-%d")
        days_in_custody = (datetime.now() - detention_start).days
    except ValueError:
        return {
            "eligible": False,
            "reason": "Invalid detention start date format.",
            "days_in_custody": 0,
            "maximum_sentence_days": 0,
            "threshold_days": 0
        }

    # Match charge to max sentence
    max_sentence_days = MAX_SENTENCE_TABLE.get("default")
    for charge, sentence in MAX_SENTENCE_TABLE.items():
        if charge in charges_str:
            max_sentence_days = sentence
            break
            
    threshold_multiplier = get_statutory_threshold(case_data)
    threshold_days = int(max_sentence_days * threshold_multiplier)
    
    eligible = days_in_custody > threshold_days
    
    if eligible:
        reason = f"Custody period ({days_in_custody} days) has crossed the statutory threshold ({threshold_days} days) for the charge of '{charges_str}'."
    else:
        reason = f"Custody period ({days_in_custody} days) has not crossed the statutory threshold ({threshold_days} days) for the charge of '{charges_str}'."
        
    return {
        "eligible": eligible,
        "reason": reason,
        "days_in_custody": days_in_custody,
        "maximum_sentence_days": max_sentence_days,
        "threshold_days": threshold_days,
        "law_version": case_data.get("law_version", "CrPC")
    }
