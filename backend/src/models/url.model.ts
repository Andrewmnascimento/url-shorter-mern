import { Schema, model } from "mongoose";

const urlSchema = new Schema({
  id: { type: Number, required: true },
  longUrl: { type: String, required: true},
  shortUrl: { type: String, required : true}
}, { timestamps: true});

export type url = {
  id: number,
  longUrl: string, 
  shortUrl: string
}

export const URL = model('URL', urlSchema);