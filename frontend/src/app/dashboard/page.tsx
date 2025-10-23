'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {user.email}!</CardTitle>
                <CardDescription>
                  You are logged in as a {user.role}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Email: {user.email}</p>
              </CardContent>
            </Card>

            {user.role === 'patient' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Find Doctors</CardTitle>
                    <CardDescription>
                      Browse and connect with medical specialists
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => router.push('/doctors')}
                      className="w-full"
                    >
                      Browse Doctors
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>My Subscriptions</CardTitle>
                    <CardDescription>
                      View your subscription requests and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => router.push('/dashboard/my-subscriptions')}
                      variant="outline"
                      className="w-full"
                    >
                      View Subscriptions
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {user.role === 'doctor' && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Subscriptions</CardTitle>
                  <CardDescription>
                    Review and manage patient subscription requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push('/dashboard/subscriptions')}
                    className="w-full"
                  >
                    View Subscriptions
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/dashboard/profile')}
                  variant="outline"
                  className="w-full"
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
