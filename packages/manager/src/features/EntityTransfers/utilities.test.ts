import { countByEntity } from './utilities';

describe('countByEntity', () => {
  it('returns the number of each entity', () => {
    expect(countByEntity({ linodes: [1] })).toBe('Linodes: 1');
    expect(countByEntity({ linodes: [1, 2, 3] })).toBe('Linodes: 3');
    expect(countByEntity({ linodes: [] })).toBe('Linodes: 0');
  });

  it('handles multiple entity types', () => {
    expect(countByEntity({ linodes: [1], domains: [1] } as any)).toBe(
      'Linodes: 1, Domains: 1'
    );
    expect(
      countByEntity({ linodes: [1, 2, 3], domains: [1, 2, 3] } as any)
    ).toBe('Linodes: 3, Domains: 3');
    expect(countByEntity({ linodes: [1], domains: [] } as any)).toBe(
      'Linodes: 1, Domains: 0'
    );
  });
});
