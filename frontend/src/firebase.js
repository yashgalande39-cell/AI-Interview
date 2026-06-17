// Firebase configuration
// ⚠️  Replace the values below with YOUR Firebase project config from:
//     Firebase Console → Project Settings → Your apps → Web App → firebaseConfig
//
// Steps to get your config:
//  1. Go to https://console.firebase.google.com
//  2. Create a project (or open existing one)
//  3. Authentication → Get Started → Sign-in method → Enable Google
//  4. Project Settings (⚙️) → Your apps → Add Web App → Register
//  5. Copy firebaseConfig values into your frontend/.env file as VITE_ prefixed vars

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that config is present before initializing
const hasConfig = Object.values(firebaseConfig).every(Boolean);

let app = null;
let auth = null;
let googleProvider = null;

if (hasConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
} else {
  console.warn(
    '[Firebase] Missing environment variables. Google login will be unavailable.\n' +
    'Create frontend/.env with VITE_FIREBASE_* values from your Firebase Console.'
  );
}

export { auth, googleProvider, hasConfig };
