import { SegmentedButton, Tooltip } from '@akamai/cds-components/react';
import { InfoOutline } from '@akamai/cds-icons/react';
import React from 'react';

import { Box, Typography } from '../components';

import type { PlaygroundSettings } from './types';

interface Props {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  tooltip: string;
  value: PlaygroundSettings['reasoning_effort'];
}

export const EffortControl = ({
  label,
  onChange,
  options,
  tooltip,
  value,
}: Props) => {
  const handleChange = (e: CustomEvent) => {
    onChange(e.detail.value as string);
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Box style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
        <Typography style={{ fontSize: '0.875rem' }}>{label}</Typography>
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
      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map((option) => (
          <SegmentedButton
            checked={value === option}
            key={option}
            onChange={handleChange}
            style={{ borderRadius: '4px', flex: 'none' }}
            value={option}
          >
            {option}
          </SegmentedButton>
        ))}
      </Box>
    </Box>
  );
};
