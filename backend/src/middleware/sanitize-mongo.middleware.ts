import type { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

type PlainObject = { [key: string]: unknown };

function isPlainObject(val: unknown): val is PlainObject {
  return !!val && typeof val === 'object' && !Array.isArray(val);
}

function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return String(str);
  return sanitizeHtml(str.trim(), { allowedTags: [], allowedAttributes: {} });
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (isPlainObject(value)) return sanitizeObject(value);
  return value;
}

function sanitizeObject(obj: PlainObject): PlainObject {
  const out: PlainObject = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) throw new Error("Invalid field detected");
    const val = (obj as any)[key];
    (out as any)[key] = sanitizeValue(val);
  }
  return out;
}

export default function mongoSanitizerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (isPlainObject(req.body)) req.body = sanitizeObject(req.body as PlainObject);
  if (isPlainObject(req.query)) (req.query as object) = sanitizeObject(req.query as PlainObject);
  if (isPlainObject(req.params)) (req.params as object) = sanitizeObject(req.params as PlainObject);
  next();
}