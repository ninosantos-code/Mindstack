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
// Sua configuração do Firebase (copiada do seu post)
const firebaseConfig = {
  apiKey: "AIzaSyCvxG7micwjo6qSr79PEgsHASm-aBMGRpg",
  authDomain: "mindstack-2d600.firebaseapp.com",
  projectId: "mindstack-2d600",
  storageBucket: "mindstack-2d600.firebasestorage.app",
  messagingSenderId: "649323024842",
  appId: "1:649323024842:web:7afbfd47a2b2a78660ff33",
  measurementId: "G-J457LPQ4HQ"
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
