// app/doctors/[id]/page.tsx
import DoctorChat from './DoctorChat';
import { fetchJson } from '@/lib/api';
import type { Doctor } from '@/types/doctor';

interface DoctorPageProps {
  params: { id: string };
}

// 1️⃣ Tell Next.js which doctor IDs to pre-render (required for static export)
export async function generateStaticParams() {
  try {
    const doctors = await fetchJson<Doctor[]>('/api/v1/doctors');
    return doctors.map((doctor) => ({
      id: doctor.id.toString(),
    }));
  } catch (error) {
    console.error('Failed to fetch doctors for static params:', error);
    return [];
  }
}

// 2️⃣ Fetch the doctor info server-side
export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = params;

  let doctor: Doctor | null = null;

  try {
    doctor = await fetchJson<Doctor>(`/api/v1/doctors/${id}`);
  } catch (err) {
    console.error('Failed to fetch doctor:', err);
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>Doctor not found.</p>
      </div>
    );
  }

  // 3️⃣ Render the client-side chat component
  return <DoctorChat doctor={doctor} patientId={''} />;
}
