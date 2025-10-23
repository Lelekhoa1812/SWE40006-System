import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  actor: {
    userId?: mongoose.Types.ObjectId;
    email?: string;
    role?: string;
  };
  target: {
    type: string;
    id?: mongoose.Types.ObjectId;
    name?: string;
  };
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
  },
  actor: {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: String,
    role: String,
  },
  target: {
    type: { type: String, required: true },
    id: Schema.Types.ObjectId,
    name: String,
  },
  details: {
    type: Schema.Types.Mixed,
    default: {},
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ 'actor.userId': 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ 'target.type': 1, 'target.id': 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
