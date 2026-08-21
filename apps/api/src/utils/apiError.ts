/**
 * Operational error with an HTTP status code and a stable machine code.
 * The global error handler turns these into clean JSON responses and never
 * leaks stack traces or internal details to the client.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(statusCode: number, message: string, code = 'ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message = 'Solicitud inválida.', details?: unknown) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'No has iniciado sesión.') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'No tienes permiso para esta acción.') {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  static notFound(message = 'Recurso no encontrado.') {
    return new ApiError(404, message, 'NOT_FOUND');
  }
  static conflict(message = 'La solicitud entra en conflicto con el estado actual.') {
    return new ApiError(409, message, 'CONFLICT');
  }
  static tooMany(message = 'Demasiadas solicitudes. Intenta de nuevo en un momento.') {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }
  static internal(message = 'Ocurrió un error inesperado.') {
    return new ApiError(500, message, 'INTERNAL');
  }
}
