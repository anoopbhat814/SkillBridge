import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/errors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ code: "VALIDATION", message: "Invalid request", details: err.flatten() });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ code: err.code, message: err.message, details: err.details });
  }
  console.error("Unhandled error", err);
  res.status(500).json({ code: "INTERNAL", message: "Something went wrong" });
}
