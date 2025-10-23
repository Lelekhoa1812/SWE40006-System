import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  subscriptionId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  subscriptionId: { type: Schema.Types.ObjectId, required: true, ref: 'Subscription' },
  fromUserId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  toUserId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
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
}, {
  timestamps: true,
});

// Indexes
messageSchema.index({ subscriptionId: 1, createdAt: -1 });
messageSchema.index({ fromUserId: 1 });
messageSchema.index({ toUserId: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
