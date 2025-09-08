import { linodeConfigInterfaceFactory } from '@linode/utilities';

import {
  getPrimaryInterfaceIndex,
  isDiskDevice,
  isVolumeDevice,
} from './utilities';

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

describe('isDiskDevice', () => {
  it('returns true if the device defines a disk id', () => {
    expect(isDiskDevice({ disk_id: 2, volume_id: null })).toBe(true);
  });

  it('returns false if the device does not define a disk id', () => {
    expect(isDiskDevice({ disk_id: null, volume_id: 1 })).toBe(false);
  });

  it('returns false if the device is malformed', () => {
    // @ts-expect-error testing an invalid device
    expect(isDiskDevice({ disk_id: null, volume_id: null })).toBe(false);
  });
});

describe('isVolumeDevice', () => {
  it('returns true if the device defines a volume id', () => {
    expect(isVolumeDevice({ disk_id: null, volume_id: 1 })).toBe(true);
  });

  it('returns false if the device does not define a volume id', () => {
    expect(isVolumeDevice({ disk_id: 5, volume_id: null })).toBe(false);
  });

  it('returns false if the device is malformed', () => {
    // @ts-expect-error testing an invalid device
    expect(isVolumeDevice({ disk_id: null, volume_id: null })).toBe(false);
  });
});
