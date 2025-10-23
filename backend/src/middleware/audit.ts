import { AuditLog } from '../database/models/AuditLog';

export interface AuditData {
  action: string;
  actor: {
    userId?: string;
    email?: string;
    role?: string;
  };
  target: {
    type: string;
    id?: string;
    name?: string;
  };
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAudit(data: AuditData): Promise<void> {
  try {
    const auditLog = new AuditLog({
      action: data.action,
      actor: data.actor,
      target: data.target,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
    });

    await auditLog.save();
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
