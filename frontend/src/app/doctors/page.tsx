'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Simple SVG icons
const Search = ({ className }: { className?: string }) => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

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

const MessageCircle = ({ className }: { className?: string }) => (
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
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

interface Doctor {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  specialties: string[];
  bio?: string;
  location?: {
    city: string;
    state: string;
  };
  rating: number;
  reviewCount: number;
  consultationFee?: number;
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const fullName = `${doctor.profile.firstName} ${doctor.profile.lastName}`;
  const location = doctor.location
    ? `${doctor.location.city}, ${doctor.location.state}`
    : 'Location not specified';

  const handleSubscribe = () => {
    alert(
      `Subscribe to ${fullName} - This would normally open a subscription form`
    );
  };

  const handleChat = () => {
    alert(
      `Start chat with ${fullName} - This would normally open a chat interface`
    );
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
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          <Button onClick={handleSubscribe} className="w-full" size="sm">
            Subscribe
          </Button>
          <Button
            onClick={handleChat}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loadDoctors = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '12',
      });

      if (searchTerm.trim()) {
        params.append('q', searchTerm.trim());
      }

      const response = await fetch(
        `https://medmsg-railway-production.up.railway.app/api/v1/doctors?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load doctors';
      setError(message);
      console.error('Failed to load doctors:', message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleSearch = () => {
    loadDoctors();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Find Medical Specialists
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search our directory of verified medical professionals and connect
            with specialists in your area.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && (
              <div className="col-span-full text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading doctors...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadDoctors} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}

            {!isLoading &&
              !error &&
              (doctors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No doctors found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search criteria to find more doctors.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      loadDoctors();
                    }}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
