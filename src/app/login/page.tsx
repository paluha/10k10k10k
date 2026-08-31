'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.push('/crm');
    } else {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={submit} style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
          10K<span style={{ color: 'var(--green)' }}>Traffic</span> CRM
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          autoFocus
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '13px 16px',
            color: 'var(--text)',
            fontSize: 15,
          }}
        />
        <button
          type="submit"
          disabled={busy || !password}
          style={{
            background: 'var(--green)',
            color: '#000',
            fontWeight: 700,
            fontSize: 15,
            padding: '13px 16px',
            borderRadius: 'var(--radius-sm)',
            opacity: busy || !password ? 0.5 : 1,
          }}
        >
          {busy ? '...' : 'Войти'}
        </button>
        {error && <div style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center' }}>Неверный пароль</div>}
      </form>
    </div>
  );
}
