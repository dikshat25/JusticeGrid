import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getReportsByCaseId = async (caseId) => {
  const q = query(collection(db, 'agent_reports'), where('caseId', '==', caseId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllReports = async () => {
  const snapshot = await getDocs(collection(db, 'agent_reports'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
