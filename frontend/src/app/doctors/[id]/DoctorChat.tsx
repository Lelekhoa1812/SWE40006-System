'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Doctor } from '@/types/doctor';

interface DoctorChatProps {
  doctor: Doctor;
  patientId: string; // you need the logged-in patient's id
}

interface Message {
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  _id?: string;
}

export default function DoctorChat({ doctor, patientId }: DoctorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const socket = io('http://localhost:4000', { withCredentials: true });
    socketRef.current = socket;

    // join doctor room
    socket.emit('joinRoom', doctor.id.toString());

    // listen for incoming messages
    socket.on('receiveMessage', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [doctor.id]);

  const sendMessage = async () => {
    if (!input.trim() || !socketRef.current) return;

    const msg: Message = {
      message: input,
      sender: 'patient',
      timestamp: new Date().toISOString(),
    };

    // optimistically add message
    setInput('');

    // emit to server
    socketRef.current.emit('sendMessage', {
      doctorId: doctor.id,
      message: msg.message,
      sender: 'patient',
    });

    // persist message via API
    try {
      await fetch('http://localhost:4000/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: patientId,
          toUserId: doctor.id,
          subscriptionId: 'dummy-subscription-id', // replace with real subscriptionId
          body: msg.message,
        }),
      });
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{doctor.name}</h1>
      <p className="text-gray-600 mb-4">{doctor.specialty}</p>

      <div className="border rounded p-4 h-96 overflow-y-auto mb-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.sender === 'patient' ? 'text-right' : 'text-left'}`}
          >
            <p className="inline-block p-2 rounded bg-gray-200">{m.message}</p>
            <div className="text-xs text-gray-400">
              {new Date(m.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
