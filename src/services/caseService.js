import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export const getCases = async () => {
  const q = query(collection(db, 'cases'), orderBy('priority', 'asc')); 
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToCases = (userId, role, callback) => {
  let q = collection(db, 'cases');
  if (role === 'lawyer') {
    q = query(q, where('lawyerId', '==', userId));
  } else if (role === 'family') {
    q = query(q, where('familyId', '==', userId));
  }
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const getCaseById = async (caseId) => {
  const docRef = doc(db, 'cases', caseId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  throw new Error("Case not found");
};

export const subscribeToCase = (caseId, callback) => {
  const docRef = doc(db, 'cases', caseId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
};

export const getDocumentsByCaseId = async (caseId) => {
  const q = query(collection(db, 'documents'), where('caseId', '==', caseId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCaseAnalysis = async (caseId) => {
  try {
    const docRef = doc(db, 'case_analyses', caseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (e) {
    console.error("Error fetching case analysis:", e);
    return null;
  }
};
