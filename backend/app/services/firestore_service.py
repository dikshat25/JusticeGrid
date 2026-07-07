import firebase_admin
from firebase_admin import credentials, firestore
from app.config.settings import settings

class FirestoreService:
    def __init__(self):
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
            self.db = firestore.client()
        except FileNotFoundError:
            print(f"[WARNING] Firebase credentials not found at {settings.FIREBASE_CREDENTIALS_PATH}. Firestore will not work.")
            self.db = None

    async def get_case(self, case_id: str) -> dict:
        doc = self.db.collection('cases').document(case_id).get()
        return doc.to_dict() if doc.exists else None

    async def get_documents_for_case(self, case_id: str) -> list[dict]:
        docs = self.db.collection('documents').where('caseId', '==', case_id).stream()
        return [doc.to_dict() for doc in docs]

    async def save_graph_run(self, run_id: str, data: dict):
        if self.db:
            self.db.collection('graph_runs').document(run_id).set(data)
            print(f"[FIRESTORE] Successfully wrote to collection 'graph_runs' with ID: {run_id}")

    async def save_agent_report(self, case_id: str, data: dict):
        if self.db:
            self.db.collection('case_analyses').document(case_id).set(data)
            print(f"[FIRESTORE] Successfully wrote to collection 'case_analyses' for case: {case_id}")

    async def update_case_analysis_status(self, case_id: str, status: str):
        if self.db:
            self.db.collection('cases').document(case_id).update({
                'analysisCompleted': True,
                'status': status
            })
            print(f"[FIRESTORE] Updated case {case_id} status to {status}")

firestore_service = FirestoreService()
