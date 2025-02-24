import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVPC,
  linodeInterfaceFactoryVlan,
} from 'src/factories/linodeInterfaces';

import {
  getLinodeInterfaceType,
  humanizeLinodeInterfaceStatus,
} from './utilities';

describe('getLinodeInterfaceType', () => {
  it("returns 'public' if the given interface defines a public interface", () => {
    const networkInterface = linodeInterfaceFactoryPublic.build();

    expect(getLinodeInterfaceType(networkInterface)).toBe('public');
  });

  it("returns 'vpc' if the given interface defines a VPC interface", () => {
    const networkInterface = linodeInterfaceFactoryVPC.build();

    expect(getLinodeInterfaceType(networkInterface)).toBe('vpc');
  });

  it("returns 'vlan' if the given interface defines a VLAN interface", () => {
    const networkInterface = linodeInterfaceFactoryVlan.build();

    expect(getLinodeInterfaceType(networkInterface)).toBe('vlan');
  });
});

describe('humanizeLinodeInterfaceStatus', () => {
  it('humanizes each status', () => {
    expect(humanizeLinodeInterfaceStatus('active')).toBe('Active');
    expect(humanizeLinodeInterfaceStatus('inactive')).toBe('Inactive');
    expect(humanizeLinodeInterfaceStatus('deleted')).toBe('Deleted');
  });
});
