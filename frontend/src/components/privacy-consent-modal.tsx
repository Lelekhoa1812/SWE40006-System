'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simple SVG icons
const Shield = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const ExternalLink = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function PrivacyConsentModal({
  isOpen,
  onAccept,
  onDecline,
}: PrivacyConsentModalProps) {
  const [hasRead, setHasRead] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setHasRead(false);
      setIsAccepted(false);
    }
  }, [isOpen]);

  const handleAccept = () => {
    if (hasRead && isAccepted) {
      // Store consent in localStorage
      const consentData = {
        acknowledged: true,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
      localStorage.setItem(
        'medmsg-privacy-consent',
        JSON.stringify(consentData)
      );
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            Privacy Notice for Doctor Subscriptions
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Please read and acknowledge our privacy policy before requesting
            doctor subscriptions.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800">
              Your privacy is important to us. This notice explains how we
              handle your data when you request doctor subscriptions.
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Data Sharing
              </h3>
              <p className="text-gray-700">
                Your basic profile information (name, email) will be shared with
                the requested doctor for review purposes. This allows doctors to
                make informed decisions about subscription requests.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2. Communication
              </h3>
              <p className="text-gray-700">
                If your subscription is approved, you may receive communications
                from the doctor through our secure platform. All communications
                are encrypted and stored securely.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Medical Information
              </h3>
              <p className="text-gray-700">
                Any medical information you share will be protected under
                applicable healthcare privacy laws, including HIPAA compliance
                measures.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                4. Data Retention
              </h3>
              <p className="text-gray-700">
                Your subscription data will be retained for the duration of your
                relationship with the doctor and as required by law. You can
                request data deletion at any time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                5. Your Rights
              </h3>
              <p className="text-gray-700">
                You have the right to access, correct, or delete your data. You
                may withdraw your consent at any time by canceling your
                subscription request.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="has-read"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="has-read" className="text-sm text-gray-700">
                I have read and understood the privacy notice above
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                I consent to the sharing of my profile information with doctors
                for subscription review purposes
              </label>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-4">
              For more information, please read our full{' '}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                Privacy Policy
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </p>
          </div>

          <div className="flex space-x-4">
            <Button onClick={onDecline} variant="outline" className="flex-1">
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!hasRead || !isAccepted}
              className="flex-1"
            >
              I Agree
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
