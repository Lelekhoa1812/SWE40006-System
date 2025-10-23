const Fastify = require('fastify');
const cors = require('@fastify/cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Add request logging
server.addHook('onRequest', async (request) => {
  request.log.info(
    {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    },
    'Incoming request'
  );
});

// Authentication middleware
server.addHook('onRequest', async (request) => {
  // Check for test headers first (for testing)
  if (request.headers['x-test-user-id']) {
    request.user = {
      id: request.headers['x-test-user-id'],
      role: request.headers['x-test-user-role'] || 'patient',
      username: request.headers['x-test-username'] || 'testuser',
      email: request.headers['x-test-user-email'] || 'test@example.com',
    };
    return;
  }

  // Check for Authorization header
  if (request.headers['authorization']) {
    const token = request.headers['authorization'].split(' ')[1];
    if (token === 'patienttoken') {
      request.user = {
        id: '68fa4142885c903d84b6868d',
        role: 'patient',
        username: 'patient1',
        email: 'patient1@example.com',
      };
    } else if (token === 'doctortoken') {
      request.user = {
        id: '68fa414a885c903d84b68692',
        role: 'doctor',
        username: 'dr.smith',
        email: 'dr.smith@example.com',
      };
    }
  }

  // For now, we'll use a simple approach - check if the user is logged in via session
  // In a real app, this would decode a JWT token or check session
  // For testing purposes, we'll set a default user
  if (!request.user) {
    // Default to a test user for testing
    request.user = {
      id: '68fa4142885c903d84b6868d',
      role: 'patient',
      username: 'patient1',
      email: 'patient1@example.com',
    };
  }
});

server.addHook('onResponse', async (request, reply) => {
  request.log.info(
    {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    },
    'Request completed'
  );
});

// Register CORS
server.register(cors, {
  origin: [
    'http://localhost:3000',
    'https://medmsg-frontend.azurewebsites.net',
    'https://frontend-dgce2pwe0-lelekhoa1812s-projects.vercel.app',
    'https://frontend-l57pkloup-lelekhoa1812s-projects.vercel.app',
    /^https:\/\/frontend-.*\.vercel\.app$/,
  ],
  credentials: true,
});

// Define schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const DoctorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true,
    default: 'doctor',
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  medicalLicense: { type: String, required: true, unique: true },
  specialties: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  location: {
    city: String,
    state: String,
    country: String,
  },
  phone: String,
  bio: String,
  consultationFee: { type: Number, default: 0 },
  languages: [{ type: String }],
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }],
  },
});

const SubscriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'denied', 'cancelled'],
    default: 'requested',
  },
  requestMessage: String,
  responseMessage: String,
  requestedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  metadata: {
    consentGiven: { type: Boolean, default: false },
    consentDate: Date,
  },
});

const MessageSchema = new mongoose.Schema({
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: { type: String, required: true },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  createdAt: { type: Date, default: Date.now },
});

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: { type: mongoose.Schema.Types.ObjectId },
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
});

