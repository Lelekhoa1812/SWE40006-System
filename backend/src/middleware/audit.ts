import { FastifyRequest } from 'fastify';
import { AuditLog } from '../database/models/AuditLog';

export async function writeAudit(options: {
  request?: FastifyRequest;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const userId = options.request?.user?.id;
    await AuditLog.create({
      action: options.action,
      userId,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      metadata: options.metadata,
    });
  } catch (err) {
    // do not throw; avoid breaking main flow due to audit failure
  }
}
