const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://medmsg-frontend.azurewebsites.net',
    ],
    credentials: true,
  })
);

app.use(express.json());

// Simple User schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },
    profile: {
      firstName: String,
      lastName: String,
      phone: String,
      bio: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// Simple Doctor schema
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicalLicense: { type: String, required: true },
    specialties: [String],
    location: {
      city: String,
      state: String,
      country: String,
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    languages: [String],
    availability: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String },
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
  });
});

// Simple auth routes (no sessions for now)
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { username, email, password, role = 'patient' } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Simple password hashing (in production, use bcrypt)
    const user = new User({
      username,
      email,
      password: password, // In production, hash this
      role,
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/v1/auth/me', async (req, res) => {
  try {
    // For now, return a mock user (in production, use proper auth)
    res.json({
      user: {
        id: 'mock-user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'patient',
        profile: {
          firstName: 'Test',
          lastName: 'User',
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctors routes
app.get('/api/v1/doctors', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      q,
      specialty,
      city,
      state,
      minRating = 0,
    } = req.query;

    let query = {};

    if (q) {
      query.$or = [
        { 'user.profile.firstName': { $regex: q, $options: 'i' } },
        { 'user.profile.lastName': { $regex: q, $options: 'i' } },
        { specialties: { $regex: q, $options: 'i' } },
      ];
    }

    if (specialty) {
      query.specialties = { $in: [specialty] };
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    if (minRating > 0) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'username email profile')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, reviewCount: -1 });

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors: doctors.map((doctor) => ({
        id: doctor._id,
        userId: doctor.userId._id,
        username: doctor.userId.username,
        email: doctor.userId.email,
        profile: doctor.userId.profile,
        medicalLicense: doctor.medicalLicense,
        specialties: doctor.specialties,
        location: doctor.location,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        consultationFee: doctor.consultationFee,
        languages: doctor.languages,
        availability: doctor.availability,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb+srv://khoale:password123@cluster0.mongodb.net/medmsg?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
