import { Button, NumericSpinner, Tooltip } from '@akamai/cds-components/react';
import { InfoOutline } from '@akamai/cds-icons/react';
import { Box, Typography } from '@linode/ui';
import React from 'react';

const MAX_SEED = 2_147_483_647;

interface SeedControlProps {
  onChange: (value: number | undefined) => void;
  value: number | undefined;
}

export const SeedControl = ({ onChange, value }: SeedControlProps) => {
  const handleChange = (e: CustomEvent<null | number>) => {
    onChange(e.detail ?? undefined);
  };

  const handleRandomize = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    onChange(array[0] % (MAX_SEED + 1));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 1.25 }}>
        <Typography variant="body2">Seed</Typography>
        <Tooltip tooltipText="Fixes the random seed so identical inputs produce identical output, making runs of the same prompt reproducible.">
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
        sx={{
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
