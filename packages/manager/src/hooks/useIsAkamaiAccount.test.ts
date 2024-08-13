import { renderHook, waitFor } from '@testing-library/react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsAkamaiAccount } from './useIsAkamaiAccount';

describe('useIsAkamaiAccount', () => {
  it('returns true when the header is included', async () => {
    server.use(
      http.get('*/profile', () => {
        return new HttpResponse(null, {
          headers: { 'Akamai-Internal-Account': '*' },
        });
      })
    );

    const { result } = renderHook(() => useIsAkamaiAccount(), {
      wrapper: (ui) => wrapWithTheme(ui),
    });

    await waitFor(() => {
      expect(result.current.isAkamaiAccount).toBe(true);
    });
  });

  it('returns false otherwise', async () => {
    const { result } = renderHook(() => useIsAkamaiAccount(), {
      wrapper: (ui) => wrapWithTheme(ui),
    });

    await waitFor(() => {
      expect(result.current.isAkamaiAccount).toBe(false);
    });
  });
});
