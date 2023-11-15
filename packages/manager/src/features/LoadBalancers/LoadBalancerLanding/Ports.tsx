import React from 'react';

import { Skeleton } from 'src/components/Skeleton';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerConfigurationsQuery } from 'src/queries/aglb/configurations';

interface PortProps {
  loadbalancerId: number;
}

export const Ports = ({ loadbalancerId }: PortProps) => {
  const {
    data: configurations,
    error,
    isLoading,
  } = useLoadBalancerConfigurationsQuery(loadbalancerId);

  const ports = configurations?.data.map((config) => config.port);

  if (isLoading) {
    return <Skeleton sx={{ minWidth: '100px' }} />;
  }

  if (error || !ports) {
    return <Typography>Unknown</Typography>;
  }

  return <Typography>{ports.join(', ')}</Typography>;
};
