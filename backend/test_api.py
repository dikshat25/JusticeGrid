import requests
import time

def test_flow():
    print("1. Triggering analyze-case...")
    res = requests.post("http://127.0.0.1:8000/api/v1/analyze-case", json={
        "case_id": "CASE-2026-0001",
        "document_urls": []
    })
    print(res.json())
    
    print("Waiting for graph to execute (15s)...")
    time.sleep(15)
    
    print("2. Fetching debug summary...")
    debug_res = requests.get("http://127.0.0.1:8000/api/v1/debug/CASE-2026-0001")
    print(debug_res.json())
    
if __name__ == "__main__":
    test_flow()
