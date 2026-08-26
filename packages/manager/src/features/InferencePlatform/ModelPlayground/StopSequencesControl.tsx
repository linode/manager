import { TagInput, Tooltip } from '@akamai/cds-components/react';
import { InfoOutline } from '@akamai/cds-icons/react';
import { useTheme } from '@linode/ui';
import React from 'react';

import { Box, Typography } from '../components';

interface StopSequencesControlProps {
  onChange: (value: string[] | undefined) => void;
  value: string[] | undefined;
}

const EMPTY_SEQUENCES: string[] = [];

export const StopSequencesControl = ({
  onChange,
  value,
}: StopSequencesControlProps) => {
  const sequences = value ?? EMPTY_SEQUENCES;
  const theme = useTheme();

  const handleChange = (e: CustomEvent<unknown[]>) => {
    const strings = e.detail as string[];
    onChange(strings.length > 0 ? strings : undefined);
  };

  return (
    <Box>
      <Box
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <Typography style={{ fontSize: '0.875rem' }}>Stop Sequences</Typography>
        <Tooltip tooltipText="Text strings that immediately halt generation when produced. Useful for ending a response at a known marker.">
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
      <TagInput
        onChange={handleChange}
        placeholder="Type and press Enter to add…"
        style={{
          borderRadius: theme.palette.mode === 'dark' ? 0 : '4px',
        }}
        value={sequences}
      />
    </Box>
  );
};
