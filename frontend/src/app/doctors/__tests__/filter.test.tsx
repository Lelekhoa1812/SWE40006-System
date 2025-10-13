import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DoctorsPage from '../page';
import { vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  fetchJson: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Dr. Alice',
      specialty: 'Cardiology',
      email: 'a@a.com',
      phone: '1',
      experience: 5,
      rating: 4.5,
      bio: 'bio',
      availability: 'Mon',
    },
    {
      id: '2',
      name: 'Dr. Bob',
      specialty: 'Dermatology',
      email: 'b@b.com',
      phone: '2',
      experience: 7,
      rating: 4.7,
      bio: 'bio',
      availability: 'Tue',
    },
  ]),
}));

describe('Doctors filtering', () => {
  it('filters by name and specialty', async () => {
    render(<DoctorsPage />);

    await waitFor(() => {
      expect(screen.queryByText('No doctors found.')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(input, { target: { value: 'alice' } });

    // open select by clicking trigger text
    const trigger = screen.getByText('All Specialties');
    fireEvent.click(trigger);
    const dermOption = await screen.findByText('Dermatology');
    fireEvent.click(dermOption);

    // Now name=alice AND specialty=Dermatology should produce no results
    await waitFor(() => {
      expect(screen.getByText('No doctors found.')).toBeInTheDocument();
    });
  });
});
