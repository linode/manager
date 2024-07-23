import {
  LinodeConfigInterfaceFactory,
  LinodeConfigInterfaceFactoryWithVPC,
  configFactory,
} from 'src/factories';

import { getVPCsFromLinodeConfigs, parseMaintenanceStartTime } from './utils';

describe('Linode Landing Utilites', () => {
  it('should return "Maintenance Window Unknown" for invalid dates', () => {
    expect(parseMaintenanceStartTime('inVALid DATE')).toBe(
      'Maintenance Window Unknown'
    );
    expect(parseMaintenanceStartTime('Invalid Date')).toBe(
      'Maintenance Window Unknown'
    );
    expect(parseMaintenanceStartTime('valid')).toBe(
      'Maintenance Window Unknown'
    );
  });

  it('should return a parsed date stamp for a valid datetime', () => {
    expect(parseMaintenanceStartTime('2020-03-22 18:58:41')).toBe(
      '2020-03-22 18:58:41'
    );
    expect(parseMaintenanceStartTime('2018-04-21 18:58:41')).toBe(
      '2018-04-21 18:58:41'
    );
  });

  it('should return "No Maintenance Needed" if the datestamp is undefined or null', () => {
    expect(parseMaintenanceStartTime(undefined)).toBe('No Maintenance Needed');
    expect(parseMaintenanceStartTime(null)).toBe('No Maintenance Needed');
  });

  describe('getVPCsFromLinodeConfigs', () => {
    const vpcInterfaceList = LinodeConfigInterfaceFactoryWithVPC.buildList(2);

    it('returns an empty list if there are no vpc interfaces in the configs', () => {
      const configs = configFactory.buildList(3);
      const vpcIds = getVPCsFromLinodeConfigs(configs);
      expect(vpcIds).toEqual([]);
    });

    it('returns the IDs of vpc-related interfaces', () => {
      const config = configFactory.build({
        interfaces: [
          ...vpcInterfaceList,
          ...LinodeConfigInterfaceFactory.buildList(4),
        ],
      });
      const vpcIds = getVPCsFromLinodeConfigs([
        ...configFactory.buildList(3),
        config,
      ]);
      expect(vpcIds).toEqual([3, 4]);
    });

    it('returns unique vpc ids (no duplicates)', () => {
      const vpcInterface = LinodeConfigInterfaceFactoryWithVPC.build({
        vpc_id: 3,
      });
      const config = configFactory.build({
        interfaces: [...vpcInterfaceList, vpcInterface],
      });
      const vpcIds = getVPCsFromLinodeConfigs([config]);
      expect(vpcIds).toEqual([3, 4]);
    });
  });
});
