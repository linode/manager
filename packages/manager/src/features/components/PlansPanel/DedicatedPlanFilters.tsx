/**
 * DedicatedPlanFilters Component
 *
 * Filter component for Dedicated CPU plans. Composes Select dropdowns and
 * uses the generic usePlanFilters hook to sync state with context provider.
 */

import { Select } from '@linode/ui';
import * as React from 'react';

import {
  PLAN_FILTER_EMPTY_STATE_MESSAGE,
  PLAN_FILTER_GENERATION_G6,
  PLAN_FILTER_GENERATION_G7,
  PLAN_FILTER_GENERATION_G8,
  PLAN_FILTER_TYPE_ALL,
  PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED,
  PLAN_FILTER_TYPE_GENERAL_PURPOSE,
} from './constants';
import { usePlanFilters } from './hooks/usePlanFilters';
import {
  applyPlanFilters,
  shouldShowEmptyState,
  supportsTypeFiltering,
} from './utils/planFilters';

import type {
  PlanFilterRenderArgs,
  PlanFilterRenderResult,
} from './PlanContainer';
import type { PlanWithAvailability } from './types';
import type { PlanFilterGeneration, PlanFilterType } from './types/planFilters';
import type { SelectOption } from '@linode/ui';

type DedicatedFilterKey = 'generation' | 'type';

const GENERATION_OPTIONS: SelectOption<PlanFilterGeneration>[] = [
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
  preferenceKey: string;
  resetPagination: () => void;
}

const DedicatedPlanFiltersComponent = React.memo(
  (props: DedicatedPlanFiltersComponentProps) => {
    const {
      disabled = false,
      onResult,
      plans,
      preferenceKey,
      resetPagination,
    } = props;

    const filterDefinitions = React.useMemo(
      () => ({
        generation: {
          clearsOnClear: ['type'] as DedicatedFilterKey[],
          resetsToDefaultOnChange: ['type'] as DedicatedFilterKey[],
        },
        type: {
          defaultValue: PLAN_FILTER_TYPE_ALL,
        },
      }),
      []
    );

    const { filterState, setFilterValue } = usePlanFilters<DedicatedFilterKey>({
      filters: filterDefinitions,
      preferenceKey,
    });

    const generation = filterState.generation as
      | PlanFilterGeneration
      | undefined;

    const type =
      (filterState.type as PlanFilterType | undefined) ?? PLAN_FILTER_TYPE_ALL;

    const typeFilteringSupported = generation
      ? supportsTypeFiltering(generation)
      : false;

    const typeOptions = typeFilteringSupported
      ? TYPE_OPTIONS_WITH_SUBTYPES
      : TYPE_OPTIONS_ALL_ONLY;

    // Disable type filter if:
    // 1. Panel is disabled, OR
    // 2. No generation selected, OR
    // 3. Selected generation doesn't support type filtering (G7, G6)
    const isTypeSelectDisabled =
      disabled || !generation || !typeFilteringSupported;

    const previousFilters = React.useRef<{
      generation?: PlanFilterGeneration;
      type?: PlanFilterType;
    }>({ generation, type });

    React.useEffect(() => {
      const { generation: prevGeneration, type: prevType } =
        previousFilters.current;

      // Skip pagination reset on initial mount when filters are loaded from URL
      const isInitialMount =
        prevGeneration === undefined && prevType === undefined;

      if (
        !isInitialMount &&
        (prevGeneration !== generation || prevType !== type)
      ) {
        resetPagination();
      }

      previousFilters.current = { generation, type };
    }, [generation, resetPagination, type]);

    const handleGenerationChange = React.useCallback(
      (
        _event: React.SyntheticEvent,
        option: null | SelectOption<number | string>
      ) => {
        setFilterValue(
          'generation',
          option?.value as PlanFilterGeneration | undefined
        );
      },
      [setFilterValue]
    );

    const handleTypeChange = React.useCallback(
      (
        _event: React.SyntheticEvent,
        option: null | SelectOption<number | string>
      ) => {
        setFilterValue(
          'type',
          (option?.value as PlanFilterType | undefined) ?? PLAN_FILTER_TYPE_ALL
        );
      },
      [setFilterValue]
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
      const emptyState = shouldShowEmptyState(generation)
        ? { message: PLAN_FILTER_EMPTY_STATE_MESSAGE }
        : null;

      const filterUI = (
        <div
          style={{
            alignItems: 'flex-end',
            display: 'flex',
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
        emptyState,
        filteredPlans,
        filterUI,
        hasActiveFilters: !!generation,
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
    // onResult is stable (created with useCallback in parent), so this is safe
    React.useEffect(() => {
      onResult(result);
    }, [onResult, result]);

    return null;
  }
);

DedicatedPlanFiltersComponent.displayName = 'DedicatedPlanFiltersComponent';

export const createDedicatedPlanFiltersRenderProp = (preferenceKey: string) => {
  return ({
    onResult,
    plans,
    resetPagination,
    shouldDisableFilters = false,
  }: PlanFilterRenderArgs): React.ReactNode => (
    <DedicatedPlanFiltersComponent
      disabled={shouldDisableFilters}
      key={preferenceKey}
      onResult={onResult}
      plans={plans}
      preferenceKey={preferenceKey}
      resetPagination={resetPagination}
    />
  );
};
