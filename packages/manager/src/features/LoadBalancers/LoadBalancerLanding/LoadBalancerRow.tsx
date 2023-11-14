import { Loadbalancer } from '@linode/api-v4';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { Skeleton } from 'src/components/Skeleton';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerConfigurationsQuery } from 'src/queries/aglb/configurations';

import { LoadBalancerActionsMenu } from './LoadBalancerActionsMenu';
import { RegionsCell } from './RegionsCell';

export interface LoadBalancerHandlers {
  onDelete: () => void;
}

interface Props {
  handlers: LoadBalancerHandlers;
  loadBalancer: Loadbalancer;
}

export const LoadBalancerRow = ({ handlers, loadBalancer }: Props) => {
  const { id, label, regions } = loadBalancer;

  return (
    <TableRow
      ariaLabel={`Load Balancer ${label}`}
      key={`loadbalancer-row-${id}`}
    >
      <TableCell>
        <Link to={`/loadbalancers/${id}`}>{label}</Link>
      </TableCell>
      <TableCell>
        {/* TODO: AGLB - These are stub values for now*/}
        <Stack alignItems="center" direction="row">
          <StatusIcon status="active" />
          <Typography>4 up</Typography>
          <Typography mx={1}>&mdash;</Typography>
          <StatusIcon status="error" />
          <Typography>6 down</Typography>
        </Stack>
      </TableCell>
      <Hidden smDown>
        <TableCell>
          <Ports loadbalancerId={id} />
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>
          {regions.map((region) => (
            <RegionsCell key={region} region={region} />
          ))}
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <LoadBalancerActionsMenu
          handlers={handlers}
          loadbalancer={loadBalancer}
        />
      </TableCell>
    </TableRow>
  );
};

interface PortProps {
  loadbalancerId: number;
}

const Ports = ({ loadbalancerId }: PortProps) => {
  const {
    data: configurations,
    error,
    isLoading,
  } = useLoadBalancerConfigurationsQuery(loadbalancerId);

  const ports = configurations?.data.map((config) => config.port);

  if (isLoading) {
    return <Skeleton />;
  }

  if (error) {
    return <Typography>Unknown</Typography>;
  }

  // @TODO handle tons of ports
  return <Typography>{ports!.join(', ')}</Typography>;
};
