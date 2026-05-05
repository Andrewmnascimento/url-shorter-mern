import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  BarChart3,
  Link2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { PageShell } from "../components/layout/PageShell";
import { AuthCard } from "../features/auth/components/AuthCard";
import { useAuthSession } from "../features/auth/hooks/useAuthSession";
import { ShortenedUrlCard } from "../features/shortener/components/ShortenedUrlCard";
import { UrlForm } from "../features/shortener/components/UrlForm";
import { useUrlShortener } from "../features/shortener/hooks/useUrlShortener";

export const HomePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { isLoggedIn, handleLogin, handleRegister, handleLogout } = useAuthSession();
  const { shortUrl, isLoading, copied, handleShorten, handleCopy } = useUrlShortener();

  const clearError = () => setError("");

  const onShorten = async (longUrl: string) => {
    clearError();

    try {
      await handleShorten(longUrl);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Erro ao encurtar a URL.";
      setError(message);
    }
  };

  const onLogin = async (email: string, password: string) => {
    clearError();

    try {
      await handleLogin(email, password);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Erro ao fazer login.";
      setError(message);
    }
  };

  const onRegister = async (email: string, password: string) => {
    clearError();

    try {
      await handleRegister(email, password);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Erro ao registrar.";
      setError(message);
    }
  };

  const onLogout = async () => {
    clearError();

    try {
      await handleLogout();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Erro ao fazer logout.";
      setError(message);
    }
  };

  return (
    <PageShell>
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground md:text-5xl">
              URLs encurtadas, interface limpa, fluxo simples.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Entre na sua conta, encurte links e acompanhe seus atalhos em um layout mais
              organizado e responsivo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Sessao protegida
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Link2 className="h-3.5 w-3.5 text-primary" />
              Encaminhamento instantaneo
            </span>
          </div>
        </div>

        {isLoggedIn ? (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="secondary" onClick={() => void onLogout()}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        ) : (
          <Card className="max-w-md border-primary/15 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">Pronto para começar</CardTitle>
              <CardDescription>
                Crie sua conta ou acesse com seus dados para liberar o encurtador.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-primary" />
              Links, dashboard e histórico em um unico lugar.
            </CardContent>
          </Card>
        )}
      </header>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 text-red-700">
          <AlertTitle>Ops, algo falhou</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <section className="w-full max-w-2xl space-y-6">
          {isLoggedIn ? (
            <>
              <Card className="border-primary/15 shadow-lg shadow-primary/5">
                <CardHeader>
                  <Badge className="w-fit gap-2" variant="secondary">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Criar link
                  </Badge>
                  <CardTitle className="text-2xl">Encurte uma nova URL</CardTitle>
                  <CardDescription>
                    Cole o endereço completo e gere um link curto em segundos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UrlForm isLoading={isLoading} onShortURLClick={onShorten} />
                </CardContent>
              </Card>

              {shortUrl && (
                <ShortenedUrlCard copied={copied} onCopy={() => void handleCopy()} url={shortUrl} />
              )}
            </>
          ) : (
            <AuthCard
              handleLoginClick={onLogin}
              handleRegisterClick={onRegister}
            />
          )}
        </section>
      </div>
    </PageShell>
  );
};
