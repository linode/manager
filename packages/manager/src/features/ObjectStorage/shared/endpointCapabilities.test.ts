import { describe, expect, it } from 'vitest';

import { getEndpointCapabilities } from './endpointCapabilities';

describe('getEndpointCapabilities', () => {
  const gen1 = ['E0', 'E1'] as const;
  const gen2 = ['E2', 'E3'] as const;

  it('returns GEN1 capabilities for E0 and E1', () => {
    for (const t of gen1) {
      const caps = getEndpointCapabilities(t as any);
      expect(caps.objectAcl).toBe(true);
      expect(caps.cors).toBe(true);
      expect(caps.customTlsCertificate).toBe(true);
      expect(caps.metrics).toBe(false);
    }
  });

  it('returns GEN2 capabilities for E2 and E3', () => {
    for (const t of gen2) {
      const caps = getEndpointCapabilities(t as any);
      expect(caps.objectAcl).toBe(false);
      expect(caps.cors).toBe(false);
      expect(caps.customTlsCertificate).toBe(false);
      expect(caps.metrics).toBe(true);
    }
  });

  it('returns all-false capabilities for unknown endpoint types', () => {
    const caps = getEndpointCapabilities('SOME_UNKNOWN' as any);
    expect(caps).toEqual({
      objectAcl: false,
      cors: false,
      customTlsCertificate: false,
      metrics: false,
    });
  });

  it('returns all-false capabilities when endpoint type is undefined', () => {
    const caps = getEndpointCapabilities(undefined);
    expect(caps).toEqual({
      objectAcl: false,
      cors: false,
      customTlsCertificate: false,
      metrics: false,
    });
  });
});
