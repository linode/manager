import { Loadbalancer } from '@linode/api-v4';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';

import { LoadBalancerEndpointHealth } from '../LoadBalancerDetail/LoadBalancerEndpointHealth';
import { LoadBalancerRegionsList } from '../LoadBalancerDetail/LoadBalancerRegions';
import { LoadBalancerActionsMenu } from './LoadBalancerActionsMenu';
import { Ports } from './Ports';

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
      <Hidden mdDown>
        <TableCell>
          <LoadBalancerEndpointHealth id={id} />
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>
          <Ports loadbalancerId={id} />
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>
          {hostname ? <IPAddress ips={[hostname]} /> : 'None'}
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>
          <LoadBalancerRegionsList
            hideFlags
            py={1}
            regionIds={regions}
            spacing={0.5}
          />
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
