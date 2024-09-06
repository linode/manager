import type { aggregation } from 'support/constants/aggregation';
import type { granularity } from 'support/constants/granularity';

// Factory function to create widget constants
export function createWidget(
  name: string,
  title: string,
  expectedAggregation: aggregation,
  expectedGranularity: granularity,
  expectedGranularityArray: string[],
  expectedAggregationyArray: string[]
) {
  return {
    expectedAggregation,
    expectedAggregationyArray,
    expectedGranularity,
    expectedGranularityArray,
    name,
    title,
  };
}
