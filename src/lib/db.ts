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

// We'll use a specific "room" or "space" for the users. For simplicity, we can let users create a "roomId" or just use a shared string.
// We'll expose functions that take a roomId.

export const createSpace = async (spaceId: string) => {
  const docRef = doc(db, 'spaces', spaceId);
  await setDoc(docRef, {
    createdAt: new Date().toISOString()
  }, { merge: true });
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
  });
};
