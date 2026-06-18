import { collection, doc, setDoc, deleteDoc, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Transaction {
  id: string;
  date: string;
  contributor: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
}

export const createSpace = async (spaceId: string) => {
  const docRef = doc(db, 'spaces', spaceId);
  await setDoc(docRef, {
    createdAt: new Date().toISOString()
  }, { merge: true });
};

export const getUserRoomId = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data().roomId || null;
    }
  } catch (error) {
    console.error("Error fetching user room:", error);
  }
  return null;
};

export const setUserRoomId = async (userId: string, roomId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { roomId }, { merge: true });
  } catch (error) {
    console.error("Error updating user room:", error);
  }
};

export const appendTransactionFirestore = async (spaceId: string, transaction: Transaction) => {
  const transRef = doc(collection(db, 'spaces', spaceId, 'transactions'), transaction.id);
  await setDoc(transRef, transaction);
};

export const deleteTransactionFirestore = async (spaceId: string, transactionId: string) => {
  const transRef = doc(collection(db, 'spaces', spaceId, 'transactions'), transactionId);
  await deleteDoc(transRef);
};

export const subscribeTransactions = (spaceId: string, onUpdate: (transactions: Transaction[]) => void) => {
  const q = query(collection(db, 'spaces', spaceId, 'transactions'), orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach(doc => {
      transactions.push(doc.data() as Transaction);
    });
    onUpdate(transactions);
  }, (error) => {
    console.error("Subscription error:", error);
  });
};
