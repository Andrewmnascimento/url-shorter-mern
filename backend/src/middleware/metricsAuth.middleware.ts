import { type RequestHandler } from "express";

export const metricsAuth: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(`${token}`);
  if(token !== process.env.PROMETHEUS_SECRET || !process.env.PROMETHEUS_SECRET){
    return res.status(400).json({ error: "The token isn't correct"})
  }
  return next();
}