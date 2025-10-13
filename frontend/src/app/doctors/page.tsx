'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchJson } from '@/lib/api';
import type { Doctor } from '@/types/doctor';
import { DoctorCard } from '@/components/doctor-card';

const specialties = [
  'All Specialties',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
];

const DoctorCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
  </Card>
);

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loadDoctors = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await fetchJson<Doctor[]>('/api/v1/doctors');
      setDoctors(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load doctors';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  const handleSearch = () => {
    void loadDoctors();
  };

  const filteredDoctors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchesTerm = term
        ? d.name.toLowerCase().includes(term) ||
          d.specialty.toLowerCase().includes(term)
        : true;
      const matchesSpecialty =
        selectedSpecialty === 'All Specialties' ||
        d.specialty === selectedSpecialty;
      return matchesTerm && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

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

        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, location, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}

            {!isLoading && error && (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!isLoading &&
              !error &&
              (filteredDoctors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No doctors found.</p>
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
