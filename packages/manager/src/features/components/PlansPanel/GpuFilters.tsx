/**
 * GPUPlanFilter Component
 *
 * Filter component for GPU plans. Composes Select dropdown and
 * uses local React state to manage filter selections.
 */

import { Autocomplete } from '@linode/ui';
import * as React from 'react';

import {
  PLAN_FILTER_ALL,
  PLAN_FILTER_ALL_AVAILABLE,
  PLAN_FILTER_GPU_RTX_4000_ADA,
  PLAN_FILTER_GPU_RTX_6000,
  PLAN_FILTER_GPU_RTX_PRO_6000,
} from './constants';
import { getIsPlanDisabled } from './utils';
import { filterPlansByGpuType, getGpuRank } from './utils/planFilters';

import type {
  PlanFilterRenderArgs,
  PlanFilterRenderResult,
} from './PlanContainer';
import type { PlanWithAvailability } from './types';
import type { PlanFilterGPU } from './types/planFilters';
import type { SelectOption } from '@linode/ui';

type GPUOptionWithDisabled = SelectOption<PlanFilterGPU> & {
  isDisabled: boolean;
};
const ALL_GPU_OPTIONS: SelectOption<PlanFilterGPU>[] = [
  { label: 'All Available Plans', value: PLAN_FILTER_ALL_AVAILABLE },
  { label: 'All Plans', value: PLAN_FILTER_ALL },
  { label: 'RTX PRO 6000 Blackwell', value: PLAN_FILTER_GPU_RTX_PRO_6000 },
  { label: 'RTX 4000 Ada', value: PLAN_FILTER_GPU_RTX_4000_ADA },
  { label: 'Quadro RTX 6000', value: PLAN_FILTER_GPU_RTX_6000 },
];

interface GPUPlanFilterComponentProps {
  disabled?: boolean;
  onResult: (result: PlanFilterRenderResult) => void;
  plans: PlanWithAvailability[];
  resetPagination: () => void;
}

const GPUPlanFilterComponent = React.memo(
  (props: GPUPlanFilterComponentProps) => {
    const { disabled = false, onResult, plans, resetPagination } = props;

    // Local state - persists automatically because component stays mounted
    const [gpuType, setGpuType] = React.useState<PlanFilterGPU>(
      PLAN_FILTER_ALL_AVAILABLE
    );

    const previousFilters = React.useRef<{
      gpuType?: PlanFilterGPU;
    }>(null);

    // Compute available GPU options based on plans
    const GPU_OPTIONS_BASED_ON_AVAILABLE_PLANS = React.useMemo(() => {
      const options = ALL_GPU_OPTIONS.reduce(
        (acc: GPUOptionWithDisabled[], option) => {
          if (
            option.value === PLAN_FILTER_ALL ||
            option.value === PLAN_FILTER_ALL_AVAILABLE
          ) {
            acc.push({
              ...option,
              isDisabled: false,
            });
          } else {
            const filteredPlans = filterPlansByGpuType(plans, option.value);
            if (filteredPlans.length > 0) {
              acc.push({
                ...option,
                isDisabled: filteredPlans.every((plan) =>
                  getIsPlanDisabled(plan)
                ),
              });
            }
          }
          return acc;
        },
        []
      );
      // Sort options: available first, then all, then by generation (Blackwell > Ada > Quadro)
      return options.sort((a, b) => {
        // "available" always comes first
        if (a.value === 'available') return -1;
        if (b.value === 'available') return 1;

        // "all" always comes second
        if (a.value === 'all') return -1;
        if (b.value === 'all') return 1;

        // enabled options before disabled
        if (a.isDisabled !== b.isDisabled) {
          return Number(a.isDisabled) - Number(b.isDisabled);
        }

        // generation order blackwell > ada > quadro
        return getGpuRank(b.value) - getGpuRank(a.value);
      });
    }, [plans]);

    // Reset pagination when filters change (but not on initial mount)
    React.useEffect(() => {
      // Skip pagination reset on initial mount
      if (previousFilters.current === null) {
        previousFilters.current = { gpuType };
        return;
      }

      const { gpuType: prevGpuType } = previousFilters.current;

      if (prevGpuType !== gpuType) {
        resetPagination();
      }

      previousFilters.current = { gpuType };
    }, [gpuType, resetPagination]);

    const handleGpuTypeChange = React.useCallback(
      (_event: React.SyntheticEvent, option: GPUOptionWithDisabled) => {
        const newGpuType = option?.value ?? PLAN_FILTER_ALL_AVAILABLE;
        setGpuType(newGpuType);
      },
      []
    );

    const filteredPlans = React.useMemo(
      () => filterPlansByGpuType(plans, gpuType),
      [gpuType, plans]
    );

    const selectedGpuType = React.useMemo(() => {
      return (
        GPU_OPTIONS_BASED_ON_AVAILABLE_PLANS.find(
          (opt) => opt.value === gpuType
        ) ?? undefined
      );
    }, [gpuType, GPU_OPTIONS_BASED_ON_AVAILABLE_PLANS]);

    const result = React.useMemo<PlanFilterRenderResult>(() => {
      const filterUI = (
        <div
          style={{
            marginBottom: 16,
            marginTop: -16,
          }}
        >
          <Autocomplete
            aria-labelledby="plan-filter-gpu-label"
            data-testid="plan-filter-gpu"
            disableClearable
            disabled={disabled}
            getOptionDisabled={(option) => option.isDisabled || false}
            id="plan-filter-gpu"
            label="GPU Plans"
            onChange={handleGpuTypeChange}
            options={GPU_OPTIONS_BASED_ON_AVAILABLE_PLANS}
            placeholder="Select a plan"
            value={selectedGpuType}
          />
        </div>
      );

      return {
        filteredPlans,
        filterUI,
        hasActiveFilters: gpuType !== PLAN_FILTER_ALL_AVAILABLE,
      };
    }, [
      GPU_OPTIONS_BASED_ON_AVAILABLE_PLANS,
      disabled,
      filteredPlans,
      gpuType,
      handleGpuTypeChange,
      selectedGpuType,
    ]);

    // Notify parent component whenever filter result changes
    // onResult is stable (created with useCallback in parent), so this is safe
    React.useEffect(() => {
      onResult(result);
    }, [onResult, result]);

    return null;
  }
);

export const createGPUPlanFilterRenderProp = () => {
  return ({
    onResult,
    plans,
    resetPagination,
    shouldDisableFilters = false,
  }: PlanFilterRenderArgs): React.ReactNode => (
    <GPUPlanFilterComponent
      disabled={shouldDisableFilters}
      onResult={onResult}
      plans={plans}
      resetPagination={resetPagination}
    />
  );
};
