import { useProfile, useRegionsQuery } from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import { getFormattedStatus } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { formatDate } from 'src/utilities/formatDate';

import { AttachedToValue } from '../../Partials/AttachedToValue';
import { volumeStatusIconMap } from '../../utils';

import type { Volume } from '@linode/api-v4';

interface Props {
  detachHandler: () => void;
  volume: Volume;
}

export const VolumeEntityDetailBody = ({ volume, detachHandler }: Props) => {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const { data: regions } = useRegionsQuery();

  const regionLabel =
    regions?.find((region) => region.id === volume.region)?.label ??
    volume.region;

  return (
    <Grid container spacing={1} sx={{ padding: theme.spacingFunction(16) }}>
      <Grid
        size={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacingFunction(8),
        }}
      >
        <Box>
          <Typography>Status</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StatusIcon status={volumeStatusIconMap[volume.status]} />
            <Typography sx={(theme) => ({ font: theme.font.bold })}>
              {getFormattedStatus(volume.status)}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography>Size</Typography>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {volume.size} GB
          </Typography>
        </Box>
        <Box>
          <Typography>Created</Typography>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {formatDate(volume.created, {
              timezone: profile?.timezone,
            })}
          </Typography>
        </Box>
      </Grid>

      <Grid
        size={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacingFunction(8),
        }}
      >
        <Box>
          <Typography>Volume ID</Typography>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {volume.id}
          </Typography>
        </Box>
        <Box>
          <Typography>Region</Typography>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {regionLabel}
          </Typography>
        </Box>
        <Box>
          <Typography>Volume Label</Typography>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {volume.label}
          </Typography>
        </Box>
      </Grid>

      <Grid
        size={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacingFunction(8),
        }}
      >
        <Box>
          <Typography>Attached To</Typography>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            <AttachedToValue onDetach={detachHandler} volume={volume} />
          </Typography>
        </Box>

        <Box>
          <Typography>Encryption</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacingFunction(4),
            }}
          >
            {volume.encryption === 'enabled' ? (
              <>
                <Lock />
                <Typography sx={(theme) => ({ font: theme.font.bold })}>
                  Encrypted
                </Typography>
              </>
            ) : (
              <>
                <Unlock />
                <Typography sx={(theme) => ({ font: theme.font.bold })}>
                  Not Encrypted
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
