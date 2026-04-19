import { createHash } from "crypto";

export const hashUrl = (url: string):string => createHash("sha256").update(url).digest("hex").slice(0, 16)