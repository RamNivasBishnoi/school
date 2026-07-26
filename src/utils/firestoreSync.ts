import { initializeApp, getApps, getApp, setLogLevel } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState } from '../types';

// Silence verbose connection warnings in console when offline or firestore unavailable
try {
  setLogLevel('error');
} catch (e) {
  // ignore if already set
}

// Get dynamic or custom config if specified in localStorage (e.g. for GitHub Pages custom domain)
const getEffectiveFirebaseConfig = () => {
  try {
    const custom = localStorage.getItem('CUSTOM_FIREBASE_CONFIG');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.projectId) return parsed;
    }
  } catch (e) {
    // ignore parse error
  }
  return firebaseConfig;
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(getEffectiveFirebaseConfig()) : getApp();
export const db = getFirestore(app);

const DOC_REF = doc(db, 'school_erp_data', 'main_state');

/**
 * Listens for live real-time updates from Firestore across all users/devices
 */
export function subscribeToFirestoreState(
  onUpdate: (newState: AppState) => void,
  onError?: (error: any) => void
) {
  try {
    const unsubscribe = onSnapshot(
      DOC_REF,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as AppState;
          if (remoteData && remoteData.students && remoteData.teachers) {
            onUpdate(remoteData);
          }
        }
      },
      (err) => {
        // Fallback silently if firestore backend is unavailable/offline
        if (err.code !== 'unavailable') {
          console.warn('Firestore subscription status:', err.message || err);
        }
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Firestore init error:', err);
    return () => {};
  }
}

/**
 * Saves current ERP state to Firestore for shared live access across users
 */
export async function saveStateToFirestore(state: AppState): Promise<boolean> {
  try {
    await setDoc(DOC_REF, state, { merge: true });
    return true;
  } catch (err: any) {
    if (err?.code !== 'unavailable') {
      console.warn('Firestore save status:', err?.message || err);
    }
    return false;
  }
}

/**
 * Fetches state once from Firestore
 */
export async function fetchStateFromFirestore(): Promise<AppState | null> {
  try {
    const docSnap = await getDoc(DOC_REF);
    if (docSnap.exists()) {
      return docSnap.data() as AppState;
    }
    return null;
  } catch (err: any) {
    if (err?.code !== 'unavailable') {
      console.warn('Firestore fetch status:', err?.message || err);
    }
    return null;
  }
}

