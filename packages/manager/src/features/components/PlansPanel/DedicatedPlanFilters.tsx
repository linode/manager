/**
 * DedicatedPlanFilters Component
 *
 * Filter component for Dedicated CPU plans. Composes Select dropdowns and
 * uses local React state to manage filter selections.
 *
 * Note: State persists when switching between plan tabs because Reach UI
 * TabPanels keep all tabs mounted in the DOM (only visibility changes).
 */

import { Select } from '@linode/ui';
import * as React from 'react';

import {
  PLAN_FILTER_GENERATION_ALL,
  PLAN_FILTER_GENERATION_G6,
  PLAN_FILTER_GENERATION_G7,
  PLAN_FILTER_GENERATION_G8,
  PLAN_FILTER_TYPE_ALL,
  PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED,
  PLAN_FILTER_TYPE_GENERAL_PURPOSE,
} from './constants';
import { applyPlanFilters, supportsTypeFiltering } from './utils/planFilters';

import type {
  PlanFilterRenderArgs,
  PlanFilterRenderResult,
} from './PlanContainer';
import type { PlanWithAvailability } from './types';
import type { PlanFilterGeneration, PlanFilterType } from './types/planFilters';
import type { SelectOption } from '@linode/ui';

const GENERATION_OPTIONS: SelectOption<PlanFilterGeneration>[] = [
  { label: 'All', value: PLAN_FILTER_GENERATION_ALL },
  { label: 'G8 Dedicated', value: PLAN_FILTER_GENERATION_G8 },
  { label: 'G7 Dedicated', value: PLAN_FILTER_GENERATION_G7 },
  { label: 'G6 Dedicated', value: PLAN_FILTER_GENERATION_G6 },
];

const TYPE_OPTIONS_WITH_SUBTYPES: SelectOption<PlanFilterType>[] = [
  { label: 'All', value: PLAN_FILTER_TYPE_ALL },
  { label: 'Compute Optimized', value: PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED },
  { label: 'General Purpose', value: PLAN_FILTER_TYPE_GENERAL_PURPOSE },
];

const TYPE_OPTIONS_ALL_ONLY: SelectOption<PlanFilterType>[] = [
  { label: 'All', value: PLAN_FILTER_TYPE_ALL },
];

interface DedicatedPlanFiltersComponentProps {
  disabled?: boolean;
  onResult: (result: PlanFilterRenderResult) => void;
  plans: PlanWithAvailability[];
  resetPagination: () => void;
}

const DedicatedPlanFiltersComponent = React.memo(
  (props: DedicatedPlanFiltersComponentProps) => {
    const { disabled = false, onResult, plans, resetPagination } = props;

    // Local state - persists automatically because component stays mounted
    const [generation, setGeneration] = React.useState<PlanFilterGeneration>(
      PLAN_FILTER_GENERATION_ALL
    );

    const [type, setType] =
      React.useState<PlanFilterType>(PLAN_FILTER_TYPE_ALL);

    const typeFilteringSupported = supportsTypeFiltering(generation);

    const typeOptions = typeFilteringSupported
      ? TYPE_OPTIONS_WITH_SUBTYPES
      : TYPE_OPTIONS_ALL_ONLY;

    // Disable type filter if:
    // 1. Panel is disabled, OR
    // 2. Selected generation doesn't support type filtering (G7, G6, All)
    const isTypeSelectDisabled = disabled || !typeFilteringSupported;

    // Track previous filters to detect changes for pagination reset
    const previousFilters = React.useRef<null | {
      generation: PlanFilterGeneration;
      type: PlanFilterType;
    }>(null);

    // Reset pagination when filters change (but not on initial mount)
    React.useEffect(() => {
      // Skip pagination reset on initial mount
      if (previousFilters.current === null) {
        previousFilters.current = { generation, type };
        return;
      }

      const { generation: prevGeneration, type: prevType } =
        previousFilters.current;

      if (prevGeneration !== generation || prevType !== type) {
        resetPagination();
      }

      previousFilters.current = { generation, type };
    }, [generation, resetPagination, type]);

    const handleGenerationChange = React.useCallback(
      (
        _event: React.SyntheticEvent,
        option: null | SelectOption<number | string>
      ) => {
        // When clearing, default to "All" instead of undefined
        const newGeneration =
          (option?.value as PlanFilterGeneration | undefined) ??
          PLAN_FILTER_GENERATION_ALL;
        setGeneration(newGeneration);

        // Reset type filter when generation changes
        setType(PLAN_FILTER_TYPE_ALL);
      },
      []
    );

    const handleTypeChange = React.useCallback(
      (
        _event: React.SyntheticEvent,
        option: null | SelectOption<number | string>
      ) => {
        setType(
          (option?.value as PlanFilterType | undefined) ?? PLAN_FILTER_TYPE_ALL
        );
      },
      []
    );

    const filteredPlans = React.useMemo(() => {
      const normalizedType = typeFilteringSupported
        ? type
        : PLAN_FILTER_TYPE_ALL;
      return applyPlanFilters(plans, generation, normalizedType);
    }, [generation, plans, type, typeFilteringSupported]);

    const selectedGenerationOption = React.useMemo(() => {
      return GENERATION_OPTIONS.find((opt) => opt.value === generation) ?? null;
    }, [generation]);

    const selectedTypeOption = React.useMemo(() => {
      const displayType = typeFilteringSupported ? type : PLAN_FILTER_TYPE_ALL;
      return typeOptions.find((opt) => opt.value === displayType) ?? null;
    }, [type, typeFilteringSupported, typeOptions]);

    const result = React.useMemo<PlanFilterRenderResult>(() => {
      const filterUI = (
        <div
          style={{
            alignItems: 'flex-end',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '19px',
            marginBottom: 16,
          }}
        >
          <Select
            aria-labelledby="plan-filter-generation-label"
            clearable
            data-testid="plan-filter-generation"
            disabled={disabled}
            id="plan-filter-generation"
            label="Dedicated Plans"
            onChange={handleGenerationChange}
            options={GENERATION_OPTIONS}
            placeholder="Select a plan"
            sx={{ width: 446 }}
            value={selectedGenerationOption}
          />

          <Select
            aria-labelledby="plan-filter-type-label"
            clearable
            data-testid="plan-filter-type"
            disabled={isTypeSelectDisabled}
            id="plan-filter-type"
            label="Types"
            onChange={handleTypeChange}
            options={typeOptions}
            sx={{ width: 207 }}
            value={selectedTypeOption}
          />
        </div>
      );

      return {
        filteredPlans,
        filterUI,
        hasActiveFilters: generation !== PLAN_FILTER_GENERATION_ALL,
      };
    }, [
      disabled,
      filteredPlans,
      generation,
      handleGenerationChange,
      handleTypeChange,
      isTypeSelectDisabled,
      selectedGenerationOption,
      selectedTypeOption,
      typeOptions,
    ]);

    // Notify parent component whenever filter result changes
    React.useEffect(() => {
      onResult(result);
    }, [onResult, result]);

    return null;
  }
);

DedicatedPlanFiltersComponent.displayName = 'DedicatedPlanFiltersComponent';

export const createDedicatedPlanFiltersRenderProp = () => {
  return ({
    onResult,
    plans,
    resetPagination,
    shouldDisableFilters = false,
  }: PlanFilterRenderArgs): React.ReactNode => (
    <DedicatedPlanFiltersComponent
      disabled={shouldDisableFilters}
      onResult={onResult}
      plans={plans}
      resetPagination={resetPagination}
    />
  );
};
