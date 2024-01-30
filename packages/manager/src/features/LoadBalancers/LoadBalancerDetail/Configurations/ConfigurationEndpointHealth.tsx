import React from 'react';

import { Skeleton } from 'src/components/Skeleton';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerConfigurationsEndpointsHealth } from 'src/queries/aglb/configurations';

import { EndpointHealth } from '../EndpointHealth';

interface Props {
  configurationId: number;
  loadBalancerId: number;
}

export const ConfigurationEndpointHealth = (props: Props) => {
  const { configurationId, loadBalancerId } = props;

  const {
    data,
    error,
    isLoading,
  } = useLoadBalancerConfigurationsEndpointsHealth(loadBalancerId);

  const health = data?.configurations.find((c) => c.id === configurationId);

  if (isLoading) {
    return <Skeleton sx={{ minWidth: '200px' }} />;
  }

  const renderEndpointHealthBody = () => {
    if (error) {
      return <Typography>{error[0].reason}</Typography>;
    }

    if (!health) {
      return <EndpointHealth down={0} up={0} />;
    }

    return (
      <EndpointHealth
        down={health.total_endpoints - health.healthy_endpoints}
        up={health.healthy_endpoints}
      />
    );
  };

  return (
    <Stack direction="row" spacing={1}>
      <Typography>Endpoints:</Typography>
      {renderEndpointHealthBody()}
    </Stack>
  );
};
