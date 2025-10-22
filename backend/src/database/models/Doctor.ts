import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  id: string;
  email: string;
  password: string;
  role: 'doctor';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    avatar?: string;
  };
  medicalLicense: string;
  specialties: string[];
  bio?: string;
  location?: {
    address?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability?: {
    timezone: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
  };
  rating: number;
  reviewCount: number;
  consultationFee?: number;
  languages: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      required: true,
      enum: ['doctor'],
      default: 'doctor',
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
      },
      phone: {
        type: String,
        trim: true,
        match: /^\+?[1-9]\d{1,14}$/,
      },
      dateOfBirth: {
        type: String,
        match: /^\d{4}-\d{2}-\d{2}$/,
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      },
      avatar: {
        type: String,
        trim: true,
      },
    },
    medicalLicense: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    specialties: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'At least one specialty is required',
      },
    },
    bio: {
      type: String,
      maxlength: 2000,
      trim: true,
    },
    location: {
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        default: 'US',
        trim: true,
      },
      postalCode: {
        type: String,
        match: /^\d{5}(-\d{4})?$/,
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
          min: -90,
          max: 90,
        },
        lng: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
    },
    availability: {
      timezone: {
        type: String,
        default: 'UTC',
      },
      schedule: [
        {
          day: {
            type: String,
            enum: [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            ],
          },
          startTime: {
            type: String,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          },
          endTime: {
            type: String,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          },
          isAvailable: {
            type: Boolean,
            default: true,
          },
        },
      ],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    consultationFee: {
      type: Number,
      min: 0,
    },
    languages: {
      type: [String],
      default: ['en'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes
DoctorSchema.index({ medicalLicense: 1 }, { unique: true });
DoctorSchema.index({ specialties: 1 });
DoctorSchema.index({ 'location.city': 1, 'location.state': 1 });
DoctorSchema.index({ rating: -1, reviewCount: -1 });
DoctorSchema.index({ role: 1, isActive: 1, specialties: 1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
