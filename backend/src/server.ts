import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import urlRoutes from "./routes/url.routes.js";
import { connectDB } from "./db.js";

dotenv.config({ path : './.env'});

const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(cors());
app.use(express.json())

connectDB();

app.use("/", urlRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});