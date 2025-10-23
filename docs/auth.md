# Authentication System

## Overview

The authentication system provides secure user registration, login, and session management for the Medical Messenger application.

## Backend Authentication

### Routes

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `POST /api/v1/auth/logout` - Logout and destroy session
- `GET /api/v1/auth/me` - Get current user profile
- `PATCH /api/v1/auth/profile` - Update user profile

### Security Features

- **Password Hashing**: Uses bcryptjs with salt rounds of 12
- **Session Management**: HTTP-only cookies with secure settings
- **Input Validation**: Zod schemas for all endpoints
- **Role-based Access**: Support for patient, doctor, and admin roles

### Session Configuration

- **Cookie Security**:
  - `httpOnly: true` - Prevents XSS attacks
  - `secure: true` in production - HTTPS only
  - `sameSite: 'lax'` - CSRF protection
  - `maxAge: 24 hours` - Session expiration

- **Storage**: MongoDB session store for scalability

## Frontend Authentication

### Components

- **AuthProvider**: React context for global auth state
- **Login Page**: `/auth/login` - User login form
- **Register Page**: `/auth/register` - User registration form
- **Dashboard**: `/dashboard` - Protected user area

### Features

- **Form Validation**: React Hook Form with Zod validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during auth operations
- **Auto-redirect**: Automatic navigation based on auth state

## Password Policy

- Minimum 8 characters
- No complexity requirements (can be enhanced)
- Stored as bcrypt hash in database

## Cookie Policy

- **Purpose**: Session management and user authentication
- **Duration**: 24 hours from last activity
- **Security**: HTTP-only, secure in production
- **Scope**: Application-wide authentication state

## User Roles

### Patient

- Can browse doctors
- Can request subscriptions
- Can view own subscriptions

### Doctor

- Can manage subscription requests
- Can view patient profiles
- Can access doctor dashboard

### Admin

- Full system access
- User management capabilities

## Security Considerations

1. **Password Storage**: Never store plain text passwords
2. **Session Security**: Use secure, HTTP-only cookies
3. **Input Validation**: Validate all user inputs
4. **Error Messages**: Don't reveal sensitive information
5. **Rate Limiting**: Consider implementing for auth endpoints

## Development Notes

- All auth routes include comprehensive error handling
- Session middleware validates user on protected routes
- Frontend automatically handles auth state changes
- Database models include proper indexing for performance
