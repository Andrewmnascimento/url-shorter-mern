import { nanoid } from "nanoid";
import validator from "validator";
import type { Request, RequestHandler, Response } from "express";
import * as uaParser from "ua-parser-js";
import { URL } from "../models/url.model.js";
import { User } from "../models/user.model.js";
import { Click } from "../models/clicks.model.js";
import type { Url } from "../models/url.model.js";
import { redisClient } from "../db.js";
import type { Types } from "mongoose";

export const createURL = async (req: Request, res: Response): Promise<Response> => {
  let userId: Types.ObjectId | null = null;
  const payload = (req as any).user;
  const dbUser = await User.findOne({ email: payload.email as string });
  if (dbUser === null){
    return res.status(400).json({error: "Este usuario não existe no banco de dados"});
  }
  userId = dbUser._id;
  
  try{
  const { longUrl } = req.body;

  if(!validator.isURL(longUrl)) {
    return res.status(400).json({ error: "URL Invalida"});
    
  };

  const existing = await URL.findOne({ longUrl });
  if (existing) {
    return res.status(200).json(existing.shortUrl);
  }

  let shortURL: string;
  let alreadyExists: any;
  
  do{
    shortURL = nanoid(7);
    alreadyExists = await URL.findOne({ shortURL });
  } while (alreadyExists);

  const newURL = {
    longUrl: `${longUrl}`,
    shortUrl: shortURL,
    owner: userId
  };
  const url: Url = await URL.create(newURL);
  return res.status(201).json(url.shortUrl);
  } catch (err: any) {
    return res.status(500).json({error: `Server error: ${err.message}`});
  }
};

type Params = {
  shortURL: string
};

export const redirectURL = (res: Response,longUrl: string) => {
  return res.redirect(longUrl);
};

export const getURL: RequestHandler  = async (req, res): Promise<Response | void> => {
  const shortURL = req.params.shortURL as string;
  const parser = new uaParser.UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  if (shortURL === "favicon.ico") return res.status(204).end();
  const url = await redisClient.get(shortURL);
  let longUrl: string = "";
  if (url){
    longUrl = url;
    redirectURL(res, longUrl);
    req.stats.recordHit();
  } 
  const dbUrl = await URL.findOne({shortUrl: shortURL});
  if (!dbUrl){
    return res.status(404).json({error: "URL não encontrado"});
  }
  if(!url){
    longUrl = dbUrl.longUrl;
    redirectURL(res, longUrl);
    req.stats.recordMisses();
    await redisClient.set(shortURL, longUrl, {EX: 3600 } as any);
  }
  if(!longUrl) return res.status(404).json({error: "URL não encontrado"});
  await URL.updateOne(
    { shortUrl: shortURL},
    {$inc : {clicks: 1}}
  );
  const urlId = dbUrl._id;
  const ip = req.ip;
  const region = await (await fetch(`http://ip-api.com/json/${ip}`)).json();
  const userAgent = {
    raw : req.headers['user-agent'] as string,
    browser : result.browser.name as string,
    os: result.os.name as string,
    deviceType: result.device.type as string
  };
  await Click.create({
    urlId: urlId,
    ip: ip || req.ip as string,
    region: { country: region.country || "Unknown", city: region.city || "Unknown" },
    userAgent: userAgent
  });
  return;
};
