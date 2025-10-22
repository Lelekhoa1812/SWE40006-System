# Data Retention Policy

## Overview

The Medical Messenger application implements a comprehensive data retention policy to ensure compliance with healthcare regulations, optimize storage costs, and maintain system performance while preserving necessary audit trails.

## Retention Periods

### Messages

- **Retention Period**: 30 days (configurable via `RETENTION_DAYS` environment variable)
- **Rationale**: Messages contain sensitive medical information and should be retained only as long as necessary for patient care
- **Cleanup Process**: Automated daily cleanup of messages older than the retention period
- **Audit Trail**: Cleanup operations are logged in the audit system

### Audit Logs

- **Retention Period**: 90 days (configurable via `AUDIT_RETENTION_DAYS` environment variable)
- **Rationale**: Audit logs are essential for security monitoring and compliance but can be archived after 90 days
- **Cleanup Process**: Automated daily cleanup of audit logs older than the retention period
- **Archive Strategy**: Consider archiving to cold storage before deletion

### User Data

- **Retention Period**: Until account deletion
- **Rationale**: User data is essential for service provision and should be retained while the account is active
- **Cleanup Process**: Manual cleanup upon account deletion request
- **Data Anonymization**: Consider anonymizing data before deletion for analytics

### Subscription Data

- **Retention Period**: Until subscription cancellation + 7 years
- **Rationale**: Healthcare regulations may require extended retention of patient-provider relationships
- **Cleanup Process**: Automated cleanup after the extended retention period
- **Compliance**: Aligns with healthcare data retention requirements

### Session Data

- **Retention Period**: 24 hours (session timeout)
- **Rationale**: Session data should be short-lived for security
- **Cleanup Process**: Automatic cleanup when sessions expire
- **Storage**: Stored in MongoDB with TTL indexes

## Configuration

### Environment Variables

```bash
# Message retention (days)
RETENTION_DAYS=30

# Audit log retention (days)
AUDIT_RETENTION_DAYS=90

# Subscription retention (days)
SUBSCRIPTION_RETENTION_DAYS=2555  # 7 years

# Session timeout (hours)
SESSION_TIMEOUT_HOURS=24
```

### Database Configuration

```typescript
// TTL indexes for automatic cleanup
db.messages.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
db.auditlogs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
db.sessions.createIndex({ expires: 1 }, { expireAfterSeconds: 86400 }); // 24 hours
```

## Implementation

### Automated Cleanup Jobs

#### Daily Cleanup Job

```typescript
// Runs daily at 2 AM UTC
cron.schedule('0 2 * * *', async () => {
  await cleanupExpiredMessages();
  await cleanupExpiredAuditLogs();
  await cleanupExpiredSessions();
});
```

#### Cleanup Functions

```typescript
async function cleanupExpiredMessages() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  const result = await Message.deleteMany({
    createdAt: { $lt: cutoffDate },
  });

  // Log cleanup operation
  await writeAudit('data_cleanup', 'system', 'system', null, 'Message', {
    deletedCount: result.deletedCount,
    cutoffDate: cutoffDate.toISOString(),
  });
}
```

### Manual Cleanup

#### Admin API Endpoints

```typescript
// Manual cleanup trigger
POST / api / v1 / admin / cleanup / messages;
POST / api / v1 / admin / cleanup / audit - logs;
POST / api / v1 / admin / cleanup / sessions;
```

#### Cleanup Reports

```typescript
// Get cleanup statistics
GET / api / v1 / admin / cleanup / stats;
```

## Compliance Considerations

### Healthcare Regulations

#### HIPAA Compliance

- **Minimum Retention**: 6 years for certain records
- **Maximum Retention**: No specific maximum, but reasonable limits apply
- **Patient Rights**: Patients can request data deletion
- **Breach Notification**: Retained data must be included in breach assessments

#### GDPR Compliance

- **Right to Erasure**: Patients can request data deletion
- **Data Minimization**: Retain only necessary data
- **Purpose Limitation**: Data retention must align with stated purposes
- **Storage Limitation**: Data should not be kept longer than necessary

