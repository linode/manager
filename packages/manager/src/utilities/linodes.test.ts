import { linodeFactory } from '@linode/utilities';
import { renderHook, waitFor } from '@testing-library/react';

import { accountFactory, accountMaintenanceFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';

import {
  addMaintenanceToLinodes,
  useIsLinodeCloneFirewallEnabled,
  useIsLinodeInterfacesEnabled,
} from './linodes';
import { wrapWithTheme } from './testHelpers';

describe('addMaintenanceToLinodes', () => {
  it('adds relevant maintenance items to Linodes', () => {
    const linodes = linodeFactory.buildList(2);
    const accountMaintenance = accountMaintenanceFactory.buildList(1, {
      entity: { type: 'linode' },
    });
    const result = addMaintenanceToLinodes(accountMaintenance, linodes);
    expect(result[0].maintenance).not.toBeNull();
    expect(result[1].maintenance).toBeNull();
    expect(result[0].maintenance?.when).toBe(accountMaintenance[0].when);
  });
});

describe('useIsLinodeInterfacesEnabled', () => {
  it('returns isLinodeInterfacesEnabled: true if the feature is enabled and account has the capability', async () => {
    const options = { flags: { linodeInterfaces: { enabled: true } } };
    const account = accountFactory.build({
      capabilities: ['Linode Interfaces'],
    });

    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { result } = renderHook(() => useIsLinodeInterfacesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current?.isLinodeInterfacesEnabled).toBe(true);
    });
  });

  it('returns isLinodeInterfacesEnabled: false if the feature is NOT enabled', () => {
    const options = { flags: { linodeInterfaces: { enabled: false } } };

    const { result } = renderHook(() => useIsLinodeInterfacesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isLinodeInterfacesEnabled).toBe(false);
  });
});

describe('useIsLinodeCloneFirewallEnabled', () => {
  it('returns isLinodeCloneFirewallEnabled: true if the feature is enabled', () => {
    const options = { flags: { linodeCloneFirewall: true } };

    const { result } = renderHook(() => useIsLinodeCloneFirewallEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isLinodeCloneFirewallEnabled).toBe(true);
  });

  it('returns isLinodeCloneFirewallEnabled: false if the feature is NOT enabled', () => {
    const options = { flags: { linodeCloneFirewall: false } };

    const { result } = renderHook(() => useIsLinodeCloneFirewallEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.isLinodeCloneFirewallEnabled).toBe(false);
  });
});
