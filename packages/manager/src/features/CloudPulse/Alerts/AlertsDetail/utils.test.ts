import { describe, expect, it } from 'vitest';

import { firewallMetricRulesFactory } from 'src/factories';

import { transformationAllowedOperators } from './constants';
import {
  getResolvedDimensionValue,
  isCheckRequired,
  resolveIds,
  transformCommaSeperatedDimensionValues,
} from './utils';

describe('handleDimensionValueCapitalization', () => {
  it('should transform a single value', () => {
    const value = 'primary';

    const result = transformCommaSeperatedDimensionValues(
      value,
      'dbaas',
      'protocol'
    );

    expect(result).toBe('Primary');
  });

  it('should transform multiple comma-separated values', () => {
    const value = 'udp,tcp,http';

    const result = transformCommaSeperatedDimensionValues(
      value,
      'nodebalancer',
      'protocol'
    );

    expect(result).toBe('UDP, TCP, HTTP');
  });
});

describe('resolveIds', () => {
  const linodeMap = {
    '123': 'linode-a',
    '456': 'linode-b',
    '789': 'linode-c',
  };

  it('should resolve single  ID', () => {
    const value = '123';

    const result = resolveIds(value, linodeMap);

    expect(result).toBe('linode-a');
  });

  it('should resolve multiple comma-separated IDs', () => {
    const value = '123,456,999';

    const result = resolveIds(value, linodeMap);

    expect(result).toBe('linode-a, linode-b, 999');
  });
});

describe('isCheckRequired', () => {
  const ruleCriteria = { rules: [firewallMetricRulesFactory.build()] };

  it('should return true if the label is present with an allowed operator', () => {
    const result = isCheckRequired(ruleCriteria, 'linode_id');
    expect(result).toBe(true);
  });

  it('should return false if the label is not present', () => {
    const result = isCheckRequired(ruleCriteria, '');
    expect(result).toBe(false);
  });
});

describe('getResolvedDimensionValue', () => {
  const linodeMap = {
    '123': 'linode-a',
    '456': 'linode-b',
  };
  const vpcSubnetMap = {
    'subnet-1': 'VPC-1_subnet-1',
    'subnet-2': 'VPC-1_subnet-2',
  };
  it('should return correct transformed value', () => {
    const linodeResult = getResolvedDimensionValue(
      'linode_id',
      'in',
      '123,456',
      'firewall',
      linodeMap,
      vpcSubnetMap
    );
    expect(linodeResult).toBe('linode-a, linode-b');
    const vpcResult = getResolvedDimensionValue(
      'vpc_subnet_id',
      'in',
      'subnet-1',
      'firewall',
      linodeMap,
      vpcSubnetMap
    );
    expect(vpcResult).toBe('VPC-1_subnet-1');
  });

  it('should not transform value if operator is not in allowed list', () => {
    const result = getResolvedDimensionValue(
      'linode_id',
      'startswith',
      'linode-c, linode-d',
      'firewall',
      linodeMap,
      vpcSubnetMap
    );
    expect(result).toBe('linode-c, linode-d');
  });

  it('should return empty string if value is null or undefined', () => {
    const nullResult = getResolvedDimensionValue(
      'linode_id',
      'in',
      null,
      'firewall',
      linodeMap,
      vpcSubnetMap
    );
    expect(nullResult).toBe('');
  });
});
