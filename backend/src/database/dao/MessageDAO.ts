import { Message, IMessage } from '../models/Message';
import { z } from 'zod';

// Validation schemas
const createMessageSchema = z.object({
  subscriptionId: z.string().min(1),
  fromUserId: z.string().min(1),
  toUserId: z.string().min(1),
  content: z.string().min(1).max(1000).trim(),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
  status: z.enum(['sent', 'delivered', 'read']).default('sent'),
});

const updateMessageSchema = z.object({
  content: z.string().min(1).max(1000).trim().optional(),
  status: z.enum(['sent', 'delivered', 'read']).optional(),
});

export class MessageDAO {
  /**
   * Create a new message with validation
   */
  static async createMessage(
    messageData: z.infer<typeof createMessageSchema>
  ): Promise<IMessage> {
    try {
      const validatedData = createMessageSchema.parse(messageData);

      const message = new Message(validatedData);
      await message.save();
      return message;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Find message by ID with validation
   */
  static async findById(id: string): Promise<IMessage | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid message ID');
    }

    try {
      return await Message.findById(id);
    } catch (error) {
      throw new Error('Invalid message ID format');
    }
  }

  /**
   * Find messages by subscription ID with pagination
   */
  static async findBySubscriptionId(
    subscriptionId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: IMessage[];
    total: number;
    page: number;
    limit: number;
  }> {
    const subscriptionIdSchema = z.string().min(1);
    const pageSchema = z.number().min(1);
    const limitSchema = z.number().min(1).max(100);

    try {
      const validatedSubscriptionId =
        subscriptionIdSchema.parse(subscriptionId);
      const validatedPage = pageSchema.parse(page);
      const validatedLimit = limitSchema.parse(limit);

      const skip = (validatedPage - 1) * validatedLimit;

      const [messages, total] = await Promise.all([
        Message.find({ subscriptionId: validatedSubscriptionId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validatedLimit),
        Message.countDocuments({ subscriptionId: validatedSubscriptionId }),
      ]);

      return {
        messages: messages.reverse(), // Return in chronological order
        total,
        page: validatedPage,
        limit: validatedLimit,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Find messages between two users
   */
  static async findMessagesBetweenUsers(
    userId1: string,
    userId2: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: IMessage[];
    total: number;
    page: number;
    limit: number;
  }> {
    const userIdSchema = z.string().min(1);
    const pageSchema = z.number().min(1);
    const limitSchema = z.number().min(1).max(100);

    try {
      const validatedUserId1 = userIdSchema.parse(userId1);
      const validatedUserId2 = userIdSchema.parse(userId2);
      const validatedPage = pageSchema.parse(page);
      const validatedLimit = limitSchema.parse(limit);

      const skip = (validatedPage - 1) * validatedLimit;

      const [messages, total] = await Promise.all([
        Message.find({
          $or: [
            { fromUserId: validatedUserId1, toUserId: validatedUserId2 },
            { fromUserId: validatedUserId2, toUserId: validatedUserId1 },
          ],
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validatedLimit),
        Message.countDocuments({
          $or: [
            { fromUserId: validatedUserId1, toUserId: validatedUserId2 },
            { fromUserId: validatedUserId2, toUserId: validatedUserId1 },
          ],
        }),
      ]);

      return {
        messages: messages.reverse(), // Return in chronological order
        total,
        page: validatedPage,
        limit: validatedLimit,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Update message with validation
   */
  static async updateMessage(
    id: string,
    updateData: z.infer<typeof updateMessageSchema>
  ): Promise<IMessage | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid message ID');
    }

    try {
      const validatedData = updateMessageSchema.parse(updateData);

      return await Message.findByIdAndUpdate(id, validatedData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Mark message as delivered
   */
  static async markAsDelivered(id: string): Promise<IMessage | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid message ID');
    }

    try {
      return await Message.findByIdAndUpdate(
        id,
        { status: 'delivered' },
        { new: true }
      );
    } catch (error) {
      throw new Error('Invalid message ID format');
    }
  }

  /**
   * Mark message as read
   */
  static async markAsRead(id: string): Promise<IMessage | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid message ID');
    }

    try {
      return await Message.findByIdAndUpdate(
        id,
        { status: 'read' },
        { new: true }
      );
    } catch (error) {
      throw new Error('Invalid message ID format');
    }
  }

  /**
   * Delete message with validation
   */
  static async deleteMessage(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid message ID');
    }

    try {
      const result = await Message.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error('Invalid message ID format');
    }
  }

  /**
   * Get recent messages for a subscription
   */
  static async getRecentMessages(
    subscriptionId: string,
    limit: number = 50
  ): Promise<IMessage[]> {
    const subscriptionIdSchema = z.string().min(1);
    const limitSchema = z.number().min(1).max(100);

    try {
      const validatedSubscriptionId =
        subscriptionIdSchema.parse(subscriptionId);
      const validatedLimit = limitSchema.parse(limit);

      return await Message.find({ subscriptionId: validatedSubscriptionId })
        .sort({ createdAt: -1 })
        .limit(validatedLimit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Get message statistics
   */
  static async getMessageStats(subscriptionId?: string): Promise<{
    total: number;
    byStatus: { [key: string]: number };
    byType: { [key: string]: number };
    recent: number; // Messages in last 24 hours
  }> {
    try {
      const filter = subscriptionId ? { subscriptionId } : {};
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [total, byStatus, byType, recent] = await Promise.all([
        Message.countDocuments(filter),
        Message.aggregate([
          { $match: filter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Message.aggregate([
          { $match: filter },
          { $group: { _id: '$messageType', count: { $sum: 1 } } },
        ]),
        Message.countDocuments({
          ...filter,
          createdAt: { $gte: oneDayAgo },
        }),
      ]);

      const statusStats = byStatus.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      );

      const typeStats = byType.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        total,
        byStatus: statusStats,
        byType: typeStats,
        recent,
      };
    } catch (error) {
      throw new Error('Failed to get message statistics');
    }
  }

  /**
   * Clean up old messages (for retention policy)
   */
  static async cleanupOldMessages(retentionDays: number): Promise<number> {
    const retentionDaysSchema = z.number().min(1).max(365);

    try {
      const validatedRetentionDays = retentionDaysSchema.parse(retentionDays);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - validatedRetentionDays);

      const result = await Message.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      return result.deletedCount || 0;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }
}
