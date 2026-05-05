import { LockKeyhole } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { LoginForm } from "./LoginForm";

interface AuthCardProps {
  handleLoginClick: (email: string, password: string) => Promise<void> | void;
  handleRegisterClick: (email: string, password: string) => Promise<void> | void;
}

export const AuthCard = ({ handleLoginClick, handleRegisterClick }: AuthCardProps) => {
  return (
    <Card className="border-primary/15 bg-card/95 shadow-lg shadow-primary/5">
      <CardHeader>
        <Badge className="w-fit gap-2" variant="secondary">
          <LockKeyhole className="h-3.5 w-3.5" />
          Acesso seguro
        </Badge>
        <CardTitle className="text-2xl">Entre para encurtar URLs</CardTitle>
        <CardDescription>Crie sua conta ou entre com seu email para acessar o painel.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm
          handleLoginClick={handleLoginClick}
          handleRegisterClick={handleRegisterClick}
        />
      </CardContent>
    </Card>
  );
};
