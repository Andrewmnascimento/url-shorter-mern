import { useMemo, useState } from "react";
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
import { getStoredLinks, type StoredShortLink } from "../../lib/dashboard-storage";

type SortKey = "createdAt" | "longUrl" | "shortUrl";
type SortDirection = "asc" | "desc";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const BACKEND_URL = import.meta.env.VITE_PUBLIC_URL ?? "http://localhost:3000";

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoDate));

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export const UserDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unavailableError, setUnavailableError] = useState<string | null>(null);

  const links = useMemo(() => getStoredLinks(), []);

  const filteredSortedLinks = useMemo(() => {
    const lowered = search.trim().toLowerCase();

    const filtered = links.filter((item) => {
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
  }, [links, search, sortDirection, sortKey]);

  const creationSeries = useMemo(() => {
    const grouped = links.reduce<Record<string, number>>((acc, item) => {
      const day = new Date(item.createdAt).toISOString().slice(0, 10);
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, count]) => ({
        date,
        count,
      }));
  }, [links]);

  const totalUrls = links.length;

  const copyToClipboard = (value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const callUnavailableAnalytics = async () => {
    setRefreshing(true);
    setUnavailableError(null);

    try {
      const response = await fetch(`${API_BASE}/dashboard`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("O backend ainda não expõe endpoints de analytics para o dashboard.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao consultar analytics.";
      setUnavailableError(message);
    } finally {
      setRefreshing(false);
    }
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

  const renderUnavailable = (title: string, detail: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{detail}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="border-dashed">
          <AlertTitle>Dados indisponiveis</AlertTitle>
          <AlertDescription>
            Este bloco depende de endpoints de analytics ainda nao expostos no backend.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,oklch(0.98_0.01_200),transparent_50%),radial-gradient(circle_at_90%_0%,oklch(0.95_0.03_165),transparent_42%)]">
      <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">Painel do Encurtador</p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Visualize os dados que ja foram gerados pelo backend no fluxo de encurtamento.</p>
          </div>
          <div className="flex gap-2">
            <Button disabled={refreshing} onClick={callUnavailableAnalytics}>
              {refreshing ? "Consultando..." : "Tentar Analytics"}
            </Button>
            <Button disabled={false} onClick={() => navigate("/")}>Ir para Encurtador</Button>
            <Button disabled={false} onClick={onLogout}>Sair</Button>
          </div>
        </div>

        {unavailableError && (
          <div className="mb-4">
            <Alert className="border-amber-300 bg-amber-50">
              <AlertTitle>Analytics indisponivel</AlertTitle>
              <AlertDescription>{unavailableError}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total de URLs criadas</CardDescription>
              <CardTitle className="text-3xl">{totalUrls}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Fonte: respostas do endpoint de criacao</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total de cliques</CardDescription>
              <CardTitle className="text-3xl">-</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Aguardando endpoint de leitura de cliques</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Media de cliques por URL</CardDescription>
              <CardTitle className="text-3xl">-</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Aguardando endpoint de agregacao</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>URLs criadas por dia</CardTitle>
              <CardDescription>
                Serie temporal baseada nas URLs que o backend ja gerou durante seu uso.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-70">
              {creationSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={creationSeries} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="URLs"
                      stroke="var(--color-chart-3)"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Alert className="border-dashed">
                  <AlertTitle>Sem dados ainda</AlertTitle>
                  <AlertDescription>
                    Crie URLs no encurtador para alimentar este grafico.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {renderUnavailable(
            "Cliques por pais",
            "Grafico de barras reservado para os dados de origem geografica de cliques.",
          )}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {renderUnavailable(
            "Dispositivos",
            "Distribuicao por desktop/mobile/tablet a partir de user-agent.",
          )}
          <Card>
            <CardHeader>
              <CardTitle>Projecao de paises (placeholder visual)</CardTitle>
              <CardDescription>
                Estrutura pronta para receber o endpoint real de cliques por pais.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-55">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Historico de URLs encurtadas</CardTitle>
                <CardDescription>
                  Lista local das URLs criadas a partir das respostas do backend no frontend.
                </CardDescription>
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
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSortedLinks.map((item: StoredShortLink) => {
                    const shortLink = `${BACKEND_URL}/${item.shortUrl}`;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-65 truncate">{stripProtocol(item.longUrl)}</TableCell>
                        <TableCell className="font-medium">{shortLink}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            disabled={false}
                            onClick={() => copyToClipboard(shortLink, item.id)}
                          >
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
                <AlertDescription>
                  Crie URLs no encurtador para visualizar dados aqui.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};