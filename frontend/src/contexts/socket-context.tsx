'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/env';
import { useAuth } from './auth-context';

interface Message {
  id: string;
  subscriptionId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  sendMessage: (
    subscriptionId: string,
    content: string,
    messageType?: 'text' | 'image' | 'file' | 'system'
  ) => void;
  joinRoom: (subscriptionId: string) => void;
  leaveRoom: (subscriptionId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  clearMessages: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize socket connection
  useEffect(() => {
    if (!user || authLoading) return;

    const newSocket = io(env.NEXT_PUBLIC_API_BASE_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        // In a real implementation, you would pass a proper session token
        // For now, we'll rely on cookies for authentication
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Message events
    newSocket.on('message_received', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on(
      'message_delivered',
      (data: { messageId: string; status: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, status: data.status as 'delivered' }
              : msg
          )
        );
      }
    );

    newSocket.on(
      'message_read',
      (data: { messageId: string; status: string; readBy: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, status: data.status as 'read' }
              : msg
          )
        );
      }
    );

    newSocket.on(
      'message_history',
      (data: { subscriptionId: string; messages: Message[] }) => {
        setMessages(data.messages);
      }
    );

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, authLoading]);

  const sendMessage = useCallback(
    (
      subscriptionId: string,
      content: string,
      messageType: 'text' | 'image' | 'file' | 'system' = 'text'
    ) => {
      if (socket && isConnected) {
        socket.emit('message_send', {
          subscriptionId,
          content,
          messageType,
        });
      }
    },
    [socket, isConnected]
  );

  const joinRoom = useCallback(
    (subscriptionId: string) => {
      if (socket && isConnected) {
        socket.emit('join_room', { subscriptionId });
      }
    },
    [socket, isConnected]
  );

  const leaveRoom = useCallback(
    (subscriptionId: string) => {
      if (socket && isConnected) {
        socket.leave(`subscription_${subscriptionId}`);
      }
    },
    [socket, isConnected]
  );

  const markMessageAsRead = useCallback(
    (messageId: string) => {
      if (socket && isConnected) {
        socket.emit('message_read', { messageId });
      }
    },
    [socket, isConnected]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        sendMessage,
        joinRoom,
        leaveRoom,
        markMessageAsRead,
        clearMessages,
      }}
    >
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
