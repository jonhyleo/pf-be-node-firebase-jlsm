import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { getJwtSecret } from '../utils/jwt.js';

export async function login(email, password) {
  if (
    typeof email !== 'string'
    || !email.trim()
    || typeof password !== 'string'
    || !password
  ) {
    throw new AppError(400, 'Email y password son obligatorios');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AppError(400, 'El email no tiene un formato válido');
  }

  const user = await findUserByEmail(normalizedEmail);
  const passwordMatches = user?.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!passwordMatches) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const role = typeof user.role === 'string' && user.role.trim()
    ? user.role
    : 'user';
  const token = jwt.sign(
    { sub: user.id, role },
    getJwtSecret(),
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
  );

  return {
    token,
    user: {
      id: user.id,
      email: normalizedEmail,
      role,
    },
  };
}
