from datetime import datetime

def calculate_days_between(start_date: str, end_date: str) -> int:
    try:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        return (end - start).days
    except Exception:
        return 0
