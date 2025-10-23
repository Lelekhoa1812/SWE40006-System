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
  ...UserSchema.obj,
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
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  status: { type: String, enum: ['requested', 'approved', 'denied', 'cancelled'], default: 'requested' },
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
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
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
server.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

server.get('/api/v1/health', async (request, reply) => {
  return {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

// Auth routes
server.post('/api/v1/auth/register', async (request, reply) => {
  try {
    const { username, email, password, role } = request.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return reply.code(400).send({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

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
      user: { id: user._id, username, email, role }
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.post('/api/v1/auth/login', async (request, reply) => {
  try {
    const { email, password } = request.body;

    // Find user
    const user = await User.findOne({ email });
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
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
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
      user: { id: 'mock-user-id', username: 'testuser', email: 'test@test.com', role: 'patient' }
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
        { specialties: { $regex: q, $options: 'i' } }
      ];
    }

    if (specialty) {
      query.specialties = { $regex: specialty, $options: 'i' };
    }

    // Get total count
    const total = await Doctor.countDocuments(query);

    // Get paginated results
    const doctors = await Doctor.find(query)
      .select('profile specialties rating reviewCount location phone bio consultationFee languages medicalLicense')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return {
      doctors,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Subscription routes
server.post('/api/v1/subscriptions', async (request, reply) => {
  try {
    const { doctorId, requestMessage } = request.body;
    const patientId = '68fa4142885c903d84b6868d'; // Test patient ID

    // Create subscription
    const subscription = new Subscription({
      patientId,
      doctorId,
      requestMessage,
    });

    await subscription.save();

    // Log audit
    await AuditLog.create({
      action: 'subscription_requested',
      actor: patientId,
      target: doctorId,
      details: { requestMessage },
    });

    return reply.code(201).send({
      message: 'Subscription requested successfully',
      subscription: { id: subscription._id, status: subscription.status }
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.get('/api/v1/subscriptions/mine', async (request, reply) => {
  try {
    const userId = '68fa4142885c903d84b6868d'; // Test user ID

    const subscriptions = await Subscription.find({
      $or: [{ patientId: userId }, { doctorId: userId }]
    })
    .populate('patientId', 'username email')
    .populate('doctorId', 'profile specialties')
    .lean();

    return reply.send({ subscriptions });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

server.patch('/api/v1/subscriptions/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const { status, responseMessage } = request.body;

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { status, responseMessage, respondedAt: new Date() },
      { new: true }
    );

    if (!subscription) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }

    // Log audit
    await AuditLog.create({
      action: 'subscription_updated',
      actor: '68fa414a885c903d84b68692', // Test doctor ID
      target: id,
      details: { status, responseMessage },
      ip: request.ip,
      userAgent: request.headers['user-agent']
    });

    return reply.send({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Message routes
server.get('/api/v1/messages', async (request, reply) => {
  try {
    const { subscriptionId } = request.query;
    const { limit = 50 } = request.query;

    const messages = await Message.find({ subscriptionId })
      .populate('fromUserId', 'username')
      .populate('toUserId', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    return reply.send({ messages: messages.reverse() });
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
      messageId: message._id
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

const start = async () => {
  try {
    // Connect to database
    await connectToDatabase();

    const port = process.env.PORT || 8080;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${port}`);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
