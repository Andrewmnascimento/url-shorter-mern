import { useState } from "react";
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
import { Input } from "../Input";
import { PageShell } from "../layout/PageShell";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DashboardMetricCard } from "../../features/dashboard/components/DashboardMetricCard";
import { formatDate, stripProtocol, useDashboard } from "../../features/dashboard/hooks/useDashboard";
import { logout as logoutSession } from "../../features/auth/auth-api";
import { PUBLIC_URL } from "../../lib/api";

export const UserDashboard = () => {
  const navigate = useNavigate();
  const [actionError, setActionError] = useState("");
  const {
    search,
    setSearch,
    sortKey,
    sortDirection,
    copiedId,
    loading,
    refreshing,
    fetchError,
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
  } = useDashboard();

  const onLogout = async () => {
    setActionError("");

    try {
      await logoutSession();
      Cookies.remove("accessToken");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer logout.";
      setActionError(message);
    }
  };

  const sortIndicator = (key: "createdAt" | "longUrl" | "shortUrl") =>
    sortKey === key ? (sortDirection === "asc" ? " ↑" : " ↓") : "";

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Painel do Encurtador
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Dados carregados do endpoint /dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={refreshing} onClick={() => void loadDashboard(true)}>
              {refreshing ? "Atualizando..." : "Atualizar"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Ir para Encurtador
            </Button>
            <Button variant="secondary" onClick={() => void onLogout()}>
              Sair
            </Button>
          </div>
        </div>

        {actionError && (
          <div className="mb-4">
            <Alert className="border-red-300 bg-red-50">
              <AlertTitle>Falha na ação</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          </div>
        )}

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
          <DashboardMetricCard description="Total de URLs criadas" label="Resumo" value={totalUrls} />
          <DashboardMetricCard description="Total de cliques" label="Resumo" value={totalClicks} />
          <DashboardMetricCard
            description="Media de cliques por URL"
            label="Resumo"
            value={avgClicks.toFixed(1)}
          />
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cliques por dia</CardTitle>
              <CardDescription>Serie temporal recebida do backend.</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
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
            <CardContent className="h-72">
              {countries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
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
                  <Badge key={device.device} variant="outline">
                    {device.device}: {device.count}
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
              <Input
                className="md:max-w-xs"
                placeholder="Pesquisar por URL longa ou curta"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredSortedLinks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button onClick={() => onSortChange("longUrl")} className="cursor-pointer">
                        URL original{sortIndicator("longUrl")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => onSortChange("shortUrl")} className="cursor-pointer">
                        URL curta{sortIndicator("shortUrl")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => onSortChange("createdAt")} className="cursor-pointer">
                        Criada em{sortIndicator("createdAt")}
                      </button>
                    </TableHead>
                    <TableHead>Cliques</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSortedLinks.map((item) => {
                    const shortLink = `${PUBLIC_URL}/${item.shortUrl}`;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-65 truncate">{stripProtocol(item.longUrl)}</TableCell>
                        <TableCell className="font-medium">{shortLink}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>{item.clicks}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
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
                <AlertDescription>O backend nao retornou URLs para este usuario/filtro.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};
