import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "../../../components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

interface ShortenedUrlCardProps {
  url: string;
  copied: boolean;
  onCopy: () => void;
}

export const ShortenedUrlCard = ({ url, copied, onCopy }: ShortenedUrlCardProps) => {
  return (
    <Card className="border-primary/15 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ExternalLink className="h-4 w-4" />
          Link pronto
        </CardTitle>
        <CardDescription>Compartilhe ou copie a URL abaixo.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <a
            className="truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
            href={url}
            rel="noreferrer"
            target="_blank"
          >
            {url}
          </a>
          <Button className="sm:w-auto" variant="outline" onClick={onCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
