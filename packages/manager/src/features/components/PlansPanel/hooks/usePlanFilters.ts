/**
 * Plan Filters Hook
 *
 * Custom hook for managing plan filter state with React Context.
 * Provides a generic API that can support an arbitrary set of filters and
 * encapsulates the common state management logic used by the Plans panel.
 */

import * as React from 'react';

import { usePlanFilterContext } from './usePlanFilterContext';

// ============================================================================
// Types
// ============================================================================

type FilterValue = number | string | undefined;

export interface PlanFilterDefinition<TFilters extends string = string> {
  /**
   * Filters that should be cleared when this filter is cleared (set to `undefined`).
   */
  clearsOnClear?: TFilters[];

  /**
   * Optional default value when a filter is not present in preferences.
   */
  defaultValue?: FilterValue;

  /**
   * Filters that should be reset to their default values whenever this filter
   * changes to a defined value.
   */
  resetsToDefaultOnChange?: TFilters[];
}

type PlanFilterDefinitions<TFilters extends string> = {
  [K in TFilters]: PlanFilterDefinition<TFilters>;
};

export interface UsePlanFiltersOptions<TFilters extends string> {
  /**
   * Definition map describing how each filter should behave.
   */
  filters: PlanFilterDefinitions<TFilters>;

  /**
   * A key used to store user's filter preferences for this specific table/context.
   * Example: 'planFilters-dedicated', 'planFilters-gpu'
   */
  preferenceKey: string;
}

type PlanFilterState<TFilters extends string> = Record<TFilters, FilterValue>;

export interface UsePlanFiltersReturn<TFilters extends string> {
  /**
   * Clears all filters (sets them to undefined in preferences).
   */
  clearFilters: () => void;

  /**
   * Current filter values (defaults are applied when preferences are absent).
   */
  filterState: PlanFilterState<TFilters>;

  /**
   * `true` when at least one filter differs from its default value.
   */
  hasActiveFilters: boolean;

  /**
   * Resets all filters back to their configured default values.
   */
  resetFilters: () => void;

  /**
   * Updates a specific filter value. Passing `undefined` clears the filter.
   */
  setFilterValue: (filterKey: TFilters, value: FilterValue) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export const usePlanFilters = <TFilters extends string>(
  options: UsePlanFiltersOptions<TFilters>
): UsePlanFiltersReturn<TFilters> => {
  const { filters, preferenceKey } = options;

  const filterEntries = React.useMemo(() => {
    return Object.entries(filters) as [TFilters, PlanFilterDefinition][];
  }, [filters]);

  // Get context methods
  const {
    clearFilters: clearContextFilters,
    getFilterState,
    setFilterValue: setContextFilterValue,
  } = usePlanFilterContext();

  // Get current filter values from context, falling back to defaults
  const currentContextState = getFilterState(preferenceKey);

  const filterState = React.useMemo(() => {
    return filterEntries.reduce((state, [filterKey, definition]) => {
      const storedValue = currentContextState[filterKey];
      const value =
        storedValue !== undefined ? storedValue : definition.defaultValue;
      return {
        ...state,
        [filterKey]: value,
      };
    }, {} as PlanFilterState<TFilters>);
  }, [filterEntries, currentContextState]);

  const hasActiveFilters = React.useMemo(() => {
    return filterEntries.some(([filterKey, definition]) => {
      const value = filterState[filterKey];
      if (value === undefined) {
        return false;
      }

      if (definition.defaultValue === undefined) {
        return true;
      }

      return value !== definition.defaultValue;
    });
  }, [filterEntries, filterState]);

  const setFilterValue = React.useCallback(
    (filterKey: TFilters, value: FilterValue) => {
      const definition = filters[filterKey];

      if (value === undefined || value === '') {
        // Clear this filter
        setContextFilterValue(preferenceKey, filterKey, undefined);

        // Clear dependent filters
        definition.clearsOnClear?.forEach((dependentKey) => {
          setContextFilterValue(preferenceKey, dependentKey, undefined);
        });
      } else {
        // Set new value
        setContextFilterValue(preferenceKey, filterKey, value);

        // Reset dependent filters to defaults
        definition.resetsToDefaultOnChange?.forEach((dependentKey) => {
          const dependentDefinition = filters[dependentKey];
          if (!dependentDefinition) {
            return;
          }

          if (dependentDefinition.defaultValue === undefined) {
            setContextFilterValue(preferenceKey, dependentKey, undefined);
          } else {
            setContextFilterValue(
              preferenceKey,
              dependentKey,
              dependentDefinition.defaultValue
            );
          }
        });
      }
    },
    [filters, preferenceKey, setContextFilterValue]
  );

  const clearFilters = React.useCallback(() => {
    clearContextFilters(preferenceKey);
  }, [clearContextFilters, preferenceKey]);

  const resetFilters = React.useCallback(() => {
    // Clear all filters first
    clearContextFilters(preferenceKey);

    // Then set defaults
    filterEntries.forEach(([filterKey, definition]) => {
      if (definition.defaultValue !== undefined) {
        setContextFilterValue(
          preferenceKey,
          filterKey,
          definition.defaultValue
        );
      }
    });
  }, [
    clearContextFilters,
    filterEntries,
    preferenceKey,
    setContextFilterValue,
  ]);

  return {
    clearFilters,
    filterState,
    hasActiveFilters,
    resetFilters,
    setFilterValue,
  };
};
