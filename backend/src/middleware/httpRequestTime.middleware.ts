import { type RequestHandler } from "express";
import client from "prom-client"

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP',
  labelNames: ['method', 'route', 'status_code']
})

export const httpRequestTimeMiddleware: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || "unknown", `${res.statusCode}`)
      .observe(duration)
  });
  next();
}