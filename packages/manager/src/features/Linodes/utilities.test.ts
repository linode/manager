import { isAclpSupportedRegion } from './utilities';

describe('isAclpSupportedRegion', () => {
  it('returns false if aclpSupportedRegions is undefined', () => {
    expect(isAclpSupportedRegion('us-east', undefined)).toBe(false);
  });

  it('returns true if aclpSupportedRegions is "*" (all regions supported)', () => {
    expect(isAclpSupportedRegion('any-region', '*')).toBe(true);
    expect(isAclpSupportedRegion(undefined, '*')).toBe(true);
  });

  it('returns false if selectedRegion is undefined', () => {
    expect(isAclpSupportedRegion(undefined, 'us-east,us-iad')).toBe(false);
  });

  it('returns true if selectedRegion is included in aclpSupportedRegions', () => {
    expect(isAclpSupportedRegion('us-east', 'us-east,us-iad')).toBe(true);
    expect(isAclpSupportedRegion('us-iad', 'us-east,us-iad')).toBe(true);
  });

  it('returns false if selectedRegion is not included in aclpSupportedRegions', () => {
    expect(isAclpSupportedRegion('us-southeast', 'us-east,us-iad')).toBe(false);
  });

  it('returns false if both selectedRegion and aclpSupportedRegions are empty strings', () => {
    expect(isAclpSupportedRegion('', '')).toBe(false);
  });

  it('returns true if selectedRegion is included in aclpSupportedRegions even with spaces around regions', () => {
    expect(isAclpSupportedRegion('us-iad', 'us-east, us-iad')).toBe(true);
  });
});
