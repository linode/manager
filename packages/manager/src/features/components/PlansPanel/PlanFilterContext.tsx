/**
 * Plan Filter Context
 *
 * Provides a lightweight context-based state management for plan filters.
 * This approach:
 * - Persists filter state during tab changes within the same session
 * - Resets on page reload (no URL params or user preferences)
 * - Allows separate state per usage context (Linodes vs Kubernetes)
 * - Keeps implementation simple without external persistence
 */

import * as React from 'react';

// ============================================================================
// Types
// ============================================================================

type FilterValue = number | string | undefined;

/**
 * Filter state for a specific context (e.g., 'plan-panel-dedicated').
 * Maps filter keys to their current values.
 */
export type PlanFilterState = Record<string, FilterValue>;

/**
 * All filter states, keyed by preference key (context identifier).
 */
export type PlanFiltersState = Record<string, PlanFilterState>;

export interface PlanFilterContextValue {
  /**
   * Clears all filters for a specific context.
   */
  clearFilters: (preferenceKey: string) => void;

  /**
   * Gets the current filter state for a specific context.
   */
  getFilterState: (preferenceKey: string) => PlanFilterState;

  /**
   * Updates a single filter value for a specific context.
   */
  setFilterValue: (
    preferenceKey: string,
    filterKey: string,
    value: FilterValue
  ) => void;
}

// ============================================================================
// Context
// ============================================================================

const PlanFilterContext = React.createContext<
  PlanFilterContextValue | undefined
>(undefined);

// ============================================================================
// Provider
// ============================================================================

export interface PlanFilterProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that manages plan filter state in memory.
 * Wrap this around your PlansPanel usage to enable filter persistence
 * during tab changes (but not across page reloads).
 */
export const PlanFilterProvider = ({ children }: PlanFilterProviderProps) => {
  // Store all filter states in a single state object
  const [filtersState, setFiltersState] = React.useState<PlanFiltersState>({});

  const getFilterState = React.useCallback(
    (preferenceKey: string): PlanFilterState => {
      return filtersState[preferenceKey] ?? {};
    },
    [filtersState]
  );

  const setFilterValue = React.useCallback(
    (preferenceKey: string, filterKey: string, value: FilterValue) => {
      setFiltersState((prev) => {
        const currentContextState = prev[preferenceKey] ?? {};

        // If value is undefined or empty, remove the key
        if (value === undefined || value === '') {
          const updated = { ...currentContextState };
          delete updated[filterKey];
          return {
            ...prev,
            [preferenceKey]: updated,
          };
        }

        // Otherwise, update the value
        return {
          ...prev,
          [preferenceKey]: {
            ...currentContextState,
            [filterKey]: value,
          },
        };
      });
    },
    []
  );

  const clearFilters = React.useCallback((preferenceKey: string) => {
    setFiltersState((prev) => {
      const updated = { ...prev };
      delete updated[preferenceKey];
      return updated;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      clearFilters,
      getFilterState,
      setFilterValue,
    }),
    [clearFilters, getFilterState, setFilterValue]
  );

  return (
    <PlanFilterContext.Provider value={value}>
      {children}
    </PlanFilterContext.Provider>
  );
};

PlanFilterContext.displayName = 'PlanFilterContext';

export { PlanFilterContext };
