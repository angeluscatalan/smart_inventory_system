'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Shield, Building2, UserCheck } from 'lucide-react';

interface DemoAccount {
  label: string;
  username: string;
  password: string;
  subtitle: string;
}

const demoAccounts: { title: string; icon: React.ComponentType<{ className?: string }>; accounts: DemoAccount[] }[] = [
  {
    title: 'Administrator',
    icon: Shield,
    accounts: [
      { label: 'Admin', username: 'admin', password: 'password123', subtitle: 'Full access' },
    ],
  },
  {
    title: 'Branch Managers',
    icon: Building2,
    accounts: [
      { label: 'Maria Santos', username: 'manila_manager', password: 'manila2024', subtitle: 'Manila Branch' },
      { label: 'Juan Dela Cruz', username: 'cebu_manager', password: 'cebu2024', subtitle: 'Cebu Branch' },
      { label: 'Rosa Garcia', username: 'davao_manager', password: 'davao2024', subtitle: 'Davao Branch' },
    ],
  },
  {
    title: 'Staff',
    icon: UserCheck,
    accounts: [
      { label: 'Anna Lopez', username: 'manila_staff', password: 'staff123', subtitle: 'Manila Branch' },
      { label: 'Miguel Rodriguez', username: 'cebu_staff', password: 'staff123', subtitle: 'Cebu Branch' },
      { label: 'Christine Reyes', username: 'davao_staff', password: 'staff123', subtitle: 'Davao Branch' },
    ],
  },
];

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(username, password);

    if (success) {
      router.push('/');
    } else {
      setError('Invalid username or password');
      setPassword('');
    }

    setIsLoading(false);
  };

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    setError('');
    setIsLoading(true);
    setUsername(demoUsername);
    setPassword(demoPassword);

    const success = await login(demoUsername, demoPassword);

    if (success) {
      router.push('/');
    } else {
      setError('Demo login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Form */}
        <Card className="border border-border shadow-lg">
          <div className="p-8">
            <div className="mb-8">
              <p className="text-muted-foreground">InvSys PH - Smart Inventory System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </Card>

        {/* Demo Accounts Panel */}
        <Card className="border border-border shadow-lg">
          <div className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Demo Accounts</h2>
            <div className="space-y-5">
              {demoAccounts.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.title}>
                    <div className="flex items-center gap-2 mb-2">
                      <GroupIcon className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {group.accounts.map((account) => (
                        <button
                          key={account.username}
                          onClick={() => handleDemoLogin(account.username, account.password)}
                          disabled={isLoading}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:bg-secondary hover:border-primary/40 transition-all text-left disabled:opacity-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{account.label}</p>
                            <p className="text-xs text-muted-foreground">{account.subtitle}</p>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{account.username}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
