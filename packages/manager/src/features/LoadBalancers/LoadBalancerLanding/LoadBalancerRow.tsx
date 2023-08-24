import { Loadbalancer } from '@linode/api-v4';
import Stack from '@mui/material/Stack';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
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
  loadBalancer: Loadbalancer;
  handlers: LoadBalancerHandlers;
}

export const LoadBalancerRow = ({ loadBalancer, handlers }: Props) => {
  const { id, label, regions } = loadBalancer;
  const { data: configurations } = useLoadBalancerConfigurationsQuery(id);
  const ports = configurations?.data.map((config) => config.port);

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
        <TableCell>{ports?.join(', ')}</TableCell>
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
