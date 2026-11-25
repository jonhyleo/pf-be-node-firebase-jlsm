import * as productModel from '../models/product.model.js';
import AppError from '../utils/AppError.js';

function validateProduct(product) {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    throw new AppError(400, 'El cuerpo debe contener un objeto de producto');
  }

  const { name, description, price, stock, category } = product;
  if (
    typeof name !== 'string' || !name.trim()
    || typeof description !== 'string' || !description.trim()
    || typeof category !== 'string' || !category.trim()
    || typeof price !== 'number' || !Number.isFinite(price) || price < 0
    || !Number.isInteger(stock) || stock < 0
  ) {
    throw new AppError(
      400,
      'Se requieren name, description y category como texto; price como número no negativo y stock como entero no negativo',
    );
  }

  return {
    name: name.trim(),
    description: description.trim(),
    price,
    stock,
    category: category.trim(),
  };
}

function validateProductId(id) {
  if (typeof id !== 'string' || !id.trim() || id.includes('/')) {
    throw new AppError(400, 'El ID del producto no es válido');
  }
}

export async function getAllProducts() {
  return productModel.findAllProducts();
}

export async function getProductById(id) {
  validateProductId(id);
  const product = await productModel.findProductById(id);
  if (!product) {
    throw new AppError(404, 'Producto no encontrado');
  }
  return product;
}

export async function createProduct(product) {
  return productModel.createProduct(validateProduct(product));
}

export async function removeProduct(id) {
  validateProductId(id);
  const product = await productModel.findProductById(id);
  if (!product) {
    throw new AppError(404, 'Producto no encontrado');
  }

  await productModel.deleteProductById(id);
}
