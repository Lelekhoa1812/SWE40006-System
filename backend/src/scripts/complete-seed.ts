import { connectDatabase } from '../../database/connection';
import { User } from '../../database/models/User';
import { Doctor } from '../../database/models/Doctor';
import { Message } from '../../database/models/Message';
import { Subscription } from '../../database/models/Subscription';
import { AuditLog } from '../../database/models/AuditLog';
import bcrypt from 'bcryptjs';

// ============================================================================
// COMPLETE SEEDING DATA MATCHING ACTUAL DATABASE STRUCTURE
// ============================================================================

const users = [
  {
    username: 'alice_patient',
    email: 'alice.johnson@example.com',
    password: 'PatientPass123!',
    role: 'patient',
    profile: {
      firstName: 'Alice',
      lastName: 'Johnson',
      phone: '+1-555-1001',
      dateOfBirth: new Date('1985-03-15'),
    },
    isActive: true,
  },
  {
    username: 'bob_patient',
    email: 'bob.smith@example.com',
    password: 'PatientPass123!',
    role: 'patient',
    profile: {
      firstName: 'Bob',
      lastName: 'Smith',
      phone: '+1-555-1002',
      dateOfBirth: new Date('1978-07-22'),
    },
    isActive: true,
  },
  {
    username: 'charlie_patient',
    email: 'charlie.brown@example.com',
    password: 'PatientPass123!',
    role: 'patient',
    profile: {
      firstName: 'Charlie',
      lastName: 'Brown',
      phone: '+1-555-1003',
      dateOfBirth: new Date('1992-11-08'),
    },
    isActive: true,
  },
];

const doctors = [
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
    bio: 'Board-certified dermatologist specializing in cosmetic and medical dermatology.',
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
    bio: 'Pediatrician with 12 years of experience caring for children.',
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
];

async function seedCompleteData() {
  try {
    console.log('🌱 Starting complete database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Message.deleteMany({});
    await Subscription.deleteMany({});
    await AuditLog.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      await user.save();
      createdUsers.push(user);
      console.log(
        `✅ Created user: ${userData.profile.firstName} ${userData.profile.lastName}`
      );
    }

    // Create doctors
    console.log('👨‍⚕️ Creating doctors...');
    const createdDoctors = [];
    for (const doctorData of doctors) {
      const hashedPassword = await bcrypt.hash(doctorData.password, 12);
      const doctor = new Doctor({
        ...doctorData,
        password: hashedPassword,
      });
      await doctor.save();
      createdDoctors.push(doctor);
      console.log(
        `✅ Created doctor: ${doctorData.profile.firstName} ${doctorData.profile.lastName}`
      );
    }

    // Create subscriptions
    console.log('🔗 Creating subscriptions...');
    const subscriptions = [
      {
        patientId: createdUsers[0]?._id.toString(),
        doctorId: createdDoctors[0]?._id.toString(),
        status: 'approved',
        requestMessage:
          'I would like to schedule a consultation for my heart condition.',
        responseMessage:
          'I would be happy to help you with your heart condition.',
        requestedAt: new Date('2024-01-15T10:30:00Z'),
        respondedAt: new Date('2024-01-15T14:20:00Z'),
        isActive: true,
        metadata: {
          consentGiven: true,
          consentDate: new Date('2024-01-15T10:30:00Z'),
          privacyPolicyVersion: '1.0',
        },
      },
      {
        patientId: createdUsers[1]?._id.toString(),
        doctorId: createdDoctors[1]?._id.toString(),
        status: 'approved',
        requestMessage: 'I need help with a skin rash.',
        responseMessage: 'I can help you with your skin condition.',
        requestedAt: new Date('2024-01-16T09:15:00Z'),
        respondedAt: new Date('2024-01-16T11:45:00Z'),
        isActive: true,
        metadata: {
          consentGiven: true,
          consentDate: new Date('2024-01-16T09:15:00Z'),
          privacyPolicyVersion: '1.0',
        },
      },
    ];

    const createdSubscriptions = [];
    for (const subscriptionData of subscriptions) {
      if (subscriptionData.patientId && subscriptionData.doctorId) {
        const subscription = new Subscription(subscriptionData);
        await subscription.save();
        createdSubscriptions.push(subscription);
        console.log(`✅ Created subscription: ${subscriptionData.status}`);
      }
    }

    // Create messages
    console.log('💬 Creating messages...');
    const messages = [
      {
        subscriptionId: createdSubscriptions[0]?._id.toString(),
        fromUserId: createdUsers[0]?._id.toString(),
        toUserId: createdDoctors[0]?._id.toString(),
        content:
          'Hello Dr. Smith, I have been experiencing chest pain for the past week.',
        messageType: 'text',
        status: 'read',
        createdAt: new Date('2024-01-15T10:35:00Z'),
      },
      {
        subscriptionId: createdSubscriptions[0]?._id.toString(),
        fromUserId: createdDoctors[0]?._id.toString(),
        toUserId: createdUsers[0]?._id.toString(),
        content:
          'Hello Alice, I understand your concern about chest pain. Can you describe the pain in more detail?',
        messageType: 'text',
        status: 'read',
        createdAt: new Date('2024-01-15T14:25:00Z'),
      },
    ];

    for (const messageData of messages) {
      if (
        messageData.subscriptionId &&
        messageData.fromUserId &&
        messageData.toUserId
      ) {
        const message = new Message(messageData);
        await message.save();
        console.log(
          `✅ Created message: ${messageData.content.substring(0, 50)}...`
        );
      }
    }

    // Create audit logs
    console.log('📋 Creating audit logs...');
    const auditLogs = [
      {
        action: 'user_registration',
        userId: createdUsers[0]?._id.toString(),
        resourceType: 'user',
        resourceId: createdUsers[0]?._id.toString(),
        metadata: {
          registrationMethod: 'email',
          ipAddress: '192.168.1.100',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        createdAt: new Date('2024-01-10T09:30:00Z'),
      },
      {
        action: 'subscription_requested',
        userId: createdUsers[0]?._id.toString(),
        resourceType: 'subscription',
        resourceId: createdSubscriptions[0]?._id.toString(),
        metadata: {
          doctorId: createdDoctors[0]?._id.toString(),
          requestMessage:
            'I would like to schedule a consultation for my heart condition.',
        },
        createdAt: new Date('2024-01-15T10:30:00Z'),
      },
    ];

    for (const auditLogData of auditLogs) {
      if (auditLogData.userId && auditLogData.resourceId) {
        const auditLog = new AuditLog(auditLogData);
        await auditLog.save();
        console.log(`✅ Created audit log: ${auditLogData.action}`);
      }
    }

    console.log('\n🎉 Complete database seeding finished successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Doctors: ${createdDoctors.length}`);
    console.log(`   - Subscriptions: ${createdSubscriptions.length}`);
    console.log(`   - Messages: ${messages.length}`);
    console.log(`   - Audit Logs: ${auditLogs.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during complete seeding:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedCompleteData();
}

export { seedCompleteData };
