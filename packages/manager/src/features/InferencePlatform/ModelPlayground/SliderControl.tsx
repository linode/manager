import { NumericSpinner, Tooltip } from '@akamai/cds-components/react';
import { InfoOutline } from '@akamai/cds-icons/react';
import React from 'react';

import { Box, Typography } from '../components';
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
  max: number | undefined;
  min: number | undefined;
  onChange: (value: number) => void;
  step: number;
  tooltip?: string;
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
  const hasBounds = min !== undefined && max !== undefined;
  const effectiveValue = value ?? min ?? null;

  const handleInputChange = (e: CustomEvent<null | number>) => {
    if (e.detail !== null) {
      const minimumClampedValue =
        min === undefined ? e.detail : Math.max(min, e.detail);
      const clampedValue =
        max === undefined
          ? minimumClampedValue
          : Math.min(max, minimumClampedValue);
      onChange(clampedValue);
    }
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <Box
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
          <Typography style={{ fontSize: '0.875rem' }}>{label}</Typography>
          {tooltip && (
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
          )}
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
      {hasBounds && (
        <StyledSlider
          max={max}
          min={min}
          onChange={(_e, val) => onChange(val as number)}
          size="small"
          step={step}
          value={value ?? min!}
        />
      )}
    </Box>
  );
};
