import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    limit 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Sua NOVÍSSIMA configuração do Firebase (Projeto mindstack-80741)
const firebaseConfig = {
  apiKey: "AIzaSyDT4huEhyyOmTlAvcv4Np3zzAMKFCjGkEc",
  authDomain: "mindstack-80741.firebaseapp.com",
  projectId: "mindstack-80741",
  storageBucket: "mindstack-80741.firebasestorage.app",
  messagingSenderId: "558340613049",
  appId: "1:558340613049:web:b4edc61dd49ab8ec294c68",
  measurementId: "G-L5G87PM6GB"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Provedores
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { 
    auth, 
    db, 
    googleProvider, 
    githubProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut,
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    limit
};
