import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Doctor } from '@/types/doctor';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const router = useRouter();

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
        <Button
          className="mt-5"
          onClick={() => router.push(`/doctors/${doctor.id}`)}
        >
          Subscribe
        </Button>
      </CardContent>

      <PrivacyConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </Card>
  );
}
