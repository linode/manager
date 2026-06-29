import { Box, TooltipIcon, Typography } from '@linode/ui';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React from 'react';

import { StyledToggleButton } from './EffortControl.styles';

import type { PlaygroundSettings } from './types';

interface Props {
  label: string;
  onChange: (value: PlaygroundSettings['reasoning_effort']) => void;
  tooltip: string;
  value: PlaygroundSettings['reasoning_effort'];
}

const effortLevels: Array<{
  label: string;
  value: PlaygroundSettings['reasoning_effort'];
}> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export const EffortControl = ({ label, onChange, tooltip, value }: Props) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: null | PlaygroundSettings['reasoning_effort']
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
      <ToggleButtonGroup
        aria-label={label}
        exclusive
        fullWidth
        onChange={handleChange}
        sx={{ gap: 1 }}
        value={value}
      >
        {effortLevels.map((level) => (
          <StyledToggleButton key={level.value} value={level.value}>
            {level.label}
          </StyledToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
