import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error", error);
    throw error;
  }
};

export const signUp = async (formData) => {
  try {
    const { email, password, role, name, phone, relationship, undertrialName, prisonId, aadhaar, city, state, barCouncilId } = formData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    let linkedCaseId = null;

    if (role === 'family') {
      // Check if a case was already created by a lawyer with this family email
      const q = query(collection(db, 'cases'), where('familyEmail', '==', email));
      const caseSnapshot = await getDocs(q);
      
      if (!caseSnapshot.empty) {
        // Link the first matching case
        const linkedCase = caseSnapshot.docs[0];
        linkedCaseId = linkedCase.id;
        
        // Update the case to explicitly hold the family UID
        await updateDoc(doc(db, 'cases', linkedCaseId), {
          familyId: user.uid
        });
      }
    }

    const baseUserData = {
      uid: user.uid,
      name,
      email,
      role,
      phone: phone || '',
      city: city || '',
      state: state || '',
      photo: ''
    };

    if (role === 'family') {
      await setDoc(doc(db, 'users', user.uid), {
        ...baseUserData,
        relationship,
        undertrialName,
        prisonId,
        aadhaar,
        linkedCaseId
      });
    } else {
      await setDoc(doc(db, 'users', user.uid), {
        ...baseUserData,
        barCouncilId,
        organization: '',
        aboutMe: ''
      });
    }
    
    return user;
  } catch (error) {
    console.error("Sign Up error", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error", error);
    throw error;
  }
};
