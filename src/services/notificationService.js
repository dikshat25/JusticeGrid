import { db } from '../firebase';
import { collection, getDocs, query, orderBy, addDoc, where } from 'firebase/firestore';

export const getNotifications = async (userId, role) => {
  let q = collection(db, 'notifications');
  if (userId) {
    q = query(q, where('recipientId', '==', userId), orderBy('date', 'desc'));
  } else {
    q = query(q, orderBy('date', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addNotification = async (recipientId, title, message) => {
  const docRef = await addDoc(collection(db, 'notifications'), {
    recipientId,
    title,
    message,
    date: new Date().toISOString(),
    read: false
  });
  return docRef.id;
};
