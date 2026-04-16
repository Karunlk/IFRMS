/**
 * Firebase Admin SDK initialization.
 * Used on the backend to verify Firebase ID tokens sent from the frontend.
 *
 * Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env
 * (or use GOOGLE_APPLICATION_CREDENTIALS pointing to a service-account JSON file).
 *
 * When none of these are set the module exports a stub so the rest of the app
 * can still boot without Firebase configured.
 */
import admin from 'firebase-admin';

let firebaseAdmin = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Newlines inside the env var are escaped; unescape them.
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  firebaseAdmin = admin;
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
  firebaseAdmin = admin;
} else {
  console.warn('[Firebase Admin] No credentials found — Firebase token verification disabled.');
}

/**
 * Verify a Firebase ID token and return the decoded payload.
 * Throws if the token is invalid or Firebase is not configured.
 */
export async function verifyFirebaseToken(idToken) {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin SDK is not configured.');
  }
  return firebaseAdmin.auth().verifyIdToken(idToken);
}

export default firebaseAdmin;
