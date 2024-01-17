import React from 'react';

import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { pluralize } from 'src/utilities/pluralize';

import { ConfigurationEndpointHealth } from './ConfigurationEndpointHealth';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Configuration;
  loadbalancerId: number;
}

export const ConfigurationAccordionHeader = (props: Props) => {
  const { configuration, loadbalancerId } = props;

  return (
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="wrap"
      gap={1}
      justifyContent="space-between"
      pr={2}
    >
      <Stack alignItems="center" direction="row" spacing={1}>
        <Typography variant="h3">{configuration.label}</Typography>
        <Typography>&mdash;</Typography>
        <Typography fontSize="1rem">
          Port {configuration.port} -{' '}
          {pluralize('Route', 'Routes', configuration.routes.length)}
        </Typography>
      </Stack>
      <Stack alignItems="center" direction="row" spacing={2}>
        <ConfigurationEndpointHealth
          configurationId={configuration.id}
          loadBalancerId={loadbalancerId}
        />
        <Typography>ID: {configuration.id}</Typography>
      </Stack>
    </Stack>
  );
};
