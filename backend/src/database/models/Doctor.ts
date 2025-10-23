import { Schema, model, Document } from 'mongoose';

export interface IDoctor extends Document {
  userId: string;
  medicalLicense: string;
  specialties: string[];
  bio?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  phone?: string;
  consultationFee?: number;
  rating?: number;
  reviewCount?: number;
  languages?: string[];
  availability?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    medicalLicense: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    specialties: [{
      type: String,
      required: true,
    }],
    bio: {
      type: String,
      maxlength: 1000,
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    phone: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      min: 0,
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
    languages: [{
      type: String,
      trim: true,
    }],
    availability: {
      monday: [String],
      tuesday: [String],
      wednesday: [String],
      thursday: [String],
      friday: [String],
      saturday: [String],
      sunday: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
DoctorSchema.index({ medicalLicense: 1 });
DoctorSchema.index({ specialties: 1 });
DoctorSchema.index({ location: 1 });
DoctorSchema.index({ rating: -1 });
DoctorSchema.index({ isActive: 1 });

export const Doctor = model<IDoctor>('Doctor', DoctorSchema);
