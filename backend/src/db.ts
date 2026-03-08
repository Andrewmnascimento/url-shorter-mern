import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config({ path : './.env'});

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB conectado com sucesso")
  } catch (error: any) {
    console.error('Erro ao conectar: ', error.message);
    process.exit(1);
  }
};