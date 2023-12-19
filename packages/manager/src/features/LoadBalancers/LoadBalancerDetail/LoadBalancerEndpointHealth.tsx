import React from 'react';

import { Skeleton } from 'src/components/Skeleton';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerEndpointHealthQuery } from 'src/queries/aglb/loadbalancers';

import { EndpointHealth } from './EndpointHealth';

interface Props {
  id: number;
}

export const LoadBalancerEndpontHeath = ({ id }: Props) => {
  const { data: health, error, isLoading } = useLoadBalancerEndpointHealthQuery(
    id
  );

  if (isLoading) {
    return <Skeleton />;
  }

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
