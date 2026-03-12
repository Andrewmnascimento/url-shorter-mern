import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import dotenv from "dotenv";
import urlRoutes from "./routes/url.routes.js";
import authRouter from "./routes/auth.routes.js";
import { connectDB } from "./db.js";

dotenv.config({ path : './.env'});

const PORT = Number(process.env.PORT) || 3000;

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.18.0.4:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(allowed => allowed!.replace(/\/$/, "") === cleanOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`Origem não permitida detectada: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

connectDB();

app.use("/", urlRoutes);
app.use("/auth", authRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});