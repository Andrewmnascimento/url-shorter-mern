import { Input } from './Input';
import { Button } from './Button';
import { useState } from 'react';

export const LoginForm = ({ handleLoginClick, handleRegisterClick }: { handleLoginClick: (email: string, password: string) => void; handleRegisterClick: (email: string, password: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xl">
      <div className="flex w-full gap-2">
        <Input placeholder="Email" type="email" onKeyDown={() => {}} onChange={event => setEmail(event.currentTarget.value)}/>
        <Input placeholder="Password" type="password" onKeyDown={() => {}} onChange={event => setPassword(event.currentTarget.value)}/>
      </div>
      <div className="flex w-full gap-2 justify-center">
        <Button onClick={() => handleLoginClick(email, password) } disabled={false}>Login</Button>
        <Button onClick={() => handleRegisterClick(email, password) } disabled={false}>Register</Button>
      </div>
    </div>
  );
};