const STORAGE_KEY = "dashboard:created-links";
const isBrowser = () => typeof window !== "undefined";
export const getStoredLinks = () => {
    if (!isBrowser())
        return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed;
    }
    catch {
        return [];
    }
};
export const saveCreatedLink = (longUrl, shortUrl) => {
    const nextItem = {
        id: `${shortUrl}-${Date.now()}`,
        longUrl,
        shortUrl,
        createdAt: new Date().toISOString(),
    };
    const current = getStoredLinks();
    const next = [nextItem, ...current].slice(0, 200);
    if (isBrowser()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    return next;
};
