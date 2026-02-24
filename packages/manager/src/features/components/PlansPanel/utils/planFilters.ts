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
  PLAN_FILTER_ALL,
  PLAN_FILTER_ALL_AVAILABLE,
  PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED,
  PLAN_FILTER_TYPE_GENERAL_PURPOSE,
} from '../constants';
import { getIsPlanDisabled } from '../utils';

import type {
  PlanFilterGeneration,
  PlanFilterType,
  PlanWithAvailability,
} from '../types';
import type { PlanFilterGPU } from '../types/planFilters';

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

  // For "Available", return only plans that are not disabled
  if (generation === 'available') {
    return plans.filter((plan) => !getIsPlanDisabled(plan));
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
 * Returns the numeric generation of a plan based on its ID.
 * Higher generation number = newer plan (shown first).
 *
 * Example:
 * - "g8-dedicated-4-2" -> 8
 * - "g1-accelerated-netint-vpu" -> 1
 * - "legacy-plan" -> 0
 */
export const getGenerationRank = (planId: string): number => {
  const generation = planId.split('-')[0]; // eg., "g8" or "legacy"

  // Safe fallback: must start with "g"
  if (!generation.startsWith('g')) return 0;

  const num = Number(generation.slice(1));

  return Number.isFinite(num) ? num : 0;
};

/**
 * Filter plans by type within a generation
 *
 * @param plans - Array of plans (should be pre-filtered by generation)
 * @param generation - The generation context ('all', 'available', 'g8', 'g7', or 'g6')
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
  // "All" returns all plans, sorted based on availability, from newest to oldest generations
  if (type === PLAN_FILTER_ALL) {
    return [...plans].sort((a, b) => {
      const isPlanADisabled = getIsPlanDisabled(a);
      const isPlanBDisabled = getIsPlanDisabled(b);

      // Primary sort: Availability (available plans first)
      if (isPlanADisabled !== isPlanBDisabled) {
        return Number(isPlanADisabled) - Number(isPlanBDisabled);
      }

      // Secondary sort: Generation (newest generation first)
      return getGenerationRank(b.id) - getGenerationRank(a.id);
    });
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
 * const filtered = applyDedicatedPlanFilters(allPlans, 'g8', 'compute-optimized');
 *
 * // Get all G7 plans
 * const g7All = applyDedicatedPlanFilters(allPlans, 'g7', 'all');
 *
 * // Get all dedicated plans (G6, G7, G8)
 * const allDedicated = applyDedicatedPlanFilters(allPlans, 'all', 'all');
 *
 * // No filters - return empty array
 * const none = applyDedicatedPlanFilters(allPlans);
 * ```
 */
export const applyDedicatedPlanFilters = (
  plans: PlanWithAvailability[],
  generation?: PlanFilterGeneration,
  type: PlanFilterType = PLAN_FILTER_ALL
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
// GPU Filtering
// ============================================================================

/**
 * Return a numeric rank for a GPU based on plan ID.
 * Higher rank = latest gpu(shown first).
 *
 * Example:
 * - "g3-gpu-rtxpro6000-blackwell-1"" -> 3
 * - "g2-gpu-rtx4000a1-s" -> 2
 * - "g1-gpu-rtx6000-1" -> 1
 * - "legacy-plan" -> 0
 */
export const getGpuRank = (planId: string): number => {
  if (planId.includes('rtxpro6000')) return 3;
  if (planId.includes('rtx4000')) return 2;
  if (planId.includes('rtx6000')) return 1;
  return 0;
};
/**
 * Filter plans by gpu type
 *
 * @param plans - Array of all plans (mostly pre-filtered by plan type/class)
 * @param gpuType - The GPU type to filter by
 * @returns Filtered array of plans matching the generation
 *
 * @example
 * ```ts
 * const rtx4000Plans = filterPlansByGpuType(allPlans, 'gpu-rtx4000');
 * // Returns all plans with GPU type 'gpu-rtx4000'
 *
 * const allDedicatedPlans = filterPlansByGpuType(allPlans, 'all');
 * // Returns all plans as-is (already filtered by plan type in parent) sorted based on the latest generation
 * ```
 */
export const filterPlansByGpuType = (
  plans: PlanWithAvailability[],
  gpuType?: PlanFilterGPU
): PlanWithAvailability[] => {
  // For "All", return all plans as-is
  // For "available", return only plans that are not disabled, sorted in order of blackwell > ada > quadro
  // The plans array is already filtered to only GPU plans by the parent component
  if (!gpuType || gpuType === PLAN_FILTER_ALL) {
    return [...plans].sort((a, b) => {
      const isPlanADisabled = getIsPlanDisabled(a);
      const isPlanBDisabled = getIsPlanDisabled(b);

      // Primary sort: Availability (available plans first)
      if (isPlanADisabled !== isPlanBDisabled) {
        return Number(isPlanADisabled) - Number(isPlanBDisabled);
      }

      // Secondary sort: Generation (newest generation first)
      return getGpuRank(b.id) - getGpuRank(a.id);
    });
  }
  // For "Available", return only plans that are not disabled
  if (gpuType === PLAN_FILTER_ALL_AVAILABLE) {
    return plans
      .filter((plan) => !getIsPlanDisabled(plan))
      .sort((a, b) => {
        return getGenerationRank(b.id) - getGenerationRank(a.id);
      });
  }
  return plans.filter((plan) => plan.id.includes(gpuType));
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
      PLAN_FILTER_ALL,
      PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED,
      PLAN_FILTER_TYPE_GENERAL_PURPOSE,
    ];
  }

  // G7, G6, and "All" only have "All" type option
  return [PLAN_FILTER_ALL];
};
