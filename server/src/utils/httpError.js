// Грешка с HTTP статус, която errorHandler превръща в JSON отговор
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (message) => new HttpError(400, message);
export const notFoundError = (message) => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);

// Превръща параметър в положително цяло число или хвърля 400
export function toId(value, name = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest(`Невалиден ${name}`);
  }
  return n;
}
