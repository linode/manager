import { linodeFactory, nodeBalancerFactory } from '@linode/utilities';

import { transformDimensionValue } from '../../../Utils/utils';
import {
  getFilteredFirewallParentEntities,
  getFirewallLinodes,
  getLinodeRegions,
  getNodebalancerRegions,
  getOperatorGroup,
  getStaticOptions,
  handleValueChange,
  resolveSelectedValues,
  scopeBasedFilteredBuckets,
} from './utils';

import type { Linode } from '@linode/api-v4';
import type { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

describe('Utils', () => {
  describe('resolveSelectedValues', () => {
    const options = [
      { label: 'Option One', value: 'one' },
      { label: 'Option Two', value: 'two' },
      { label: 'Option Three', value: 'three' },
    ];

    it('should return null if value is null and not multiple', () => {
      expect(resolveSelectedValues(options, null, false)).toBeNull();
    });

    it('should return empty array if value is null and multiple', () => {
      expect(resolveSelectedValues(options, null, true)).toEqual([]);
    });

    it('should return matched option for single value', () => {
      expect(resolveSelectedValues(options, 'two', false)).toEqual(options[1]);
    });

    it('should return matched options for multiple values', () => {
      expect(resolveSelectedValues(options, 'one,two', true)).toEqual([
        options[0],
        options[1],
      ]);
    });
  });

  describe('handleValueChange', () => {
    const selectedSingle = { label: 'One', value: 'one' };
    const selectedMultiple = [
      { label: 'One', value: 'one' },
      { label: 'Two', value: 'two' },
    ];

    it('should return empty string if operation is not selectOption/removeOption', () => {
      expect(handleValueChange(selectedSingle, 'blur', false)).toBe('');
    });

    it('should return single value string', () => {
      expect(handleValueChange(selectedSingle, 'selectOption', false)).toBe(
        'one'
      );
    });

    it('should return comma-separated string for multiple', () => {
      expect(handleValueChange(selectedMultiple, 'selectOption', true)).toBe(
        'one,two'
      );
    });
  });

  describe('getOperatorGroup', () => {
    it('should return correct group for eq/neq', () => {
      expect(getOperatorGroup('eq')).toBe('eq_neq');
      expect(getOperatorGroup('neq')).toBe('eq_neq');
    });

    it('should return correct group for startswith/endswith', () => {
      expect(getOperatorGroup('startswith')).toBe('startswith_endswith');
      expect(getOperatorGroup('endswith')).toBe('startswith_endswith');
    });

    it('should return in for operator in', () => {
      expect(getOperatorGroup('in')).toBe('in');
    });

    it('should return * for unknown/null operators', () => {
      expect(getOperatorGroup(null)).toBe('*');
    });
  });

  describe('getStaticOptions', () => {
    it('should return transformed label/value pairs', () => {
      expect(
        getStaticOptions('nodebalancer', 'protocol', ['tcp', 'udp'])
      ).toEqual([
        {
          label: transformDimensionValue('nodebalancer', 'protocol', 'tcp'),
          value: 'tcp',
        },
        {
          label: transformDimensionValue('nodebalancer', 'protocol', 'udp'),
          value: 'udp',
        },
      ]);
    });

    it('should return empty array if input is null', () => {
      expect(getStaticOptions('linode', 'dim', [])).toEqual([]);
    });
  });

  describe('getFilteredFirewallParentEntities', () => {
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
      {
        id: '3',
        entities: { c: 'nodebalancer-1' },
        label: 'firewall-3',
      },
    ];

    it('should return matched resources by entity IDs', () => {
      expect(getFilteredFirewallParentEntities(resources, ['1'])).toEqual([
        {
          label: 'linode-1',
          id: 'a',
        },
      ]);
      expect(getFilteredFirewallParentEntities(resources, ['3'])).toEqual([
        {
          label: 'nodebalancer-1',
          id: 'c',
        },
      ]);
    });

    it('should return empty object if no match', () => {
      expect(getFilteredFirewallParentEntities(resources, ['4'])).toEqual([]);
    });

    it('should handle undefined inputs', () => {
      expect(getFilteredFirewallParentEntities(undefined, ['1'])).toEqual([]);
      expect(getFilteredFirewallParentEntities(resources, undefined)).toEqual(
        []
      );
    });
  });

  describe('getFirewallLinodes', () => {
    const linodes: Linode[] = linodeFactory.buildList(2);

    it('should return linode options with transformed labels', () => {
      // checking for same label as linode_id dimension filter should not have any transformation
      expect(getFirewallLinodes(linodes)).toEqual([
        {
          label: linodes[0].label,
          value: linodes[0].id.toString(),
        },
        {
          label: linodes[1].label,
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

  describe('getNodebalancerRegions', () => {
    it('should extract and deduplicate regions', () => {
      const nodebalancers = nodeBalancerFactory.buildList(3, {
        region: 'us-east',
      });
      nodebalancers[1].region = 'us-west'; // introduce a second unique region

      const result = getNodebalancerRegions(nodebalancers);
      expect(result).toEqual([
        {
          label: transformDimensionValue(
            'firewall',
            'region_id',
            nodebalancers[0].region
          ),
          value: 'us-east',
        },
        {
          label: transformDimensionValue(
            'firewall',
            'region_id',
            nodebalancers[1].region
          ),
          value: 'us-west',
        },
      ]);
    });
  });

  describe('scopeBasedFilteredBuckets', () => {
    const buckets: CloudPulseResources[] = [
      { label: 'bucket-1', id: 'bucket-1', region: 'us-east' },
      { label: 'bucket-2', id: 'bucket-2', region: 'us-west' },
      { label: 'bucket-3', id: 'bucket-3', region: 'eu-central' },
    ];

    it('returns all buckets for account scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: 'account',
        buckets,
      });
      expect(result).toEqual(buckets);
    });

    it('filters buckets by entity IDs for entity scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: 'entity',
        buckets,
        entities: ['bucket-1', 'bucket-3'],
      });
      expect(result).toEqual([
        { id: 'bucket-1', label: 'bucket-1', region: 'us-east' },
        { id: 'bucket-3', label: 'bucket-3', region: 'eu-central' },
      ]);
    });

    it('returns empty array if no entities match for entity scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: 'entity',
        buckets,
        entities: ['bucket-99'],
      });
      expect(result).toEqual([]);
    });

    it('returns empty array if entities is undefined for entity scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: 'entity',
        buckets,
      });
      expect(result).toEqual([]);
    });

    it('filters buckets by region IDs for region scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: 'region',
        buckets,
        selectedRegions: ['us-east', 'eu-central'],
      });
      expect(result).toEqual([
        { id: 'bucket-1', label: 'bucket-1', region: 'us-east' },
        { id: 'bucket-3', label: 'bucket-3', region: 'eu-central' },
      ]);
    });

    it('returns empty array if no regions match for region scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: 'region',
        buckets,
        selectedRegions: ['ap-south'],
      });
      expect(result).toEqual([]);
    });

    it('returns empty array if selectedRegions is undefined for region scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: 'region',
        buckets,
      });
      expect(result).toEqual([]);
    });

    it('returns all buckets for null scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: null,
        buckets,
      });
      expect(result).toEqual(buckets);
    });

    it('returns all buckets for unrecognized scope', () => {
      const result = scopeBasedFilteredBuckets({
        scope: null,
        buckets,
      });
      expect(result).toEqual(buckets);
    });
  });
});
