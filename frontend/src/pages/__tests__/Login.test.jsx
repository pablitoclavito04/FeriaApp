import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the contexts and router navigation the page depends on.
const loginMock = vi.fn();
const showToastMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../../context/useAuth', () => ({ default: () => ({ login: loginMock }) }));
vi.mock('../../context/useToast', () => ({ default: () => ({ showToast: showToastMock }) }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => navigateMock };
});

import Login from '../Login';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-in form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields and does not call login', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email format', () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('rejects a too-short password', () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates on success', async () => {
    loginMock.mockResolvedValue({ name: 'Admin' });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@feriaapp.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'admin1234' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('admin@feriaapp.com', 'admin1234'));
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error when login fails', async () => {
    loginMock.mockRejectedValue(new Error('401'));
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@feriaapp.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpw' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('toggles password visibility', () => {
    renderLogin();
    const pw = screen.getByPlaceholderText('Password');
    expect(pw).toHaveAttribute('type', 'password');
    // The eye button is the only other button besides submit and the close (×).
    const toggle = pw.parentElement.querySelector('.login__toggle-password');
    fireEvent.click(toggle);
    expect(pw).toHaveAttribute('type', 'text');
  });
});
