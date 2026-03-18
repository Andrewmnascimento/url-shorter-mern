import { nanoid } from "nanoid";
import validator from "validator";
import type { Request, Response } from "express-serve-static-core";
import { URL } from "../models/url.model.js"
import type { Url } from "../models/url.model.js"
import { redisClient } from "../db.js";

export const createURL = async (req: Request, res: Response) => {
  try{
  const { longUrl } = req.body;
  
  if(!validator.isURL(longUrl)) {
    res.status(400).json({ error: "URL Invalida"});
    return;
  };

  const existing = await URL.findOne({ longUrl });
  if (existing) {
    res.status(200).json(existing.shortUrl);
    return;
  }

  let shortURL: string;
  let alreadyExists: any;
  
  do{
    shortURL = nanoid(7);
    alreadyExists = await URL.findOne({ shortURL });
  } while(alreadyExists);

  const newURL = {
    longUrl: `${longUrl}`,
    shortUrl: shortURL
  };
  const url: Url = await URL.create(newURL);
  res.status(201).json(url.shortUrl);
  } catch (err: any) {
    res.status(500).json({error: `Server error: ${err.message}`})
  }
};

type Params = {
  shortURL: string
};
export const getURL  = async (req: Request, res: Response) => {
  const shortURL = req.params.shortURL;
  if (shortURL === "favicon.ico") return res.status(204).end();
  const url = await redisClient.get(shortURL);
  let longUrl: string;
  if (url){
    longUrl = url
  } else {
    const dbUrl = await URL.findOne({shortUrl: shortURL});
    if (!dbUrl){
      res.status(404).json({error: "URL não encontrado"});
      return;
    }
    longUrl = dbUrl.longUrl;
    await redisClient.set(shortURL, longUrl, {EX: 3600 } as any);
  }
  if(!longUrl) {res.status(404).json({error: "URL não encontrado"}); return;};
  await URL.updateOne(
    { shortUrl: shortURL},
    {$inc : {clicks: 1}}
  );
  res.redirect( longUrl );
  return;
};
