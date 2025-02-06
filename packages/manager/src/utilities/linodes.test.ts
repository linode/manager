import { renderHook } from '@testing-library/react';

import { accountMaintenanceFactory, linodeFactory } from 'src/factories';

import {
  addMaintenanceToLinodes,
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
  it('returns enabled: true if the feature is enabled', () => {
    const options = { flags: { linodeInterfaces: { enabled: true } } };

    const { result } = renderHook(() => useIsLinodeInterfacesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.enabled).toBe(true);
  });

  it('returns enabled: false if the feature is NOT enabled', () => {
    const options = { flags: { linodeInterfaces: { enabled: false } } };

    const { result } = renderHook(() => useIsLinodeInterfacesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    expect(result.current?.enabled).toBe(false);
  });
});
