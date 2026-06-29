import { Box, Button, Tooltip, TooltipIcon, Typography } from '@linode/ui';
import OutlinedInput from '@mui/material/OutlinedInput';
import React from 'react';

const MAX_SEED = 2_147_483_647;

interface SeedControlProps {
  onChange: (value: number | undefined) => void;
  value: number | undefined;
}

export const SeedControl = ({ onChange, value }: SeedControlProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(undefined);
      return;
    }
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      onChange(Math.min(MAX_SEED, Math.max(0, num)));
    }
  };

  const handleRandomize = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    onChange(array[0] % (MAX_SEED + 1));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ alignItems: 'center', display: 'flex' }}>
        <Typography variant="body2">Seed</Typography>
        <TooltipIcon
          labelTooltipIconSize="small"
          status="info"
          sxTooltipIcon={{
            '& svg': { height: 16, width: 16 },
            marginLeft: '-4px',
          }}
          text="Fixes the random seed so identical inputs produce identical output, making runs of the same prompt reproducible."
        />
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <OutlinedInput
          inputProps={{ max: MAX_SEED, min: 0, step: 1 }}
          onChange={handleChange}
          placeholder="—"
          sx={(theme) => ({
            '& input': {
              fontSize: theme.tokens.font.FontSize.Xs,
              padding: '4px 0',
              textAlign: 'left',
            },
            '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button':
              { display: 'none' },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            width: 110,
          })}
          type="number"
          value={value ?? ''}
        />
        <Tooltip title="Generate random seed">
          <Button buttonType="secondary" onClick={handleRandomize} size="small">
            New Seed
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};
