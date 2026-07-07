import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export const getHearingsByCaseId = async (caseId) => {
  const q = query(collection(db, 'hearings'), where('caseId', '==', caseId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllHearings = async () => {
  const snapshot = await getDocs(collection(db, 'hearings'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
