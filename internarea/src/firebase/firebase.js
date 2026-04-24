// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXEi57uwEiiWJKiUG7mMZVT5oqTXZYvtI",
  authDomain: "internarea-a2768.firebaseapp.com",
  projectId: "internarea-a2768",
  storageBucket: "internarea-a2768.firebasestorage.app",
  messagingSenderId: "262380327546",
  appId: "1:262380327546:web:c287b116d895faaedce1c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
export { auth, provider};
