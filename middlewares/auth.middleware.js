import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import { getJwtSecret } from '../utils/jwt.js';

export function authenticateToken(req, res, next) {
  const authorization = req.get('Authorization');
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return next(new AppError(401, 'Se requiere un token Bearer válido'));
  }

  try {
    const payload = jwt.verify(match[1], getJwtSecret(), {
      algorithms: ['HS256'],
    });

    if (
      typeof payload === 'string'
      || typeof payload.sub !== 'string'
      || typeof payload.role !== 'string'
    ) {
      return next(new AppError(401, 'Token inválido o expirado'));
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(401, 'Token inválido o expirado'));
  }
}

export function authorizeRoles(...allowedRoles) {
  return function roleAuthorization(req, res, next) {
    if (!req.user) {
      return next(new AppError(401, 'Se requiere autenticación'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'No tienes permisos para realizar esta acción'));
    }

    return next();
  };
}
