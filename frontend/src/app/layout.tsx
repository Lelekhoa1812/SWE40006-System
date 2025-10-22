import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/contexts/auth-context';
import { SubscriptionProvider } from '@/contexts/subscription-context';
import { SocketProvider } from '@/contexts/socket-context';
import { Toaster } from '@/components/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Medical Messenger',
  description: 'Connect with medical specialists for personalized healthcare',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SubscriptionProvider>
            <SocketProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </SocketProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
