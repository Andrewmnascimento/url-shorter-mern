import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import dotenv from "dotenv";
import urlRoutes from "./routes/url.routes.js";
import authRouter from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import {adminRouter} from "./routes/admin.routes.js";
import { metricsRouter } from "./routes/metrics.routes.js";
import { connectDB } from "./db.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { createLogger } from "./utils/logger.js";
import { cacheStats } from "./config/stats.js";
import { statsMiddleware } from "./middleware/stats.middleware.js";

dotenv.config({ path : './.env'});

const logger = createLogger("SERVER");
const PORT = Number(process.env.PORT) || 3000;

const app: any = express();
const stats = new cacheStats();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.18.0.4:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(allowed => allowed!.replace(/\/$/, "") === cleanOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`Blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.use(requestLogger);
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
connectDB();

app.use(statsMiddleware(stats));
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/metrics", metricsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/", urlRoutes);

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});