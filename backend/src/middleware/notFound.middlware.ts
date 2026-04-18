import type { RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (req, res): void => {
  res.status(404).json({error: "Algo deu errado"});
}