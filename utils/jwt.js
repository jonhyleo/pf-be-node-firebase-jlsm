import AppError from './AppError.js';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'La configuración JWT_SECRET no está definida');
  }
  return secret;
}
