# Database Indexes Documentation

This document outlines the database indexes used across all collections for optimal query performance.

## User Collection

### Primary Indexes

- `_id`: Primary key (automatic)
- `email`: Unique index for login lookups
- `role`: For role-based queries
- `isActive`: For filtering active users

### Composite Indexes

- `role + isActive`: For role-based active user queries
- `createdAt`: For chronological queries

## Doctor Collection

### Primary Indexes

- `_id`: Primary key (automatic)
- `medicalLicense`: Unique index for license validation
- `specialties`: Multi-key index for specialty filtering
- `rating + reviewCount`: For sorting by popularity

### Composite Indexes

- `location.city + location.state`: For location-based searches
- `role + isActive + specialties`: For complex doctor queries
- `specialties`: For specialty-based filtering

## Patient Collection

### Primary Indexes

- `_id`: Primary key (automatic)
- `role + isActive`: For patient queries

### Composite Indexes

- `createdAt`: For chronological queries

## Subscription Collection

### Primary Indexes

- `_id`: Primary key (automatic)
- `patientId + doctorId`: Unique compound index (prevents duplicate subscriptions)
- `status`: For filtering by subscription status
- `isActive + status`: For active subscription queries

### Composite Indexes

- `patientId + status`: For patient's subscription list
- `doctorId + status`: For doctor's subscription requests
- `status + requestedAt`: For chronological status queries

## Chat Collection

### Primary Indexes

- `_id`: Primary key (automatic)
- `subscriptionId`: Unique index (one chat per subscription)
- `participants`: Multi-key index for user chat lookups
- `status + lastMessageAt`: For active chat queries

### Composite Indexes

- `createdAt`: For chronological queries

## Message Collection

### Primary Indexes

- `_id`: Primary key (automatic)
- `chatId + createdAt`: For chat message history
- `senderId + createdAt`: For user message history
- `isRead + createdAt`: For unread message queries

### Composite Indexes

- `type + createdAt`: For message type filtering

## Performance Considerations

### Query Optimization

- All frequently queried fields have appropriate indexes
- Compound indexes are ordered by selectivity (most selective first)
- Text search indexes may be added for full-text search capabilities

### Index Maintenance

- Regular index usage analysis should be performed
- Unused indexes should be dropped to improve write performance
- Index size monitoring for storage optimization

### Common Query Patterns

1. **User Authentication**: `email` index
2. **Doctor Search**: `specialties + location + rating` indexes
3. **Subscription Management**: `patientId + status` and `doctorId + status` indexes
4. **Chat History**: `chatId + createdAt` index
5. **Unread Messages**: `isRead + createdAt` index

## Index Creation Commands

```javascript
// User collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, isActive: 1 });

// Doctor collection
db.doctors.createIndex({ medicalLicense: 1 }, { unique: true });
db.doctors.createIndex({ specialties: 1 });
db.doctors.createIndex({ 'location.city': 1, 'location.state': 1 });
db.doctors.createIndex({ rating: -1, reviewCount: -1 });

// Subscription collection
db.subscriptions.createIndex({ patientId: 1, doctorId: 1 }, { unique: true });
db.subscriptions.createIndex({ patientId: 1, status: 1 });
db.subscriptions.createIndex({ doctorId: 1, status: 1 });

// Chat collection
db.chats.createIndex({ subscriptionId: 1 }, { unique: true });
db.chats.createIndex({ participants: 1 });
db.chats.createIndex({ status: 1, lastMessageAt: -1 });

// Message collection
db.messages.createIndex({ chatId: 1, createdAt: 1 });
db.messages.createIndex({ senderId: 1, createdAt: 1 });
db.messages.createIndex({ isRead: 1, createdAt: 1 });
```
