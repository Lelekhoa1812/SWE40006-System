'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchJson } from '@/lib/api';

interface Subscription {
  id: string;
  patient: {
    id: string;
    username: string;
    email: string;
  };
  doctor: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    specialties: string[];
  };
  status: 'requested' | 'approved' | 'denied';
  requestedAt: string;
  approvedAt?: string;
  deniedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  fetchSubscriptions: () => Promise<void>;
  createSubscription: (doctorId: string) => Promise<Subscription>;
  updateSubscriptionStatus: (
    subscriptionId: string,
    status: 'approved' | 'denied'
  ) => Promise<Subscription>;
  clearError: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<{ subscriptions: Subscription[] }>(
        '/api/v1/subscriptions/mine'
      );
      setSubscriptions(data.subscriptions);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch subscriptions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubscription = useCallback(
    async (doctorId: string): Promise<Subscription> => {
      setError(null);
      try {
        const data = await fetchJson<{ subscription: Subscription }>(
          '/api/v1/subscriptions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ doctorId }),
          }
        );

        // Add the new subscription to the list
        setSubscriptions((prev) => [data.subscription, ...prev]);

        return data.subscription;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create subscription';
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateSubscriptionStatus = useCallback(
    async (
      subscriptionId: string,
      status: 'approved' | 'denied'
    ): Promise<Subscription> => {
      setError(null);
      try {
        const data = await fetchJson<{ subscription: Subscription }>(
          `/api/v1/subscriptions/${subscriptionId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          }
        );

        // Update the subscription in the list
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId ? data.subscription : sub
          )
        );

        return data.subscription;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update subscription';
        setError(message);
        throw err;
      }
    },
    []
  );

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        loading,
        error,
        fetchSubscriptions,
        createSubscription,
        updateSubscriptionStatus,
        clearError,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscriptions must be used within a SubscriptionProvider'
    );
  }
  return context;
}
