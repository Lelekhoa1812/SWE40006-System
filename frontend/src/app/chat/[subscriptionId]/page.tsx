'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useParams } from 'next/navigation';

interface Message {
  _id: string;
  content: string;
  fromUserId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  toUserId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  senderRole: 'patient' | 'doctor';
  createdAt: string;
  status: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const subscriptionId = params.subscriptionId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/messages/${subscriptionId}`,
        {
          headers: {
            'x-test-user-id': user?.id || '68fa4142885c903d84b6868d',
            'x-test-user-role': user?.role || 'patient',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-test-user-id': user?.id || '68fa4142885c903d84b6868d',
            'x-test-user-role': user?.role || 'patient',
          },
          body: JSON.stringify({
            subscriptionId,
            content: newMessage.trim(),
            messageType: 'text',
          }),
        }
      );

      if (response.ok) {
        setNewMessage('');
        // Reload messages
        await loadMessages();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          `Failed to send message: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (subscriptionId) {
      loadMessages();
    }
  }, [subscriptionId, loadMessages]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Chat
          </h1>
          <p className="text-lg text-gray-600">
            {user.role === 'doctor' ? 'Patient' : 'Doctor'} Conversation
          </p>
        </div>

        <Card className="h-96 flex flex-col">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading messages...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={loadMessages} className="mt-4">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => {
                  const isFromCurrentUser = message.fromUserId._id === user.id;

                  // Use the senderRole field for accurate identification
                  const senderName =
                    message.senderRole === 'doctor' ? 'Doctor' : 'Patient';

                  // Determine if this message should be on the right (current user) or left (other user)
                  const isCurrentUserMessage = isFromCurrentUser;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUserMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {senderName}
                        </div>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
                disabled={isSending}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
