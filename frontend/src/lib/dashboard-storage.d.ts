export type StoredShortLink = {
    id: string;
    longUrl: string;
    shortUrl: string;
    createdAt: string;
};
export declare const getStoredLinks: () => StoredShortLink[];
export declare const saveCreatedLink: (longUrl: string, shortUrl: string) => StoredShortLink[];
