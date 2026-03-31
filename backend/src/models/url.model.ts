import mongoose, { Schema, model } from "mongoose";

const urlSchema = new Schema({
  clicks: { type: Number, default: 0},
  longUrl: { type: String, required: true},
  shortUrl: { type: String, required : true, unique: true, index: true},
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  }
}, { timestamps: true});

export type Url = {
  clicks: number,
  longUrl: string, 
  shortUrl: string,
  owner: object
}

export const URL = model('URL', urlSchema);