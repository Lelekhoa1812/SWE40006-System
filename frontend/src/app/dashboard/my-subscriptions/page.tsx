'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSubscriptions } from '@/contexts/subscription-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MySubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscriptions, loading, error, fetchSubscriptions } =
    useSubscriptions();
  const router = useRouter();

  useEffect(() => {
    if (user && !authLoading) {
      fetchSubscriptions();
    }
  }, [user, authLoading, fetchSubscriptions]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'denied':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        );
      case 'requested':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
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

  if (user.role !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Only patients can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              My Subscriptions
            </h1>
            <p className="text-gray-600 mt-2">
              View your subscription requests to doctors
            </p>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No subscriptions yet
                </h3>
                <p className="text-gray-600 mb-4">
                  You haven&apos;t requested any doctor subscriptions yet.
                </p>
                <button
                  onClick={() => router.push('/doctors')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Browse doctors to get started
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Dr. {subscription.doctor.profile.firstName}{' '}
                        {subscription.doctor.profile.lastName}
                      </CardTitle>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Requested on {formatDate(subscription.requestedAt)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 mb-1">
                          Specialties:
                        </div>
                        <div className="text-gray-600">
                          {subscription.doctor.specialties
                            .map((s) =>
                              s
                                .replace('_', ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                            )
                            .join(', ')}
                        </div>
                      </div>

                      {subscription.status === 'approved' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center text-green-800 text-sm font-medium mb-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Subscription Approved
                          </div>
                          <p className="text-green-700 text-xs">
                            You can now communicate with this doctor through the
                            platform.
                          </p>
                        </div>
                      )}

                      {subscription.status === 'denied' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center text-red-800 text-sm font-medium mb-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Subscription Denied
                          </div>
                          <p className="text-red-700 text-xs">
                            This doctor has declined your subscription request.
                          </p>
                        </div>
                      )}

                      {subscription.status === 'requested' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center text-yellow-800 text-sm font-medium mb-1">
                            <Clock className="h-4 w-4 mr-2" />
                            Request Pending
                          </div>
                          <p className="text-yellow-700 text-xs">
                            Waiting for doctor approval. You&apos;ll be notified
                            once they respond.
                          </p>
                        </div>
                      )}

                      {subscription.status === 'approved' &&
                        subscription.approvedAt && (
                          <div className="text-sm text-green-600">
                            Approved on {formatDate(subscription.approvedAt)}
                          </div>
                        )}

                      {subscription.status === 'denied' &&
                        subscription.deniedAt && (
                          <div className="text-sm text-red-600">
                            Denied on {formatDate(subscription.deniedAt)}
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
