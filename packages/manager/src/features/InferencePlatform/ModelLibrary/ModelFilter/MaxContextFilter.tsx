import { Box, Typography } from '@linode/ui';
import React from 'react';

import { FilterSlider } from './FilterSlider';

import type { ModelFilterState } from '../modelLibrary.types';

// Real context length values at each evenly-spaced tick position (in K tokens)
const CTX_REAL_VALUES = [8, 32, 128, 200, 256];

// Index-based marks so MUI spaces ticks evenly regardless of value gaps
export const CTX_MARKS = CTX_REAL_VALUES.map((v, i) => ({
  label: `${v}K`,
  value: i,
}));

const CTX_IDX_MIN = 0;
const CTX_IDX_MAX = CTX_MARKS.length - 1;

export const CTX_MIN = CTX_REAL_VALUES[0];
export const CTX_MAX = CTX_REAL_VALUES[CTX_IDX_MAX];

/** Map an index to its real K value. */
const indexToValue = (idx: number): number => CTX_REAL_VALUES[idx] ?? CTX_MAX;

/** Map a real K value to its index. */
const valueToIndex = (val: number): number => {
  const idx = CTX_REAL_VALUES.indexOf(val);
  return idx >= 0 ? idx : CTX_IDX_MAX;
};

export function formatContextLabel(min: number, max: number): string {
  if (min === CTX_MIN && max === CTX_MAX) return 'All sizes';
  return `${min}K – ${max}K`;
}

interface MaxContextFilterProps {
  maxContextLengthK: null | number;
  minContextLengthK: number;
  onFilterChange: (next: Partial<ModelFilterState>) => void;
}

export const MaxContextFilter = ({
  maxContextLengthK,
  minContextLengthK,
  onFilterChange,
}: MaxContextFilterProps) => {
  const sliderIndices: [number, number] = [
    valueToIndex(minContextLengthK),
    valueToIndex(maxContextLengthK ?? CTX_MAX),
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
      maxContextLengthK: max === CTX_MAX ? null : max,
      minContextLengthK: min,
    });
  };

  return (
    <Box
      sx={{ flex: '2 1 260px', minWidth: 180, maxWidth: 200, paddingLeft: 1 }}
    >
      <Typography
        sx={{
          display: 'block',
          fontSize: 14,
          fontWeight: 700,
          mb: 1.4,
          textTransform: 'none',
        }}
        variant="caption"
      >
        Max Context
      </Typography>

      <FilterSlider
        marks={CTX_MARKS}
        max={CTX_IDX_MAX}
        min={CTX_IDX_MIN}
        onChange={handleSliderChange}
        scale={indexToValue}
        type="context"
        value={sliderIndices}
      />
    </Box>
  );
};
