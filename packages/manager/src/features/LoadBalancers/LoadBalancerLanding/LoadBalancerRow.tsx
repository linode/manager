import { Loadbalancer } from '@linode/api-v4';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

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
