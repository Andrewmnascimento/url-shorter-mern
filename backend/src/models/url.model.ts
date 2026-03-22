import { Schema, model } from "mongoose";

const urlSchema = new Schema({
  clicks: { type: Number, default: 0},
  longUrl: { type: String, required: true},
  shortUrl: { type: String, required : true, unique: true, index: true},
}, { timestamps: true});

export type Url = {
  clicks: number,
  longUrl: string, 
  shortUrl: string,
}

export const URL = model('URL', urlSchema);