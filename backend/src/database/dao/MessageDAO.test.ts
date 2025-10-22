import { describe, it, expect, beforeEach } from 'vitest';
import { MessageDAO } from './MessageDAO';
import { Message } from '../models/Message';

describe('MessageDAO', () => {
  beforeEach(async () => {
    // Clear all messages before each test
    await Message.deleteMany({});
  });

  describe('createMessage', () => {
    it('should create a message with valid data', async () => {
      const messageData = {
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Hello, this is a test message',
        messageType: 'text' as const,
        status: 'sent' as const,
      };

      const message = await MessageDAO.createMessage(messageData);

      expect(message).toBeDefined();
      expect(message.subscriptionId).toBe('507f1f77bcf86cd799439011');
      expect(message.fromUserId).toBe('507f1f77bcf86cd799439012');
      expect(message.toUserId).toBe('507f1f77bcf86cd799439013');
      expect(message.content).toBe('Hello, this is a test message');
      expect(message.messageType).toBe('text');
      expect(message.status).toBe('sent');
    });

    it('should throw error for empty content', async () => {
      const messageData = {
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: '',
        messageType: 'text' as const,
      };

      await expect(MessageDAO.createMessage(messageData)).rejects.toThrow(
        'Validation error'
      );
    });

    it('should throw error for content too long', async () => {
      const messageData = {
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'a'.repeat(1001), // Exceeds 1000 character limit
        messageType: 'text' as const,
      };

      await expect(MessageDAO.createMessage(messageData)).rejects.toThrow(
        'Validation error'
      );
    });

    it('should throw error for invalid message type', async () => {
      const messageData = {
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Hello',
        messageType: 'invalid' as never,
      };

      await expect(MessageDAO.createMessage(messageData)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  describe('findById', () => {
    it('should find message by valid ID', async () => {
      const message = new Message({
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Test message',
        messageType: 'text',
        status: 'sent',
      });
      await message.save();

      const foundMessage = await MessageDAO.findById(message._id.toString());

      expect(foundMessage).toBeDefined();
      expect(foundMessage?.content).toBe('Test message');
    });

    it('should return null for non-existent ID', async () => {
      const foundMessage = await MessageDAO.findById(
        '507f1f77bcf86cd799439011'
      );

      expect(foundMessage).toBeNull();
    });

    it('should throw error for invalid ID format', async () => {
      await expect(MessageDAO.findById('invalid-id')).rejects.toThrow(
        'Invalid message ID format'
      );
    });
  });

  describe('findBySubscriptionId', () => {
    it('should find messages by subscription ID with pagination', async () => {
      const subscriptionId = '507f1f77bcf86cd799439011';

      // Create test messages
      const message1 = new Message({
        subscriptionId,
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'First message',
        messageType: 'text',
        status: 'sent',
      });
      await message1.save();

      const message2 = new Message({
        subscriptionId,
        fromUserId: '507f1f77bcf86cd799439013',
        toUserId: '507f1f77bcf86cd799439012',
        content: 'Second message',
        messageType: 'text',
        status: 'sent',
      });
      await message2.save();

      const result = await MessageDAO.findBySubscriptionId(
        subscriptionId,
        1,
        10
      );

      expect(result.messages).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      // Messages should be in chronological order (oldest first)
      expect(result.messages[0].content).toBe('First message');
      expect(result.messages[1].content).toBe('Second message');
    });

    it('should throw error for invalid subscription ID', async () => {
      await expect(MessageDAO.findBySubscriptionId('')).rejects.toThrow(
        'Validation error'
      );
    });
  });

  describe('findMessagesBetweenUsers', () => {
    it('should find messages between two users', async () => {
      const userId1 = '507f1f77bcf86cd799439012';
      const userId2 = '507f1f77bcf86cd799439013';

      // Create test messages
      const message1 = new Message({
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: userId1,
        toUserId: userId2,
        content: 'Message from user1 to user2',
        messageType: 'text',
        status: 'sent',
      });
      await message1.save();

      const message2 = new Message({
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: userId2,
        toUserId: userId1,
        content: 'Message from user2 to user1',
        messageType: 'text',
        status: 'sent',
      });
      await message2.save();

      const result = await MessageDAO.findMessagesBetweenUsers(
        userId1,
        userId2,
        1,
        10
      );

      expect(result.messages).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('updateMessage', () => {
    it('should update message with valid data', async () => {
      const message = new Message({
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Original message',
        messageType: 'text',
        status: 'sent',
      });
      await message.save();

      const updatedMessage = await MessageDAO.updateMessage(
        message._id.toString(),
        {
          content: 'Updated message',
          status: 'delivered',
        }
      );

      expect(updatedMessage).toBeDefined();
      expect(updatedMessage?.content).toBe('Updated message');
      expect(updatedMessage?.status).toBe('delivered');
    });

    it('should throw error for invalid update data', async () => {
      const message = new Message({
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Test message',
        messageType: 'text',
        status: 'sent',
      });
      await message.save();

      await expect(
        MessageDAO.updateMessage(message._id.toString(), {
          content: 'a'.repeat(1001), // Too long
        })
      ).rejects.toThrow('Validation error');
    });
  });

  describe('markAsDelivered', () => {
    it('should mark message as delivered', async () => {
      const message = new Message({
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Test message',
        messageType: 'text',
        status: 'sent',
      });
      await message.save();

      const updatedMessage = await MessageDAO.markAsDelivered(
        message._id.toString()
      );

      expect(updatedMessage).toBeDefined();
      expect(updatedMessage?.status).toBe('delivered');
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const message = new Message({
        subscriptionId: '507f1f77bcf86cd799439011',
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Test message',
        messageType: 'text',
        status: 'delivered',
      });
      await message.save();

      const updatedMessage = await MessageDAO.markAsRead(
        message._id.toString()
      );

      expect(updatedMessage).toBeDefined();
      expect(updatedMessage?.status).toBe('read');
    });
  });

  describe('getRecentMessages', () => {
    it('should get recent messages for subscription', async () => {
      const subscriptionId = '507f1f77bcf86cd799439011';

      const message = new Message({
        subscriptionId,
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Recent message',
        messageType: 'text',
        status: 'sent',
      });
      await message.save();

      const recentMessages = await MessageDAO.getRecentMessages(
        subscriptionId,
        10
      );

      expect(recentMessages).toHaveLength(1);
      expect(recentMessages[0].content).toBe('Recent message');
    });
  });

  describe('getMessageStats', () => {
    it('should return message statistics', async () => {
      const subscriptionId = '507f1f77bcf86cd799439011';

      // Create test messages
      const message1 = new Message({
        subscriptionId,
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Message 1',
        messageType: 'text',
        status: 'sent',
      });
      await message1.save();

      const message2 = new Message({
        subscriptionId,
        fromUserId: '507f1f77bcf86cd799439013',
        toUserId: '507f1f77bcf86cd799439012',
        content: 'Message 2',
        messageType: 'text',
        status: 'delivered',
      });
      await message2.save();

      const stats = await MessageDAO.getMessageStats(subscriptionId);

      expect(stats.total).toBe(2);
      expect(stats.byStatus.sent).toBe(1);
      expect(stats.byStatus.delivered).toBe(1);
      expect(stats.byType.text).toBe(2);
      expect(stats.recent).toBe(2); // Both messages are recent
    });
  });

  describe('cleanupOldMessages', () => {
    it('should cleanup old messages', async () => {
      const subscriptionId = '507f1f77bcf86cd799439011';

      // Create an old message
      const oldMessage = new Message({
        subscriptionId,
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Old message',
        messageType: 'text',
        status: 'sent',
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      });
      await oldMessage.save();

      // Create a recent message
      const recentMessage = new Message({
        subscriptionId,
        fromUserId: '507f1f77bcf86cd799439012',
        toUserId: '507f1f77bcf86cd799439013',
        content: 'Recent message',
        messageType: 'text',
        status: 'sent',
      });
      await recentMessage.save();

      const deletedCount = await MessageDAO.cleanupOldMessages(30);

      expect(deletedCount).toBe(1);

      // Verify old message is deleted and recent message remains
      const remainingMessages = await Message.find({});
      expect(remainingMessages).toHaveLength(1);
      expect(remainingMessages[0].content).toBe('Recent message');
    });

    it('should throw error for invalid retention days', async () => {
      await expect(MessageDAO.cleanupOldMessages(0)).rejects.toThrow(
        'Validation error'
      );
      await expect(MessageDAO.cleanupOldMessages(400)).rejects.toThrow(
        'Validation error'
      );
    });
  });
});