### Legal Requirements

#### Medical Records

- **State Regulations**: Vary by jurisdiction (typically 5-7 years)
- **Federal Requirements**: 6 years for certain records
- **Malpractice Considerations**: Extended retention may be advisable

#### Audit Requirements

- **Financial Audits**: 7 years for financial records
- **Security Audits**: 3-5 years for security logs
- **Compliance Audits**: Varies by regulation

## Data Classification

### Sensitive Data

- **Messages**: High sensitivity, short retention
- **User Profiles**: Medium sensitivity, long retention
- **Audit Logs**: Medium sensitivity, medium retention
- **Session Data**: Low sensitivity, very short retention

### Data Handling

- **Encryption**: All data encrypted at rest and in transit
- **Access Control**: Role-based access with audit trails
- **Backup**: Regular backups with retention policies
- **Disposal**: Secure deletion of expired data

## Monitoring and Alerting

### Key Metrics

- **Storage Usage**: Monitor database size and growth
- **Cleanup Success**: Track successful cleanup operations
- **Retention Compliance**: Verify data is being retained according to policy
- **Performance Impact**: Monitor cleanup job performance

### Alerts

- **Cleanup Failures**: Alert on failed cleanup operations
- **Storage Thresholds**: Alert when storage exceeds limits
- **Retention Violations**: Alert on data older than retention period
- **Performance Degradation**: Alert on slow cleanup operations

## Backup and Recovery

### Backup Strategy

- **Full Backups**: Daily full backups with 30-day retention
- **Incremental Backups**: Hourly incremental backups
- **Point-in-Time Recovery**: Available for last 30 days
- **Cross-Region Replication**: Backup replication to secondary region

### Recovery Procedures

- **Data Recovery**: Restore from backup within retention period
- **Partial Recovery**: Restore specific collections or time ranges
- **Disaster Recovery**: Full system recovery procedures
- **Testing**: Regular recovery testing and validation

## Privacy and Security

### Data Minimization

- **Collection**: Only collect necessary data
- **Processing**: Process data only for stated purposes
- **Retention**: Retain data only as long as necessary
- **Disposal**: Securely dispose of expired data

### Access Controls

- **Authentication**: Strong authentication for all access
- **Authorization**: Role-based access control
- **Audit Trails**: Complete audit trails for all access
- **Monitoring**: Real-time monitoring of data access

### Encryption

- **At Rest**: AES-256 encryption for stored data
- **In Transit**: TLS 1.3 for data transmission
- **Key Management**: Secure key management and rotation
- **Compliance**: Encryption standards compliance

## Implementation Checklist

### Setup

- [ ] Configure environment variables for retention periods
- [ ] Set up TTL indexes in MongoDB
- [ ] Implement cleanup job scheduling
- [ ] Create admin API endpoints for manual cleanup

### Testing

- [ ] Test automated cleanup jobs
- [ ] Verify TTL index functionality
- [ ] Test manual cleanup operations
- [ ] Validate audit logging of cleanup operations

### Monitoring

- [ ] Set up storage monitoring
- [ ] Configure cleanup job monitoring
- [ ] Implement retention compliance monitoring
- [ ] Set up alerting for failures

### Documentation

- [ ] Document retention policies
- [ ] Create cleanup procedures
- [ ] Document compliance requirements
- [ ] Train staff on retention policies

## Future Considerations

### Scalability

- **Horizontal Scaling**: Consider sharding for large datasets
- **Archive Storage**: Move old data to cheaper storage
- **Compression**: Implement data compression for storage efficiency
- **Partitioning**: Consider time-based partitioning

### Advanced Features

- **Data Analytics**: Retain anonymized data for analytics
- **Machine Learning**: Use retained data for ML model training
- **Compliance Automation**: Automated compliance reporting
- **Data Lineage**: Track data lineage and transformations

### Regulatory Changes

- **Policy Updates**: Regular review of retention policies
- **Compliance Monitoring**: Continuous compliance monitoring
- **Regulatory Updates**: Stay updated with regulatory changes
- **Policy Adjustments**: Adjust policies based on new requirements
