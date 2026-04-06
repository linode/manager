import { Box } from '@linode/ui';
import { Typography } from '@linode/ui';
import React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';

import { VolumesActionMenu } from '../../Partials/VolumesActionMenu';

import type { ActionHandlers } from '../../Partials/VolumesActionMenu';
import type { Volume } from '@linode/api-v4';

interface Props {
  handlers: ActionHandlers;
  volume: Volume;
}

export const VolumeEntityDetailHeader = ({ volume, handlers }: Props) => {
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
      <VolumesActionMenu
        handlers={handlers}
        isVolumeDetails={true}
        isVolumesLanding={true} // We need Attach action here
        volume={volume}
      />
    </EntityHeader>
  );
};
