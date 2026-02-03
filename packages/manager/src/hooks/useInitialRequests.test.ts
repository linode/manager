import { renderHook, waitFor } from '@testing-library/react';

import { storage } from 'src/utilities/storage';

import { useInitialRequests } from './useInitialRequests';

vi.stubEnv('REACT_APP_CLIENT_ID', 'test-client-id');
vi.stubEnv('REACT_APP_LOGIN_ROOT', 'https://login.test');

const queryClientMock = {
  prefetchQuery: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQueryClient: () => queryClientMock,
  };
});

const oauthMocks = vi.hoisted(() => ({
  validateTokenAndSession: vi.fn(),
}));

vi.mock('src/OAuth/oauth', async () => {
  const actual = await vi.importActual('src/OAuth/oauth');
  return {
    ...actual,
    validateTokenAndSession: oauthMocks.validateTokenAndSession,
  };
});

describe('OAuth token verification and initial data fetch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    storage.authentication.token.clear();
    vi.mocked(require('react-redux')).useSelector = vi.fn().mockReturnValue(false);
  });

  it('redirects to logout when login server reports the token does not match the session', async () => {
    storage.authentication.token.set('Bearer faketoken');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ match: false }),
    } as any);

    const { result } = renderHook(() => useInitialRequests());

    await waitFor(() => expect(oauthMocks.validateTokenAndSession).toHaveBeenCalled());
  });

  it('runs initial requests when login server confirms the token belongs to the session (USER_MATCH)', async () => {
    storage.authentication.token.set('Bearer faketoken');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ match: true }),
    } as any);

    const { result } = renderHook(() => useInitialRequests());

    await waitFor(() => expect(queryClientMock.prefetchQuery).toHaveBeenCalled());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(oauthMocks.validateTokenAndSession).not.toHaveBeenCalled();
  });

  it('falls back to running initial requests if token verification fetch fails (network/error)', async () => {
    storage.authentication.token.set('Bearer faketoken');

    global.fetch = vi.fn().mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useInitialRequests());

    await waitFor(() => expect(queryClientMock.prefetchQuery).toHaveBeenCalled());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(oauthMocks.validateTokenAndSession).not.toHaveBeenCalled();
  });

  it('does not call the login server verify endpoint for Admin tokens', async () => {
    storage.authentication.token.set('Admin admintoken');

    global.fetch = vi.fn().mockRejectedValue(new Error('should-not-be-called'));

    const { result } = renderHook(() => useInitialRequests());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
