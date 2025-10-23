'use client';

import React, { createContext, useContext, useState } from 'react';

interface Subscription {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'requested' | 'approved' | 'denied' | 'cancelled';
  requestMessage?: string;
  responseMessage?: string;
  requestedAt: string;
  respondedAt?: string;
  isActive: boolean;
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  createSubscription: (
    doctorId: string,
    requestMessage: string
  ) => Promise<void>;
  updateSubscriptionStatus: (
    subscriptionId: string,
    status: string,
    responseMessage?: string
  ) => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscriptions] = useState<Subscription[]>([]);
  const [loading] = useState(false);

  const createSubscription = async (
    doctorId: string,
    requestMessage: string
  ) => {
    // Mock subscription creation
    console.log('Create subscription:', doctorId, requestMessage);
  };

  const updateSubscriptionStatus = async (
    subscriptionId: string,
    status: string,
    responseMessage?: string
  ) => {
    // Mock subscription update
    console.log(
      'Update subscription:',
      subscriptionId,
      status,
      responseMessage
    );
  };

  const fetchSubscriptions = async () => {
    // Mock fetch subscriptions
    console.log('Fetch subscriptions');
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        createSubscription,
        updateSubscriptionStatus,
        fetchSubscriptions,
        loading,
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
