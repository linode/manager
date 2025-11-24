import {
  getAssociatedEntityType,
  getResourcesFilterConfig,
} from './FilterConfig';

describe('getResourcesFilterConfig', () => {
  it('should return undefined if the dashboard id is not provided', () => {
    expect(getResourcesFilterConfig(undefined)).toBeUndefined();
  });

  it('should return the resources filter configuration for the linode-firewalldashboard', () => {
    const resourcesFilterConfig = getResourcesFilterConfig(4);
    expect(resourcesFilterConfig).toBeDefined();
    expect(resourcesFilterConfig?.associatedEntityType).toBe('linode');
  });

  it('should return the resources filter configuration for the nodebalancer-firewall dashboard', () => {
    const resourcesFilterConfig = getResourcesFilterConfig(8);
    expect(resourcesFilterConfig).toBeDefined();
    expect(resourcesFilterConfig?.associatedEntityType).toBe('nodebalancer');
  });
});

describe('getAssociatedEntityType', () => {
  it('should return undefined if the dashboard id is not provided', () => {
    expect(getAssociatedEntityType(undefined)).toBeUndefined();
  });

  it('should return the associated entity type for the linode-firewall dashboard', () => {
    expect(getAssociatedEntityType(4)).toBe('linode');
  });

  it('should return the associated entity type for the nodebalancer-firewall dashboard', () => {
    expect(getAssociatedEntityType(8)).toBe('nodebalancer');
  });
});
