import { Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';

import { Firewall } from './Firewall';
import { InterfaceGeneration } from './InterfaceGeneration';
import { NetworkConnection } from './NetworkConnection';

import type { LinodeCreateFormValues } from '../utilities';

export const Networking = () => {
  const { control } = useFormContext<LinodeCreateFormValues>();

  const interfaceGeneration = useWatch({
    control,
    name: 'interface_generation',
  });

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
        {interfaceGeneration === 'linode' ? <p>TODO</p> : <Firewall />}
      </Stack>
    </Paper>
  );
};
