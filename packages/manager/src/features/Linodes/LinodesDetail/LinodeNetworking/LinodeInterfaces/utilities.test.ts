import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVPC,
  linodeInterfaceFactoryVlan,
} from 'src/factories/linodeInterface';

import { getLinodeInterfaceType } from './utilities';

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
