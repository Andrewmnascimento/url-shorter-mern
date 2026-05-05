import { useState } from "react";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";

interface LoginFormProps {
  handleLoginClick: (email: string, password: string) => Promise<void> | void;
  handleRegisterClick: (email: string, password: string) => Promise<void> | void;
}

export const LoginForm = ({ handleLoginClick, handleRegisterClick }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleLoginClick(email, password);
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          autoComplete="email"
          name="email"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <Input
          autoComplete="current-password"
          name="password"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" type="submit">
          Entrar
        </Button>
        <Button
          className="w-full sm:w-auto"
          type="button"
          variant="outline"
          onClick={() => void handleRegisterClick(email, password)}
        >
          Criar conta
        </Button>
      </div>
    </form>
  );
};
