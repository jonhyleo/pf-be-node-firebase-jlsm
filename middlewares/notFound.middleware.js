import AppError from '../utils/AppError.js';

export default function notFoundMiddleware(req, res, next) {
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}
