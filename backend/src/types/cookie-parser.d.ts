declare module "express-serve-static-core" {
  interface CookieOptions {
    sameSite?: boolean | "lax" | "strict" | "none";
  }
}