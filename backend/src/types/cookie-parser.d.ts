import "express";

declare module "express" {
  interface CookieOptions {
    sameSite?: boolean | "lax" | "strict" | "none";
  }
}

export {};