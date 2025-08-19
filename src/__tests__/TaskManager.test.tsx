import { render, screen, waitFor } from '@testing-library/react';
import { TaskManager } from '../components/TaskManager';

const mockQueryResult = Promise.resolve({ data: [], error: null });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockQuery: any = {
  select: vi.fn(() => mockQuery),
  order: vi.fn(() => mockQuery),
  eq: vi.fn(() => mockQuery),
  then: mockQueryResult.then.bind(mockQueryResult),
  catch: mockQueryResult.catch.bind(mockQueryResult),
};

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn(() => mockQuery) },
  getCurrentLocation: vi.fn(),
  formatLocation: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ profile: { id: '1', role: 'worker' } }),
}));

test('renders task manager heading for worker', async () => {
  render(<TaskManager />);
  await waitFor(() => expect(screen.getByText('Мои задачи')).toBeInTheDocument());
});
