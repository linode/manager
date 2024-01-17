import React from 'react';

import { Skeleton } from 'src/components/Skeleton';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerServiceTargetsEndpointHealthQuery } from 'src/queries/aglb/serviceTargets';

import { EndpointHealth } from '../EndpointHealth';

interface Props {
  loadbalancerId: number;
  serviceTargetId: number;
}

export const ServiceTargetEndpontHeath = ({
  loadbalancerId,
  serviceTargetId,
}: Props) => {
  const {
    data,
    error,
    isLoading,
  } = useLoadBalancerServiceTargetsEndpointHealthQuery(loadbalancerId);

  const health = data?.service_targets.find((st) => st.id === serviceTargetId);

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
