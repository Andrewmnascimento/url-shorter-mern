import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  refreshToken: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  role: string
}

interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, Record<string, never>, UserMethods>;

const userSchema = new Schema<IUser, UserModel, UserMethods>(
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
    role: { type: String, required: true, default: "Client"}
  },
  { timestamps: true }
);

userSchema.pre("save", async function (this: HydratedDocument<IUser, UserMethods>) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (
  this: HydratedDocument<IUser, UserMethods>,
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser, UserModel>("User", userSchema);
