import { Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

import { InterfaceGeneration } from './InterfaceGeneration';
import { NetworkConnection } from './NetworkConnection';

/**
 * Linode Create UI for new Linode Interfaces
 */
export const Networking = () => {
  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Networking</Typography>
        <Typography>
          Select the type of network interface and the connection for this
          Linode instance. <Link to="#">Learn more</Link>.
        </Typography>
        <NetworkConnection />
        <InterfaceGeneration />
      </Stack>
    </Paper>
  );
};
