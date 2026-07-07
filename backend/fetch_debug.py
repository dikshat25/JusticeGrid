import requests
import json

res = requests.get('http://127.0.0.1:8000/api/v1/debug/CASE-2026-0001')
data = res.json()
with open('debug_out.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
