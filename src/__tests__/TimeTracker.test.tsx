import { render, screen } from '@testing-library/react';
import { TimeTracker } from '../components/TimeTracker';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ profile: null }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {},
  getCurrentLocation: vi.fn(),
  formatLocation: vi.fn(),
}));

test('shows start work button when no session', () => {
  render(<TimeTracker />);
  expect(screen.getByText('Начать работу')).toBeInTheDocument();
});
