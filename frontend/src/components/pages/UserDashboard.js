import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { Button } from "../Button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const BACKEND_URL = import.meta.env.VITE_PUBLIC_URL ?? "http://localhost:3000";
const formatDate = (isoDate) => new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
}).format(new Date(isoDate));
const stripProtocol = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const ensureArray = (value) => (Array.isArray(value) ? value : []);
export const UserDashboard = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");
    const [copiedId, setCopiedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const loadDashboard = async (isManual = false) => {
        if (isManual)
            setRefreshing(true);
        else
            setLoading(true);
        setFetchError(null);
        try {
            const response = await fetch(`${API_BASE}/dashboard`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Falha ao carregar dados do dashboard.");
            }
            const json = (await response.json());
            setDashboard({
                summary: {
                    totalUrls: json.summary?.totalUrls ?? 0,
                    totalClicks: json.summary?.totalClicks ?? 0,
                    avgClicksPerUrl: json.summary?.avgClicksPerUrl ?? 0,
                },
                timeseries: ensureArray(json.timeseries),
                countries: ensureArray(json.countries),
                devices: ensureArray(json.devices),
                urls: ensureArray(json.urls),
                meta: json.meta,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Erro inesperado ao carregar dashboard.";
            setFetchError(message);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        void loadDashboard(false);
    }, []);
    const urls = useMemo(() => {
        return dashboard?.urls ?? [];
    }, [dashboard?.urls]);
    const filteredSortedLinks = useMemo(() => {
        const lowered = search.trim().toLowerCase();
        const filtered = urls.filter((item) => {
            if (!lowered)
                return true;
            return (item.longUrl.toLowerCase().includes(lowered) ||
                item.shortUrl.toLowerCase().includes(lowered));
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
    const copyToClipboard = (value, id) => {
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
    const onSortChange = (key) => {
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
    return (_jsx("div", { className: "min-h-screen bg-[radial-gradient(circle_at_10%_20%,oklch(0.98_0.01_200),transparent_50%),radial-gradient(circle_at_90%_0%,oklch(0.95_0.03_165),transparent_42%)]", children: _jsxs("div", { className: "mx-auto w-full max-w-7xl p-4 md:p-8", children: [_jsxs("div", { className: "mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium tracking-wide text-muted-foreground", children: "Painel do Encurtador" }), _jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Dashboard" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Dados carregados do endpoint /dashboard." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { disabled: refreshing, onClick: () => void loadDashboard(true), children: refreshing ? "Atualizando..." : "Atualizar" }), _jsx(Button, { disabled: false, onClick: () => navigate("/"), children: "Ir para Encurtador" }), _jsx(Button, { disabled: false, onClick: onLogout, children: "Sair" })] })] }), fetchError && (_jsx("div", { className: "mb-4", children: _jsxs(Alert, { className: "border-red-300 bg-red-50", children: [_jsx(AlertTitle, { children: "Falha ao carregar dashboard" }), _jsx(AlertDescription, { children: fetchError })] }) })), loading ? (_jsxs(Alert, { className: "mb-6", children: [_jsx(AlertTitle, { children: "Carregando" }), _jsx(AlertDescription, { children: "Buscando dados do dashboard..." })] })) : null, _jsxs("div", { className: "mb-6 grid gap-4 md:grid-cols-3", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardDescription, { children: "Total de URLs criadas" }), _jsx(CardTitle, { className: "text-3xl", children: totalUrls })] }), _jsx(CardContent, { children: _jsx(Badge, { variant: "secondary", children: "Resumo" }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardDescription, { children: "Total de cliques" }), _jsx(CardTitle, { className: "text-3xl", children: totalClicks })] }), _jsx(CardContent, { children: _jsx(Badge, { variant: "secondary", children: "Resumo" }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardDescription, { children: "Media de cliques por URL" }), _jsx(CardTitle, { className: "text-3xl", children: avgClicks.toFixed(1) })] }), _jsx(CardContent, { children: _jsx(Badge, { variant: "secondary", children: "Resumo" }) })] })] }), _jsxs("div", { className: "mb-6 grid gap-4 lg:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Cliques por dia" }), _jsx(CardDescription, { children: "Serie temporal recebida do backend." })] }), _jsx(CardContent, { className: "h-70", children: timeseries.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: timeseries, margin: { top: 12, right: 8, left: -8, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 12 } }), _jsx(YAxis, { allowDecimals: false, tick: { fontSize: 12 } }), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "count", name: "Cliques", stroke: "var(--color-chart-3)", strokeWidth: 3, dot: { r: 3 } })] }) })) : (_jsxs(Alert, { className: "border-dashed", children: [_jsx(AlertTitle, { children: "Sem dados" }), _jsx(AlertDescription, { children: "Nenhum ponto no periodo retornado." })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Cliques por pais" }), _jsx(CardDescription, { children: "Top paises por cliques." })] }), _jsx(CardContent, { className: "h-70", children: countries.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: countries, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "country" }), _jsx(YAxis, { allowDecimals: false }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "clicks", fill: "var(--color-chart-4)", radius: [4, 4, 0, 0] })] }) })) : (_jsxs(Alert, { className: "border-dashed", children: [_jsx(AlertTitle, { children: "Sem dados" }), _jsx(AlertDescription, { children: "Nenhum dado de pais retornado." })] })) })] })] }), _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Dispositivos" }), _jsx(CardDescription, { children: "Distribuicao de cliques por deviceType." })] }), _jsx(CardContent, { children: devices.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-2", children: devices.map((device) => (_jsxs(Badge, { variant: "outline", children: [device.deviceType, ": ", device.clicks] }, device.deviceType))) })) : (_jsxs(Alert, { className: "border-dashed", children: [_jsx(AlertTitle, { children: "Sem dados" }), _jsx(AlertDescription, { children: "Nenhum dado de dispositivo retornado." })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Historico de URLs encurtadas" }), _jsx(CardDescription, { children: "Lista retornada pelo endpoint /dashboard." })] }), _jsx("input", { value: search, onChange: (event) => setSearch(event.currentTarget.value), placeholder: "Pesquisar por URL longa ou curta", className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm md:max-w-xs" })] }) }), _jsx(CardContent, { children: filteredSortedLinks.length > 0 ? (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: _jsx("button", { onClick: () => onSortChange("longUrl"), className: "cursor-pointer", children: "URL original" }) }), _jsx(TableHead, { children: _jsx("button", { onClick: () => onSortChange("shortUrl"), className: "cursor-pointer", children: "URL curta" }) }), _jsx(TableHead, { children: _jsx("button", { onClick: () => onSortChange("createdAt"), className: "cursor-pointer", children: "Criada em" }) }), _jsx(TableHead, { children: "Cliques" }), _jsx(TableHead, { children: "Acoes" })] }) }), _jsx(TableBody, { children: filteredSortedLinks.map((item) => {
                                            const shortLink = `${BACKEND_URL}/${item.shortUrl}`;
                                            return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "max-w-65 truncate", children: stripProtocol(item.longUrl) }), _jsx(TableCell, { className: "font-medium", children: shortLink }), _jsx(TableCell, { children: formatDate(item.createdAt) }), _jsx(TableCell, { children: item.clicks }), _jsx(TableCell, { children: _jsx(Button, { disabled: false, onClick: () => copyToClipboard(shortLink, item.id), children: copiedId === item.id ? "Copiado" : "Copiar" }) })] }, item.id));
                                        }) })] })) : (_jsxs(Alert, { className: "border-dashed", children: [_jsx(AlertTitle, { children: "Nenhuma URL encontrada" }), _jsx(AlertDescription, { children: "O backend nao retornou URLs para este usuario/filtro." })] })) })] })] }) }));
};
