/**
 * Plan Filtering Utilities
 *
 * Functions for filtering plans by generation (G8/G7/G6) and type (Compute Optimized/General Purpose).
 * Uses explicit slug mappings for precise filtering.
 */

import {
  G8_DEDICATED_ALL_SLUGS,
  G8_DEDICATED_COMPUTE_OPTIMIZED_SLUGS,
  G8_DEDICATED_GENERAL_PURPOSE_SLUGS,
  PLAN_FILTER_TYPE_ALL,
  PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED,
  PLAN_FILTER_TYPE_GENERAL_PURPOSE,
} from '../constants';

import type {
  PlanFilterGeneration,
  PlanFilterType,
  PlanWithAvailability,
} from '../types';

// ============================================================================
// Generation Filtering
// ============================================================================

/**
 * Filter plans by generation (G8, G7, G6, or All)
 *
 * @param plans - Array of all plans (mostly pre-filtered by plan type/class)
 * @param generation - The generation to filter by ('all', 'g8', 'g7', or 'g6')
 * @returns Filtered array of plans matching the generation
 *
 * @example
 * ```ts
 * const g8Plans = filterPlansByGeneration(allPlans, 'g8');
 * // Returns all plans with IDs starting with 'g8-dedicated-'
 *
 * const allDedicatedPlans = filterPlansByGeneration(allPlans, 'all');
 * // Returns all plans as-is (already filtered by plan type in parent)
 * ```
 */
export const filterPlansByGeneration = (
  plans: PlanWithAvailability[],
  generation: PlanFilterGeneration
): PlanWithAvailability[] => {
  // For "All", return all plans as-is
  // The plans array is already filtered to only dedicated plans by the parent component
  if (generation === 'all') {
    return plans;
  }

  // For G8, use explicit slug list for precise filtering
  if (generation === 'g8') {
    const g8Slugs = new Set<string>(G8_DEDICATED_ALL_SLUGS);
    return plans.filter((plan) => g8Slugs.has(plan.id));
  }

  // For G7 and G6, use ID prefix matching
  // G7: IDs start with 'g7-dedicated-' or 'g7-premium-'
  // G6: IDs start with 'g6-dedicated-'
  const prefix = `${generation}-`;
  return plans.filter((plan) => plan.id.startsWith(prefix));
};

// ============================================================================
// Type Filtering
// ============================================================================

/**
 * Filter plans by type within a generation
 *
 * @param plans - Array of plans (should be pre-filtered by generation)
 * @param generation - The generation context ('all', 'g8', 'g7', or 'g6')
 * @param type - The type to filter by ('all', 'compute-optimized', 'general-purpose')
 * @returns Filtered array of plans matching the type
 *
 * @example
 * ```ts
 * // Get all G8 Compute Optimized plans
 * const g8Plans = filterPlansByGeneration(allPlans, 'g8');
 * const g8CO = filterPlansByType(g8Plans, 'g8', 'compute-optimized');
 * ```
 */
export const filterPlansByType = (
  plans: PlanWithAvailability[],
  generation: PlanFilterGeneration,
  type: PlanFilterType
): PlanWithAvailability[] => {
  // "All" returns all plans unchanged
  if (type === PLAN_FILTER_TYPE_ALL) {
    return plans;
  }

  // G7, G6, and "All" generation only have "All" option (no sub-types)
  if (generation === 'g7' || generation === 'g6' || generation === 'all') {
    return plans;
  }

  // G8 has Compute Optimized and General Purpose sub-types
  if (generation === 'g8') {
    if (type === PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED) {
      const computeOptimizedSlugs = new Set<string>(
        G8_DEDICATED_COMPUTE_OPTIMIZED_SLUGS
      );
      return plans.filter((plan) => computeOptimizedSlugs.has(plan.id));
    }

    if (type === PLAN_FILTER_TYPE_GENERAL_PURPOSE) {
      const generalPurposeSlugs = new Set<string>(
        G8_DEDICATED_GENERAL_PURPOSE_SLUGS
      );
      return plans.filter((plan) => generalPurposeSlugs.has(plan.id));
    }
  }

  // Default: return all plans
  return plans;
};

// ============================================================================
// Combined Filtering
// ============================================================================

/**
 * Apply both generation and type filters to a list of plans
 *
 * @param plans - Array of all plans
 * @param generation - The generation to filter by (optional)
 * @param type - The type to filter by (optional, defaults to 'all')
 * @returns Filtered array of plans, or all plans if no filters applied
 *
 * @example
 * ```ts
 * // Get G8 Compute Optimized plans
 * const filtered = applyPlanFilters(allPlans, 'g8', 'compute-optimized');
 *
 * // Get all G7 plans
 * const g7All = applyPlanFilters(allPlans, 'g7', 'all');
 *
 * // Get all dedicated plans (G6, G7, G8)
 * const allDedicated = applyPlanFilters(allPlans, 'all', 'all');
 *
 * // No filters - return empty array
 * const none = applyPlanFilters(allPlans);
 * ```
 */
export const applyPlanFilters = (
  plans: PlanWithAvailability[],
  generation?: PlanFilterGeneration,
  type: PlanFilterType = PLAN_FILTER_TYPE_ALL
): PlanWithAvailability[] => {
  // No filters - return empty array
  if (!generation) {
    return [];
  }

  // Apply generation filter first
  const generationFiltered = filterPlansByGeneration(plans, generation);

  // Then apply type filter
  return filterPlansByType(generationFiltered, generation, type);
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a generation supports type filtering
 *
 * @param generation - The generation to check
 * @returns True if the generation has multiple types (G8), false otherwise
 */
export const supportsTypeFiltering = (
  generation: PlanFilterGeneration
): boolean => {
  return generation === 'g8';
};

/**
 * Get available type options for a generation
 *
 * @param generation - The generation to get types for
 * @returns Array of available type values
 *
 * @example
 * ```ts
 * getAvailableTypes('g8'); // ['all', 'compute-optimized', 'general-purpose']
 * getAvailableTypes('g7'); // ['all']
 * getAvailableTypes('all'); // ['all']
 * ```
 */
export const getAvailableTypes = (
  generation: PlanFilterGeneration
): PlanFilterType[] => {
  if (generation === 'g8') {
    return [
      PLAN_FILTER_TYPE_ALL,
      PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED,
      PLAN_FILTER_TYPE_GENERAL_PURPOSE,
    ];
  }

  // G7, G6, and "All" only have "All" type option
  return [PLAN_FILTER_TYPE_ALL];
};
