import { useCallback, useEffect, useMemo, useState } from "react";
import { requestJson } from "../../../lib/api";

export type SortKey = "createdAt" | "longUrl" | "shortUrl";
export type SortDirection = "asc" | "desc";

export type DashboardUrl = {
  id: string;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
};

export type DashboardResponse = {
  summary: {
    totalUrls: number;
    totalClicks: number;
    avgClicksPerUrl: number;
  };
  timeseries: Array<{ date: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
  urls: DashboardUrl[];
  meta?: {
    generatedAt: string;
  };
};

const ensureArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoDate));

export const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function useDashboard() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const loadDashboard = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    setFetchError("");

    try {
      const json = (await requestJson<Partial<DashboardResponse>>(
        "/dashboard",
        {
          method: "GET",
        },
        "Falha ao carregar dados do dashboard.",
      )) as Partial<DashboardResponse>;

      setDashboard({
        summary: {
          totalUrls: json.summary?.totalUrls ?? 0,
          totalClicks: json.summary?.totalClicks ?? 0,
          avgClicksPerUrl: json.summary?.avgClicksPerUrl ?? 0,
        },
        timeseries: ensureArray<{ date: string; count: number }>(json.timeseries),
        countries: ensureArray<{ country: string; count: number }>(json.countries),
        devices: ensureArray<{ device: string; count: number }>(json.devices),
        urls: ensureArray<DashboardUrl>(json.urls),
        meta: json.meta,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao carregar dashboard.";
      setFetchError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(false);
  }, [loadDashboard]);

  const urls = useMemo(() => dashboard?.urls ?? [], [dashboard?.urls]);

  const filteredSortedLinks = useMemo(() => {
    const lowered = search.trim().toLowerCase();

    const filtered = urls.filter((item) => {
      if (!lowered) return true;
      return (
        item.longUrl.toLowerCase().includes(lowered) ||
        item.shortUrl.toLowerCase().includes(lowered)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "createdAt") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      const left = a[sortKey].toLowerCase();
      const right = b[sortKey].toLowerCase();
      return left.localeCompare(right);
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [search, sortDirection, sortKey, urls]);

  const copyToClipboard = useCallback((value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }, []);

  const onSortChange = useCallback((key: SortKey) => {
    setSortKey((currentKey) => {
      if (currentKey === key) {
        setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
        return currentKey;
      }

      setSortDirection("asc");
      return key;
    });
  }, []);

  const totalUrls = dashboard?.summary.totalUrls ?? 0;
  const totalClicks = dashboard?.summary.totalClicks ?? 0;
  const avgClicks = dashboard?.summary.avgClicksPerUrl ?? 0;
  const timeseries = dashboard?.timeseries ?? [];
  const countries = dashboard?.countries ?? [];
  const devices = dashboard?.devices ?? [];

  return {
    search,
    setSearch,
    sortKey,
    sortDirection,
    copiedId,
    loading,
    refreshing,
    fetchError,
    dashboard,
    urls,
    filteredSortedLinks,
    totalUrls,
    totalClicks,
    avgClicks,
    timeseries,
    countries,
    devices,
    loadDashboard,
    copyToClipboard,
    onSortChange,
  };
}
