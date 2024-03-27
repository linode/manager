import { act, renderHook, waitFor } from '@testing-library/react';

import { queryClientFactory } from 'src/queries/base';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { usePendingRevocationToken } from './usePendingRevocationToken'; // Adjust path as needed
import { Token } from '@linode/api-v4';

const queryClient = queryClientFactory();

const queryMocks = vi.hoisted(() => ({
  getPersonalAccessTokenForRevocation: vi.fn(
    (tokens, currentTokenWithBearer) => {
      const tokenValue = currentTokenWithBearer.replace('Bearer ', '');
      const foundToken = tokens.find(
        (token: Token) => token.token === tokenValue
      );
      return Promise.resolve(foundToken);
    }
  ),
  useCurrentToken: vi.fn(() => 'Bearer 232345245345'),
  usePersonalAccessTokensQuery: vi.fn().mockReturnValue({
    data: {
      data: [{ id: 123, token: '232345245345' }],
    },
  }),
}));

vi.mock('src/queries/tokens', async () => {
  const actual = await vi.importActual('src/queries/tokens');
  return {
    ...actual,
    usePersonalAccessTokensQuery: queryMocks.usePersonalAccessTokensQuery,
  };
});

vi.mock('src/features/Account/utils', async () => {
  const actual = await vi.importActual('src/features/Account/utils');
  return {
    ...actual,
    getPersonalAccessTokenForRevocation:
      queryMocks.getPersonalAccessTokenForRevocation,
  };
});

vi.mock('src/hooks/useAuthentication', async () => {
  const actual = await vi.importActual('src/hooks/useAuthentication');
  return {
    ...actual,
    useCurrentToken: queryMocks.useCurrentToken,
  };
});

describe('usePendingRevocationToken', () => {
  it('should set pendingRevocationToken id when personal access tokens are available', async () => {
    const { result } = renderHook(() => usePendingRevocationToken(), {
      wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
    });

    await waitFor(() => {
      expect(result.current.pendingRevocationToken?.id).toBeUndefined();
    });

    await act(async () => {
      await result.current.getPendingRevocationToken();
    });

    await waitFor(() => {
      expect(result.current.pendingRevocationToken?.id).toEqual(123);
    });
  });

  it('should not set pendingRevocationToken?.id when no matching tokens are available', async () => {
    // Adjust the mock to return a token that doesn't match
    queryMocks.useCurrentToken.mockReturnValue('Bearer nonMatchingToken');

    const { result } = renderHook(() => usePendingRevocationToken(), {
      wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
    });

    await act(async () => {
      await result.current.getPendingRevocationToken();
    });

    // Now expecting undefined because there should be no match
    await waitFor(() => {
      expect(result.current.pendingRevocationToken?.id).toBeUndefined();
    });
  });
});
