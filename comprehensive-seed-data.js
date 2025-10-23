/**
 * Comprehensive Seeding Data for Medical Messenger System
 *
 * This file contains comprehensive seeding data for all models in the system:
 * - Users (Patients, Doctors, Admin)
 * - Doctors (extended user profiles)
 * - Messages (chat messages)
 * - Subscriptions (patient-doctor relationships)
 * - AuditLogs (system audit trail)
 */

const bcrypt = require('bcryptjs');

// ============================================================================
// USER SEEDING DATA
// ============================================================================

const users = [
  // Admin Users
  {
    username: 'admin_system',
    email: 'admin@medicalmessenger.com',
    password: 'AdminPass123!',
    role: 'admin',
    profile: {
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-555-0001',
      gender: 'prefer_not_to_say',
    },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'admin_support',
    email: 'support@medicalmessenger.com',
    password: 'SupportPass123!',
    role: 'admin',
    profile: {
      firstName: 'Support',
      lastName: 'Team',
      phone: '+1-555-0002',
      gender: 'prefer_not_to_say',
    },
    isActive: true,
    emailVerified: true,
  },

  // Patient Users
  {
    username: 'alice_patient',
    email: 'alice.johnson@example.com',
    password: 'PatientPass123!',
    role: 'patient',
    profile: {
      firstName: 'Alice',
      lastName: 'Johnson',
      phone: '+1-555-1001',
      dateOfBirth: '1985-03-15',
      gender: 'female',
    },
    isActive: true,
    emailVerified: true,
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
      dateOfBirth: '1978-07-22',
      gender: 'male',
    },
    isActive: true,
    emailVerified: true,
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
      dateOfBirth: '1992-11-08',
      gender: 'male',
    },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'diana_patient',
    email: 'diana.wilson@example.com',
    password: 'PatientPass123!',
    role: 'patient',
    profile: {
      firstName: 'Diana',
      lastName: 'Wilson',
      phone: '+1-555-1004',
      dateOfBirth: '1990-05-12',
      gender: 'female',
    },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'eve_patient',
    email: 'eve.davis@example.com',
    password: 'PatientPass123!',
    role: 'patient',
    profile: {
      firstName: 'Eve',
      lastName: 'Davis',
      phone: '+1-555-1005',
      dateOfBirth: '1988-09-30',
      gender: 'female',
    },
    isActive: true,
    emailVerified: true,
  },

  // Doctor Users
  {
    username: 'dr_smith',
    email: 'dr.smith@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-2001',
      dateOfBirth: '1975-04-10',
      gender: 'male',
    },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'dr_johnson',
    email: 'dr.johnson@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-2002',
      dateOfBirth: '1980-08-25',
      gender: 'female',
    },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'dr_williams',
    email: 'dr.williams@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Michael',
      lastName: 'Williams',
      phone: '+1-555-2003',
      dateOfBirth: '1972-12-03',
      gender: 'male',
    },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'dr_brown',
    email: 'dr.brown@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Emily',
      lastName: 'Brown',
      phone: '+1-555-2004',
      dateOfBirth: '1983-06-18',
      gender: 'female',
    },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'dr_davis',
    email: 'dr.davis@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Robert',
      lastName: 'Davis',
      phone: '+1-555-2005',
      dateOfBirth: '1970-01-14',
      gender: 'male',
    },
    isActive: true,
    emailVerified: true,
  },
];

// ============================================================================
// DOCTOR SEEDING DATA (Extended User Profiles)
// ============================================================================

