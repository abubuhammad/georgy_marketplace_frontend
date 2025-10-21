import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { sellerService } from '@/services/sellerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DebugAuth: React.FC = () => {
  const { user, login, logout } = useAuthContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('DebugAuth - Current user:', user);
  }, [user]);

  const handleLogin = async () => {
    console.log('Attempting login...');
    const result = await login({
      email: 'seller@test.com',
      password: 'seller123'
    });
    console.log('Login result:', result);
  };

  const handleLoadProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading profile for user:', user.id);
      const profileData = await sellerService.getSellerProfile(user.id);
      console.log('Profile data:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Profile loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔍 Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">User Status:</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          {!user ? (
            <Button onClick={handleLogin}>Login as Test Seller</Button>
          ) : (
            <>
              <Button onClick={handleLoadProfile} disabled={loading}>
                {loading ? 'Loading...' : 'Load Profile'}
              </Button>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </div>

        {profile && (
          <div>
            <h3 className="font-semibold">Profile Data:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded mt-2 max-h-96 overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugAuth;