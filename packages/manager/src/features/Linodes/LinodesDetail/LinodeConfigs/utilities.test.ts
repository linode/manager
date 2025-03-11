import { linodeConfigInterfaceFactory } from '@linode/utilities';

import { getPrimaryInterfaceIndex } from './utilities';

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
