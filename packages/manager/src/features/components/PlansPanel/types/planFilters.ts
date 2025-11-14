/**
 * Plan Filter Types
 *
 * This file contains TypeScript types and interfaces for the plan filtering system.
 * Filters allow users to narrow down plans by generation (G8/G7/G6) and type (Compute Optimized/General Purpose).
 */

import type { PlanWithAvailability } from '../types';

// ============================================================================
// Filter Value Types
// ============================================================================

/**
 * Available plan generations for Dedicated CPU filtering
 */
export type PlanFilterGeneration = 'g6' | 'g7' | 'g8';

/**
 * Available plan types for filtering within a generation
 */
export type PlanFilterType = 'all' | 'compute-optimized' | 'general-purpose';

// ============================================================================
// Filter State
// ============================================================================

/**
 * Current state of plan filters
 */
export interface PlanFilterState {
  /**
   * Selected generation (e.g., "g8", "g7", "g6")
   */
  generation?: PlanFilterGeneration;

  /**
   * Selected type within the generation (e.g., "compute-optimized", "general-purpose", "all")
   */
  type?: PlanFilterType;
}

// ============================================================================
// Filter Options
// ============================================================================

/**
 * A single filter option for dropdowns
 */
export interface FilterOption<T = string> {
  /**
   * Whether this option should be disabled
   */
  disabled?: boolean;

  /**
   * Display label for the option
   */
  label: string;

  /**
   * Underlying value for the option
   */
  value: T;
}

/**
 * Configuration for a filter dropdown
 */
export interface FilterDropdownConfig<T = string> {
  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean;

  /**
   * Label displayed above the dropdown
   */
  label: string;

  /**
   * Callback when selection changes
   */
  onChange: (value: T | undefined) => void;

  /**
   * Available options for this dropdown
   */
  options: FilterOption<T>[];

  /**
   * Placeholder text when no option is selected
   */
  placeholder: string;

  /**
   * Currently selected value
   */
  value?: T;

  /**
   * Width of the dropdown in pixels
   */
  width?: number;
}

// ============================================================================
// Filter Result
// ============================================================================

/**
 * Result of applying filters to a list of plans
 */
export interface PlanFilterResult {
  /**
   * Total number of plans after filtering
   */
  count: number;

  /**
   * Whether filters are currently active
   */
  hasActiveFilters: boolean;

  /**
   * Whether the filter state results in no plans (empty state)
   */
  isEmpty: boolean;

  /**
   * Filtered list of plans
   */
  plans: PlanWithAvailability[];
}

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Function type for filtering plans by generation
 */
export type FilterPlansByGenerationFn = (
  plans: PlanWithAvailability[],
  generation: PlanFilterGeneration
) => PlanWithAvailability[];

/**
 * Function type for filtering plans by type within a generation
 */
export type FilterPlansByTypeFn = (
  plans: PlanWithAvailability[],
  generation: PlanFilterGeneration,
  type: PlanFilterType
) => PlanWithAvailability[];
