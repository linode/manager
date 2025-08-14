import { linodeFactory } from '@linode/utilities';

import { transformDimensionValue } from '../../../Utils/utils';
import {
  getFilteredFirewallResources,
  getFirewallLinodes,
  getLinodeRegions,
} from './utils';

import type { Linode } from '@linode/api-v4';
import type { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

describe('Utils', () => {
  describe('getFilteredFirewallResources', () => {
    const resources: CloudPulseResources[] = [
      {
        id: '1',
        entities: { a: 'linode-1' },
        label: 'firewall-1',
      },
      {
        id: '2',
        entities: { b: 'linode-2' },
        label: 'firewall-2',
      },
    ];

    it('should return matched resources by entity IDs', () => {
      expect(getFilteredFirewallResources(resources, ['1'])).toEqual(['a']);
    });

    it('should return empty array if no match', () => {
      expect(getFilteredFirewallResources(resources, ['3'])).toEqual([]);
    });

    it('should handle undefined inputs', () => {
      expect(getFilteredFirewallResources(undefined, ['1'])).toEqual([]);
      expect(getFilteredFirewallResources(resources, undefined)).toEqual([]);
    });
  });

  describe('getFirewallLinodes', () => {
    const linodes: Linode[] = linodeFactory.buildList(2);

    it('should return linode options with transformed labels', () => {
      expect(getFirewallLinodes(linodes)).toEqual([
        {
          label: transformDimensionValue(
            'firewall',
            'parent_vm_entity_id',
            linodes[0].label
          ),
          value: linodes[0].id.toString(),
        },
        {
          label: transformDimensionValue(
            'firewall',
            'parent_vm_entity_id',
            linodes[1].label
          ),
          value: linodes[1].id.toString(),
        },
      ]);
    });

    it('should handle empty linode list', () => {
      expect(getFirewallLinodes([])).toEqual([]);
    });
  });

  describe('getLinodeRegions', () => {
    it('should extract and deduplicate regions', () => {
      const linodes = linodeFactory.buildList(3, {
        region: 'us-east',
      });
      linodes[1].region = 'us-west'; // introduce a second unique region

      const result = getLinodeRegions(linodes);
      expect(result).toEqual([
        {
          label: transformDimensionValue(
            'firewall',
            'region_id',
            linodes[0].region
          ),
          value: 'us-east',
        },
        {
          label: transformDimensionValue(
            'firewall',
            'region_id',
            linodes[1].region
          ),
          value: 'us-west',
        },
      ]);
    });
  });
});
