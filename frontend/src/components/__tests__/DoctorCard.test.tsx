import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DoctorCard from '../DoctorCard';

// Mock the auth context
const mockUser = {
  id: '68fa4142885c903d84b6868d',
  username: 'testuser',
  email: 'test@test.com',
  role: 'patient' as const,
};

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
  }),
}));

describe('DoctorCard', () => {
  const mockDoctor = {
    _id: '68fa5d2d45ffa1b0b99c4524',
    email: 'dr.smith@example.com',
    profile: {
      firstName: 'Dr. John',
      lastName: 'Smith',
      phone: '+1-555-0101',
    },
    specialties: ['cardiology', 'internal_medicine'],
    bio: 'Experienced cardiologist with 15 years of practice.',
    location: {
      city: 'New York',
      state: 'NY',
    },
    rating: 4.8,
    reviewCount: 127,
    consultationFee: 200,
  };

  const mockOnSubscribe = vi.fn();
  const mockUserSubscriptions = [];

  it('should render doctor information correctly', () => {
    render(
      <DoctorCard
        doctor={mockDoctor}
        onSubscribe={mockOnSubscribe}
        userSubscriptions={mockUserSubscriptions}
      />
    );

    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    expect(screen.getByText('Cardiologist')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(127 reviews)')).toBeInTheDocument();
  });

  it('should show subscribe button for non-subscribed doctor', () => {
    render(
      <DoctorCard
        doctor={mockDoctor}
        onSubscribe={mockOnSubscribe}
        userSubscriptions={mockUserSubscriptions}
      />
    );

    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('should show chat button for approved subscription', () => {
    const approvedSubscriptions = [
      {
        _id: 'subscription-id',
        doctorId: { _id: mockDoctor._id },
        status: 'approved',
      },
    ];

    render(
      <DoctorCard
        doctor={mockDoctor}
        onSubscribe={mockOnSubscribe}
        userSubscriptions={approvedSubscriptions}
      />
    );

    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('should call onSubscribe when subscribe button is clicked', () => {
    render(
      <DoctorCard
        doctor={mockDoctor}
        onSubscribe={mockOnSubscribe}
        userSubscriptions={mockUserSubscriptions}
      />
    );

    const subscribeButton = screen.getByText('Subscribe');
    fireEvent.click(subscribeButton);

    expect(mockOnSubscribe).toHaveBeenCalledWith(
      mockDoctor._id,
      'Dr. John Smith'
    );
  });

  it('should display specialties correctly', () => {
    render(
      <DoctorCard
        doctor={mockDoctor}
        onSubscribe={mockOnSubscribe}
        userSubscriptions={mockUserSubscriptions}
      />
    );

    expect(screen.getByText('Cardiology')).toBeInTheDocument();
    expect(screen.getByText('Internal Medicine')).toBeInTheDocument();
  });

  it('should handle doctor without bio gracefully', () => {
    const doctorWithoutBio = { ...mockDoctor, bio: undefined };

    render(
      <DoctorCard
        doctor={doctorWithoutBio}
        onSubscribe={mockOnSubscribe}
        userSubscriptions={mockUserSubscriptions}
      />
    );

    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
  });

  it('should handle doctor without location gracefully', () => {
    const doctorWithoutLocation = { ...mockDoctor, location: undefined };

    render(
      <DoctorCard
        doctor={doctorWithoutLocation}
        onSubscribe={mockOnSubscribe}
        userSubscriptions={mockUserSubscriptions}
      />
    );

    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
  });
});
