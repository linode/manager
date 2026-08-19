import { NumericSpinner, Tooltip } from '@akamai/cds-components/react';
import { InfoOutline } from '@akamai/cds-icons/react';
import { Box, Typography } from '@linode/ui';
import React from 'react';

import { StyledSlider } from './SliderControl.styles';

const stepDecimals = (step: number) =>
  (step.toString().split('.')[1] ?? '').length;

const roundedIncrement = (value: null | number, step: number): number => {
  if (value === null) return 0;
  return parseFloat((value + step).toFixed(stepDecimals(step)));
};

const roundedDecrement = (value: null | number, step: number): number => {
  if (value === null) return 0;
  return parseFloat((value - step).toFixed(stepDecimals(step)));
};

export interface SliderControlProps {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  tooltip: string;
  value: number | undefined;
}

export const SliderControl = ({
  label,
  max,
  min,
  onChange,
  step,
  tooltip,
  value,
}: SliderControlProps) => {
  const effectiveValue = value ?? min;

  const handleInputChange = (e: CustomEvent<null | number>) => {
    if (e.detail !== null) {
      onChange(Math.min(max, Math.max(min, e.detail)));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <Typography variant="body2">{label}</Typography>
          <Tooltip tooltipText={tooltip}>
            <span
              style={{
                alignItems: 'center',
                display: 'flex',
                marginRight: 8,
              }}
            >
              <InfoOutline height={16} width={16} />
            </span>
          </Tooltip>
        </Box>
        <NumericSpinner
          decrementFn={roundedDecrement}
          incrementFn={roundedIncrement}
          max={max}
          min={min}
          onChange={handleInputChange}
          step={step}
          style={{ borderRadius: '4px', flex: 'none', width: 85 }}
          value={effectiveValue}
        />
      </Box>
      <StyledSlider
        max={max}
        min={min}
        onChange={(_e, val) => onChange(val as number)}
        size="small"
        step={step}
        value={effectiveValue}
      />
    </Box>
  );
};
