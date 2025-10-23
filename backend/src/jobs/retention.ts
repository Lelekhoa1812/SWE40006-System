import cron from 'node-cron';
import { Message } from '../database/models/Message';
import { AuditLog } from '../database/models/AuditLog';
import { env } from '../env';

export function startRetentionJob(): void {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const retentionDays = parseInt(env.RETENTION_DAYS);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Delete old messages
      const deletedMessages = await Message.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      // Delete old audit logs
      const deletedAuditLogs = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      console.log(`Retention job completed: ${deletedMessages.deletedCount} messages and ${deletedAuditLogs.deletedCount} audit logs deleted`);
    } catch (error) {
      console.error('Retention job failed:', error);
    }
  });
}
