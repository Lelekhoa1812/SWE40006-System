import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  id: string;
  subscriptionId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    subscriptionId: {
      type: String,
      required: true,
      index: true,
    },
    fromUserId: {
      type: String,
      required: true,
      index: true,
    },
    toUserId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    messageType: {
      type: String,
      required: true,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    status: {
      type: String,
      required: true,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
      index: true,
    },
    metadata: {
      fileUrl: {
        type: String,
      },
      fileName: {
        type: String,
      },
      fileSize: {
        type: Number,
      },
      mimeType: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient querying
MessageSchema.index({ subscriptionId: 1, createdAt: -1 });
MessageSchema.index({ fromUserId: 1, createdAt: -1 });
MessageSchema.index({ toUserId: 1, createdAt: -1 });
MessageSchema.index({ subscriptionId: 1, status: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
