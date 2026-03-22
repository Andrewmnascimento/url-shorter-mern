import { Schema, model } from "mongoose";

const clickSchema = new Schema({
  urlId: { type: Schema.Types.ObjectId, ref:'URL', required:true, index: true},
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  region: {
    country: { type: String},
    city: { type: String}
  },
  userAgent: {
    raw: { type: String },
    browser: { type: String },
    os: { type: String},
    deviceType: { type: String}
  }
});

clickSchema.index({ urlId: 1, timestamp: -1});
clickSchema.index({ urlId: 1, 'region.country': 1});
clickSchema.index({ urlId: 1, 'region.city': 1});

export const Click = model('Click', clickSchema);