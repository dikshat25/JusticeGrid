import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export const getNotifications = async () => {
  const q = query(collection(db, 'notifications'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
