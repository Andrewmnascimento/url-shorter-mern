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
    { $match: { owner: new Types.ObjectId(user)}},

    {
      $lookup: {
        from:"click",
        localField:"_id",
        foreignField:"urlId",
        as: "clickDetails"
      }
    },

    {
      $addFields:{
        clicksCount: { $size: "$clickDetails"}
      }
    },

    {
      $facet: {
        "summary":[
          {
            $group: {
              _id: null,
              totalUrls: { $sum: 1 },
              totalClicks: { $sum: "$clicksCount"}
            }
          },
          {
          $project: {
            _id: 0,
            totalUrls: 1,
            totalClicks: 1,
            avgClicksPerUrl: { 
              $cond: [ { $eq: ["$totalUrls", 0] }, 0, { $divide: ["$totalClicks", "$totalUrls"] } ] 
            }
          }
          }
        ],
        "timeseries":[
          { $unwind: "$clickDetails"},
          {
            $group:{
              _id:{ $dateToString: { format: "%Y-%m-%d", date: "$clickDetails.createdAt"}},
              count: { $sum: 1 }
            }
          },
          { $project: {_id: 0, date: "$_id", count: 1 } },
          { $sort: { date: 1 }}
        ],
        "urls":[
          { $sort: { createdAt: -1}},
          { $limit: 10 },
          {
            $project:{
              id:"$_id",
              longUrl:1,
              shortUrl: 1,
              createdAt:1,
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