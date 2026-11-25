import AppError from '../utils/AppError.js';

export default function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const isInvalidJson = error.type === 'entity.parse.failed';
  const isClientError = Number.isInteger(error.status) && error.status >= 400 && error.status < 500;
  const statusCode = error instanceof AppError
    ? error.statusCode
    : isInvalidJson
      ? 400
      : isClientError
        ? error.status
        : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  const message = error instanceof AppError
    ? error.message
    : isInvalidJson
      ? 'El cuerpo de la solicitud contiene JSON inválido'
      : statusCode === 404
        ? 'Recurso no encontrado'
        : 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
  });
}
