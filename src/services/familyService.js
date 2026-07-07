import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getFamilyUpdatesByCaseId = async (caseId) => {
  const q = query(collection(db, 'family_updates'), where('caseId', '==', caseId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllFamilyUpdates = async () => {
  const snapshot = await getDocs(collection(db, 'family_updates'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
