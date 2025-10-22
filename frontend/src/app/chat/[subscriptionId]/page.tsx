'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSocket } from '@/contexts/socket-context';
import { useSubscriptions } from '@/contexts/subscription-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
// import { fetchJson } from '@/lib/api';

// interface Message {
//   id: string;
//   subscriptionId: string;
//   fromUserId: string;
//   toUserId: string;
//   content: string;
//   messageType: 'text' | 'image' | 'file' | 'system';
//   status: 'sent' | 'delivered' | 'read';
//   createdAt: string;
// }

interface Subscription {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'requested' | 'approved' | 'denied' | 'cancelled';
  patient?: {
    id: string;
    username: string;
    email: string;
  };
  doctor?: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    specialties: string[];
  };
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    isConnected,
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    clearMessages,
  } = useSocket();
  const { subscriptions } = useSubscriptions();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionId = params.subscriptionId as string;

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load subscription details and join room
  useEffect(() => {
    if (!user || authLoading || !subscriptionId) return;

    const loadSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // Find subscription in context first
        const foundSubscription = subscriptions.find(
          (sub) => sub.id === subscriptionId
        );

        if (foundSubscription) {
          setSubscription(foundSubscription);

          // Check if user has access
          if (foundSubscription.status !== 'approved') {
            router.push('/chat/no-access');
            return;
          }

          if (
            foundSubscription.patientId !== user.id &&
            foundSubscription.doctorId !== user.id
          ) {
            router.push('/chat/no-access');
            return;
          }

          // Join the chat room
          if (isConnected) {
            joinRoom(subscriptionId);
          }
        } else {
          router.push('/chat/no-access');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();

    // Cleanup on unmount
    return () => {
      if (subscriptionId) {
        leaveRoom(subscriptionId);
        clearMessages();
      }
    };
  }, [
    user,
    authLoading,
    subscriptionId,
    subscriptions,
    isConnected,
    joinRoom,
    leaveRoom,
    clearMessages,
    router,
  ]);

  // Join room when socket connects
  useEffect(() => {
    if (isConnected && subscription && subscription.status === 'approved') {
      joinRoom(subscriptionId);
    }
  }, [isConnected, subscription, subscriptionId, joinRoom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !subscription) return;

    setSending(true);
    try {
      sendMessage(subscriptionId, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getOtherUser = () => {
    if (!subscription || !user) return null;

    if (user.role === 'patient') {
      return subscription.doctor;
    } else {
      return subscription.patient;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Subscription not found</div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <CardTitle className="text-lg">
                  Chat with {otherUser?.username || 'Unknown User'}
                </CardTitle>
                {subscription.doctor && (
                  <p className="text-sm text-gray-600">
                    Dr. {subscription.doctor.profile.firstName}{' '}
                    {subscription.doctor.profile.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="h-96 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.fromUserId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                      {isOwnMessage && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending || !isConnected}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || !isConnected}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-red-500 mt-2">
              Disconnected from chat server. Trying to reconnect...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
