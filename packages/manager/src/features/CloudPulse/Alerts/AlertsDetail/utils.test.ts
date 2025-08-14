import { describe, expect, it } from 'vitest';

import { transformDimensionValue } from '../Utils/utils';
import { handleDimensionValueCapitalization } from './utils';

import type { CloudPulseServiceType } from '@linode/api-v4';

describe('handleDimensionValueCapitalization', () => {
  const serviceType: CloudPulseServiceType = 'linode';

  it('should ransform a single value', () => {
    const value = 'ipv4';
    const expected = transformDimensionValue(serviceType, 'protocol', value);

    const result = handleDimensionValueCapitalization(
      value,
      serviceType,
      'protocol'
    );

    expect(result).toBe(expected);
  });

  it('should transform multiple comma-separated values', () => {
    const value = 'ipv4,ipv6';
    const expected = value
      .split(',')
      .map((v) => transformDimensionValue(serviceType, 'protocol', v))
      .join(',');

    const result = handleDimensionValueCapitalization(
      value,
      serviceType,
      'protocol'
    );

    expect(result).toBe(expected);
  });
});
