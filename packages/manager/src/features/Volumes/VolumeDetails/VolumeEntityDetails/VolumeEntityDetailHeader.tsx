import { Box } from '@linode/ui';
import { Typography } from '@linode/ui';
import React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';

import type { Volume } from '@linode/api-v4';

interface Props {
  volume: Volume;
}

export const VolumeEntityDetailHeader = ({ volume }: Props) => {
  return (
    <EntityHeader>
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          padding: `${theme.spacingFunction(6)} 0 ${theme.spacingFunction(6)} ${theme.spacingFunction(16)}`,
        })}
      >
        <Typography sx={(theme) => ({ font: theme.font.bold })}>
          Summary
        </Typography>
      </Box>
    </EntityHeader>
  );
};
