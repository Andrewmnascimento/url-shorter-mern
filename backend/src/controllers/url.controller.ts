import { nanoid } from "nanoid";
import validator from "validator";
import type { Request, Response }  from "express"
import { URL } from "../models/url.model.js"
import type { url } from "../models/url.model.js"


export const createURL = async (req: Request, res: Response) => {
  try{
  const { longUrl } = req.body;
  
  if(!validator.isURL(longUrl)) {
    return res.status(400).json({ error: "URL Invalida"})
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
    shortUrl: shortURL
  };
  const url: url = await URL.create(newURL);
  res.status(201).json(url.shortUrl);
  } catch (err: any) {
    res.status(500).json({error: `Server error: ${err.message}`})
  }
};

type Params = {
  shortURL: string
};
export const getURL  = async (req: Request<Params>, res: Response) => {
  const shortURL = req.params.shortURL;
  if (shortURL === "favicon.ico") return res.status(204).end();
  const url = await URL.findOne({shortUrl: shortURL});
  if (!url){
    return res.status(404).json({error: "URL não encontrado"});
  }
  await URL.updateOne(
    { shortUrl: shortURL},
    {$inc : {clicks: 1}}
  );
  return res.redirect( url.longUrl );
};