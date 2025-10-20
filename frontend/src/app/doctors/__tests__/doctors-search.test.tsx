import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DoctorsPage from '../page';

// Mock the API call
vi.mock('@/lib/api', () => ({
  fetchJson: vi.fn().mockResolvedValue([]),
}));

describe('Doctors Search', () => {
  it('renders the search input', () => {
    render(<DoctorsPage />);
    const searchInput = screen.getByPlaceholderText(
      /search by name, location, or specialty/i
    );
    expect(searchInput).toBeInTheDocument();
  });

  it('renders the specialty filter dropdown', () => {
    render(<DoctorsPage />);
    expect(screen.getByText('All Specialties')).toBeInTheDocument();
  });

  it('renders the search button in loading state initially', () => {
    render(<DoctorsPage />);
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('allows typing in the search input', () => {
    render(<DoctorsPage />);
    const searchInput = screen.getByPlaceholderText(
      /search by name, location, or specialty/i
    );
    fireEvent.change(searchInput, { target: { value: 'cardiologist' } });
    expect(searchInput).toHaveValue('cardiologist');
  });

  it('shows loading state when search is clicked', async () => {
    render(<DoctorsPage />);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });
});
