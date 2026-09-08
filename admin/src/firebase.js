// Firebase Console → Configuración del proyecto → Tus apps → Web
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD_QBi-LZH2ebb79MKOzypDWOjICgupxAE',
  authDomain: 'bachilleres70-384ed.firebaseapp.com',
  projectId: 'bachilleres70-384ed',
  storageBucket: 'bachilleres70-384ed.firebasestorage.app',
  messagingSenderId: '377136547654',
  appId: '1:377136547654:web:5092eae874c20aacf7c747',
  measurementId: 'G-R5PKWZT9CH',
};

const app = initializeApp(firebaseConfig);

/** Solo si el navegador soporta Analytics; si getAnalytics lanzara error, todo el SPA quedaría en blanco */
export let analytics = null;
isSupported().then((ok) => {
  if (!ok) return;
  try {
    analytics = getAnalytics(app);
  } catch {
    /* Analytics no debe impedir cargar el panel */
  }
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
