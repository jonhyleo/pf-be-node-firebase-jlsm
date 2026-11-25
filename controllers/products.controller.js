import * as productsService from '../services/products.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productsService.getAllProducts();
  res.status(200).json({ success: true, data: products });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await productsService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productsService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productsService.removeProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Producto eliminado' });
});
