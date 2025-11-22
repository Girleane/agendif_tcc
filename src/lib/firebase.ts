'use client';

import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Valida se as variáveis de ambiente foram carregadas
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('As variáveis de ambiente do Firebase não foram carregadas. Verifique seu arquivo .env.local e reinicie o servidor de desenvolvimento.');
  }

  return initializeApp(firebaseConfig);
}

export const app = getFirebaseApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
