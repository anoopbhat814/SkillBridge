import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@skillbridge/types";
import { HttpError } from "../lib/errors";

export interface AuthedRequest extends Request {
  user?: { id: string; role: Role };
}

export function signToken(user: { id: string; role: Role }): string {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "12h" });
}

export function requireAuth(role?: Role) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    const header = req.header("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next(new HttpError(401, "UNAUTHENTICATED", "Missing bearer token"));
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: Role };
    } catch {
      return next(new HttpError(401, "UNAUTHENTICATED", "Invalid or expired token"));
    }
    if (role && req.user.role !== role && req.user.role !== "ADMIN") {
      return next(new HttpError(403, "FORBIDDEN", `Requires ${role} role`));
    }
    next();
  };
}
