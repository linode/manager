import { Loadbalancer } from '@linode/api-v4';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

import { LoadBalancerActionsMenu } from './LoadBalancerActionsMenu';
import { Ports } from './Ports';
import { RegionsCell } from './RegionsCell';

export interface LoadBalancerHandlers {
  onDelete: () => void;
}

interface Props {
  handlers: LoadBalancerHandlers;
  loadBalancer: Loadbalancer;
}

export const LoadBalancerRow = ({ handlers, loadBalancer }: Props) => {
  const { hostname, id, label, regions } = loadBalancer;

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
      <Hidden smDown>
        <TableCell>{hostname}</TableCell>
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
