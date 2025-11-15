import { renderHook, waitFor } from '@testing-library/react';

import { accountFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsNetworkLoadBalancerEnabled } from './utils';

describe('useIsNetworkLoadBalancerEnabled', () => {
  it('returns true if the feature is enabled', async () => {
    const options = { flags: { networkLoadBalancer: true } };
    const account = accountFactory.build({
      capabilities: ['Network LoadBalancer'],
    });

    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { result } = renderHook(() => useIsNetworkLoadBalancerEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isNetworkLoadBalancerEnabled).toBe(true);
    });
  });

  it('returns false if the feature is NOT enabled', async () => {
    const options = { flags: { networkLoadBalancer: false } };

    const { result } = renderHook(() => useIsNetworkLoadBalancerEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isNetworkLoadBalancerEnabled).toBe(false);
    });
  });
});
