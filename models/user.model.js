import { db } from '../config/firebase.js';

export async function findUserByEmail(email) {
  const snapshot = await db
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const document = snapshot.docs[0];
  return {
    id: document.id,
    ...document.data(),
  };
}
