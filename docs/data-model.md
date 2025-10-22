# Data Model Documentation

## Overview

The Medical Messenger application uses MongoDB as its primary database with Mongoose ODM for data modeling and validation. This document describes the complete data model, including schemas, relationships, indexes, and validation rules.

## Database Schema

### User Model

**Collection**: `users`

```typescript
interface IUser {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed with bcrypt
  role: 'patient' | 'doctor' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    avatar?: string;
  };
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- `username`: Required, unique, 3-30 characters
- `email`: Required, unique, valid email format
- `password`: Required, minimum 8 characters, hashed with bcrypt
- `role`: Required, enum validation
- `profile.firstName`: Required, maximum 50 characters
- `profile.lastName`: Required, maximum 50 characters
- `profile.phone`: Optional, valid phone number format
- `profile.dateOfBirth`: Optional, YYYY-MM-DD format

**Indexes**:

- `username`: Unique index
- `email`: Unique index
- `role`: Single field index
- `isActive`: Single field index
- `emailVerified`: Single field index
- `createdAt`: Single field index

### Doctor Model

**Collection**: `doctors`

```typescript
interface IDoctor extends IUser {
  medicalLicense: string;
  specialties: string[];
  bio?: string;
  location?: {
    address?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability?: {
    timezone: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
  };
  rating: number;
  reviewCount: number;
  consultationFee?: number;
  languages: string[];
}
```

**Validation Rules**:

- `medicalLicense`: Required, unique, valid license format
- `specialties`: Required, at least one specialty
- `bio`: Optional, maximum 2000 characters
- `location.city`: Required
- `location.state`: Required
- `location.country`: Required, defaults to 'US'
- `location.postalCode`: Optional, US ZIP code format
- `location.coordinates.lat`: -90 to 90
- `location.coordinates.lng`: -180 to 180
- `rating`: 0 to 5
- `reviewCount`: Minimum 0
- `consultationFee`: Minimum 0
- `languages`: Array of strings, defaults to ['en']

**Indexes**:

- `medicalLicense`: Unique index
- `specialties`: Multikey index
- `location.city + location.state`: Compound index
- `rating + reviewCount`: Compound index
- `role + isActive + specialties`: Compound index

### Subscription Model

**Collection**: `subscriptions`

```typescript
interface ISubscription {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'requested' | 'approved' | 'denied' | 'cancelled';
  requestMessage?: string;
  responseMessage?: string;
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: {
    consentGiven?: boolean;
    consentDate?: Date;
    privacyPolicyVersion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- `patientId`: Required, valid ObjectId
- `doctorId`: Required, valid ObjectId
- `status`: Required, enum validation
- `requestMessage`: Optional, maximum 500 characters
- `responseMessage`: Optional, maximum 500 characters
- `requestedAt`: Required, valid date
- `respondedAt`: Optional, valid date
- `expiresAt`: Optional, valid date
- `isActive`: Boolean, defaults to true

**Indexes**:

- `patientId + doctorId`: Unique compound index
- `patientId + status`: Compound index
- `doctorId + status`: Compound index
- `status + requestedAt`: Compound index
- `isActive + status`: Compound index

### Message Model

**Collection**: `messages`

```typescript
interface IMessage {
  id: string;
  subscriptionId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
}
```

**Validation Rules**:

- `subscriptionId`: Required, valid ObjectId
- `fromUserId`: Required, valid ObjectId
- `toUserId`: Required, valid ObjectId
- `content`: Required, maximum 1000 characters
- `messageType`: Required, enum validation
- `status`: Required, enum validation
- `createdAt`: Required, valid date

**Indexes**:

- `subscriptionId + createdAt`: Compound index
- `fromUserId + createdAt`: Compound index
- `toUserId + createdAt`: Compound index
- `status + createdAt`: Compound index

### AuditLog Model

**Collection**: `auditlogs`

```typescript
interface IAuditLog {
  id: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  targetId?: string;
  targetType?: string;
  timestamp: Date;
  details?: Record<string, any>;
}
```

**Validation Rules**:

- `action`: Required, string
- `actorId`: Optional, valid ObjectId
- `actorRole`: Optional, string
- `targetId`: Optional, valid ObjectId
- `targetType`: Optional, string
- `timestamp`: Required, valid date
- `details`: Optional, object

**Indexes**:

- `action + timestamp`: Compound index
- `actorId + timestamp`: Compound index
- `targetId + timestamp`: Compound index

## Data Relationships

### User Relationships

- **One-to-Many**: User → Subscriptions (as patient)
- **One-to-Many**: User → Subscriptions (as doctor)
- **One-to-Many**: User → Messages (as sender)
- **One-to-Many**: User → Messages (as recipient)
- **One-to-Many**: User → AuditLogs (as actor)

### Subscription Relationships

- **Many-to-One**: Subscription → User (patient)
- **Many-to-One**: Subscription → User (doctor)
- **One-to-Many**: Subscription → Messages

### Message Relationships

- **Many-to-One**: Message → Subscription
- **Many-to-One**: Message → User (sender)
- **Many-to-One**: Message → User (recipient)

## Data Validation

### Input Validation

- All user inputs are validated using Zod schemas
- Database-level validation using Mongoose schemas
- Type safety enforced through TypeScript interfaces

### Business Rules

- Users can only have one active subscription per doctor
- Messages can only be sent between subscribed users
- Only doctors can approve/deny subscription requests
- Only patients can request subscriptions

### Data Integrity

- Unique constraints on critical fields
- Referential integrity through ObjectId references
- Cascade deletion rules for related data
- Soft deletion for audit trail preservation

## Indexing Strategy

### Performance Indexes

- **User queries**: Email, username, role-based filtering
- **Doctor queries**: Specialty, location, rating-based filtering
- **Subscription queries**: Status, date-based filtering
- **Message queries**: Subscription-based, time-based filtering
- **Audit queries**: Action, actor, time-based filtering

### Compound Indexes

- Optimized for common query patterns
- Balanced between query performance and storage overhead
- Regular monitoring and optimization

## Data Retention

### Retention Policies

- **Messages**: 30 days (configurable)
- **Audit Logs**: 90 days (configurable)
- **User Data**: Until account deletion
- **Subscription Data**: Until subscription cancellation

### Cleanup Process

- Automated daily cleanup jobs
- Configurable retention periods
- Audit logging of cleanup operations
- Manual cleanup capabilities

## Security Considerations

### Data Protection

- Password hashing with bcrypt
- Input sanitization and validation
- SQL injection prevention through ODM
- XSS prevention through input validation

### Access Control

- Role-based access control (RBAC)
- API endpoint protection
- Database-level permissions
- Audit trail for all access

### Privacy

- PII minimization in audit logs
- Data encryption in transit and at rest
- Secure session management
- GDPR compliance considerations

## Performance Optimization

### Query Optimization

- Efficient indexing strategy
- Query result pagination
- Aggregation pipeline optimization
- Connection pooling

### Caching Strategy

- Session-based caching
- Query result caching
- Static data caching
- CDN integration for assets

### Monitoring

- Database performance metrics
- Query execution time monitoring
- Index usage analysis
- Connection pool monitoring

## Migration and Versioning

### Schema Evolution

- Backward-compatible changes
- Migration scripts for breaking changes
- Version control for schema changes
- Rollback procedures

### Data Migration

- Automated migration scripts
- Data validation during migration
- Backup procedures
- Testing in staging environment

## Backup and Recovery

### Backup Strategy

- Regular automated backups
- Point-in-time recovery capabilities
- Cross-region backup replication
- Backup validation and testing

### Recovery Procedures

- Documented recovery processes
- Regular disaster recovery testing
- Data integrity verification
- Service restoration procedures

## Monitoring and Alerting

### Key Metrics

- Database connection health
- Query performance metrics
- Index usage statistics
- Storage utilization

### Alerting

- Connection pool exhaustion
- Slow query detection
- Index performance degradation
- Storage capacity warnings

## Future Considerations

### Scalability

- Horizontal scaling strategies
- Sharding considerations
- Read replica implementation
- Caching layer expansion

### Advanced Features

- Full-text search capabilities
- Real-time data synchronization
- Advanced analytics integration
- Machine learning data preparation
