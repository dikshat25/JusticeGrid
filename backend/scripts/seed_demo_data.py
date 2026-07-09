import os
import sys
import firebase_admin
from firebase_admin import credentials, auth, firestore
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config.settings import settings

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def create_or_update_user(email, password, role, name):
    try:
        user = auth.get_user_by_email(email)
        print(f"User {email} already exists. Updating password...")
        auth.update_user(user.uid, password=password)
    except auth.UserNotFoundError:
        print(f"Creating user {email}...")
        user = auth.create_user(email=email, password=password, display_name=name)
    
    db = firestore.client()
    db.collection('users').document(user.uid).set({
        'email': email,
        'role': role,
        'name': name,
        'createdAt': datetime.utcnow().isoformat()
    })
    return user.uid

def seed_database():
    print("Initializing Firebase...")
    db = init_firebase()
    
    print("Creating Auth Users...")
    admin_uid = create_or_update_user('admin@gmail.com', 'password123', 'admin', 'System Admin')
    lawyer_uid = create_or_update_user('lawyer@gmail.com', 'password123', 'lawyer', 'Advocate Rajesh')
    family_uid = create_or_update_user('family@gmail.com', 'password123', 'family', 'Kumar Family')

    print("Clearing old cases...")
    # Optional: we can delete old cases, but to be safe we'll just create new ones with a specific tag
    # or just create clean ones at the top.
    
    db.collection('cases').document('DEMO-CASE-001').delete()
    db.collection('case_analyses').document('DEMO-CASE-001').delete()
    
    now = datetime.utcnow()
    
    # Define 8 Cases
    cases_to_insert = [
        {
            "caseId": "CR-2023-0441",
            "undertrialName": "Suresh Kumar",
            "age": 34, "gender": "Male", "district": "Pune",
            "court": "District Sessions Court, Pune",
            "FIRNumber": "CR-2023/0441",
            "charges": "Section 379 IPC (Theft)",
            "detentionStartDate": (now - timedelta(days=642)).isoformat(),
            "suretyAmount": 15000,
            "familyContact": "9876543210",
            "familyEmail": "family@gmail.com",
            "lawyerId": lawyer_uid,
            "status": "Resolved",
            "priority": "High",
            "policeAssessment": "Eligible for Bail",
            "analysisCompleted": True,
            "nextHearing": (now + timedelta(days=14)).isoformat(),
            "summary": "The accused was arrested for alleged theft of a two-wheeler. He has been in continuous custody for over 21 months while the maximum sentence for the offense is 3 years.",
            "createdAt": now.isoformat()
        },
        {
            "caseId": "CR-2022-1102",
            "undertrialName": "Ramesh Singh",
            "age": 41, "gender": "Male", "district": "Mumbai",
            "court": "High Court of Bombay",
            "FIRNumber": "CR-2022/1102",
            "charges": "Section 323 IPC (Voluntarily causing hurt)",
            "detentionStartDate": (now - timedelta(days=400)).isoformat(),
            "suretyAmount": 20000,
            "familyContact": "9123456780",
            "familyEmail": "family@gmail.com",
            "lawyerId": lawyer_uid,
            "status": "Resolved",
            "priority": "Medium",
            "policeAssessment": "Eligible for Bail",
            "analysisCompleted": True,
            "nextHearing": (now + timedelta(days=5)).isoformat(),
            "summary": "Accused charged with simple hurt during a neighborhood dispute. Has served over 1 year in custody.",
            "createdAt": (now - timedelta(days=10)).isoformat()
        },
        {
            "caseId": "CR-2024-0015",
            "undertrialName": "Priya Sharma",
            "age": 28, "gender": "Female", "district": "Delhi",
            "court": "Saket District Court",
            "FIRNumber": "CR-2024/0015",
            "charges": "Section 420 IPC (Cheating)",
            "detentionStartDate": (now - timedelta(days=45)).isoformat(),
            "suretyAmount": 50000,
            "familyContact": "9988776655",
            "familyEmail": "family@gmail.com",
            "lawyerId": lawyer_uid,
            "status": "Pending",
            "priority": "High",
            "policeAssessment": "Pending Review",
            "analysisCompleted": False,
            "nextHearing": (now + timedelta(days=20)).isoformat(),
            "summary": "Accused involved in an alleged financial dispute with a vendor.",
            "createdAt": (now - timedelta(days=2)).isoformat()
        },
        {
            "caseId": "CR-2024-0089",
            "undertrialName": "Amit Patel",
            "age": 22, "gender": "Male", "district": "Ahmedabad",
            "court": "Ahmedabad Sessions Court",
            "FIRNumber": "CR-2024/0089",
            "charges": "Section 454 IPC (Lurking house-trespass)",
            "detentionStartDate": (now - timedelta(days=120)).isoformat(),
            "suretyAmount": 25000,
            "familyContact": "8877665544",
            "familyEmail": "family@gmail.com",
            "lawyerId": lawyer_uid,
            "status": "Pending",
            "priority": "Medium",
            "policeAssessment": "Pending Review",
            "analysisCompleted": False,
            "nextHearing": (now + timedelta(days=7)).isoformat(),
            "summary": "Young offender caught trespassing. No previous criminal record.",
            "createdAt": (now - timedelta(days=5)).isoformat()
        },
        {
            "caseId": "CR-2023-0992",
            "undertrialName": "Vikram Desai",
            "age": 45, "gender": "Male", "district": "Surat",
            "court": "Surat District Court",
            "FIRNumber": "CR-2023/0992",
            "charges": "Section 384 IPC (Extortion)",
            "detentionStartDate": (now - timedelta(days=210)).isoformat(),
            "suretyAmount": 100000,
            "familyContact": "7766554433",
            "familyEmail": "family@gmail.com",
            "lawyerId": lawyer_uid,
            "status": "Pending",
            "priority": "High",
            "policeAssessment": "Pending Review",
            "analysisCompleted": False,
            "nextHearing": (now + timedelta(days=2)).isoformat(),
            "summary": "Alleged extortion case involving local businesses. Investigation is ongoing.",
            "createdAt": (now - timedelta(days=15)).isoformat()
        },
        {
            "caseId": "CR-2024-0155",
            "undertrialName": "Kiran Verma",
            "age": 31, "gender": "Female", "district": "Bangalore",
            "court": "Bangalore City Civil Court",
            "FIRNumber": "CR-2024/0155",
            "charges": "Section 66 IT Act (Computer related offenses)",
            "detentionStartDate": (now - timedelta(days=60)).isoformat(),
            "suretyAmount": 40000,
            "familyContact": "6655443322",
            "familyEmail": "family@gmail.com",
            "lawyerId": lawyer_uid,
            "status": "Pending",
            "priority": "Medium",
            "policeAssessment": "Pending Review",
            "analysisCompleted": False,
            "nextHearing": (now + timedelta(days=10)).isoformat(),
            "summary": "Cyber crime investigation related to data breach.",
            "createdAt": (now - timedelta(days=8)).isoformat()
        },
        {
            "caseId": "CR-2023-0871",
            "undertrialName": "Anita Roy",
            "age": 52, "gender": "Female", "district": "Kolkata",
            "court": "Calcutta High Court",
            "FIRNumber": "CR-2023/0871",
            "charges": "Section 406 IPC (Criminal breach of trust)",
            "detentionStartDate": (now - timedelta(days=310)).isoformat(),
            "suretyAmount": 75000,
            "familyContact": "5544332211",
            "familyEmail": "family@gmail.com",
            "lawyerId": lawyer_uid,
            "status": "Pending",
            "priority": "Low",
            "policeAssessment": "Eligible for Bail",
            "analysisCompleted": False,
            "nextHearing": (now + timedelta(days=25)).isoformat(),
            "summary": "Corporate dispute resulting in criminal breach of trust allegations.",
            "createdAt": (now - timedelta(days=20)).isoformat()
        },
        {
            "caseId": "CR-2024-0203",
            "undertrialName": "Ravi Kumar",
            "age": 26, "gender": "Male", "district": "Jaipur",
            "court": "Jaipur Sessions Court",
            "FIRNumber": "CR-2024/0203",
            "charges": "Section 27 NDPS Act (Consumption of narcotic drugs)",
            "detentionStartDate": (now - timedelta(days=20)).isoformat(),
            "suretyAmount": 10000,
            "familyContact": "4433221100",
            "familyEmail": "family@gmail.com",
            "lawyerId": lawyer_uid,
            "status": "Pending",
            "priority": "High",
            "policeAssessment": "Pending Review",
            "analysisCompleted": False,
            "nextHearing": (now + timedelta(days=3)).isoformat(),
            "summary": "Caught with minor quantity of contraband for personal consumption.",
            "createdAt": (now - timedelta(days=1)).isoformat()
        }
    ]

    analysis_templates = {
        "CR-2023-0441": {
            "final_report": {
                "result": {
                    "finding": "Statutory threshold for default bail exceeded.",
                    "reasoning": "The accused has been incarcerated for 642 days. Under Section 436A of the CrPC (now Section 479 BNSS), an undertrial who has served more than one-half of the maximum period of imprisonment for the alleged offense is entitled to be released on personal bond. The maximum sentence for Section 379 IPC is 3 years (1095 days). Half of this is 547 days. The accused's detention of 642 days clearly exceeds this statutory threshold.",
                    "legal_references": "Section 479 BNSS; Section 379 IPC; Article 21 Constitution of India",
                    "recommendation": "Grant Immediate Bail",
                    "confidence": 98.5
                }
            },
            "merged_data": {
                "eligibility": {
                    "result": {
                        "finding": "Eligible under Section 479 BNSS",
                        "reasoning": "642 days served > 547 days (half of max sentence). Statutory right to bail triggered.",
                        "recommendation": "Proceed with Section 479 BNSS application."
                    }
                },
                "delay": {
                    "result": {
                        "finding": "Delay attributable to prosecution",
                        "reasoning": "Case diary shows 4 adjournments requested by prosecution due to non-availability of witnesses.",
                        "recommendation": "Highlight prosecution delays in bail application."
                    }
                },
                "financial": {
                    "result": {
                        "finding": "Indigent status likely",
                        "reasoning": "Accused is a daily wage laborer. Standard surety of ₹15,000 may be excessive.",
                        "recommendation": "Request release on Personal Bond (PR Bond) without heavy surety."
                    }
                },
                "strategy": {
                    "result": {
                        "finding": "Strong case for default bail",
                        "reasoning": "Combine Section 479 BNSS eligibility with indigent status to argue for immediate release on PR bond.",
                        "recommendation": "File application immediately citing statutory violation."
                    }
                }
            }
        },
        "CR-2022-1102": {
            "final_report": {
                "result": {
                    "finding": "Eligible for bail due to disproportionate detention.",
                    "reasoning": "The accused has served 400 days for an offense carrying a maximum 1-year sentence under Section 323 IPC. The detention has already exceeded the maximum possible punishment. Continued incarceration is a severe violation of fundamental rights.",
                    "legal_references": "Section 479 BNSS; Section 323 IPC; Article 21 Constitution of India",
                    "recommendation": "Grant Immediate Bail & Discharge",
                    "confidence": 99.0
                }
            },
            "merged_data": {
                "eligibility": {
                    "result": {
                        "finding": "Detention exceeds maximum sentence",
                        "reasoning": "400 days served > 365 days max sentence. Accused must be released immediately.",
                        "recommendation": "File for immediate discharge/bail."
                    }
                },
                "delay": {
                    "result": {
                        "finding": "Unreasonable trial delay",
                        "reasoning": "Trial has not concluded despite the offense being a minor summons case.",
                        "recommendation": "Seek explanation from prosecution."
                    }
                },
                "financial": {
                    "result": {
                        "finding": "Standard surety affordable",
                        "reasoning": "Accused has regular employment, ₹20,000 surety is reasonable.",
                        "recommendation": "Arrange standard surety."
                    }
                },
                "strategy": {
                    "result": {
                        "finding": "Unlawful detention",
                        "reasoning": "As detention exceeds max sentence, focus on immediate release and potential compensation.",
                        "recommendation": "File urgent writ petition if bail is delayed."
                    }
                }
            }
        }
    }

    for case in cases_to_insert:
        case_id = case["caseId"]
        print(f"Creating/Updating Case: {case_id}")
        db.collection('cases').document(case_id).set(case)
        
        if case["analysisCompleted"] and case_id in analysis_templates:
            db.collection('case_analyses').document(case_id).set(analysis_templates[case_id])
    
    print("All 8 cases seeded successfully!")

if __name__ == "__main__":
    seed_database()
