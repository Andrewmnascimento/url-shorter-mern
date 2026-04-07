import { type RequestHandler } from "express";
import client from "prom-client"

export const metricsController: RequestHandler = async (req, res) => {
  client.collectDefaultMetrics();
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics);
}