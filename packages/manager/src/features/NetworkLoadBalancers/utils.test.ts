import { accountQueries, queryClientFactory } from '@linode/queries';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { accountFactory } from 'src/factories';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsNetworkLoadBalancerEnabled } from './utils';

describe('useIsNetworkLoadBalancerEnabled', () => {
  it('returns true if the feature is enabled', async () => {
    const options = { flags: { networkLoadBalancer: true } };
    const account = accountFactory.build({
      capabilities: ['Network LoadBalancer'],
    });

    const queryClient = queryClientFactory();
    queryClient.setQueryData(accountQueries.account.queryKey, account);

    const wrapper = ({ children }: { children: ReactNode }) =>
      wrapWithTheme(children, { ...options, queryClient });

    const { result } = renderHook(() => useIsNetworkLoadBalancerEnabled(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isNetworkLoadBalancerEnabled).toBe(true);
    });
  });

  it('returns false if the feature is NOT enabled', async () => {
    const options = { flags: { networkLoadBalancer: false } };
    const account = accountFactory.build({ capabilities: [] });

    const queryClient = queryClientFactory();
    queryClient.setQueryData(accountQueries.account.queryKey, account);

    const wrapper = ({ children }: { children: ReactNode }) =>
      wrapWithTheme(children, { ...options, queryClient });

    const { result } = renderHook(() => useIsNetworkLoadBalancerEnabled(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isNetworkLoadBalancerEnabled).toBe(false);
    });
  });
});
