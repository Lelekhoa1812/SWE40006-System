import cron from 'node-cron';
import { Message } from '../database/models/Message';
import { AuditLog } from '../database/models/AuditLog';
import { env } from '../env';

export function startRetentionJob(logger: { info: Function; error: Function }) {
  // Run daily at 02:00
  cron.schedule('0 2 * * *', async () => {
    const days = Number(env.RETENTION_DAYS ?? 30);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    try {
      const result = await Message.deleteMany({ createdAt: { $lt: cutoff } });
      const deleted = (result as any).deletedCount ?? 0;
      await AuditLog.create({
        action: 'retention.purge',
        resourceType: 'message',
        metadata: { olderThanDays: days, deleted },
      });
      logger.info({ deleted, days }, 'Retention purge completed');
    } catch (err) {
      logger.error({ err }, 'Retention purge failed');
    }
  });
}
