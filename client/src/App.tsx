import React, { useEffect, useMemo, useState } from 'react';
import { TreeView } from './components/TreeView';
import { AuthPanel } from './components/AuthPanel';
import { NewRootForm } from './components/NewRootForm';
import { TreeNode, User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function api<T>(
  path: string,
  options: RequestInit,
  token: string | null,
): Promise<T> {
  const res = await fetch(API_URL + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    let body: any = {};
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

function groupByRoot(nodes: TreeNode[]): Record<string, TreeNode[]> {
  const map: Record<string, TreeNode[]> = {};
  nodes.forEach((n) => {
    (map[n.rootId] ||= []).push(n);
  });
  return map;
}

export const App: React.FC = () => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<TreeNode[]>('/api/trees', { method: 'GET' }, null)
      .then(setNodes)
      .catch((e) => setError(e.message));
  }, []);

  const roots = useMemo(() => groupByRoot(nodes), [nodes]);

  const handleAuth = async (mode: 'login' | 'register', username: string, password: string) => {
    setError(null);
    try {
      const res = await api<{ token: string; user: User }>(
        '/api/auth/' + mode,
        {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        },
        null,
      );
      setUser(res.user);
      setToken(res.token);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCreateRoot = async (value: number) => {
    setError(null);
    try {
      const res = await api<{ node: TreeNode }>(
        '/api/trees',
        {
          method: 'POST',
          body: JSON.stringify({ value }),
        },
        token,
      );
      setNodes((prev) => [...prev, res.node]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleReply = async (parentId: string, op: 'add' | 'sub' | 'mul' | 'div', rightValue: number) => {
    setError(null);
    try {
      const res = await api<{ node: TreeNode }>(
        `/api/trees/${parentId}/operations`,
        {
          method: 'POST',
          body: JSON.stringify({ op, rightValue }),
        },
        token,
      );
      setNodes((prev) => [...prev, res.node]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Number Talk</h1>
      <p>People talk with numbers. Start a number or reply with an operation.</p>

      <AuthPanel
        user={user}
        onAuth={handleAuth}
        onLogout={() => {
          setUser(null);
          setToken(null);
        }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {user && <NewRootForm onCreate={handleCreateRoot} />}

      <hr />

      {Object.entries(roots).map(([rootId, list]) => (
        <TreeView
          key={rootId}
          nodes={list}
          canReply={!!user}
          onReply={handleReply}
        />
      ))}
    </div>
  );
};