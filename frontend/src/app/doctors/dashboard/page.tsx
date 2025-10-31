'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

interface SubscriptionUserRef {
  _id: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  username?: string;
  email?: string;
}

interface Subscription {
  _id: string;
  patientId: SubscriptionUserRef;
  doctorId: SubscriptionUserRef;
  status: 'requested' | 'approved' | 'denied';
  requestMessage: string;
  responseMessage?: string;
  requestedAt: string;
  respondedAt?: string;
  isActive: boolean;
  metadata: {
    consentGiven: boolean;
  };
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef<string | null>(null); // track last user.id loaded to avoid duplicate loads

  const loadSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/subscriptions/mine`,
        {
          headers: {
            // Send user information as headers for authentication
            'x-test-user-id': user?.id || '',
            'x-test-user-role': user?.role || '',
            'x-test-username': user?.username || '',
            'x-test-user-email': user?.email || '',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Subscriptions loaded:', data);
        setSubscriptions(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          `Failed to load subscriptions: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (err) {
      console.error('Error loading subscriptions:', err);
      setError('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, user?.username, user?.email]);

  const handleSubscriptionAction = async (
    subscriptionId: string,
    status: 'approved' | 'denied',
    responseMessage?: string
  ) => {
    try {
      console.log('🔍 Subscription Action Debug:', {
        subscriptionId,
        status,
        responseMessage,
        user: user,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/subscriptions/${subscriptionId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            // Send user information as headers for authentication
            'x-test-user-id': user?.id || '',
            'x-test-user-role': user?.role || '',
            'x-test-username': user?.username || '',
            'x-test-user-email': user?.email || '',
          },
          body: JSON.stringify({ status, responseMessage }),
        }
      );

      if (response.ok) {
        // Reload subscriptions
        await loadSubscriptions();
        alert(`Subscription ${status} successfully`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to update subscription');
    }
  };

  useEffect(() => {
    // Only load once per distinct doctor user id to prevent infinite reloads
    if (user?.role === 'doctor' && user.id) {
      if (hasLoadedRef.current !== user.id) {
        hasLoadedRef.current = user.id;
        void loadSubscriptions();
      }
    }
  }, [user?.role, user?.id, loadSubscriptions]);

  if (user?.role !== 'doctor') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">Only doctors can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Doctor Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your patient subscription requests and communications.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading subscriptions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button onClick={loadSubscriptions} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subscription requests
              </h3>
              <p className="text-gray-500">
                You don&apos;t have any pending subscription requests from
                patients.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {subscriptions.map((subscription) => {
                const profile = subscription.patientId?.profile;
                const first = profile?.firstName?.trim();
                const last = profile?.lastName?.trim();
                const username = subscription.patientId?.username;
                const email = subscription.patientId?.email;

                const fullFromProfile = [first, last]
                  .filter(Boolean)
                  .join(' ')
                  .trim();

                const patientName =
                  fullFromProfile || username || email || 'Unknown Patient';

                return (
                  <Card key={subscription._id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{patientName}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subscription.status === 'requested'
                              ? 'bg-yellow-100 text-yellow-800'
                              : subscription.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subscription.status.toUpperCase()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Request Message:
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {subscription.requestMessage}
                          </p>
                        </div>

                        {subscription.responseMessage && (
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Your Response:
                            </h4>
                            <p className="text-gray-600 mt-1">
                              {subscription.responseMessage}
                            </p>
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          Requested:{' '}
                          {new Date(
                            subscription.requestedAt
                          ).toLocaleDateString()}
                          {subscription.respondedAt && (
                            <span>
                              {' '}
                              • Responded:{' '}
                              {new Date(
                                subscription.respondedAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {subscription.status === 'requested' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() =>
                                handleSubscriptionAction(
                                  subscription._id,
                                  'approved',
                                  'Your subscription request has been approved. You can now start messaging with me.'
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() =>
                                handleSubscriptionAction(
                                  subscription._id,
                                  'denied',
                                  'Your subscription request has been denied.'
                                )
                              }
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Deny
                            </Button>
                          </div>
                        )}

                        {subscription.status === 'approved' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => {
                                // Navigate to chat page
                                window.location.href = `/chat/${subscription._id}`;
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Start Chat
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
