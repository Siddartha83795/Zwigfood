'use client';

import { doc, runTransaction, type Firestore } from "firebase/firestore";

/**
 * Generates a sequential token number for a given outlet using a Firestore transaction.
 * It reads a counter document, increments it, and returns the new value.
 * If the counter document does not exist, it initializes it.
 * 
 * @param {Firestore} db - The Firestore database instance.
 * @param {string} outletId - The ID of the outlet for which to generate a token.
 * @returns {Promise<number>} A promise that resolves to the next token number.
 * @throws {Error} Throws an error if the transaction fails for reasons other than contention.
 */
export async function generateTokenNumber(db: Firestore, outletId: string): Promise<number> {
  const counterRef = doc(db, 'counters', outletId);
  
  try {
    const nextToken = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      if (!counterDoc.exists()) {
        // Initialize the counter if it doesn't exist
        transaction.set(counterRef, { lastToken: 1 });
        return 1;
      }
      
      const lastToken = counterDoc.data()?.lastToken || 0;
      const newToken = lastToken + 1;
      
      transaction.update(counterRef, { lastToken: newToken });
      
      return newToken;
    });
    
    return nextToken;
  } catch (error) {
    console.error("Token generation transaction failed: ", error);
    // Fallback or re-throw error
    throw new Error('Failed to generate a token number.');
  }
}
