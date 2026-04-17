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
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    _auth = getAuth(getApps()[0]);
  }
}

export const auth = _auth;
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  firebaseSignOut,
};
