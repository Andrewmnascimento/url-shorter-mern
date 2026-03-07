import express from "express"
import dotenv from 'dotenv';
import cors from 'cors'
import urlRoutes from "./routes/url.routes.js"
import { connectDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json())

connectDB();

app.use("/api", urlRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
});