import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock SSO tokens for demo
  const mockSSOTokens = {
    'admin@company.com': 'mock-sso-token-admin',
    'user@company.com': 'mock-sso-token-user',
    'noaccess@company.com': 'mock-sso-token-noaccess'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast({
        title: 'Selection Required',
        description: 'Please select a user to simulate SSO login.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const ssoToken = mockSSOTokens[selectedUser as keyof typeof mockSSOTokens];
      await login(ssoToken);
      navigate('/');
    } catch (error) {
      toast({
        title: 'SSO Login Failed',
        description: 'SSO authentication failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SSO Authentication</CardTitle>
          <CardDescription>
            Authenticate via Single Sign-On to access the Job Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user for SSO demo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin@company.com">Admin User (Has Access)</SelectItem>
                  <SelectItem value="user@company.com">Regular User (Has Access)</SelectItem>
                  <SelectItem value="noaccess@company.com">No Access User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Authenticate with SSO'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Demo SSO Users:</p>
            <div className="text-xs space-y-1">
              <div>• Admin User - Full system access</div>
              <div>• Regular User - Standard access</div>
              <div>• No Access User - Access denied</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;