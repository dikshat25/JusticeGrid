from app.tools.date_calculator import calculate_days_between
from datetime import datetime

def calculate_detention_duration(detention_start_date: str) -> int:
    now = datetime.utcnow().isoformat()
    return calculate_days_between(detention_start_date, now)
