'use client';

import React, { createContext, useContext, useState } from 'react';

interface Message {
  id: string;
  subscriptionId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

interface SocketContextType {
  messages: Message[];
  sendMessage: (subscriptionId: string, content: string, messageType?: string) => Promise<void>;
  joinRoom: (subscriptionId: string) => void;
  leaveRoom: (subscriptionId: string) => void;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  const sendMessage = async (subscriptionId: string, content: string, messageType = 'text') => {
    // Mock message sending
    console.log('Send message:', subscriptionId, content, messageType);
  };

  const joinRoom = (subscriptionId: string) => {
    // Mock join room
    console.log('Join room:', subscriptionId);
  };

  const leaveRoom = (subscriptionId: string) => {
    // Mock leave room
    console.log('Leave room:', subscriptionId);
  };

  return (
    <SocketContext.Provider value={{ 
      messages, 
      sendMessage, 
      joinRoom, 
      leaveRoom, 
      connected 
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
