'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSubscriptions } from '@/contexts/subscription-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, User, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    updateSubscriptionStatus,
  } = useSubscriptions();
  const [updating, setUpdating] = useState<string | null>(null);
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

  const handleStatusUpdate = async (
    subscriptionId: string,
    status: 'approved' | 'denied'
  ) => {
    setUpdating(subscriptionId);
    try {
      await updateSubscriptionStatus(subscriptionId, status);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    } finally {
      setUpdating(null);
    }
  };

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

  if (user.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Only doctors can access this page.</p>
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
              Subscription Requests
            </h1>
            <p className="text-gray-600 mt-2">
              Manage patient subscription requests
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
                  No subscription requests
                </h3>
                <p className="text-gray-600">
                  You don&apos;t have any pending subscription requests at the
                  moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {subscription.patient.username}
                      </CardTitle>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Requested on {formatDate(subscription.requestedAt)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{subscription.patient.email}</span>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium text-gray-900 mb-1">
                          Doctor Details:
                        </div>
                        <div className="text-gray-600">
                          Dr. {subscription.doctor.profile.firstName}{' '}
                          {subscription.doctor.profile.lastName}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {subscription.doctor.specialties
                            .map((s) =>
                              s
                                .replace('_', ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                            )
                            .join(', ')}
                        </div>
                      </div>

                      {subscription.status === 'requested' && (
                        <div className="flex space-x-2 pt-4">
                          <Button
                            onClick={() =>
                              handleStatusUpdate(subscription.id, 'approved')
                            }
                            disabled={updating === subscription.id}
                            size="sm"
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {updating === subscription.id
                              ? 'Approving...'
                              : 'Approve'}
                          </Button>
                          <Button
                            onClick={() =>
                              handleStatusUpdate(subscription.id, 'denied')
                            }
                            disabled={updating === subscription.id}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {updating === subscription.id
                              ? 'Denying...'
                              : 'Deny'}
                          </Button>
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
