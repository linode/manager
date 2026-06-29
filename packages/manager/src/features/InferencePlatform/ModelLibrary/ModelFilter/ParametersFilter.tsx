import { Box, Typography } from '@linode/ui';
import React from 'react';

import { FilterSlider } from './FilterSlider';

import type { ModelFilterState } from '../modelLibrary.types';

// Real parameter values at each evenly-spaced tick position
const PARAM_REAL_VALUES = [1, 6, 25, 50, 75, 100, 1000];

// Index-based marks so MUI spaces ticks evenly regardless of value gaps
export const PARAM_MARKS = PARAM_REAL_VALUES.map((v, i) => ({
  label: `${v}B`,
  value: i,
}));

const PARAM_IDX_MIN = 0;
const PARAM_IDX_MAX = PARAM_MARKS.length - 1;

export const PARAM_MIN = PARAM_REAL_VALUES[0];
export const PARAM_MAX = PARAM_REAL_VALUES[PARAM_IDX_MAX];

/** Map an index to its real B value. */
const indexToValue = (idx: number): number =>
  PARAM_REAL_VALUES[idx] ?? PARAM_MAX;

/** Map a real B value to its index. */
const valueToIndex = (val: number): number => {
  const idx = PARAM_REAL_VALUES.indexOf(val);
  return idx >= 0 ? idx : PARAM_IDX_MAX;
};

export function formatParamLabel(min: number, max: number): string {
  if (min === PARAM_MIN && max === PARAM_MAX) return 'All sizes';
  return `${min}B – ${max}B`;
}

interface ParametersFilterProps {
  maxParametersB: null | number;
  minParametersB: number;
  onFilterChange: (next: Partial<ModelFilterState>) => void;
}

export const ParametersFilter = ({
  maxParametersB,
  minParametersB,
  onFilterChange,
}: ParametersFilterProps) => {
  const sliderIndices: [number, number] = [
    valueToIndex(minParametersB),
    valueToIndex(maxParametersB ?? PARAM_MAX),
  ];

  const handleSliderChange = (
    _: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    const MIN_DISTANCE = 1;
    let [minIdx, maxIdx] = value as [number, number];

    if (activeThumb === 0) {
      minIdx = Math.min(minIdx, maxIdx - MIN_DISTANCE);
    } else {
      maxIdx = Math.max(maxIdx, minIdx + MIN_DISTANCE);
    }

    const min = indexToValue(minIdx);
    const max = indexToValue(maxIdx);
    onFilterChange({
      maxParametersB: max === PARAM_MAX ? null : max,
      minParametersB: min,
    });
  };

  return (
    <Box
      sx={(theme) => ({
        flex: '2 1 260px',
        minWidth: 180,
        maxWidth: 220,
        paddingRight: 1,
      })}
    >
      <Typography
        sx={(theme) => ({
          display: 'block',
          fontSize: 14,
          fontFamily: theme.font.semibold,
          mb: 1.4,
          textTransform: 'none',
        })}
        variant="caption"
      >
        Parameters
      </Typography>

      <FilterSlider
        marks={PARAM_MARKS}
        max={PARAM_IDX_MAX}
        min={PARAM_IDX_MIN}
        onChange={handleSliderChange}
        scale={indexToValue}
        type="parameters"
        value={sliderIndices}
      />
    </Box>
  );
};
