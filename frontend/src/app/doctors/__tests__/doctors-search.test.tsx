import { render, screen, fireEvent } from '@testing-library/react';
import DoctorsPage from '../page';

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

  it('renders the search button', () => {
    render(<DoctorsPage />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('allows typing in the search input', () => {
    render(<DoctorsPage />);
    const searchInput = screen.getByPlaceholderText(
      /search by name, location, or specialty/i
    );
    fireEvent.change(searchInput, { target: { value: 'cardiologist' } });
    expect(searchInput).toHaveValue('cardiologist');
  });

  it('shows loading state when search is clicked', () => {
    render(<DoctorsPage />);
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });
});
