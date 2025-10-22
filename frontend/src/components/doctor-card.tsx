import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useSubscriptions } from '@/contexts/subscription-context';
import { PrivacyConsentModal } from '@/components/privacy-consent-modal';
import { useState } from 'react';

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
