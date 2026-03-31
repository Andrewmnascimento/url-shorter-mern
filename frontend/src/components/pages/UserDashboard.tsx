import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../Button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

type SortKey = "createdAt" | "longUrl" | "shortUrl";
type SortDirection = "asc" | "desc";

type DashboardUrl = {
  id: string;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
};

type DashboardResponse = {
  summary: {
    totalUrls: number;
    totalClicks: number;
    avgClicksPerUrl: number;
  };
  timeseries: Array<{ date: string; count: number }>;
  countries: Array<{ country: string; clicks: number }>;
  devices: Array<{ deviceType: string; clicks: number }>;
  urls: DashboardUrl[];
  meta?: {
    generatedAt: string;
  };
};

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const BACKEND_URL = import.meta.env.VITE_PUBLIC_URL ?? "http://localhost:3000";

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoDate));

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const ensureArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export const UserDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const loadDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    setFetchError(null);

    try {
      const response = await fetch(`${API_BASE}/dashboard`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar dados do dashboard.");
      }

      const json = (await response.json()) as Partial<DashboardResponse>;

      setDashboard({
        summary: {
          totalUrls: json.summary?.totalUrls ?? 0,
          totalClicks: json.summary?.totalClicks ?? 0,
          avgClicksPerUrl: json.summary?.avgClicksPerUrl ?? 0,
        },
        timeseries: ensureArray<{ date: string; count: number }>(json.timeseries),
        countries: ensureArray<{ country: string; clicks: number }>(json.countries),
        devices: ensureArray<{ deviceType: string; clicks: number }>(json.devices),
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
  };

  useEffect(() => {
    void loadDashboard(false);
  }, []);

  const urls = useMemo( () => {
    return dashboard?.urls ?? []
  }, [dashboard?.urls]);

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
  }, [urls, search, sortDirection, sortKey]);

  const copyToClipboard = (value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const onLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    Cookies.remove("accessToken");
    navigate("/");
  };

  const onSortChange = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const totalUrls = dashboard?.summary.totalUrls ?? 0;
  const totalClicks = dashboard?.summary.totalClicks ?? 0;
  const avgClicks = dashboard?.summary.avgClicksPerUrl ?? 0;
  const timeseries = dashboard?.timeseries ?? [];
  const countries = dashboard?.countries ?? [];
  const devices = dashboard?.devices ?? [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,oklch(0.98_0.01_200),transparent_50%),radial-gradient(circle_at_90%_0%,oklch(0.95_0.03_165),transparent_42%)]">
      <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">Painel do Encurtador</p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Dados carregados do endpoint /dashboard.</p>
          </div>
          <div className="flex gap-2">
            <Button disabled={refreshing} onClick={() => void loadDashboard(true)}>
              {refreshing ? "Atualizando..." : "Atualizar"}
            </Button>
            <Button disabled={false} onClick={() => navigate("/")}>Ir para Encurtador</Button>
            <Button disabled={false} onClick={onLogout}>Sair</Button>
          </div>
        </div>

        {fetchError && (
          <div className="mb-4">
            <Alert className="border-red-300 bg-red-50">
              <AlertTitle>Falha ao carregar dashboard</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          </div>
        )}

        {loading ? (
          <Alert className="mb-6">
            <AlertTitle>Carregando</AlertTitle>
            <AlertDescription>Buscando dados do dashboard...</AlertDescription>
          </Alert>
        ) : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total de URLs criadas</CardDescription>
              <CardTitle className="text-3xl">{totalUrls}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Resumo</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total de cliques</CardDescription>
              <CardTitle className="text-3xl">{totalClicks}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Resumo</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Media de cliques por URL</CardDescription>
              <CardTitle className="text-3xl">{avgClicks.toFixed(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Resumo</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cliques por dia</CardTitle>
              <CardDescription>Serie temporal recebida do backend.</CardDescription>
            </CardHeader>
            <CardContent className="h-70">
              {timeseries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeseries} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Cliques"
                      stroke="var(--color-chart-3)"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Alert className="border-dashed">
                  <AlertTitle>Sem dados</AlertTitle>
                  <AlertDescription>Nenhum ponto no periodo retornado.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cliques por pais</CardTitle>
              <CardDescription>Top paises por cliques.</CardDescription>
            </CardHeader>
            <CardContent className="h-70">
              {countries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Alert className="border-dashed">
                  <AlertTitle>Sem dados</AlertTitle>
                  <AlertDescription>Nenhum dado de pais retornado.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dispositivos</CardTitle>
            <CardDescription>Distribuicao de cliques por deviceType.</CardDescription>
          </CardHeader>
          <CardContent>
            {devices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {devices.map((device) => (
                  <Badge key={device.deviceType} variant="outline">
                    {device.deviceType}: {device.clicks}
                  </Badge>
                ))}
              </div>
            ) : (
              <Alert className="border-dashed">
                <AlertTitle>Sem dados</AlertTitle>
                <AlertDescription>Nenhum dado de dispositivo retornado.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Historico de URLs encurtadas</CardTitle>
                <CardDescription>Lista retornada pelo endpoint /dashboard.</CardDescription>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Pesquisar por URL longa ou curta"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm md:max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredSortedLinks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button onClick={() => onSortChange("longUrl")} className="cursor-pointer">URL original</button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => onSortChange("shortUrl")} className="cursor-pointer">URL curta</button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => onSortChange("createdAt")} className="cursor-pointer">Criada em</button>
                    </TableHead>
                    <TableHead>Cliques</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSortedLinks.map((item) => {
                    const shortLink = `${BACKEND_URL}/${item.shortUrl}`;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-65 truncate">{stripProtocol(item.longUrl)}</TableCell>
                        <TableCell className="font-medium">{shortLink}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>{item.clicks}</TableCell>
                        <TableCell>
                          <Button disabled={false} onClick={() => copyToClipboard(shortLink, item.id)}>
                            {copiedId === item.id ? "Copiado" : "Copiar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Alert className="border-dashed">
                <AlertTitle>Nenhuma URL encontrada</AlertTitle>
                <AlertDescription>O backend nao retornou URLs para este usuario/filtro.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};