# Privacy Consent and Data Protection

## Overview

This document outlines the privacy consent requirements and data protection measures for the Medical Messenger platform, specifically regarding patient-doctor subscription requests and data sharing.

## Consent Notice

### Initial Consent Modal

Before a patient can request a subscription to a doctor, they must acknowledge the following privacy notice:

---

**Privacy Notice for Doctor Subscriptions**

By requesting a subscription to a doctor, you consent to:

1. **Data Sharing**: Your basic profile information (name, email) will be shared with the requested doctor for review purposes.

2. **Communication**: If approved, you may receive communications from the doctor through our secure platform.

3. **Medical Information**: Any medical information you share will be protected under applicable healthcare privacy laws.

4. **Data Retention**: Your subscription data will be retained for the duration of your relationship with the doctor and as required by law.

5. **Withdrawal**: You may withdraw your consent at any time by canceling your subscription request.

**By clicking "I Agree", you acknowledge that you have read and understood this privacy notice.**

---

### Consent Storage

- Consent acknowledgment is stored in `localStorage` with key `medmsg-privacy-consent`
- Value: `"acknowledged"` with timestamp
- Consent is valid for 1 year from acknowledgment date
- Users can re-acknowledge consent if it expires

## Data Protection Measures

### Patient Data Protection

1. **Minimal Data Sharing**: Only essential information is shared with doctors during subscription requests
2. **Encryption**: All data is encrypted in transit and at rest
3. **Access Controls**: Role-based access ensures only authorized users can view relevant data
4. **Audit Logging**: All data access and modifications are logged

### Doctor Data Protection

1. **Verification**: Doctors must be verified and licensed before joining the platform
2. **Secure Communication**: All doctor-patient communications are encrypted
3. **Data Minimization**: Doctors only receive necessary patient information for care decisions

## User Rights

### Right to Access

- Users can view all their personal data through their dashboard
- Users can export their data in a portable format

### Right to Rectification

- Users can update their profile information at any time
- Users can correct inaccurate data

### Right to Erasure

- Users can request deletion of their account and associated data
- Subscription data may be retained for legal compliance

### Right to Portability

- Users can export their data in a machine-readable format
- Data can be transferred to other healthcare providers

## Compliance

### HIPAA Compliance

- Platform is designed with HIPAA requirements in mind
- Business Associate Agreements (BAAs) are required for all healthcare providers
- Administrative, physical, and technical safeguards are implemented

### GDPR Compliance

- Lawful basis for processing: Consent and legitimate interest
- Data subject rights are fully supported
- Privacy by design principles are followed

## Data Breach Response

1. **Detection**: Automated monitoring for suspicious activities
2. **Assessment**: Immediate assessment of breach scope and impact
3. **Notification**: Affected users notified within 72 hours
4. **Remediation**: Immediate steps to prevent further breaches
5. **Documentation**: Complete incident documentation for regulatory reporting

## Contact Information

For privacy-related questions or concerns:

- **Privacy Officer**: privacy@medmsg.com
- **Data Protection Officer**: dpo@medmsg.com
- **General Inquiries**: support@medmsg.com

## Policy Updates

This privacy policy may be updated periodically. Users will be notified of significant changes through:

1. Email notification
2. In-app notification
3. Updated consent modal on next login

## Implementation Notes

### Frontend Implementation

- Consent modal appears before first subscription request
- Consent status checked on each subscription attempt
- Clear opt-out mechanisms available

### Backend Implementation

- Consent logging in audit trails
- Data access controls based on consent status
- Automated consent expiration handling

### Database Schema

- Consent records stored with timestamps
- Audit trail for all consent-related actions
- Data retention policies implemented at database level
