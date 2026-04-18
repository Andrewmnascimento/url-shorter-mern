import { type RequestHandler } from "express";
import { Types } from "mongoose";
import { User } from "../models/user.model.js";
import { URL } from "../models/url.model.js";

export const dashboardRoute: RequestHandler = async (req, res) => {
  const authUser = (req as any).user as { email?: string } | undefined;
  if (!authUser?.email) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }

  const dbUser = await User.findOne({ email: authUser.email });
  if (dbUser === null) {
    res.status(400).json({ error: "Este usuario não existe no banco de dados" });
    return;
  }

  const user: Types.ObjectId = dbUser._id;

  const dashboardData = await URL.aggregate([
  { $match: { owner: new Types.ObjectId(user) } },
  {
    $lookup: {
      from: "clicks", // Verifique se no DB é 'click' ou 'clicks'
      localField: "_id",
      foreignField: "urlId",
      as: "clickDetails"
    }
  },
  { $addFields: { clicksCount: { $size: "$clickDetails" } } },
  {
    $facet: {
      "summary": [
        {
          $group: {
            _id: null,
            totalUrls: { $sum: 1 },
            totalClicks: { $sum: "$clicksCount" }
          }
        }
      ],
      "timeseries": [
        { $unwind: "$clickDetails" },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$clickDetails.createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ],
      // AJUSTADO PARA: region.country
      "countries": [
        { $unwind: "$clickDetails" },
        {
          $group: {
            _id: { $ifNull: ["$clickDetails.region.country", "Unknown"] },
            count: { $sum: 1 }
          }
        },
        { $project: { country: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ],
      // AJUSTADO PARA: userAgent.browser (ou .os, se preferires)
      "devices": [
        { $unwind: "$clickDetails" },
        {
          $group: {
            _id: { $ifNull: ["$clickDetails.userAgent.browser", "Unknown"] },
            count: { $sum: 1 }
          }
        },
        { $project: { device: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ],
      "urls": [
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $project: {
            shortUrl: 1,
            longUrl: 1,
            createdAt: 1,
            clicks: "$clicksCount"
          }
        }
      ]
    }
  }
]);
  const result = dashboardData[0];
  // Ajustes finais de meta e default
  result.meta = { generatedAt: new Date().toISOString() };
  if (!result.summary.length) result.summary = [{ totalUrls: 0, totalClicks: 0, avgClicksPerUrl: 0 }];
  result.summary = result.summary[0];

  res.status(200).json(result);
}