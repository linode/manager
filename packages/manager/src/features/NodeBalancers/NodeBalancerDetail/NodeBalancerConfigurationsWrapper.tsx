import { useGrants, useNodeBalancerQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createLazyRoute, useParams } from '@tanstack/react-router';
import React from 'react';

import { NodeBalancerConfigurations } from './NodeBalancerConfigurations';
import { getConfigsWithNodes } from './requests';

import type { ConfigsWithNodes } from './requests';
import type { APIError } from '@linode/api-v4';

const NodeBalancerConfigurationsWrapper = () => {
  const queryClient = useQueryClient();

  const { id: nodeBalancerId } = useParams({
    from: '/nodebalancers/$id/configurations',
  });

  const { configId } = useParams({ strict: false });

  const { data: grants } = useGrants();
  const { data: nodeBalancer } = useNodeBalancerQuery(nodeBalancerId);

  const { data, isPending, error } = useQuery<ConfigsWithNodes, APIError[]>({
    queryKey: ['nodebalancers', nodeBalancerId, 'configs-with-nodes'],
    queryFn: () => getConfigsWithNodes(nodeBalancerId),
    gcTime: 0,
  });

  if (isPending) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <NodeBalancerConfigurations
      configId={configId}
      configs={data}
      grants={grants}
      nodeBalancerId={nodeBalancerId}
      nodeBalancerLabel={nodeBalancer?.label ?? ''}
      nodeBalancerRegion={nodeBalancer?.region ?? ''}
      queryClient={queryClient}
    />
  );
};

export const nodeBalancerConfigurationsLazyRoute = createLazyRoute(
  '/nodebalancers/$id/configurations'
)({
  component: NodeBalancerConfigurationsWrapper,
});
