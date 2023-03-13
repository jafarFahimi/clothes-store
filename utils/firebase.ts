import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
// doc to fetch d acutal document, getDoc is really getDocData, setDoc -> setDocData

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth();
const db = getFirestore();
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
// without using .then, our func's result is just returned.

// to store userAuth data(displayName,uid,email) inside firestore; doc(db, "users", userAuth.uid) if it not exists:
export const createUserDocFromAuth = async (userAuth: User, additionalInformation = {}) => {
  if (!userAuth) return;

  const userDocRef = doc(db, "users", userAuth.uid as string);
  // doc(db, 'collection/table', 'identifier; unique-id of this row')
  // it's just a ref; points to some unique point/path in db. // don't exist actually now.
  const userSnapshot = await getDoc(userDocRef); // return d data in d previous ref.
  // console.log(userSnapshot.exists()); // false if user with userAuth.id doesn't exist

  if (!userSnapshot.exists()) {
    const { displayName, email } = userAuth;
    const createdDate = new Date();
    try {
      // displayName is used & shown for users set in firestore.
      await setDoc(userDocRef, {
        displayName,
        email,
        createdAt: createdDate,
        ...additionalInformation,
      });
    } catch (error: any) {
      console.log("error at creating the user; ", error.message);
    }
  }
  return userDocRef; // if userSnapshot.exist() & not exist!
};

// to store user's order data(displayName,uid,email) inside firestore; doc(db, "users-orders", userAuth.uid) if it not exists:
export const createUserOrdersFromAuth = async (sessionAuth: any, additionalInformation: any) => {
  if (!sessionAuth) return;

  console.log("sessionAuth is ", sessionAuth);

  const userDocRef = doc(db, "users-orders", sessionAuth.id as string);
  const userSnapshot = await getDoc(userDocRef); // really getDocData! setDocData

  if (!userSnapshot.exists()) {
    const { displayName = "", email = "" } = { ...additionalInformation, ...sessionAuth };
    const createdDate = new Date();
    try {
      await setDoc(userDocRef, {
        displayName,
        email,
        createdAt: createdDate,
        ...additionalInformation,
      });
    } catch (error: any) {
      console.error("Error at storing user orders; " + error.message);
    }
  }
  return userDocRef;
};

export const createAuthUserWithEmailAndPassword = async (email: string, password: string) => {
  if (!email || !password) return;
  // const res = await createUserWithEmailAndPassword(auth, email, password);
  // return res; // same as:
  return await createUserWithEmailAndPassword(auth, email, password);
};
////
export const signInAuthUserWithEmailAndPassword = async (email: string, password: string) => {
  if (!email || !password) return;
  return await signInWithEmailAndPassword(auth, email, password);
};

// onAuthStateChanged is fired (callback is called) when auth changes:
export const onAuthStateChangedListener = (callback: (user: any) => void) =>
  onAuthStateChanged(auth, callback);

export { auth, googleProvider };
export default app;
