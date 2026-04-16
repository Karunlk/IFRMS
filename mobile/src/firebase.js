/**
 * Firebase client SDK configuration for the React Native (Expo) Play Store app.
 *
 * Values come from app.json → extra so they are never hard-coded in source.
 * For production builds, set these via EAS Secrets:
 *   eas secret:create --scope project --name FIREBASE_API_KEY --value "..."
 * then reference them in app.config.js.
 */
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import Constants from 'expo-constants';

const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} = Constants.expoConfig?.extra ?? {};

// Firebase is optional — the app falls back to classic backend auth if not configured.
export const isFirebaseConfigured = !!(firebaseApiKey && firebaseProjectId);

let _auth = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
  };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  _auth = getAuth(app);
}

export const auth = _auth;
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  firebaseSignOut,
};
