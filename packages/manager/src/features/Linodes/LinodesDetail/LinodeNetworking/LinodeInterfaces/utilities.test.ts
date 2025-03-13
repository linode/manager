import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVPC,
  linodeInterfaceFactoryVlan,
} from '@linode/utilities';

import { getLinodeInterfaceType } from './utilities';

describe('getLinodeInterfaceType', () => {
  it("returns 'public' if the given interface defines a public interface", () => {
    const networkInterface = linodeInterfaceFactoryPublic.build();

    expect(getLinodeInterfaceType(networkInterface)).toBe('Public');
  });

  it("returns 'vpc' if the given interface defines a VPC interface", () => {
    const networkInterface = linodeInterfaceFactoryVPC.build();

    expect(getLinodeInterfaceType(networkInterface)).toBe('VPC');
  });

  it("returns 'vlan' if the given interface defines a VLAN interface", () => {
    const networkInterface = linodeInterfaceFactoryVlan.build();

    expect(getLinodeInterfaceType(networkInterface)).toBe('VLAN');
  });
});
