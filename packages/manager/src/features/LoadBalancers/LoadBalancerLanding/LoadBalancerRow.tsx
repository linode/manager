import { Loadbalancer } from '@linode/api-v4/lib/AGLB/types';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { LoadBalancerActionsMenu } from './LoadBalancerActionsMenu';
import { RegionsCell } from './RegionsCell';

interface Props {
  loadBalancer: Loadbalancer;
}

export const LoadBalancerRow = ({ loadBalancer }: Props) => {
  const { id, label, regions } = loadBalancer;

  return (
    <TableRow
      ariaLabel={`Load Balancer ${label}`}
      data-qa-loadbalancers-id={id}
      key={`loadbalancer-row-${id}`}
    >
      <TableCell>
        <Link to={`/loadbalacner/${id}`}>{label}</Link>
      </TableCell>
      <Hidden mdDown>
        <TableCell>N/A</TableCell>
      </Hidden>
      <TableCell>port</TableCell>
      <TableCell>
        {regions.map((region) => (
          <RegionsCell key={region} region={region} />
        ))}
      </TableCell>
      <TableCell actionCell>
        <LoadBalancerActionsMenu loadBalancerId={id} />
      </TableCell>
    </TableRow>
  );
};
