import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
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
        console.warn('Firestore subscription warning:', err);
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
  } catch (err) {
    console.error('Failed to save state to Firestore:', err);
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
  } catch (err) {
    console.error('Fetch Firestore error:', err);
    return null;
  }
}
