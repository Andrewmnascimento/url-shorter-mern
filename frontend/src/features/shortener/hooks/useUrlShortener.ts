import { useEffect, useRef, useState } from "react";
import { buildPublicUrl } from "../../../lib/api";
import { createShortUrl } from "../shortener-api";

export function useUrlShortener() {
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeout.current) {
        window.clearTimeout(copiedTimeout.current);
      }
    };
  }, []);

  const handleShorten = async (longUrl: string) => {
    setIsLoading(true);
    setShortUrl("");

    try {
      const shortPath = await createShortUrl(longUrl);
      const publicUrl = buildPublicUrl(shortPath);
      setShortUrl(publicUrl);
      return publicUrl;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;

    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);

    if (copiedTimeout.current) {
      window.clearTimeout(copiedTimeout.current);
    }

    copiedTimeout.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return {
    shortUrl,
    isLoading,
    copied,
    handleShorten,
    handleCopy,
  };
}
