import { Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

import { InterfaceGeneration } from './InterfaceGeneration';
import { NetworkConnection } from './NetworkConnection';
import { useWatch } from 'react-hook-form';
import { LinodeCreateFormValues } from '../utilities';
import { Firewall } from '../Firewall';

/**
 * Linode Create UI for new Linode Interfaces
 */
export const Networking = () => {
  const interfaceGeneration = useWatch<
    LinodeCreateFormValues,
    'interface_generation'
  >({ name: 'interface_generation' });

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
        {interfaceGeneration === 'legacy_config' ? <Firewall /> : <p>TODO</p>}
      </Stack>
    </Paper>
  );
};
