import { Button, NumericSpinner, Tooltip } from '@akamai/cds-components/react';
import { InfoOutline } from '@akamai/cds-icons/react';
import React from 'react';

import { Box, Typography } from '../components';

const MAX_SEED = 2_147_483_647;

interface SeedControlProps {
  label?: string;
  onChange: (value: number | undefined) => void;
  tooltip?: string;
  value: number | undefined;
}

export const SeedControl = ({
  label = 'Seed',
  onChange,
  tooltip = 'Fixes the random seed so identical inputs produce identical output, making runs of the same prompt reproducible.',
  value,
}: SeedControlProps) => {
  const handleChange = (e: CustomEvent<null | number>) => {
    onChange(e.detail ?? undefined);
  };

  const handleRandomize = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    onChange(array[0] % (MAX_SEED + 1));
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <Box
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
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
      <Box
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <NumericSpinner
          max={MAX_SEED}
          min={0}
          onChange={handleChange}
          placeholder="—"
          step={1}
          style={{ borderRadius: '4px', flex: 'none', width: 130 }}
          value={value ?? null}
        />
        <Tooltip tooltipText="Generate random seed">
          <Button onClick={handleRandomize} size="large" variant="link">
            New Seed
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};
