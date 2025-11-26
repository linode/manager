import {
  getAssociatedEntityType,
  getResourcesFilterConfig,
  isEndpointsOnlyDashboard,
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

describe('isEndpointsOnlyDashboard', () => {
  it('should return true when the dashboard is an endpoints only dashboard', () => {
    // Dashboard ID 10 is an endpoints only dashboard
    expect(isEndpointsOnlyDashboard(10)).toBe(true);
  });
  it('should return false when the dashboard is not an endpoints only dashboard', () => {
    // Dashboard ID 6 is not an endpoints only dashboard, rather a buckets dashboard
    expect(isEndpointsOnlyDashboard(6)).toBe(false);
  });
});
