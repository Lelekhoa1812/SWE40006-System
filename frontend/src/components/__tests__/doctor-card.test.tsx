import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DoctorCard } from '../doctor-card';
import type { Doctor } from '../../types/doctor';

const mockDoctor: Doctor = {
  id: '1',
  name: 'Dr. Jane Doe',
  specialty: 'Cardiology',
  email: 'jane@example.com',
  phone: '555-555-5555',
  experience: 10,
  rating: 4.7,
  bio: 'Experienced cardiologist',
  availability: 'Mon-Fri',
};

describe('DoctorCard', () => {
  it('renders doctor fields', () => {
    render(<DoctorCard doctor={mockDoctor} />);
    expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    expect(screen.getByText(/Phone:/)).toBeInTheDocument();
    expect(screen.getByText(/Experience:/)).toBeInTheDocument();
    expect(screen.getByText(/Rating:/)).toBeInTheDocument();
  });
});
