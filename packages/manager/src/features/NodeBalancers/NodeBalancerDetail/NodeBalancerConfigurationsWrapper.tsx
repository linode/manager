import { useGrants, useNodeBalancerQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { NodeBalancerConfigurations } from './NodeBalancerConfigurations';
import { getConfigsWithNodes } from './requests';

import type { ConfigsWithNodes } from './requests';
import type { APIError } from '@linode/api-v4';

export const NodeBalancerConfigurationsWrapper = () => {
  const queryClient = useQueryClient();

  const { id: nodeBalancerId } = useParams({
    from: '/nodebalancers/$id/configurations',
  });

  const { configId } = useParams({ strict: false });

  const { data: grants } = useGrants();
  const { data: nodeBalancer } = useNodeBalancerQuery(+nodeBalancerId);

  const { data, isPending, error } = useQuery<ConfigsWithNodes, APIError[]>({
    queryKey: ['nodebalancers', nodeBalancerId, 'configs-with-nodes'],
    queryFn: () => getConfigsWithNodes(+nodeBalancerId),
    /**
     * Don't ever cache this query to match old behavior. When we rewrite NodeBalancerConfigurations we will change this.
     */
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
      configId={configId ? +configId : undefined}
      configs={data}
      grants={grants}
      nodeBalancerId={+nodeBalancerId}
      nodeBalancerLabel={nodeBalancer?.label ?? ''}
      nodeBalancerRegion={nodeBalancer?.region ?? ''}
      queryClient={queryClient}
    />
  );
};
