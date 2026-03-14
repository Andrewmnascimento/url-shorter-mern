import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path : './.env'});

const mongoURI = process.env.MONGO_URI || "mongodb://database:27017/urlShorterDB";

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI!);
    console.log("MongoDB conectado com sucesso");
  } catch (error: any) {
    console.error('Erro ao conectar, tentando novamente em 5s...');
    setTimeout(connectDB, 5000);
  }
};