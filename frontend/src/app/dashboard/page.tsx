'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            Please sign in to access your dashboard.
          </p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.username}! ({user.role})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Browse our directory of medical professionals and specialists.
              </p>
              <Link href="/doctors">
                <Button className="w-full">Browse Doctors</Button>
              </Link>
            </CardContent>
          </Card>

          {user.role === 'patient' && (
            <Card>
              <CardHeader>
                <CardTitle>My Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  View and manage your doctor subscriptions.
                </p>
                <Link href="/dashboard/subscriptions">
                  <Button className="w-full">View Subscriptions</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {user.role === 'doctor' && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Review and manage patient subscription requests.
                </p>
                <Link href="/dashboard/requests">
                  <Button className="w-full">View Requests</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {user.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access administrative functions and audit logs.
                </p>
                <Link href="/admin/audit">
                  <Button className="w-full">Admin Panel</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Update your profile information and preferences.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