// Create models
const User = mongoose.model('User', UserSchema);
const Doctor = mongoose.model('Doctor', DoctorSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
const Message = mongoose.model('Message', MessageSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

// Health check routes
server.get('/health', async () => {
  return {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
});

server.get('/api/v1/health', async () => {
  return {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
});

// Auth routes
server.post('/api/v1/auth/register', async (request, reply) => {
  try {
    const {
      username,
      email,
      password,
      role,
      profile,
      medicalLicense,
      specialties,
    } = request.body;

    // Check if user already exists in both User and Doctor models
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    const existingDoctor = await Doctor.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser || existingDoctor) {
      return reply.code(400).send({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === 'doctor') {
      // Create doctor in Doctor schema
      request.log.info('Creating doctor with data:', {
        username,
        email,
        role,
        profile,
        medicalLicense,
        specialties,
      });

      const doctor = new Doctor({
        username,
        email,
        password: hashedPassword,
        role,
        profile: profile || {
          firstName: '',
          lastName: '',
        },
        isActive: true,
        medicalLicense: medicalLicense || `MD${Date.now()}`,
        specialties: specialties || ['general_medicine'],
        rating: 0,
        reviewCount: 0,
        location: {
          city: '',
          state: '',
          country: 'USA',
        },
        bio: '',
        consultationFee: 0,
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
        // Let MongoDB automatically generate the _id - no custom userId needed
      });

      request.log.info('Doctor object created, attempting to save...');
      try {
        await doctor.save();
        request.log.info('Doctor saved successfully');
        user = doctor;
      } catch (saveError) {
        request.log.error('Error saving doctor:', saveError);
        return reply.code(400).send({
          error: 'Failed to create doctor account',
          details: saveError.message,
        });
      }
    } else {
      // Create patient in User schema
      const patient = new User({
        username,
        email,
        password: hashedPassword,
        role,
        profile: profile || {
          firstName: '',
          lastName: '',
        },
      });

      await patient.save();
      user = patient;
    }

    // Log audit
    await AuditLog.create({
      action: 'user_registered',
      actor: user._id,
      details: { role, email },
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.code(201).send({
      message: 'User created successfully',
      user: { id: user._id, username, email, role },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.post('/api/v1/auth/login', async (request, reply) => {
  try {
    const { email, password } = request.body;

    // Find user in both User and Doctor schemas
    let user = await User.findOne({ email });
    if (!user) {
      user = await Doctor.findOne({ email });
    }

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Log audit
    await AuditLog.create({
      action: 'user_login',
      actor: user._id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.send({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/api/v1/auth/me', async (request, reply) => {
  try {
    // This would normally check session/token, for now return mock
    return reply.send({
      user: {
        id: 'mock-user-id',
        username: 'testuser',
        email: 'test@test.com',
        role: 'patient',
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Doctors routes
server.get('/api/v1/doctors', async (request, reply) => {
  try {
    const { page = 1, limit = 12, q = '', specialty = '' } = request.query;

    // Build query
    const query = {};

    if (q) {
      query.$or = [
        { 'profile.firstName': { $regex: q, $options: 'i' } },
        { 'profile.lastName': { $regex: q, $options: 'i' } },
        { specialties: { $regex: q, $options: 'i' } },
      ];
    }

    if (specialty) {
      query.specialties = { $regex: specialty, $options: 'i' };
    }

    // Get total count
    const total = await Doctor.countDocuments(query);

    // Get paginated results
    const doctors = await Doctor.find(query)
      .select(
        'profile specialties rating reviewCount location phone bio consultationFee languages medicalLicense'
      )
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return {
      doctors,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Subscription routes
server.post('/api/v1/subscriptions', async (request, reply) => {
  try {
    // Add comprehensive logging
    request.log.info('Subscription request received:', {
      body: request.body,
      headers: request.headers,
      user: request.user,
      ip: request.ip,
    });

    const { doctorId, requestMessage } = request.body;

    // Log the parsed data
    request.log.info('Parsed subscription data:', {
      doctorId,
      requestMessage,
      doctorIdType: typeof doctorId,
      requestMessageType: typeof requestMessage,
    });

    // Validate required fields
    if (!doctorId || !requestMessage) {
      request.log.error('Missing required fields:', {
        doctorId: !!doctorId,
        requestMessage: !!requestMessage,
        doctorIdValue: doctorId,
        requestMessageValue: requestMessage,
      });
      return reply.code(400).send({
        error: 'doctorId and requestMessage are required',
        received: {
          doctorId: !!doctorId,
          requestMessage: !!requestMessage,
        },
      });
    }

    // Validate doctorId format (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return reply.code(400).send({
        error: 'Invalid doctorId format',
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return reply.code(404).send({
        error: 'Doctor not found',
      });
    }

    // Get patient ID from session or use test ID
    const patientId = request.user?.id || '68fa4142885c903d84b6868d';

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      patientId,
      doctorId,
      status: { $in: ['requested', 'approved'] },
    });

    if (existingSubscription) {
      request.log.info('Subscription already exists:', {
        existingId: existingSubscription._id,
        status: existingSubscription.status,
        patientId,
        doctorId,
      });

      // If it's already approved, return success
      if (existingSubscription.status === 'approved') {
        return reply.send({
          message: 'Subscription already approved',
          subscription: {
            id: existingSubscription._id,
            status: existingSubscription.status,
          },
        });
      }

      // If it's still requested, update the request message
      existingSubscription.requestMessage = requestMessage;
      existingSubscription.requestedAt = new Date();
      await existingSubscription.save();

      return reply.send({
        message: 'Subscription request updated',
        subscription: {
          id: existingSubscription._id,
          status: existingSubscription.status,
        },
      });
    }

    // Create subscription request
    const subscription = await Subscription.create({
      patientId,
      doctorId,
      status: 'requested',
      requestMessage,
      isActive: true,
      metadata: {
        consentGiven: false,
      },
      requestedAt: new Date(),
    });

    request.log.info('Subscription created successfully:', {
      subscriptionId: subscription._id,
      patientId,
      doctorId,
      status: subscription.status,
    });

    // Log audit
    await AuditLog.create({
      action: 'subscription_requested',
      actor: patientId,
      target: doctorId,
      details: { requestMessage },
    });

    return reply.code(201).send({
      message: 'Subscription requested successfully',
      subscription: { id: subscription._id, status: subscription.status },
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/api/v1/subscriptions/mine', async (request, reply) => {
  try {
    const userId = request.user?.id || '68fa4142885c903d84b6868d';
    const userRole = request.user?.role || 'patient';

    let subscriptions;
    if (userRole === 'patient') {
      subscriptions = await Subscription.find({ patientId: userId })
        .populate('doctorId', 'profile.firstName profile.lastName specialties')
        .sort({ requestedAt: -1 });
    } else if (userRole === 'doctor') {
      subscriptions = await Subscription.find({ doctorId: userId })
        .populate('patientId', 'profile.firstName profile.lastName')
        .sort({ requestedAt: -1 });
    } else {
      return reply.code(403).send({ error: 'Access denied' });
    }

    return reply.send(subscriptions);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.patch('/api/v1/subscriptions/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const { status, responseMessage } = request.body;
    const userId = request.user?.id;
    const userRole = request.user?.role;

    if (userRole !== 'doctor') {
      return reply
        .code(403)
        .send({ error: 'Only doctors can approve/deny subscriptions' });
    }

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }

    if (subscription.doctorId.toString() !== userId) {
      return reply
        .code(403)
        .send({ error: 'You can only manage your own subscriptions' });
    }

    subscription.status = status;
    subscription.responseMessage = responseMessage;
    subscription.respondedAt = new Date();
    await subscription.save();

    // Log audit
    await AuditLog.create({
      action: `subscription_${status}`,
      actor: userId,
      target: subscription.patientId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.send({
      message: `Subscription ${status} successfully`,
      subscription,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Clean up subscriptions for testing
server.delete('/api/v1/subscriptions/cleanup', async (request, reply) => {
  try {
    const result = await Subscription.deleteMany({
      status: { $in: ['requested', 'denied'] },
    });

    request.log.info('Cleaned up subscriptions:', {
      deletedCount: result.deletedCount,
    });

    return reply.send({
      message: 'Cleanup completed',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Chat routes
server.post('/api/v1/chat/messages', async (request, reply) => {
  try {
    const { subscriptionId, content, messageType = 'text' } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    // Check if user has access to this subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }

    if (subscription.status !== 'approved') {
      return reply
        .code(403)
        .send({ error: 'Subscription must be approved to send messages' });
    }

    if (
      subscription.patientId.toString() !== userId &&
      subscription.doctorId.toString() !== userId
    ) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    // Create message
    const message = await Message.create({
      subscriptionId,
      fromUserId: userId,
      toUserId:
        subscription.patientId.toString() === userId
          ? subscription.doctorId
          : subscription.patientId,
      content,
      messageType,
      status: 'sent',
      createdAt: new Date(),
    });

    // Log audit
    await AuditLog.create({
      action: 'message_sent',
      actor: userId,
      target: subscriptionId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.send({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/api/v1/chat/messages/:subscriptionId', async (request, reply) => {
  try {
    const { subscriptionId } = request.params;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    // Check if user has access to this subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }

    if (
      subscription.patientId.toString() !== userId &&
      subscription.doctorId.toString() !== userId
    ) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    // Get messages
    const messages = await Message.find({ subscriptionId })
      .populate('fromUserId', 'profile.firstName profile.lastName')
      .populate('toUserId', 'profile.firstName profile.lastName')
      .sort({ createdAt: 1 })
      .limit(50);

    return reply.send(messages);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.post('/api/v1/messages', async (request, reply) => {
  try {
    const { subscriptionId, content, messageType = 'text' } = request.body;
    const fromUserId = '68fa4142885c903d84b6868d'; // Test user ID
    const toUserId = '68fa414a885c903d84b68692'; // Test doctor ID

    const message = new Message({
      subscriptionId,
      fromUserId,
      toUserId,
      content,
      messageType,
    });

    await message.save();

    // Log audit
    await AuditLog.create({
      action: 'message_sent',
      actor: fromUserId,
      target: subscriptionId,
      details: { messageType },
    });

    return reply.code(201).send({
      message: 'Message sent successfully',
      messageId: message._id,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Admin routes
server.get('/api/v1/admin/audit', async (request, reply) => {
  try {
    const { limit = 100 } = request.query;

    const auditLogs = await AuditLog.find()
      .populate('actor', 'username email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    return reply.send({ auditLogs });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Connect to MongoDB
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.warn('⚠️ MongoDB connection failed:', error.message);
      console.log('Continuing without database...');
    }
  } else {
    console.log('ℹ️ No MongoDB URI provided, running without database');
  }
}

// Seed some test doctors
const seedDoctors = async () => {
  try {
    const existingDoctors = await Doctor.countDocuments();
    if (existingDoctors === 0) {
      const testDoctors = [
        {
          email: 'dr.smith@example.com',
          username: 'dr.smith',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. John',
            lastName: 'Smith',
            phone: '+1-555-0101',
            dateOfBirth: '1975-03-15',
            gender: 'male',
          },
          medicalLicense: 'MD123456',
          specialties: ['cardiology', 'internal_medicine'],
          bio: 'Experienced cardiologist with 15 years of practice. Specializes in heart disease prevention and treatment.',
          location: {
            address: '123 Medical Center Dr',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001',
          },
          rating: 4.8,
          reviewCount: 127,
          consultationFee: 20000, // $200.00 in cents
          languages: ['English', 'Spanish'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.johnson@example.com',
          username: 'dr.johnson',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            phone: '+1-555-0102',
            dateOfBirth: '1980-07-22',
            gender: 'female',
          },
          medicalLicense: 'MD789012',
          specialties: ['dermatology', 'cosmetic_surgery'],
          bio: 'Board-certified dermatologist specializing in skin cancer treatment and cosmetic procedures.',
          location: {
            address: '456 Skin Care Ave',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            postalCode: '90210',
          },
          rating: 4.9,
          reviewCount: 89,
          consultationFee: 25000, // $250.00 in cents
          languages: ['English', 'French'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.wilson@example.com',
          username: 'dr.wilson',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Michael',
            lastName: 'Wilson',
            phone: '+1-555-0103',
            dateOfBirth: '1972-11-08',
            gender: 'male',
          },
          medicalLicense: 'MD345678',
          specialties: ['orthopedics', 'sports_medicine'],
          bio: 'Orthopedic surgeon with expertise in sports injuries and joint replacement surgery.',
          location: {
            address: '789 Sports Medicine Blvd',
            city: 'Chicago',
            state: 'IL',
            country: 'USA',
            postalCode: '60601',
          },
          rating: 4.7,
          reviewCount: 156,
          consultationFee: 30000, // $300.00 in cents
          languages: ['English', 'German'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.brown@example.com',
          username: 'dr.brown',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Emily',
            lastName: 'Brown',
            phone: '+1-555-0104',
            dateOfBirth: '1985-05-12',
            gender: 'female',
          },
          medicalLicense: 'MD901234',
          specialties: ['pediatrics', 'family_medicine'],
          bio: 'Pediatrician with a focus on preventive care and child development. Fluent in multiple languages.',
          location: {
            address: "321 Children's Hospital Way",
            city: 'Miami',
            state: 'FL',
            country: 'USA',
            postalCode: '33101',
          },
          rating: 4.9,
          reviewCount: 203,
          consultationFee: 15000, // $150.00 in cents
          languages: ['English', 'Spanish', 'Portuguese'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.davis@example.com',
          username: 'dr.davis',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Robert',
            lastName: 'Davis',
            phone: '+1-555-0105',
            dateOfBirth: '1968-09-30',
            gender: 'male',
          },
          medicalLicense: 'MD567890',
          specialties: ['neurology', 'psychiatry'],
          bio: 'Neurologist specializing in movement disorders and cognitive assessment. 20+ years of experience.',
          location: {
            address: '654 Brain Health Center',
            city: 'Boston',
            state: 'MA',
            country: 'USA',
            postalCode: '02101',
          },
          rating: 4.6,
          reviewCount: 94,
          consultationFee: 35000, // $350.00 in cents
          languages: ['English', 'Italian'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.martinez@example.com',
          username: 'dr.martinez',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Maria',
            lastName: 'Martinez',
            phone: '+1-555-0106',
            dateOfBirth: '1982-04-18',
            gender: 'female',
          },
          medicalLicense: 'MD234567',
          specialties: ['gynecology', 'obstetrics'],
          bio: "Board-certified gynecologist with expertise in women's health and reproductive medicine.",
          location: {
            address: "987 Women's Health Plaza",
            city: 'Phoenix',
            state: 'AZ',
            country: 'USA',
            postalCode: '85001',
          },
          rating: 4.8,
          reviewCount: 145,
          consultationFee: 22000, // $220.00 in cents
          languages: ['English', 'Spanish'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.anderson@example.com',
          username: 'dr.anderson',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. James',
            lastName: 'Anderson',
            phone: '+1-555-0107',
            dateOfBirth: '1978-12-03',
            gender: 'male',
          },
          medicalLicense: 'MD345678',
          specialties: ['ophthalmology', 'retinal_surgery'],
          bio: 'Ophthalmologist specializing in retinal diseases and laser eye surgery. 18 years of experience.',
          location: {
            address: '456 Vision Care Center',
            city: 'Seattle',
            state: 'WA',
            country: 'USA',
            postalCode: '98101',
          },
          rating: 4.9,
          reviewCount: 178,
          consultationFee: 28000, // $280.00 in cents
          languages: ['English', 'Japanese'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.taylor@example.com',
          username: 'dr.taylor',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Jennifer',
            lastName: 'Taylor',
            phone: '+1-555-0108',
            dateOfBirth: '1983-08-14',
            gender: 'female',
          },
          medicalLicense: 'MD456789',
          specialties: ['psychiatry', 'addiction_medicine'],
          bio: 'Psychiatrist specializing in anxiety disorders and addiction treatment. Certified in cognitive behavioral therapy.',
          location: {
            address: '321 Mental Health Center',
            city: 'Denver',
            state: 'CO',
            country: 'USA',
            postalCode: '80201',
          },
          rating: 4.7,
          reviewCount: 112,
          consultationFee: 32000, // $320.00 in cents
          languages: ['English', 'French'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.clark@example.com',
          username: 'dr.clark',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. David',
            lastName: 'Clark',
            phone: '+1-555-0109',
            dateOfBirth: '1975-11-25',
            gender: 'male',
          },
          medicalLicense: 'MD567890',
          specialties: ['urology', 'oncology'],
          bio: 'Urologist with expertise in prostate cancer treatment and minimally invasive surgery.',
          location: {
            address: '654 Urology Center',
            city: 'Atlanta',
            state: 'GA',
            country: 'USA',
            postalCode: '30301',
          },
          rating: 4.5,
          reviewCount: 89,
          consultationFee: 30000, // $300.00 in cents
          languages: ['English', 'German'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.lee@example.com',
          username: 'dr.lee',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Lisa',
            lastName: 'Lee',
            phone: '+1-555-0110',
            dateOfBirth: '1987-06-09',
            gender: 'female',
          },
          medicalLicense: 'MD678901',
          specialties: ['endocrinology', 'diabetes_care'],
          bio: 'Endocrinologist specializing in diabetes management and thyroid disorders. Focus on patient education.',
          location: {
            address: '789 Endocrine Center',
            city: 'Portland',
            state: 'OR',
            country: 'USA',
            postalCode: '97201',
          },
          rating: 4.9,
          reviewCount: 156,
          consultationFee: 25000, // $250.00 in cents
          languages: ['English', 'Korean', 'Mandarin'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.white@example.com',
          username: 'dr.white',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Michael',
            lastName: 'White',
            phone: '+1-555-0111',
            dateOfBirth: '1970-02-28',
            gender: 'male',
          },
          medicalLicense: 'MD789012',
          specialties: ['gastroenterology', 'hepatology'],
          bio: 'Gastroenterologist with expertise in liver diseases and digestive disorders. 25+ years of experience.',
          location: {
            address: '147 Digestive Health Center',
            city: 'Houston',
            state: 'TX',
            country: 'USA',
            postalCode: '77001',
          },
          rating: 4.6,
          reviewCount: 134,
          consultationFee: 27000, // $270.00 in cents
          languages: ['English', 'Spanish'],
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'dr.garcia@example.com',
          username: 'dr.garcia',
          password: await bcrypt.hash('password123', 10),
          role: 'doctor',
          profile: {
            firstName: 'Dr. Sofia',
            lastName: 'Garcia',
            phone: '+1-555-0112',
            dateOfBirth: '1984-10-12',
            gender: 'female',
          },
          medicalLicense: 'MD890123',
          specialties: ['radiology', 'mammography'],
          bio: 'Radiologist specializing in breast imaging and cancer detection. Expert in MRI and CT interpretation.',
          location: {
            address: '258 Imaging Center',
            city: 'San Diego',
            state: 'CA',
            country: 'USA',
            postalCode: '92101',
          },
          rating: 4.8,
          reviewCount: 167,
          consultationFee: 26000, // $260.00 in cents
          languages: ['English', 'Spanish', 'Portuguese'],
          isActive: true,
          emailVerified: true,
        },
      ];

      for (const doctorData of testDoctors) {
        await Doctor.create(doctorData);
      }

      server.log.info('Test doctors seeded successfully');
    }

    // Seed some test patients
    const existingPatients = await User.countDocuments({ role: 'patient' });
    if (existingPatients === 0) {
      const testPatients = [
        {
          email: 'patient1@example.com',
          username: 'patient1',
          password: await bcrypt.hash('password123', 10),
          role: 'patient',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1-555-1001',
            dateOfBirth: '1990-05-15',
            gender: 'male',
          },
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'patient2@example.com',
          username: 'patient2',
          password: await bcrypt.hash('password123', 10),
          role: 'patient',
          profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+1-555-1002',
            dateOfBirth: '1985-08-22',
            gender: 'female',
          },
          isActive: true,
          emailVerified: true,
        },
        {
          email: 'patient3@example.com',
          username: 'patient3',
          password: await bcrypt.hash('password123', 10),
          role: 'patient',
          profile: {
            firstName: 'Mike',
            lastName: 'Johnson',
            phone: '+1-555-1003',
            dateOfBirth: '1992-12-10',
            gender: 'male',
          },
          isActive: true,
          emailVerified: true,
        },
      ];

      for (const patientData of testPatients) {
        await User.create(patientData);
      }

      server.log.info('Test patients seeded successfully');
    }
  } catch (error) {
    server.log.error('Error seeding doctors:', error);
  }
};

const start = async () => {
  try {
    // Connect to database
    await connectToDatabase();

    const port = process.env.PORT || 8080;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${port}`);

    // Seed test doctors
    await seedDoctors();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
// Force restart - Fri Oct 24 04:31:15 AEDT 2025
// Force restart for doctor registration fix - Fri Oct 24 05:15:42 AEDT 2025
// Force restart - Fri Oct 24 09:09:54 AEDT 2025
console.log('Server restarted at:', new Date());
