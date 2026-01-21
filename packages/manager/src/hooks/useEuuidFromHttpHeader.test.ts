import { renderHook, waitFor } from '@testing-library/react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useEuuidFromHttpHeader } from './useEuuidFromHttpHeader';

describe('useEuuidFromHttpHeader', () => {
  it('returns EUUID when the header is included', async () => {
    const mockEuuid = 'test-euuid-12345';

    server.use(
      http.get('*/profile', () => {
        return new HttpResponse(null, {
          headers: { 'X-Customer-Uuid': mockEuuid },
        });
      })
    );

    const { result } = renderHook(() => useEuuidFromHttpHeader(), {
      wrapper: (ui) => wrapWithTheme(ui),
    });

    await waitFor(() => {
      expect(result.current.euuid).toBe(mockEuuid);
    });
  });

  it('returns undefined when the header is not included', async () => {
    server.use(
      http.get('*/profile', () => {
        return new HttpResponse(null, {
          headers: {},
        });
      })
    );

    const { result } = renderHook(() => useEuuidFromHttpHeader(), {
      wrapper: (ui) => wrapWithTheme(ui),
    });

    await waitFor(() => {
      expect(result.current.euuid).toBeUndefined();
    });
  });

  it('returns undefined when profile is loading', () => {
    const { result } = renderHook(() => useEuuidFromHttpHeader(), {
      wrapper: (ui) => wrapWithTheme(ui),
    });

    // Before the profile loads, euuid should be undefined
    expect(result.current.euuid).toBeUndefined();
  });
});
