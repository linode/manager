import { linodeConfigInterfaceFactory } from '@linode/utilities';

import { getPrimaryInterfaceIndex, useGetDeviceLimit } from './utilities';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}));

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
}));

describe('getPrimaryInterfaceIndex', () => {
  it('returns null if there are no interfaces', () => {
    expect(getPrimaryInterfaceIndex([])).toBeNull();
  });

  it('returns the primary interface when one is designated as primary', () => {
    const interfaces = [
      linodeConfigInterfaceFactory.build({ primary: false }),
      linodeConfigInterfaceFactory.build({ primary: true }),
      linodeConfigInterfaceFactory.build({ primary: false }),
    ];

    expect(getPrimaryInterfaceIndex(interfaces)).toBe(1);
  });

  it('returns the index of the first non-VLAN interface if there is no interface designated as primary', () => {
    const interfaces = [
      linodeConfigInterfaceFactory.build({ primary: false, purpose: 'vlan' }),
      linodeConfigInterfaceFactory.build({ primary: false, purpose: 'public' }),
    ];

    expect(getPrimaryInterfaceIndex(interfaces)).toBe(1);
  });

  it('returns null when there is no primary interface', () => {
    const interfaces = [
      linodeConfigInterfaceFactory.build({ primary: false, purpose: 'vlan' }),
    ];

    expect(getPrimaryInterfaceIndex(interfaces)).toBe(null);
  });
});

describe('useGetDeviceLimit', () => {
  it('should always return 8 as the device limit', () => {
    queryMocks.useFlags.mockReturnValue({
      blockStorageVolumeLimit: false,
    });

    expect(useGetDeviceLimit(131072)).toEqual(8);
    expect(useGetDeviceLimit(65536)).toEqual(8);
    expect(useGetDeviceLimit(16384)).toEqual(8);
    expect(useGetDeviceLimit(1024)).toEqual(8);
  });

  it('should calculate the correct device limit', () => {
    queryMocks.useFlags.mockReturnValue({
      blockStorageVolumeLimit: true,
    });

    expect(useGetDeviceLimit(131072)).toEqual(64);
    expect(useGetDeviceLimit(65536)).toEqual(64);
    expect(useGetDeviceLimit(16384)).toEqual(16);
    expect(useGetDeviceLimit(1024)).toEqual(8);
  });
});
