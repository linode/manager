import { useAllNodeBalancerConfigsQuery } from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

export const getStatusColorMap = (
  isLoading: boolean,
  up?: number,
  down?: number
) => {
  if (isLoading) {
    return 'inactive';
  }

  if (down === 0 && up === 0) {
    return 'inactive';
  }

  if (down === 0) {
    return 'active';
  }

  if (up === 0) {
    return 'error';
  }

  return 'other';
};

export const NodeBalancerDetailHeader = () => {
  const { id } = useParams({
    from: '/nodebalancers/$id/summary',
  });
  const { data: configs, isLoading } = useAllNodeBalancerConfigsQuery(
    Number(id)
  );
  const down = configs?.reduce((acc: number, config) => {
    return acc + config.nodes_status.down;
  }, 0); // add the downtime for each config together

  const up = configs?.reduce((acc: number, config) => {
    return acc + config.nodes_status.up;
  }, 0); // add the uptime for each config together

  return (
    <EntityHeader>
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          padding: `${theme.spacingFunction(12)} ${theme.spacingFunction(24)}`,
        })}
      >
        <Typography sx={(theme) => ({ font: theme.font.bold })}>
          Backend Status
        </Typography>
        <StatusIcon
          pulse={isLoading}
          status={getStatusColorMap(isLoading, up, down)}
          sx={(theme) => ({ marginLeft: theme.spacingFunction(8) })}
        />
        <Typography sx={(theme) => ({ marginLeft: theme.spacingFunction(4) })}>
          {isLoading ? 'Loading' : `${up} Up - ${down} Down`}
        </Typography>
      </Box>
    </EntityHeader>
  );
};
