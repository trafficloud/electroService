import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

vi.mock('../lib/supabase', () => ({
  supabase: {},
  hasValidCredentials: false,
}));

test('returns default state when credentials invalid', async () => {
  const { result } = renderHook(() => useAuth());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.user).toBeNull();
  expect(result.current.profile).toBeNull();
});
