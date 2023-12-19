import React from 'react';

import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerConfigurationsEndpointsHealth } from 'src/queries/aglb/configurations';
import { pluralize } from 'src/utilities/pluralize';

import { EndpointHealth } from '../EndpointHealth';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Configuration;
  loadbalancerId: number;
}

export const ConfigurationAccordionHeader = (props: Props) => {
  const { configuration, loadbalancerId } = props;
  const { data } = useLoadBalancerConfigurationsEndpointsHealth(loadbalancerId);

  const health = data?.configurations.find((c) => c.id === configuration.id);

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
      <Stack direction="row" spacing={2}>
        <Stack direction="row" spacing={1}>
          <Typography>Endpoints:</Typography>
          {health && (
            <EndpointHealth
              down={health.total_endpoints - health.healthy_endpoints}
              up={health.healthy_endpoints}
            />
          )}
        </Stack>
        <Typography>ID: {configuration.id}</Typography>
      </Stack>
    </Stack>
  );
};
