import pkg from "base62";
import { customAlphabet } from "nanoid";
import type { Request, Response }  from "express"
import { URL } from "../models/url.model.js"
import type { url } from "../models/url.model.ts"
const { encode,decode } = pkg

export const createURL = async (req: Request, res: Response) => {
  const { longUrl } = req.body;
  console.log(longUrl);
  const generateID = customAlphabet('0123456789', 8);
  const newID: number = Number(generateID());
  const shortURL: string = encode(newID);
  const newURL = {
    id: newID,
    longUrl: `${longUrl}`,
    shortUrl: shortURL
  };
  const url: url = await URL.create(newURL);
  res.status(201).json(url.shortUrl);
};

export const getURL  = async (req: Request, res: Response) => {
  const shortURL = String(req.query.shortURL);
  const id: number = decode(shortURL);

  type filter = {
    shortUrl?: string,
    id?: number
  } 
  const filter: filter = {};
  if (shortURL) filter.shortUrl = shortURL;
  if (id) filter.id = id;

  const url = await URL.findOne(filter);
  if (!url){
    return res.status(404).json({error: "URL não encontrado"});
  }
  const longUrl: string = url.longUrl;
  return res.status(201).redirect("https://" + longUrl);
};