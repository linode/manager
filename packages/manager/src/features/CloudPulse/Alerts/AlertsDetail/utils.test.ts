import { describe, expect, it } from 'vitest';

import { resolveIds, transformCommaSeperatedDimensionValues } from './utils';

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
