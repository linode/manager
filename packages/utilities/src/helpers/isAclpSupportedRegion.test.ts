import { describe, expect, it } from 'vitest';

import { regionFactory } from '../factories';
import { isAclpSupportedRegion } from './isAclpSupportedRegion';

describe('isAclpSupportedRegion', () => {
  // - Mocked 'monitors' data used here may differ from the actual /regions API response.
  const mockRegions = [
    regionFactory.build({
      monitors: {
        alerts: ['Managed Databases'],
        metrics: [],
      },
      country: 'us',
      id: 'us-ord',
      label: 'Chicago, IL',
    }),
    regionFactory.build({
      monitors: {
        alerts: ['Linodes', 'Managed Databases'],
        metrics: ['Linodes', 'Managed Databases'],
      },
      country: 'us',
      id: 'us-iad',
      label: 'Washington, DC',
    }),
    regionFactory.build({
      monitors: {
        alerts: ['Linodes'],
        metrics: ['Linodes', 'Managed Databases'],
      },
      country: 'us',
      id: 'us-east',
      label: 'Newark, NJ',
    }),
    regionFactory.build({
      monitors: { alerts: [], metrics: [] },
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

  // For Alerts
  it('should return false if selectedRegion is undefined for the alerts monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: undefined,
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return false if regions is undefined for the alerts monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-ord',
        regions: undefined,
      }),
    ).toBe(false);
  });

  it('should return false if selectedRegion is not in regions for the alerts monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-west',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return true if Managed Databases is requested in supported regions (us-ord, us-iad) for the alerts monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'us-ord',
        regions: mockRegions,
      }),
    ).toBe(true);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'us-iad',
        regions: mockRegions,
      }),
    ).toBe(true);
  });

  it('should return true if Linodes is requested in supported regions (us-iad, us-east) for the alerts monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-iad',
        regions: mockRegions,
      }),
    ).toBe(true);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-east',
        regions: mockRegions,
      }),
    ).toBe(true);
  });

  it('should return false if Linodes is requested in unsupported regions (us-ord, ca-central) for the alerts monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-ord',
        regions: mockRegions,
      }),
    ).toBe(false);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'ca-central',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return false if alerts list is empty for the alerts monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'ca-central',
        regions: mockRegions,
      }),
    ).toBe(false);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'ca-central',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return false if monitors is undefined for the alerts monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'in-maa',
        regions: mockRegions,
      }),
    ).toBe(false);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'in-maa',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return false if capability is not supported by alerts monitoring type for the selectedRegion', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'alerts',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-ord',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  // For Metrics
  it('should return false if selectedRegion is undefined for the metrics monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: undefined,
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return false if regions is undefined for the metrics monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-ord',
        regions: undefined,
      }),
    ).toBe(false);
  });

  it('should return false if selectedRegion is not in regions for the metrics monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-west',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return true if Managed Databases is requested in supported region (us-iad, us-east) for the metrics monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'us-iad',
        regions: mockRegions,
      }),
    ).toBe(true);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'us-east',
        regions: mockRegions,
      }),
    ).toBe(true);
  });

  it('should return true if Linodes is requested in supported region (us-iad, us-east) for the metrics monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-iad',
        regions: mockRegions,
      }),
    ).toBe(true);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-east',
        regions: mockRegions,
      }),
    ).toBe(true);
  });

  it('should return false if Linodes is requested in unsupported regions (us-ord, ca-central) for the metrics monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-ord',
        regions: mockRegions,
      }),
    ).toBe(false);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'ca-central',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return false if metrics list is empty for the metrics monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'ca-central',
        regions: mockRegions,
      }),
    ).toBe(false);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'ca-central',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return false if monitors is undefined for the metrics monitoring type', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'in-maa',
        regions: mockRegions,
      }),
    ).toBe(false);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'in-maa',
        regions: mockRegions,
      }),
    ).toBe(false);
  });

  it('should return false if the capability is not supported by the metrics monitoring type for the selectedRegion', () => {
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Linodes',
        selectedRegionId: 'us-ord',
        regions: mockRegions,
      }),
    ).toBe(false);
    expect(
      isAclpSupportedRegion({
        aclpMonitoringType: 'metrics',
        featureCapability: 'Managed Databases',
        selectedRegionId: 'us-ord',
        regions: mockRegions,
      }),
    ).toBe(false);
  });
});
