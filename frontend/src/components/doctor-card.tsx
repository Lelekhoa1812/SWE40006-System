import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useSubscriptions } from '@/contexts/subscription-context';
import { PrivacyConsentModal } from '@/components/privacy-consent-modal';
import { useState } from 'react';

// Simple SVG icons
const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const MapPin = ({ className }: { className?: string }) => (
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
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const Phone = ({ className }: { className?: string }) => (
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
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const Mail = ({ className }: { className?: string }) => (
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
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const UserPlus = ({ className }: { className?: string }) => (
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
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

interface Doctor {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    avatar?: string;
  };
  medicalLicense: string;
  specialties: string[];
  bio?: string;
  location?: {
    address?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability?: {
    timezone: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
  };
  rating: number;
  reviewCount: number;
  consultationFee?: number;
  languages: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const { user } = useAuth();
  const { createSubscription, subscriptions } = useSubscriptions();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const fullName = `${doctor.profile.firstName} ${doctor.profile.lastName}`;
  const location = doctor.location
    ? `${doctor.location.city}, ${doctor.location.state}`
    : 'Location not specified';

  // Check if user has already subscribed to this doctor
  const existingSubscription = subscriptions.find(
    (sub) => sub.doctor.id === doctor.id
  );

  const checkConsent = () => {
    const consent = localStorage.getItem('medmsg-privacy-consent');
    if (!consent) {
      setShowConsentModal(true);
      return false;
    }

    try {
      const consentData = JSON.parse(consent);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (new Date(consentData.timestamp) < oneYearAgo) {
        setShowConsentModal(true);
        return false;
      }

      return true;
    } catch {
      setShowConsentModal(true);
      return false;
    }
  };

  const handleSubscribe = async () => {
    if (!user || user.role !== 'patient') return;

    if (!checkConsent()) {
      return;
    }

    setIsSubscribing(true);
    try {
      await createSubscription(doctor.id);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    // Retry subscription after consent
    handleSubscribe();
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="font-semibold text-lg">{fullName}</div>
        <div className="text-sm text-gray-500">
          {doctor.specialties
            .map((s) =>
              s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
            )
            .join(', ')}
        </div>
        {doctor.medicalLicense && (
          <div className="text-xs text-gray-400">
            License: {doctor.medicalLicense}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="text-sm text-gray-700 space-y-2 flex-1">
          {doctor.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{doctor.rating.toFixed(1)}</span>
              <span className="text-gray-500">
                ({doctor.reviewCount} reviews)
              </span>
            </div>
          )}

          {doctor.location && (
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}

          {doctor.profile.phone && (
            <div className="flex items-center space-x-1 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{doctor.profile.phone}</span>
            </div>
          )}

          <div className="flex items-center space-x-1 text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{doctor.email}</span>
          </div>

          {doctor.bio && (
            <div className="text-gray-600 text-xs line-clamp-3">
              {doctor.bio}
            </div>
          )}

          {doctor.consultationFee && (
            <div className="text-sm font-medium text-green-600">
              ${(doctor.consultationFee / 100).toFixed(2)} consultation fee
            </div>
          )}

          {doctor.languages.length > 0 && (
            <div className="text-xs text-gray-500">
              Languages: {doctor.languages.join(', ')}
            </div>
          )}
        </div>

        {/* Subscribe Button for Patients */}
        {user && user.role === 'patient' && (
          <div className="mt-4 pt-4 border-t">
            {existingSubscription ? (
              <div className="text-center">
                <span
                  className={`text-sm font-medium ${
                    existingSubscription.status === 'approved'
                      ? 'text-green-600'
                      : existingSubscription.status === 'denied'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                  }`}
                >
                  {existingSubscription.status === 'approved'
                    ? 'Subscribed'
                    : existingSubscription.status === 'denied'
                      ? 'Request Denied'
                      : 'Request Pending'}
                </span>
              </div>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="w-full"
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isSubscribing ? 'Requesting...' : 'Subscribe'}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <PrivacyConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </Card>
  );
}
