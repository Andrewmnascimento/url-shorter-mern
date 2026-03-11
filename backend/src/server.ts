import express from "express";
import cors from 'cors';
import helmet from "helmet";
import dotenv from "dotenv";
import urlRoutes from "./routes/url.routes.js";
import authRouter from "./routes/auth.routes.js";
import { connectDB } from "./db.js";

dotenv.config({ path : './.env'});

const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(helmet());

connectDB();

app.use("/", urlRoutes);
app.use("/auth", authRouter);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});