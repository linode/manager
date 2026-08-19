import { TagInput, Tooltip } from '@akamai/cds-components/react';
import { InfoOutline } from '@akamai/cds-icons/react';
import { Box, Typography, useTheme } from '@linode/ui';
import React from 'react';

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
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 1 }}>
        <Typography variant="body2">Stop Sequences</Typography>
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
