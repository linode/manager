import { Spacing } from '@linode/design-language-system';

import type { SpacingTypes } from '@linode/design-language-system';

export interface SpacingFunction {
  (...factors: number[]): string;
}

// Custom spacing function supporting up to 4 values (top, right, bottom, left)
export const spacingFunction = (...factors: number[]): string => {
  // Ensure we only process up to 4 arguments
  const validFactors = factors.slice(0, 4);

  if (validFactors.length === 0) {
    return Spacing.S0;
  }

  // If multiple factors are provided, process each one and join with spaces
  if (validFactors.length > 1) {
    return validFactors.map((factor) => spacingFunction(factor)).join(' ');
  }

  // Single factor case
  const factor = validFactors[0];

  const spacingValueMap: Record<number, keyof SpacingTypes> = {};

  /**
   * Dynamically build a mapping from pixel values to spacing tokens by parsing the keys in the Spacing object.
   * Example result:
   * {
   *   0: 'S0', // 0px
   *   2: 'S2', // 2px
   *   4: 'S4', // 4px
   *   ...
   * }
   * This approach eliminates the need for manual token mapping and automatically adapts if
   * new spacing tokens are added to our design system.
   */
  Object.keys(Spacing).forEach((key) => {
    if (key.startsWith('S')) {
      const pixelValue = parseInt(key.substring(1), 10);
      if (!isNaN(pixelValue)) {
        spacingValueMap[pixelValue] = key as keyof SpacingTypes;
      }
    }
  });

  // Find the closest matching token, rounds down.
  const availablePixels = Object.keys(spacingValueMap).map(Number);
  const closestPixel = availablePixels.reduce((prev, curr) =>
    Math.abs(curr - factor) < Math.abs(prev - factor) ? curr : prev,
  );

  const token = spacingValueMap[closestPixel];

  return Spacing[token];
};
