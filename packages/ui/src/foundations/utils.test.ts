import { Spacing } from '@linode/design-language-system';
import { describe, expect, it } from 'vitest';

import { spacingFunction } from './utils';

describe('spacingFunction', () => {
  it('should return the correct token for exact values', () => {
    expect(spacingFunction(0)).toBe(Spacing.S0);
    expect(spacingFunction(2)).toBe(Spacing.S2);
    expect(spacingFunction(4)).toBe(Spacing.S4);
    expect(spacingFunction(6)).toBe(Spacing.S6);
    expect(spacingFunction(8)).toBe(Spacing.S8);
    expect(spacingFunction(12)).toBe(Spacing.S12);
    expect(spacingFunction(16)).toBe(Spacing.S16);
    expect(spacingFunction(20)).toBe(Spacing.S20);
    expect(spacingFunction(24)).toBe(Spacing.S24);
    expect(spacingFunction(28)).toBe(Spacing.S28);
    expect(spacingFunction(32)).toBe(Spacing.S32);
    expect(spacingFunction(36)).toBe(Spacing.S36);
    expect(spacingFunction(40)).toBe(Spacing.S40);
    expect(spacingFunction(48)).toBe(Spacing.S48);
    expect(spacingFunction(64)).toBe(Spacing.S64);
    expect(spacingFunction(72)).toBe(Spacing.S72);
    expect(spacingFunction(96)).toBe(Spacing.S96);
  });

  it('should round to the nearest token for in-between values', () => {
    // Values between tokens should round to nearest
    expect(spacingFunction(3)).toBe(Spacing.S2); // Round down to 2
    expect(spacingFunction(5)).toBe(Spacing.S4); // Round down to 4
    expect(spacingFunction(7)).toBe(Spacing.S6); // Round down to 6
    expect(spacingFunction(11)).toBe(Spacing.S12); // Round down to 12
    expect(spacingFunction(13)).toBe(Spacing.S12); // Round down to 12
    expect(spacingFunction(15)).toBe(Spacing.S16); // Round up to 16
    expect(spacingFunction(17)).toBe(Spacing.S16); // Round down to 16
    expect(spacingFunction(18)).toBe(Spacing.S16); // Round down to 16
    expect(spacingFunction(19)).toBe(Spacing.S20); // Round up to 20
  });

  it('should handle multiple spacing values correctly', () => {
    expect(spacingFunction(4, 8)).toBe(`${Spacing.S4} ${Spacing.S8}`);
    expect(spacingFunction(4, 8, 16)).toBe(
      `${Spacing.S4} ${Spacing.S8} ${Spacing.S16}`,
    );
    expect(spacingFunction(4, 8, 16, 24)).toBe(
      `${Spacing.S4} ${Spacing.S8} ${Spacing.S16} ${Spacing.S24}`,
    );
  });

  it('should limit to 4 values even if more are provided', () => {
    expect(spacingFunction(4, 8, 16, 24, 32)).toBe(
      `${Spacing.S4} ${Spacing.S8} ${Spacing.S16} ${Spacing.S24}`,
    );
  });
});
