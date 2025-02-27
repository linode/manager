import { describe, expect, it } from 'vitest';

import {
  linodeConfigInterfaceFactory,
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVPC,
  linodeInterfaceFactoryVlan,
} from '../factories';
import { getIsLegacyInterfaceArray } from './getIsLegacyInterfaceArray';

describe('getIsLegacyInterfaceArray', () => {
  it('determines the given interfaces are legacy', () => {
    const legacyInterfaces = linodeConfigInterfaceFactory.buildList(3);
    expect(getIsLegacyInterfaceArray(legacyInterfaces)).toBe(true);
    expect(getIsLegacyInterfaceArray(undefined)).toBe(true);
    expect(getIsLegacyInterfaceArray([])).toBe(true);
  });

  it('returns false if the given interfaces are new Linode Interfaces', () => {
    const linodeInterfacesVlan = linodeInterfaceFactoryVlan.buildList(3);
    expect(getIsLegacyInterfaceArray(linodeInterfacesVlan)).toBe(false);

    const linodeInterfacesVPC = linodeInterfaceFactoryVPC.buildList(3);
    expect(getIsLegacyInterfaceArray(linodeInterfacesVPC)).toBe(false);

    const linodeInterfacesPublic = linodeInterfaceFactoryPublic.buildList(3);
    expect(getIsLegacyInterfaceArray(linodeInterfacesPublic)).toBe(false);
  });
});
