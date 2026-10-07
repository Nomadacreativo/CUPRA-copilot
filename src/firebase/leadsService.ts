import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Lead } from '../types';
import { INITIAL_LEADS } from '../data/initialLeads';

const LEADS_COLLECTION = 'leads';

// Seed initial leads only if authenticated and collection is empty
export async function seedInitialLeadsIfEmpty() {
  if (!auth.currentUser) {
    return;
  }

  const collectionPath = LEADS_COLLECTION;
  try {
    const snapshot = await getDocs(collection(db, collectionPath));
    if (snapshot.empty) {
      console.log('[Firestore] Seeding initial leads into collection...');
      for (const lead of INITIAL_LEADS) {
        await setDoc(doc(db, LEADS_COLLECTION, lead.id), lead);
      }
    }
  } catch (err) {
    console.warn('[Firestore] Initial seeding notice:', err);
  }
}

// Real-time listener for leads: only attaches if auth is ready and user is authenticated (SKILL.md requirement)
export function subscribeToLeads(
  onUpdate: (leads: Lead[]) => void,
  onError?: (err: any) => void
): () => void {
  // If not authenticated, do not query Firestore (prevents permission denied error)
  if (!auth.currentUser) {
    onUpdate(INITIAL_LEADS);
    return () => {};
  }

  const collectionPath = LEADS_COLLECTION;

  const unsubscribe = onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_LEADS);
        return;
      }
      const loadedLeads: Lead[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Lead;
        loadedLeads.push({
          ...data,
          id: docSnap.id,
        });
      });
      onUpdate(loadedLeads);
    },
    (error) => {
      console.warn('[Firestore] onSnapshot error:', error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } catch (e) {
        // Log formatted FirestoreErrorInfo without uncaught fatal crash
        console.error('[Firestore Error Caught]:', (e as Error)?.message);
      }
    }
  );

  return unsubscribe;
}

// Add or replace lead
export async function createOrUpdateLead(lead: Lead): Promise<void> {
  if (!auth.currentUser) {
    return;
  }

  const path = `${LEADS_COLLECTION}/${lead.id}`;
  try {
    await setDoc(doc(db, LEADS_COLLECTION, lead.id), lead);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Partial update
export async function updateLeadPartial(leadId: string, updates: Partial<Lead>): Promise<void> {
  if (!auth.currentUser) {
    return;
  }

  const path = `${LEADS_COLLECTION}/${leadId}`;
  try {
    await updateDoc(doc(db, LEADS_COLLECTION, leadId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete lead
export async function deleteLead(leadId: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }

  const path = `${LEADS_COLLECTION}/${leadId}`;
  try {
    await deleteDoc(doc(db, LEADS_COLLECTION, leadId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
