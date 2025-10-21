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
// import { fetchJson } from '@/lib/api';
import type { Doctor } from '@/types/doctor';
import { DoctorCard } from '@/components/doctor-card';

const specialties = [
  '-- Select a specialty--',
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
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadDoctors = useCallback(async () => {
    console.log('loading docs');
    setError(null);
    setIsLoading(true);
    try {
      // const data = await fetchJson<Doctor[]>('/api/v1/doctors');
      const data: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Emily Carter',
          specialty: 'Cardiology',
          email: 'emily.carter@healthcare.com',
          phone: '+61 412 345 678',
          experience: 12,
          rating: 4.8,
          bio: 'Experienced cardiologist with a passion for preventive care and patient education.',
          availability: 'Mon-Fri 9am-5pm',
        },
        {
          id: '2',
          name: 'Dr. Rajiv Menon',
          specialty: 'Neurology',
          email: 'rajiv.menon@neuroclinic.com',
          phone: '+61 423 987 654',
          experience: 15,
          rating: 4.6,
          bio: 'Specialist in neurological disorders with a focus on epilepsy and stroke recovery.',
          availability: 'Tue-Thu 10am-4pm',
        },
        {
          id: '3',
          name: 'Dr. Sarah Nguyen',
          specialty: 'Psychiatry',
          email: 'sarah.nguyen@kidshealth.com',
          phone: '+61 400 123 456',
          experience: 8,
          rating: 4.9,
          bio: 'Pediatrician dedicated to child wellness and developmental milestones.',
          availability: 'Mon, Wed, Fri 8am-2pm',
        },
        {
          id: '4',
          name: "Dr. James O'Connor",
          specialty: 'Orthopedics',
          email: 'james.oconnor@bonecare.com',
          phone: '+61 455 678 901',
          experience: 10,
          rating: 4.7,
          bio: 'Orthopedic surgeon with expertise in sports injuries and joint replacement.',
          availability: 'Mon-Fri 10am-6pm',
        },
        {
          id: '5',
          name: 'Dr. Aisha Khan',
          specialty: 'Dermatology',
          email: 'aisha.khan@skincareclinic.com',
          phone: '+61 499 321 654',
          experience: 6,
          rating: 4.5,
          bio: 'Dermatologist focused on acne treatment, skin cancer screening, and cosmetic dermatology.',
          availability: 'Tue, Thu 11am-5pm',
        },
        {
          id: '6',
          name: 'Dr. Leo Tanaka',
          specialty: 'Endocrinology',
          email: 'leo.tanaka@endoclinic.com',
          phone: '+61 411 234 567',
          experience: 9,
          rating: 4.4,
          bio: 'Expert in hormonal disorders and diabetes management.',
          availability: 'Mon-Wed 9am-3pm',
        },
        {
          id: '7',
          name: 'Dr. Mia Thompson',
          specialty: 'Gastroenterology',
          email: 'mia.thompson@guthealth.com',
          phone: '+61 422 345 678',
          experience: 11,
          rating: 4.7,
          bio: 'Focused on digestive health and minimally invasive procedures.',
          availability: 'Tue-Fri 10am-4pm',
        },
        {
          id: '8',
          name: 'Dr. Oliver Grant',
          specialty: 'Oncology',
          email: 'oliver.grant@cancercenter.com',
          phone: '+61 433 456 789',
          experience: 14,
          rating: 4.8,
          bio: 'Specialist in cancer treatment and patient support.',
          availability: 'Mon-Fri 8am-5pm',
        },
        {
          id: '9',
          name: 'Dr. Chloe Martin',
          specialty: 'Psychiatry',
          email: 'chloe.martin@mentalwellness.com',
          phone: '+61 444 567 890',
          experience: 7,
          rating: 4.6,
          bio: 'Committed to mental health care and therapy.',
          availability: 'Mon, Wed, Fri 9am-1pm',
        },
        {
          id: '10',
          name: 'Dr. Ethan Wright',
          specialty: 'Dermatology',
          email: 'ethan.wright@uroclinic.com',
          phone: '+61 455 678 901',
          experience: 10,
          rating: 4.5,
          bio: 'Experienced in urinary tract and male reproductive health.',
          availability: 'Tue-Thu 11am-6pm',
        },
        {
          id: '11',
          name: 'Dr. Grace Lin',
          specialty: 'Dermatology',
          email: 'grace.lin@jointcare.com',
          phone: '+61 466 789 012',
          experience: 13,
          rating: 4.9,
          bio: 'Treats autoimmune and joint disorders with a holistic approach.',
          availability: 'Mon-Fri 9am-4pm',
        },
        {
          id: '12',
          name: 'Dr. Max Patel',
          specialty: 'Psychiatry',
          email: 'max.patel@lungclinic.com',
          phone: '+61 477 890 123',
          experience: 8,
          rating: 4.3,
          bio: 'Focuses on respiratory conditions and asthma management.',
          availability: 'Mon, Thu 10am-3pm',
        },
        {
          id: '13',
          name: 'Dr. Lily Roberts',
          specialty: 'Neurology',
          email: 'lily.roberts@eyecare.com',
          phone: '+61 488 901 234',
          experience: 6,
          rating: 4.6,
          bio: 'Provides eye exams and surgical treatments for vision issues.',
          availability: 'Tue-Fri 9am-5pm',
        },
        {
          id: '14',
          name: 'Dr. Noah Kim',
          specialty: 'Oncology',
          email: 'noah.kim@bloodcenter.com',
          phone: '+61 499 012 345',
          experience: 12,
          rating: 4.7,
          bio: 'Specialist in blood disorders and transfusion medicine.',
          availability: 'Mon-Wed 8am-2pm',
        },
        {
          id: '15',
          name: 'Dr. Ava Singh',
          specialty: 'Neurology',
          email: 'ava.singh@womenshealth.com',
          phone: '+61 400 123 456',
          experience: 10,
          rating: 4.8,
          bio: "Dedicated to women's health and prenatal care.",
          availability: 'Mon-Fri 10am-4pm',
        },
        {
          id: '16',
          name: 'Dr. Jack Wilson',
          specialty: 'Radiology',
          email: 'jack.wilson@imagingcenter.com',
          phone: '+61 411 234 567',
          experience: 9,
          rating: 4.4,
          bio: 'Expert in diagnostic imaging and interpretation.',
          availability: 'Tue-Thu 9am-5pm',
        },
        {
          id: '17',
          name: 'Dr. Zoe Adams',
          specialty: 'Endocrinology',
          email: 'zoe.adams@labservices.com',
          phone: '+61 422 345 678',
          experience: 11,
          rating: 4.5,
          bio: 'Analyzes lab results to support accurate diagnoses.',
          availability: 'Mon-Fri 8am-3pm',
        },
        {
          id: '18',
          name: 'Dr. Lucas Bennett',
          specialty: 'Endocrinology',
          email: 'lucas.bennett@kidneycare.com',
          phone: '+61 433 456 789',
          experience: 10,
          rating: 4.6,
          bio: 'Focuses on kidney health and dialysis treatment.',
          availability: 'Mon, Wed, Fri 10am-2pm',
        },
        {
          id: '19',
          name: 'Dr. Isla Murphy',
          specialty: 'Endocrinology',
          email: 'isla.murphy@allergyclinic.com',
          phone: '+61 444 567 890',
          experience: 7,
          rating: 4.7,
          bio: 'Treats allergies and immune system disorders.',
          availability: 'Tue-Thu 9am-1pm',
        },
        {
          id: '20',
          name: 'Dr. Henry Cooper',
          specialty: 'Oncology',
          email: 'henry.cooper@gpclinic.com',
          phone: '+61 455 678 901',
          experience: 5,
          rating: 4.2,
          bio: 'Provides comprehensive primary care and health screenings.',
          availability: 'Mon-Fri 8am-6pm',
        },
        {
          id: '21',
          name: 'Dr. Priya Nair',
          specialty: 'Oncology',
          email: 'priya.nair@oncocare.com',
          phone: '+61 412 345 678',
          experience: 12,
          rating: 4.8,
          bio: 'Specializes in breast and gynecologic cancers with a focus on patient-centered care.',
          availability: 'Mon-Wed 9am-5pm, Fri 10am-4pm',
        },
        {
          id: '22',
          name: 'Dr. Marcus Lee',
          specialty: 'Oncology',
          email: 'marcus.lee@healthfirst.com',
          phone: '+61 423 987 654',
          experience: 8,
          rating: 4.5,
          bio: 'Expert in immunotherapy and targeted treatments for lung and colorectal cancers.',
          availability: 'Tue-Thu 8am-6pm',
        },
        {
          id: '23',
          name: 'Dr. Aisha Rahman',
          specialty: 'Oncology',
          email: 'aisha.rahman@medixclinic.com',
          phone: '+61 400 111 222',
          experience: 15,
          rating: 4.9,
          bio: 'Renowned for her work in hematologic malignancies and clinical trials.',
          availability: 'Mon-Fri 9am-5pm',
        },
        {
          id: '24',
          name: 'Dr. Daniel Wong',
          specialty: 'Oncology',
          email: 'daniel.wong@cancerhub.org',
          phone: '+61 466 333 444',
          experience: 6,
          rating: 4.3,
          bio: 'Focuses on early detection and multidisciplinary treatment planning for prostate cancer.',
          availability: 'Mon, Wed, Fri 8am-4pm',
        },
        {
          id: '25',
          name: 'Dr. Emily Tran',
          specialty: 'Oncology',
          email: 'emily.tran@lifecare.com',
          phone: '+61 477 555 666',
          experience: 10,
          rating: 4.7,
          bio: 'Dedicated to supportive oncology and survivorship programs for long-term patient wellness.',
          availability: 'Tue-Fri 9am-6pm',
        },
        {
          id: '26',
          name: 'Dr. Julian Tran',
          specialty: 'Oncology',
          email: 'julian.tran@lifecare.com',
          phone: '+61 477 555 666',
          experience: 8,
          rating: 4.2,
          bio: 'Dedicated to supportive oncology and survivorship programs for long-term patient wellness.',
          availability: 'Tue-Thu 9am-6pm',
        },
      ];

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
      const matchesSpecialty = d.specialty === selectedSpecialty;
      return matchesTerm && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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

        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name  ..."
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
              (currentDoctors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No results found.</p>
                  <p className="text-gray-500">
                    Select a specialty and optionally to narrow down the results
                    search by a name.
                  </p>
                </div>
              ) : (
                currentDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              ))}
          </div>

          <div className="flex">
            <div className="flex flex-auto justify-end gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={i + 1 === currentPage ? 'default' : 'outline'}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
