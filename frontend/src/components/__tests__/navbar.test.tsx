import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Navbar } from '../navbar';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navbar', () => {
  it('renders the Medical Messenger brand', () => {
    render(<Navbar />);
    expect(screen.getByText('Medical Messenger')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Doctors')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders sign in and get started buttons', () => {
    render(<Navbar />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});
