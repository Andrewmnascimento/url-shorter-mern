import { type RequestHandler } from "express";
import client from "prom-client"

let metricsInitialized = false;

export const metricsController: RequestHandler = async (req, res) => {
  if (!metricsInitialized) {
    client.collectDefaultMetrics();
    metricsInitialized = true;
  }

  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}