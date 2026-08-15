import '@testing-library/jest-dom';
import { store } from '@/store/store';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Login from '@/Pages/AuthPages/Login';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';

// Mock the RTK Query hook so we control success/failure per test
const mockLogin = vi.fn();
vi.mock('@/auth/apiAuth', () => ({
  useLoginMutation: () => [mockLogin, { isLoading: false }],
}));

// Mock the useNavigate hook so we can control navigation per test
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });
});

// Test 1
it('shows validation errors for empty submit', async () => {
  renderLogin();
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
  expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
});

// Test 2
it('submits valid credentials and navigates on success', async () => {
  mockLogin.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        token: 'abc123',
        username: 'alice',
      }),
  });
  renderLogin();

  await userEvent.type(screen.getByLabelText(/username/i), 'alice123');
  await userEvent.type(screen.getByLabelText(/password/i), 'hunter2!');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith({
      username: 'alice123',
      password: 'hunter2!',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/home/alice');
  });
});

// Test 3
it('shows an error message when login fails', async () => {
  mockLogin.mockReturnValue({
    unwrap: () => Promise.reject(new Error('Invalid credentials')),
  });
  renderLogin();

  await userEvent.type(screen.getByLabelText(/username/i), 'alice123');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});

it('navigates to signup when link is clicked', async () => {
  renderLogin();
  await userEvent.click(screen.getByText(/sign up/i));
  expect(mockNavigate).toHaveBeenCalledWith('/signup');
});
