/**
 * GPUPlanFilter Component
 *
 * Filter component for GPU plans. Composes Select dropdown and
 * uses local React state to manage filter selections.
 */

import { Select } from '@linode/ui';
import * as React from 'react';

import {
  PLAN_FILTER_ALL,
  PLAN_FILTER_GPU_RTX_4000_ADA,
  PLAN_FILTER_GPU_RTX_6000,
  PLAN_FILTER_GPU_RTX_PRO_6000,
} from './constants';
import { filterPlansByGpuType } from './utils/planFilters';

import type {
  PlanFilterRenderArgs,
  PlanFilterRenderResult,
} from './PlanContainer';
import type { PlanWithAvailability } from './types';
import type { PlanFilterGPU } from './types/planFilters';
import type { SelectOption } from '@linode/ui';

const ALL_GPU_OPTIONS: SelectOption<PlanFilterGPU>[] = [
  { label: 'All', value: PLAN_FILTER_ALL },
  { label: 'RTX PRO 6000 Blackwell', value: PLAN_FILTER_GPU_RTX_PRO_6000 },
  { label: 'RTX 4000 Ada', value: PLAN_FILTER_GPU_RTX_4000_ADA },
  { label: 'Quadro RTX 6000', value: PLAN_FILTER_GPU_RTX_6000 },
];

interface GPUPlanFilterComponentProps {
  onResult: (result: PlanFilterRenderResult) => void;
  plans: PlanWithAvailability[];
  resetPagination: () => void;
}

const GPUPlanFilterComponent = React.memo(
  (props: GPUPlanFilterComponentProps) => {
    const { onResult, plans, resetPagination } = props;

    // Local state - persists automatically because component stays mounted
    const [gpuType, setGpuType] =
      React.useState<PlanFilterGPU>(PLAN_FILTER_ALL);

    const previousFilters = React.useRef<{
      gpuType?: PlanFilterGPU;
    }>(null);

    // Compute available GPU options based on plans
    const GPU_OPTIONS_BASED_ON_AVAILABLE_PLANS = React.useMemo(() => {
      return ALL_GPU_OPTIONS.filter((option) => {
        if (option.value === 'all') {
          return true;
        }
        const filteredPlans = filterPlansByGpuType(plans, option.value);
        return filteredPlans.length > 0;
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
      (
        _event: React.SyntheticEvent,
        option: null | SelectOption<number | string>
      ) => {
        const newGpuType =
          (option?.value as PlanFilterGPU | undefined) ?? PLAN_FILTER_ALL;
        setGpuType(newGpuType);
      },
      []
    );

    const filteredPlans = React.useMemo(() => {
      return filterPlansByGpuType(plans, gpuType);
    }, [gpuType, plans]);

    const selectedGpuType = React.useMemo(() => {
      return (
        GPU_OPTIONS_BASED_ON_AVAILABLE_PLANS.find(
          (opt) => opt.value === gpuType
        ) ?? null
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
          <Select
            aria-labelledby="plan-filter-gpu-label"
            data-testid="plan-filter-gpu"
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
        hasActiveFilters: gpuType !== PLAN_FILTER_ALL,
      };
    }, [
      GPU_OPTIONS_BASED_ON_AVAILABLE_PLANS,
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

GPUPlanFilterComponent.displayName = 'GPUPlanFilterComponent';

export const createGPUPlanFilterRenderProp = () => {
  return ({
    onResult,
    plans,
    resetPagination,
  }: PlanFilterRenderArgs): React.ReactNode => (
    <GPUPlanFilterComponent
      onResult={onResult}
      plans={plans}
      resetPagination={resetPagination}
    />
  );
};
