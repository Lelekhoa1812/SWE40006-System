import { connectDatabase } from '../database/connection';
import { Doctor } from '../database/models/Doctor';
import bcrypt from 'bcryptjs';

const sampleDoctors = [
  {
    email: 'dr.smith@example.com',
    password: 'password123',
    role: 'doctor',
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-0123',
      gender: 'male',
    },
    medicalLicense: 'MD123456',
    specialties: ['cardiology', 'general_practice'],
    bio: 'Experienced cardiologist with over 15 years of practice. Specializes in interventional cardiology and preventive care.',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'US',
      postalCode: '10001',
      coordinates: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
    availability: {
      timezone: 'America/New_York',
      schedule: [
        {
          day: 'monday',
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
        {
          day: 'tuesday',
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
        {
          day: 'wednesday',
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
        {
          day: 'thursday',
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
        {
          day: 'friday',
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
      ],
    },
    rating: 4.8,
    reviewCount: 127,
    consultationFee: 15000, // $150.00 in cents
    languages: ['en', 'es'],
    isActive: true,
    emailVerified: true,
  },
  {
    email: 'dr.johnson@example.com',
    password: 'password123',
    role: 'doctor',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0124',
      gender: 'female',
    },
    medicalLicense: 'MD123457',
    specialties: ['dermatology'],
    bio: 'Board-certified dermatologist specializing in cosmetic and medical dermatology. Over 10 years of experience.',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'US',
      postalCode: '90210',
      coordinates: {
        lat: 34.0522,
        lng: -118.2437,
      },
    },
    availability: {
      timezone: 'America/Los_Angeles',
      schedule: [
        {
          day: 'monday',
          startTime: '08:00',
          endTime: '16:00',
          isAvailable: true,
        },
        {
          day: 'tuesday',
          startTime: '08:00',
          endTime: '16:00',
          isAvailable: true,
        },
        {
          day: 'wednesday',
          startTime: '08:00',
          endTime: '16:00',
          isAvailable: true,
        },
        {
          day: 'thursday',
          startTime: '08:00',
          endTime: '16:00',
          isAvailable: true,
        },
        {
          day: 'friday',
          startTime: '08:00',
          endTime: '16:00',
          isAvailable: true,
        },
      ],
    },
    rating: 4.6,
    reviewCount: 89,
    consultationFee: 12000, // $120.00 in cents
    languages: ['en'],
    isActive: true,
    emailVerified: true,
  },
  {
    email: 'dr.williams@example.com',
    password: 'password123',
    role: 'doctor',
    profile: {
      firstName: 'Michael',
      lastName: 'Williams',
      phone: '+1-555-0125',
      gender: 'male',
    },
    medicalLicense: 'MD123458',
    specialties: ['pediatrics', 'general_practice'],
    bio: 'Pediatrician with 12 years of experience caring for children from birth to adolescence. Focus on preventive care and family medicine.',
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'US',
      postalCode: '60601',
      coordinates: {
        lat: 41.8781,
        lng: -87.6298,
      },
    },
    availability: {
      timezone: 'America/Chicago',
      schedule: [
        {
          day: 'monday',
          startTime: '08:30',
          endTime: '17:30',
          isAvailable: true,
        },
        {
          day: 'tuesday',
          startTime: '08:30',
          endTime: '17:30',
          isAvailable: true,
        },
        {
          day: 'wednesday',
          startTime: '08:30',
          endTime: '17:30',
          isAvailable: true,
        },
        {
          day: 'thursday',
          startTime: '08:30',
          endTime: '17:30',
          isAvailable: true,
        },
        {
          day: 'friday',
          startTime: '08:30',
          endTime: '17:30',
          isAvailable: true,
        },
      ],
    },
    rating: 4.9,
    reviewCount: 203,
    consultationFee: 10000, // $100.00 in cents
    languages: ['en', 'fr'],
    isActive: true,
    emailVerified: true,
  },
  {
    email: 'dr.brown@example.com',
    password: 'password123',
    role: 'doctor',
    profile: {
      firstName: 'Emily',
      lastName: 'Brown',
      phone: '+1-555-0126',
      gender: 'female',
    },
    medicalLicense: 'MD123459',
    specialties: ['psychiatry'],
    bio: 'Licensed psychiatrist specializing in anxiety, depression, and mood disorders. Provides both medication management and therapy.',
    location: {
      city: 'Boston',
      state: 'MA',
      country: 'US',
      postalCode: '02101',
      coordinates: {
        lat: 42.3601,
        lng: -71.0589,
      },
    },
    availability: {
      timezone: 'America/New_York',
      schedule: [
        {
          day: 'monday',
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
        },
        {
          day: 'tuesday',
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
        },
        {
          day: 'wednesday',
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
        },
        {
          day: 'thursday',
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
        },
        {
          day: 'friday',
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
        },
      ],
    },
    rating: 4.7,
    reviewCount: 156,
    consultationFee: 18000, // $180.00 in cents
    languages: ['en'],
    isActive: true,
    emailVerified: true,
  },
  {
    email: 'dr.davis@example.com',
    password: 'password123',
    role: 'doctor',
    profile: {
      firstName: 'Robert',
      lastName: 'Davis',
      phone: '+1-555-0127',
      gender: 'male',
    },
    medicalLicense: 'MD123460',
    specialties: ['orthopedics', 'surgery'],
    bio: 'Orthopedic surgeon with expertise in joint replacement and sports medicine. Over 20 years of surgical experience.',
    location: {
      city: 'Houston',
      state: 'TX',
      country: 'US',
      postalCode: '77001',
      coordinates: {
        lat: 29.7604,
        lng: -95.3698,
      },
    },
    availability: {
      timezone: 'America/Chicago',
      schedule: [
        {
          day: 'monday',
          startTime: '07:00',
          endTime: '15:00',
          isAvailable: true,
        },
        {
          day: 'tuesday',
          startTime: '07:00',
          endTime: '15:00',
          isAvailable: true,
        },
        {
          day: 'wednesday',
          startTime: '07:00',
          endTime: '15:00',
          isAvailable: true,
        },
        {
          day: 'thursday',
          startTime: '07:00',
          endTime: '15:00',
          isAvailable: true,
        },
        {
          day: 'friday',
          startTime: '07:00',
          endTime: '15:00',
          isAvailable: true,
        },
      ],
    },
    rating: 4.5,
    reviewCount: 98,
    consultationFee: 20000, // $200.00 in cents
    languages: ['en', 'es'],
    isActive: true,
    emailVerified: true,
  },
];

async function seedDoctors() {
  try {
    console.log('🌱 Starting doctor seeding...');

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
  // seedDoctors();
}

export { seedDoctors };
