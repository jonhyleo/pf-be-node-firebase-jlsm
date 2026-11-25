import { db } from '../config/firebase.js';

const productsCollection = db.collection('products');

export async function findAllProducts() {
  const snapshot = await productsCollection.get();
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function findProductById(id) {
  const snapshot = await productsCollection.doc(id).get();
  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createProduct(product) {
  const reference = await productsCollection.add(product);
  return {
    id: reference.id,
    ...product,
  };
}

export async function deleteProductById(id) {
  await productsCollection.doc(id).delete();
}
