import { describe, expect, it } from 'vitest';

import { transformCommaSeperatedDimensionValues } from './utils';

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
