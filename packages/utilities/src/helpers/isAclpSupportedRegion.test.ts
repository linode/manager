import { describe, expect, it } from 'vitest';

import { regionFactory } from '../factories';
import { isAclpSupportedRegion } from './isAclpSupportedRegion';

describe('isAclpSupportedRegion', () => {
  // Here, monitors list from the mocked regions are just examples
  // and may differ from the actual data in the /regions API endpoint.
  const mockRegions = [
    regionFactory.build({
      monitors: ['DBAAS'],
      country: 'us',
      id: 'us-ord',
      label: 'Chicago, IL',
    }),
    regionFactory.build({
      monitors: ['Linodes', 'DBAAS'],
      country: 'us',
      id: 'us-east',
      label: 'Newark, NJ',
    }),
    regionFactory.build({
      monitors: ['Linodes'],
      country: 'us',
      id: 'us-iad',
      label: 'Washington, DC',
    }),
    regionFactory.build({
      monitors: [],
      country: 'ca',
      id: 'ca-central',
      label: 'Toronto',
    }),
    regionFactory.build({
      monitors: undefined,
      country: 'in',
      id: 'in-maa',
      label: 'Chennai',
    }),
  ];

  it('should return false if selectedRegion is undefined', () => {
    expect(isAclpSupportedRegion('Linodes', undefined, mockRegions)).toBe(
      false,
    );
  });

  it('should return false if regions is undefined', () => {
    expect(isAclpSupportedRegion('Linodes', 'us-ord', undefined)).toBe(false);
  });

  it('should return false if selectedRegion is not in regions', () => {
    expect(isAclpSupportedRegion('Linodes', 'us-west', mockRegions)).toBe(
      false,
    );
  });

  it('should return true if DBAAS is requested in supported regions (us-ord, us-east)', () => {
    expect(isAclpSupportedRegion('DBAAS', 'us-ord', mockRegions)).toBe(true);
    expect(isAclpSupportedRegion('DBAAS', 'us-east', mockRegions)).toBe(true);
  });

  it('should return true if Linodes is requested in supported regions (us-east, us-iad)', () => {
    expect(isAclpSupportedRegion('Linodes', 'us-east', mockRegions)).toBe(true);
    expect(isAclpSupportedRegion('Linodes', 'us-iad', mockRegions)).toBe(true);
  });

  it('should return false if Linodes is requested in unsupported regions (us-ord, ca-central)', () => {
    expect(isAclpSupportedRegion('Linodes', 'us-ord', mockRegions)).toBe(false);
    expect(isAclpSupportedRegion('Linodes', 'ca-central', mockRegions)).toBe(
      false,
    );
  });

  it('should return false if monitors list is empty', () => {
    expect(isAclpSupportedRegion('Linodes', 'ca-central', mockRegions)).toBe(
      false,
    );
    expect(isAclpSupportedRegion('DBAAS', 'ca-central', mockRegions)).toBe(
      false,
    );
  });

  it('should return false if monitors is undefined', () => {
    expect(isAclpSupportedRegion('Linodes', 'in-maa', mockRegions)).toBe(false);
    expect(isAclpSupportedRegion('DBAAS', 'in-maa', mockRegions)).toBe(false);
  });
});
