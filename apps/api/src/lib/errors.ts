export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, "NOT_FOUND", `${what} not found`);
export const forbidden = (msg = "Not allowed") => new HttpError(403, "FORBIDDEN", msg);
export const badRequest = (msg: string, details?: Record<string, unknown>) =>
  new HttpError(400, "BAD_REQUEST", msg, details);
