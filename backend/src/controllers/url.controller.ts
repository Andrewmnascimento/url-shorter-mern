import { nanoid } from "nanoid";
import validator from "validator";
import type { Request, RequestHandler, Response } from "express";
import * as uaParser from "ua-parser-js";
import * as https from "https";
import { URL } from "../models/url.model.js";
import { User } from "../models/user.model.js";
import { Click } from "../models/clicks.model.js";
import type { Url } from "../models/url.model.js";
import { redisClient } from "../db.js";
import type { Types } from "mongoose";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("URL");

// cloudfare verification (using 1.1.1.3 dns)
export const ping = (url: string): Promise<Boolean> => {
  return new Promise( (resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      const isUp = res.statusCode! >= 200 && res.statusCode! < 400;
      resolve(isUp);
      res.resume();
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  })
}
// google safe browsing verification
export const verifyInGoogle = async (url: string) => {
  const token = process.env.GOOGLE_API_KEY;
  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${token}`
  const requestBody = {
    client: {
      clientId: "url-shortner",
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: url }]
    }
  };
  try{
    const response = await fetch(endpoint, {
      method:"POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    if(!response.ok){
      return null;
    }

    const data = await response.json();

    if(data.matches && data.matches.length > 0){
      return false;
    }

    return true;
  } catch (error: any) {
    logger.error(`Erro no Request pro Google: ${error.message}`)
    return null;
  }
}
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
  const dnsValidation = await ping(longUrl);
  const googleValidation = await verifyInGoogle(longUrl);
  if(!validator.isURL(longUrl)) {
    return res.status(400).json({ error: "URL Invalida"});
  };

  if(!dnsValidation){
    return res.status(400).json({error: "URL insegura"});
  };

  if(!googleValidation){
    return res.status(400).json({error: "URL insegura para mais detalhes Aviso Fornecido pelo Google para mais detalhes: https://developers.google.com/safe-browsing/v4/advisory?hl=pt-br"})
  }

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
  const regionData = await fetch(`http://ip-api.com/json/${ip}`);
  const region = await regionData.json();
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
