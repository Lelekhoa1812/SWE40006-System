import { connectDatabase } from '../../database/connection';
import { Doctor } from '../../database/models/Doctor';
import bcrypt from 'bcryptjs';

// Sample doctors that match the actual database structure
const sampleDoctors = [
  {
    username: 'dr.smith',
    email: 'dr.smith@example.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Dr. John',
      lastName: 'Smith',
      phone: '+1-555-0101',
      dateOfBirth: new Date('1975-04-10'),
    },
    isActive: true,
    medicalLicense: 'MD123456',
    specialties: ['cardiology', 'internal_medicine'],
    rating: 4.8,
    reviewCount: 127,
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
    },
    bio: 'Experienced cardiologist with 15 years of practice. Specializes in heart disease prevention and treatment.',
    consultationFee: 20000, // $200.00 in cents
    languages: ['English', 'Spanish'],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
  {
    username: 'dr.johnson',
    email: 'dr.johnson@example.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0102',
      dateOfBirth: new Date('1980-08-25'),
    },
    isActive: true,
    medicalLicense: 'MD123457',
    specialties: ['dermatology'],
    rating: 4.6,
    reviewCount: 89,
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
    },
    bio: 'Board-certified dermatologist specializing in cosmetic and medical dermatology. Over 10 years of experience.',
    consultationFee: 15000, // $150.00 in cents
    languages: ['English'],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
  {
    username: 'dr.williams',
    email: 'dr.williams@example.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Dr. Michael',
      lastName: 'Williams',
      phone: '+1-555-0103',
      dateOfBirth: new Date('1972-12-03'),
    },
    isActive: true,
    medicalLicense: 'MD123458',
    specialties: ['pediatrics', 'general_practice'],
    rating: 4.9,
    reviewCount: 203,
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
    },
    bio: 'Pediatrician with 12 years of experience caring for children from birth to adolescence.',
    consultationFee: 12000, // $120.00 in cents
    languages: ['English', 'French'],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
  {
    username: 'dr.brown',
    email: 'dr.brown@example.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Dr. Emily',
      lastName: 'Brown',
      phone: '+1-555-0104',
      dateOfBirth: new Date('1983-06-18'),
    },
    isActive: true,
    medicalLicense: 'MD123459',
    specialties: ['psychiatry'],
    rating: 4.7,
    reviewCount: 156,
    location: {
      city: 'Boston',
      state: 'MA',
      country: 'USA',
    },
    bio: 'Licensed psychiatrist specializing in anxiety, depression, and mood disorders.',
    consultationFee: 18000, // $180.00 in cents
    languages: ['English'],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
  {
    username: 'dr.davis',
    email: 'dr.davis@example.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Dr. Robert',
      lastName: 'Davis',
      phone: '+1-555-0105',
      dateOfBirth: new Date('1970-01-14'),
    },
    isActive: true,
    medicalLicense: 'MD123460',
    specialties: ['orthopedics', 'surgery'],
    rating: 4.5,
    reviewCount: 98,
    location: {
      city: 'Houston',
      state: 'TX',
      country: 'USA',
    },
    bio: 'Orthopedic surgeon with expertise in joint replacement and sports medicine.',
    consultationFee: 22000, // $220.00 in cents
    languages: ['English', 'Spanish'],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
];

async function seedFixedDoctors() {
  try {
    console.log('🌱 Starting fixed doctor seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('🗑️  Cleared existing doctors');

    // Hash passwords and create doctors
    for (const doctorData of sampleDoctors) {
      const hashedPassword = await bcrypt.hash(doctorData.password, 12);

      const doctor = new Doctor({
        ...doctorData,
        password: hashedPassword,
      });

      await doctor.save();
      console.log(
        `✅ Created doctor: ${doctorData.profile.firstName} ${doctorData.profile.lastName}`
      );
    }

    console.log(`🎉 Successfully seeded ${sampleDoctors.length} doctors!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedFixedDoctors();
}

export { seedFixedDoctors };
