import { nanoid } from "nanoid";
import validator from "validator";
import type { Request, Response } from "express";
import * as uaParser from "ua-parser-js";
import { URL } from "../models/url.model.js";
import { jwtVerify } from "jose";
import { User } from "../models/user.model.js";
import { Click } from "../models/clicks.model.js";
import type { Url } from "../models/url.model.js";
import { redisClient } from "../db.js";
import type { Types } from "mongoose";

export const createURL = async (req: Request, res: Response): Promise<Response> => {
  const token: string = (req.headers.authorization)?.split(" ")[1] as string;
  let userId: Types.ObjectId | null = null;
    try{
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const {payload} = await jwtVerify(token, secret);
      if(!payload){
        return res.status(400).json({error: "O token não foi verificado com sucesso"});
      }
      const dbUser = await User.findOne({ email: payload.email as string }) ;
      if (dbUser === null){
        return res.status(400).json({error: "Este usuario não existe no banco de dados"});
      }
      userId = dbUser._id;
    } catch(err){
      return res.status(401).json({error: "Token inválido"});
    };
  
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
  } while(alreadyExists);

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

export const getURL  = async (req: Request, res: Response): Promise<Response | void> => {
  const shortURL = req.params.shortURL as string;
  const parser = new uaParser.UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  if (shortURL === "favicon.ico") return res.status(204).end();
  const url = await redisClient.get(shortURL);
  let longUrl: string = "";
  if (url){
    longUrl = url;
    redirectURL(res, longUrl);
  } 
  const dbUrl = await URL.findOne({shortUrl: shortURL});
  if (!dbUrl){
    return res.status(404).json({error: "URL não encontrado"});
  }
  if(!url){
    longUrl = dbUrl.longUrl;
    redirectURL(res, longUrl);
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
