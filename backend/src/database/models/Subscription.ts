import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document<string> {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'requested' | 'approved' | 'denied' | 'cancelled';
  requestMessage?: string;
  responseMessage?: string;
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: {
    consentGiven?: boolean;
    consentDate?: Date;
    privacyPolicyVersion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['requested', 'approved', 'denied', 'cancelled'],
      default: 'requested',
      index: true,
    },
    requestMessage: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    responseMessage: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    requestedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    respondedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      consentGiven: {
        type: Boolean,
        default: false,
      },
      consentDate: {
        type: Date,
      },
      privacyPolicyVersion: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        // delete ret._id;
        // delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
SubscriptionSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });
SubscriptionSchema.index({ patientId: 1, status: 1 });
SubscriptionSchema.index({ doctorId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, requestedAt: 1 });
SubscriptionSchema.index({ isActive: 1, status: 1 });

export const Subscription = mongoose.model<ISubscription>(
  'Subscription',
  SubscriptionSchema
);
