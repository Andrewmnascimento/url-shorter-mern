import pkg from "base62";
import { customAlphabet } from "nanoid";
import { URL } from "../models/url.model.js";
const { encode,decode } = pkg

export const createURL = async (req, res) => {
  const { longUrl } = req.body;
  console.log(longUrl);
  const generateID = customAlphabet('0123456789', 8);
  const newID = generateID();
  const shortURL = encode(newID);
  const newURL = {
    id: newID,
    longUrl: `${longUrl}`,
    shortUrl: shortURL
  };
  const url = await URL.create(newURL);
  res.status(201).json(url.shortUrl);
};

export const getURL  = async (req, res) => {
  const { shortURL } = req.query;
  const id = decode(shortURL);

  const filter = {};
  if (shortURL) filter.shortUrl = shortURL;
  if (id) filter.id = id;

  const url = await URL.find(filter);
  const longUrl = url[0].longUrl;
  res.status(201).redirect("https://" + longUrl);
};