const doctors = [
  {
    email: 'dr.smith@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-2001',
      dateOfBirth: '1975-04-10',
      gender: 'male',
    },
    medicalLicense: 'MD123456',
    specialties: ['cardiology', 'general_practice'],
    bio: 'Experienced cardiologist with over 15 years of practice. Specializes in interventional cardiology and preventive care. Board-certified in internal medicine and cardiology.',
    location: {
      address: '123 Medical Plaza, Suite 200',
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
        { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
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
    email: 'dr.johnson@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-2002',
      dateOfBirth: '1980-08-25',
      gender: 'female',
    },
    medicalLicense: 'MD123457',
    specialties: ['dermatology'],
    bio: 'Board-certified dermatologist specializing in cosmetic and medical dermatology. Over 10 years of experience treating skin conditions and performing cosmetic procedures.',
    location: {
      address: '456 Health Center Drive, Suite 100',
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
        { day: 'monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 'tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 'wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 'thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 'friday', startTime: '08:00', endTime: '16:00', isAvailable: true },
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
    email: 'dr.williams@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Michael',
      lastName: 'Williams',
      phone: '+1-555-2003',
      dateOfBirth: '1972-12-03',
      gender: 'male',
    },
    medicalLicense: 'MD123458',
    specialties: ['pediatrics', 'general_practice'],
    bio: 'Pediatrician with 12 years of experience caring for children from birth to adolescence. Focus on preventive care and family medicine.',
    location: {
      address: '789 Children\'s Hospital Way, Suite 300',
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
        { day: 'monday', startTime: '08:30', endTime: '17:30', isAvailable: true },
        { day: 'tuesday', startTime: '08:30', endTime: '17:30', isAvailable: true },
        { day: 'wednesday', startTime: '08:30', endTime: '17:30', isAvailable: true },
        { day: 'thursday', startTime: '08:30', endTime: '17:30', isAvailable: true },
        { day: 'friday', startTime: '08:30', endTime: '17:30', isAvailable: true },
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
    email: 'dr.brown@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Emily',
      lastName: 'Brown',
      phone: '+1-555-2004',
      dateOfBirth: '1983-06-18',
      gender: 'female',
    },
    medicalLicense: 'MD123459',
    specialties: ['psychiatry'],
    bio: 'Licensed psychiatrist specializing in anxiety, depression, and mood disorders. Provides both medication management and therapy.',
    location: {
      address: '321 Mental Health Plaza, Suite 150',
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
        { day: 'monday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'thursday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'friday', startTime: '09:00', endTime: '18:00', isAvailable: true },
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
    email: 'dr.davis@medicalcenter.com',
    password: 'DoctorPass123!',
    role: 'doctor',
    profile: {
      firstName: 'Robert',
      lastName: 'Davis',
      phone: '+1-555-2005',
      dateOfBirth: '1970-01-14',
      gender: 'male',
    },
    medicalLicense: 'MD123460',
    specialties: ['orthopedics', 'surgery'],
    bio: 'Orthopedic surgeon with expertise in joint replacement and sports medicine. Over 20 years of surgical experience.',
    location: {
      address: '654 Sports Medicine Center, Suite 400',
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
        { day: 'monday', startTime: '07:00', endTime: '15:00', isAvailable: true },
        { day: 'tuesday', startTime: '07:00', endTime: '15:00', isAvailable: true },
        { day: 'wednesday', startTime: '07:00', endTime: '15:00', isAvailable: true },
        { day: 'thursday', startTime: '07:00', endTime: '15:00', isAvailable: true },
        { day: 'friday', startTime: '07:00', endTime: '15:00', isAvailable: true },
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

// ============================================================================
// SUBSCRIPTION SEEDING DATA
// ============================================================================

const subscriptions = [
  {
    patientId: 'alice_patient_id', // Will be replaced with actual ObjectId
    doctorId: 'dr_smith_id', // Will be replaced with actual ObjectId
    status: 'approved',
    requestMessage: 'I would like to schedule a consultation for my heart condition. I have been experiencing chest pain recently.',
    responseMessage: 'I would be happy to help you with your heart condition. Please provide more details about your symptoms and any previous medical history.',
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
    patientId: 'bob_patient_id',
    doctorId: 'dr_johnson_id',
    status: 'approved',
    requestMessage: 'I need help with a skin rash that has been persistent for the past two weeks.',
    responseMessage: 'I can help you with your skin condition. Please send photos of the affected area if possible.',
    requestedAt: new Date('2024-01-16T09:15:00Z'),
    respondedAt: new Date('2024-01-16T11:45:00Z'),
    isActive: true,
    metadata: {
      consentGiven: true,
      consentDate: new Date('2024-01-16T09:15:00Z'),
      privacyPolicyVersion: '1.0',
    },
  },
  {
    patientId: 'charlie_patient_id',
    doctorId: 'dr_williams_id',
    status: 'approved',
    requestMessage: 'My 5-year-old son has been having frequent fevers and I\'m concerned.',
    responseMessage: 'I understand your concern about your son\'s health. Let\'s discuss his symptoms in detail.',
    requestedAt: new Date('2024-01-17T08:00:00Z'),
    respondedAt: new Date('2024-01-17T10:30:00Z'),
    isActive: true,
    metadata: {
      consentGiven: true,
      consentDate: new Date('2024-01-17T08:00:00Z'),
      privacyPolicyVersion: '1.0',
    },
  },
  {
    patientId: 'diana_patient_id',
    doctorId: 'dr_brown_id',
    status: 'requested',
    requestMessage: 'I have been struggling with anxiety and would like to discuss treatment options.',
    requestedAt: new Date('2024-01-18T13:20:00Z'),
    isActive: true,
    metadata: {
      consentGiven: true,
      consentDate: new Date('2024-01-18T13:20:00Z'),
      privacyPolicyVersion: '1.0',
    },
  },
  {
    patientId: 'eve_patient_id',
    doctorId: 'dr_davis_id',
    status: 'denied',
    requestMessage: 'I need a second opinion on my knee surgery recommendation.',
    responseMessage: 'I recommend you consult with a local orthopedic specialist for an in-person evaluation.',
    requestedAt: new Date('2024-01-19T15:45:00Z'),
    respondedAt: new Date('2024-01-19T16:30:00Z'),
    isActive: false,
    metadata: {
      consentGiven: true,
      consentDate: new Date('2024-01-19T15:45:00Z'),
      privacyPolicyVersion: '1.0',
    },
  },
  {
    patientId: 'alice_patient_id',
    doctorId: 'dr_brown_id',
    status: 'approved',
    requestMessage: 'I would like to discuss my mental health concerns.',
    responseMessage: 'I\'m here to help with your mental health. Let\'s start with understanding your current concerns.',
    requestedAt: new Date('2024-01-20T11:00:00Z'),
    respondedAt: new Date('2024-01-20T14:15:00Z'),
    isActive: true,
    metadata: {
      consentGiven: true,
      consentDate: new Date('2024-01-20T11:00:00Z'),
      privacyPolicyVersion: '1.0',
    },
  },
];

// ============================================================================
// MESSAGE SEEDING DATA
// ============================================================================

const messages = [
  // Alice and Dr. Smith conversation
  {
    subscriptionId: 'alice_smith_subscription_id',
    fromUserId: 'alice_patient_id',
    toUserId: 'dr_smith_id',
    content: 'Hello Dr. Smith, I have been experiencing chest pain for the past week. It usually happens when I\'m walking or exercising.',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-15T10:35:00Z'),
  },
  {
    subscriptionId: 'alice_smith_subscription_id',
    fromUserId: 'dr_smith_id',
    toUserId: 'alice_patient_id',
    content: 'Hello Alice, I understand your concern about chest pain. Can you describe the pain in more detail? Is it sharp, dull, or burning?',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-15T14:25:00Z'),
  },
  {
    subscriptionId: 'alice_smith_subscription_id',
    fromUserId: 'alice_patient_id',
    toUserId: 'dr_smith_id',
    content: 'It\'s more of a dull, heavy feeling. Sometimes it spreads to my left arm. I also feel short of breath.',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-15T15:10:00Z'),
  },
  {
    subscriptionId: 'alice_smith_subscription_id',
    fromUserId: 'dr_smith_id',
    toUserId: 'alice_patient_id',
    content: 'Those symptoms are concerning and could indicate a heart condition. I recommend you schedule an appointment for a thorough evaluation. Do you have any family history of heart disease?',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-15T15:45:00Z'),
  },

  // Bob and Dr. Johnson conversation
  {
    subscriptionId: 'bob_johnson_subscription_id',
    fromUserId: 'bob_patient_id',
    toUserId: 'dr_johnson_id',
    content: 'Hi Dr. Johnson, I have this rash on my arm that won\'t go away. It\'s red and itchy.',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-16T09:20:00Z'),
  },
  {
    subscriptionId: 'bob_johnson_subscription_id',
    fromUserId: 'dr_johnson_id',
    toUserId: 'bob_patient_id',
    content: 'Hello Bob, I can help you with that rash. Can you describe when it first appeared and if you\'ve used any new products recently?',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-16T11:50:00Z'),
  },
  {
    subscriptionId: 'bob_johnson_subscription_id',
    fromUserId: 'bob_patient_id',
    toUserId: 'dr_johnson_id',
    content: 'It started about two weeks ago. I did start using a new laundry detergent around that time.',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-16T12:15:00Z'),
  },

  // Charlie and Dr. Williams conversation
  {
    subscriptionId: 'charlie_williams_subscription_id',
    fromUserId: 'charlie_patient_id',
    toUserId: 'dr_williams_id',
    content: 'Dr. Williams, my son has been having fevers every few days. Should I be worried?',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-17T08:05:00Z'),
  },
  {
    subscriptionId: 'charlie_williams_subscription_id',
    fromUserId: 'dr_williams_id',
    toUserId: 'charlie_patient_id',
    content: 'Frequent fevers in children can have various causes. Can you tell me more about the fever pattern and any other symptoms?',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-17T10:35:00Z'),
  },

  // Diana and Dr. Brown conversation (pending)
  {
    subscriptionId: 'diana_brown_subscription_id',
    fromUserId: 'diana_patient_id',
    toUserId: 'dr_brown_id',
    content: 'Hello Dr. Brown, I\'ve been struggling with anxiety and panic attacks. I\'m not sure where to start.',
    messageType: 'text',
    status: 'sent',
    createdAt: new Date('2024-01-18T13:25:00Z'),
  },

  // Alice and Dr. Brown conversation
  {
    subscriptionId: 'alice_brown_subscription_id',
    fromUserId: 'alice_patient_id',
    toUserId: 'dr_brown_id',
    content: 'Dr. Brown, I\'ve been feeling anxious about my health lately, especially after the chest pain episodes.',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-20T11:05:00Z'),
  },
  {
    subscriptionId: 'alice_brown_subscription_id',
    fromUserId: 'dr_brown_id',
    toUserId: 'alice_patient_id',
    content: 'I understand that health concerns can cause significant anxiety. Let\'s work together to address both your physical and mental health needs.',
    messageType: 'text',
    status: 'read',
    createdAt: new Date('2024-01-20T14:20:00Z'),
  },
];

// ============================================================================
// AUDIT LOG SEEDING DATA
// ============================================================================

const auditLogs = [
  {
    action: 'user_registration',
    userId: 'alice_patient_id',
    resourceType: 'user',
    resourceId: 'alice_patient_id',
    metadata: {
      registrationMethod: 'email',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    createdAt: new Date('2024-01-10T09:30:00Z'),
  },
  {
    action: 'user_registration',
    userId: 'dr_smith_id',
    resourceType: 'user',
    resourceId: 'dr_smith_id',
    metadata: {
      registrationMethod: 'email',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    createdAt: new Date('2024-01-08T14:20:00Z'),
  },
  {
    action: 'subscription_requested',
    userId: 'alice_patient_id',
    resourceType: 'subscription',
    resourceId: 'alice_smith_subscription_id',
    metadata: {
      doctorId: 'dr_smith_id',
      requestMessage: 'I would like to schedule a consultation for my heart condition.',
    },
    createdAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    action: 'subscription_approved',
    userId: 'dr_smith_id',
    resourceType: 'subscription',
    resourceId: 'alice_smith_subscription_id',
    metadata: {
      patientId: 'alice_patient_id',
      responseMessage: 'I would be happy to help you with your heart condition.',
    },
    createdAt: new Date('2024-01-15T14:20:00Z'),
  },
  {
    action: 'message_sent',
    userId: 'alice_patient_id',
    resourceType: 'message',
    resourceId: 'message_1',
    metadata: {
      toUserId: 'dr_smith_id',
      messageType: 'text',
      contentLength: 120,
    },
    createdAt: new Date('2024-01-15T10:35:00Z'),
  },
  {
    action: 'message_sent',
    userId: 'dr_smith_id',
    resourceType: 'message',
    resourceId: 'message_2',
    metadata: {
      toUserId: 'alice_patient_id',
      messageType: 'text',
      contentLength: 95,
    },
    createdAt: new Date('2024-01-15T14:25:00Z'),
  },
  {
    action: 'subscription_denied',
    userId: 'dr_davis_id',
    resourceType: 'subscription',
    resourceId: 'eve_davis_subscription_id',
    metadata: {
      patientId: 'eve_patient_id',
      reason: 'Requires in-person consultation',
    },
    createdAt: new Date('2024-01-19T16:30:00Z'),
  },
  {
    action: 'user_login',
    userId: 'alice_patient_id',
    resourceType: 'user',
    resourceId: 'alice_patient_id',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    createdAt: new Date('2024-01-20T08:15:00Z'),
  },
  {
    action: 'user_login',
    userId: 'dr_smith_id',
    resourceType: 'user',
    resourceId: 'dr_smith_id',
    metadata: {
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    createdAt: new Date('2024-01-20T09:30:00Z'),
  },
  {
    action: 'system_backup',
    userId: 'admin_system_id',
    resourceType: 'system',
    resourceId: 'backup_2024_01_20',
    metadata: {
      backupType: 'full',
      size: '2.5GB',
      duration: '15 minutes',
    },
    createdAt: new Date('2024-01-20T02:00:00Z'),
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Hash passwords for all users
 */
async function hashPasswords() {
  const hashedUsers = [];
  const hashedDoctors = [];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    hashedUsers.push({
      ...user,
      password: hashedPassword,
    });
  }

  for (const doctor of doctors) {
    const hashedPassword = await bcrypt.hash(doctor.password, 12);
    hashedDoctors.push({
      ...doctor,
      password: hashedPassword,
    });
  }

  return { hashedUsers, hashedDoctors };
}

/**
 * Generate comprehensive seeding data
 */
async function generateSeedingData() {
  const { hashedUsers, hashedDoctors } = await hashPasswords();

  return {
    users: hashedUsers,
    doctors: hashedDoctors,
    subscriptions,
    messages,
    auditLogs,
  };
}

module.exports = {
  users,
  doctors,
  subscriptions,
  messages,
  auditLogs,
  generateSeedingData,
  hashPasswords,
};
