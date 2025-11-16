import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  user: User | null;
  onAuth: (mode: 'login' | 'register', username: string, password: string) => Promise<void> | void;
  onLogout: () => void;
}

export const AuthPanel: React.FC<Props> = ({ user, onAuth, onLogout }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    return (
      <div style={{ marginBottom: 16 }}>
        Logged in as <strong>{user.username}</strong>
        <button style={{ marginLeft: 8 }} onClick={onLogout}>
          Logout
        </button>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth(mode, username, password);
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginRight: 4 }}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginRight: 4 }}
      />
      <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      <button
        type="button"
        style={{ marginLeft: 4 }}
        onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
      >
        Switch to {mode === 'login' ? 'Register' : 'Login'}
      </button>
    </form>
  );
};