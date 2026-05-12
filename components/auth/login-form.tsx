'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { DEMO_ACCOUNT_GROUPS, type DemoAccountGroup } from '@/lib/demo-accounts';

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
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-foreground">Demo Accounts</h2>
              <span className="text-xs font-medium text-destructive">Development Only</span>
            </div>
            <div className="space-y-5">
              {DEMO_ACCOUNT_GROUPS.map((group: DemoAccountGroup) => {
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
