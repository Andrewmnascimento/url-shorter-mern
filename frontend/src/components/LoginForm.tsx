import { Input } from './Input';
import { Button } from './Button';
import { useState } from 'react';

export const LoginForm = ({ handleLoginClick, handleRegisterClick }: { handleLoginClick: (email: string, password: string) => void; handleRegisterClick: (email: string, password: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xl">
      <div className="flex w-full gap-2">
        <Input placeholder="Username" type="text" onKeyDown={() => {}} onChange={event => setUsername(event.currentTarget.value)}/>
        <Input placeholder="Password" type="password" onKeyDown={() => handleLoginClick(username, password)} onChange={event => setPassword(event.currentTarget.value)}/>
      </div>
      <div className="flex w-full gap-2">
        <Button onClick={() => handleLoginClick(username, password) } disabled={false}>Login</Button>
        <Button onClick={() => handleRegisterClick(username, password) } disabled={false}>Register</Button>
      </div>
    </div>
  );
};