import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { app };

isSupported()
  .then((ok) => { if (ok) getAnalytics(app); })
  .catch(() => {});
