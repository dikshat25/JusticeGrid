import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error", error);
    throw error;
  }
};

export const signUp = async (email, password, name, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create the user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      aboutMe: '',
      phone: '',
      district: '',
      organization: '',
      photo: ''
    });
    
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
