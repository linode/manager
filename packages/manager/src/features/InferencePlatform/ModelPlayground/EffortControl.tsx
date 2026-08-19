import { SegmentedButton, Tooltip } from '@akamai/cds-components/react';
import { InfoOutline } from '@akamai/cds-icons/react';
import { Box, Typography } from '@linode/ui';
import React from 'react';

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
  const handleChange = (e: CustomEvent) => {
    onChange(e.detail.value as PlaygroundSettings['reasoning_effort']);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
        <Typography variant="body2">{label}</Typography>
        <Tooltip tooltipText={tooltip}>
          <span
            style={{
              alignItems: 'center',
              display: 'flex',
              marginRight: 4,
            }}
          >
            <InfoOutline height={16} width={16} />
          </span>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {effortLevels.map((level) => (
          <SegmentedButton
            checked={value === level.value}
            key={level.value}
            onChange={handleChange}
            style={{ borderRadius: '4px', flex: 1 }}
            value={level.value}
          >
            {level.label}
          </SegmentedButton>
        ))}
      </Box>
    </Box>
  );
};
