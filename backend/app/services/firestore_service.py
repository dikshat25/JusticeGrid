import firebase_admin
from firebase_admin import credentials, firestore, storage
from app.config.settings import settings
import uuid
from datetime import datetime

class FirestoreService:
    def __init__(self):
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': settings.FIREBASE_STORAGE_BUCKET if hasattr(settings, 'FIREBASE_STORAGE_BUCKET') else None
                })
            self.db = firestore.client()
            self.bucket = storage.bucket() if hasattr(settings, 'FIREBASE_STORAGE_BUCKET') else None
        except FileNotFoundError:
            print(f"[WARNING] Firebase credentials not found at {settings.FIREBASE_CREDENTIALS_PATH}. Firestore will not work.")
            self.db = None
            self.bucket = None
        except Exception as e:
            print(f"[WARNING] Firebase init error: {e}")
            self.db = None
            self.bucket = None

    async def get_case(self, case_id: str) -> dict:
        if not self.db: return None
        doc = self.db.collection('cases').document(case_id).get()
        return doc.to_dict() if doc.exists else None

    async def get_documents_for_case(self, case_id: str) -> list[dict]:
        if not self.db: return []
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



    async def create_case(self, case_data: dict) -> str:
        if self.db:
            doc_ref = self.db.collection('cases').document()
            case_data['caseId'] = doc_ref.id
            case_data['createdAt'] = datetime.utcnow().isoformat()
            doc_ref.set(case_data)
            return doc_ref.id
        return uuid.uuid4().hex

    async def save_document(self, doc_data: dict) -> str:
        if self.db:
            doc_ref = self.db.collection('documents').document()
            doc_data['documentId'] = doc_ref.id
            doc_data['uploadedAt'] = datetime.utcnow().isoformat()
            doc_ref.set(doc_data)
            return doc_ref.id
        return uuid.uuid4().hex

firestore_service = FirestoreService()
