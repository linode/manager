import { describe, expect, it } from 'vitest';

import { formatStorageUnits } from './formatStorageUnits';

describe('formatStorageUnits', () => {
  it('returns the original string when the string does not contain a storage unit', () => {
    expect(formatStorageUnits('Linode High Memory')).toBe('Linode High Memory');
    expect(formatStorageUnits('Linode GB')).toBe('Linode GB');
    expect(formatStorageUnits('')).toBe('');
  });

  it('returns a string that contains the storage units and measurement separated by a single space character', () => {
    expect(formatStorageUnits('Nanode 1GB')).toBe('Nanode 1 GB');
    expect(formatStorageUnits('Linode 4GB')).toBe('Linode 4 GB');
    expect(formatStorageUnits('10kB')).toBe('10 kB');
    expect(formatStorageUnits('10MB')).toBe('10 MB');
    expect(formatStorageUnits('10GB')).toBe('10 GB');
    expect(formatStorageUnits('10TB')).toBe('10 TB');
    expect(formatStorageUnits('10PB')).toBe('10 PB');
    expect(formatStorageUnits('10EB')).toBe('10 EB');
    expect(formatStorageUnits('10ZB')).toBe('10 ZB');
    expect(formatStorageUnits('10YB')).toBe('10 YB');

    expect(formatStorageUnits('10kiB')).toBe('10 kiB');
    expect(formatStorageUnits('10MiB')).toBe('10 MiB');
    expect(formatStorageUnits('10GiB')).toBe('10 GiB');
    expect(formatStorageUnits('10TiB')).toBe('10 TiB');
    expect(formatStorageUnits('10PiB')).toBe('10 PiB');
    expect(formatStorageUnits('10EiB')).toBe('10 EiB');
    expect(formatStorageUnits('10ZiB')).toBe('10 ZiB');
    expect(formatStorageUnits('10YiB')).toBe('10 YiB');
  });
});
