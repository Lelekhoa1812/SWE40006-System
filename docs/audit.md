# Audit Logging

## Overview

The Medical Messenger application implements comprehensive audit logging to track user actions and system events for security, compliance, and debugging purposes.

## What is Logged

### User Actions

- **User Registration**: When new users create accounts
- **User Login/Logout**: Authentication events
- **Profile Updates**: Changes to user profile information

### Subscription Actions

- **Subscription Requests**: When patients request to subscribe to doctors
- **Subscription Approvals**: When doctors approve subscription requests
- **Subscription Denials**: When doctors deny subscription requests

### Messaging Actions

- **Message Sent**: When users send messages through the chat system
- **Message Delivery**: Confirmation of message delivery
- **Message Read**: When messages are marked as read

### System Actions

- **Data Retention**: Automated cleanup of old messages and audit logs
- **Error Events**: Critical system errors and failures

## Audit Log Structure

Each audit log entry contains:

```json
{
  "id": "unique_identifier",
  "action": "action_type",
  "actorId": "user_id_who_performed_action",
  "actorRole": "role_of_actor",
  "targetId": "id_of_affected_entity",
  "targetType": "type_of_affected_entity",
  "timestamp": "ISO_8601_timestamp",
  "details": {
    "additional_context": "value"
  }
}
```

### Field Descriptions

- **action**: The type of action performed (e.g., `user_registered`, `subscription_approved`)
- **actorId**: ID of the user who performed the action (null for system actions)
- **actorRole**: Role of the user (patient, doctor, admin, or system)
- **targetId**: ID of the entity affected by the action
- **targetType**: Type of entity (User, Subscription, Message, etc.)
- **timestamp**: When the action occurred
- **details**: Additional context-specific information

## Access Control

### Admin-Only Access

- Audit logs are only accessible to users with the `admin` role
- Non-admin users receive a 403 Forbidden response
- Unauthenticated users receive a 401 Unauthorized response

### API Endpoint

```
GET /api/v1/admin/audit?limit=100&page=1&action=filter
```

### Query Parameters

- **limit**: Number of logs to return (default: 50, max: 100)
- **page**: Page number for pagination (default: 1)
- **action**: Filter by specific action type (optional)

## Data Retention Policy

### Retention Period

- **Messages**: Retained for 30 days (configurable via `RETENTION_DAYS` environment variable)
- **Audit Logs**: Retained for 90 days (configurable)
- **User Data**: Retained until account deletion

### Automated Cleanup

- A scheduled job runs daily to purge expired data
- Cleanup events are logged in the audit system
- Retention periods can be adjusted via environment variables

### Manual Cleanup

- Admins can manually trigger cleanup via API endpoints
- All cleanup operations are logged for audit purposes

## Privacy and Compliance

### PII Minimization

- Audit logs minimize personally identifiable information (PII)
- User emails are not stored in audit logs
- Only user IDs and roles are recorded
- Sensitive data in `details` field is limited to necessary context

### Data Protection

- Audit logs are stored securely in MongoDB
- Access is restricted to admin users only
- Logs are encrypted in transit and at rest
- Regular backups are maintained

### Compliance Considerations

- Audit logs support compliance with healthcare regulations
- Retention policies can be adjusted for specific requirements
- Log integrity is maintained through database constraints
- Access logging is implemented for audit log access

## Monitoring and Alerting

### Key Metrics

- Failed authentication attempts
- Unusual access patterns
- System errors and exceptions
- Data retention cleanup events

### Alerting (Future Implementation)

- Real-time alerts for suspicious activities
- Dashboard for audit log analysis
- Integration with monitoring systems
- Automated compliance reporting

## Implementation Details

### Backend Implementation

- Audit logging is implemented as middleware
- Uses MongoDB for persistent storage
- Integrates with existing authentication system
- Supports filtering and pagination

### Frontend Implementation

- Admin-only audit log viewer
- Real-time filtering and search
- Pagination for large datasets
- Responsive design for mobile access

## Best Practices

### For Developers

1. Always log significant user actions
2. Include relevant context in the `details` field
3. Use consistent action naming conventions
4. Test audit logging in development environments

### For Administrators

1. Regularly review audit logs for anomalies
2. Monitor failed authentication attempts
3. Verify data retention policies are working
4. Maintain audit log backups

### For Compliance

1. Document audit log retention policies
2. Implement access controls for audit data
3. Regular review of audit log completeness
4. Maintain audit trail integrity

## Troubleshooting

### Common Issues

- **Missing audit logs**: Check if audit middleware is properly registered
- **Access denied**: Verify user has admin role
- **Performance issues**: Consider pagination and indexing
- **Storage concerns**: Monitor database size and cleanup jobs

### Debugging

- Check application logs for audit middleware errors
- Verify MongoDB connection and permissions
- Test audit logging in development environment
- Review retention job execution logs

## Future Enhancements

### Planned Features

- Real-time audit log streaming
- Advanced analytics and reporting
- Integration with external SIEM systems
- Automated compliance reporting
- Audit log export functionality

### Considerations

- Performance optimization for large datasets
- Enhanced search and filtering capabilities
- Integration with monitoring and alerting systems
- Compliance with evolving regulations
