import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  status: 'requested' | 'approved' | 'denied' | 'expired';
  requestMessage?: string;
  responseMessage?: string;
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: {
    consentGiven?: boolean;
    consentDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  patientId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  doctorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  status: {
    type: String,
    enum: ['requested', 'approved', 'denied', 'expired'],
    default: 'requested',
  },
  requestMessage: String,
  responseMessage: String,
  requestedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  metadata: {
    consentGiven: Boolean,
    consentDate: Date,
  },
}, {
  timestamps: true,
});

// Indexes
subscriptionSchema.index({ patientId: 1, doctorId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ requestedAt: -1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
