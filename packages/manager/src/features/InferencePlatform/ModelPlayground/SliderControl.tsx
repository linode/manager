import { Box, TooltipIcon, Typography } from '@linode/ui';
import React from 'react';

import { StyledOutlinedInput, StyledSlider } from './SliderControl.styles';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
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
        <Box sx={{ alignItems: 'center', display: 'flex' }}>
          <Typography variant="body2">{label}</Typography>
          <TooltipIcon
            labelTooltipIconSize="small"
            status="info"
            sxTooltipIcon={{
              '& svg': { height: 16, width: 16 },
              marginLeft: '-4px',
            }}
            text={tooltip}
          />
        </Box>
        <StyledOutlinedInput
          inputProps={{ max, min, step }}
          onChange={handleInputChange}
          type="number"
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
