import express from "express"
import cors from 'cors'
import urlRoutes from "./routes/url.routes.js"
import { connectDB } from "./db.js";

const PORT = Number(process.env.PORT) || 3000

const app = express();
app.use(cors());
app.use(express.json())

connectDB();

app.use("/api", urlRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
});