import { Loadbalancer } from '@linode/api-v4';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { Stack } from 'src/components/Stack';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';

import { LoadBalancerEndpontHeath } from '../LoadBalancerDetail/LoadBalancerEndpointHealth';
import { regions as alphaRegions } from '../LoadBalancerDetail/LoadBalancerRegions';
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
  const { hostname, id, label } = loadBalancer;

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
          <LoadBalancerEndpontHeath id={id} />
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
          <Stack py={1} spacing={0.5}>
            {alphaRegions.map(({ id, label }) => (
              <Typography key={id}>
                {label} ({id})
              </Typography>
            ))}
          </Stack>
          {/* Uncomment the code below to show the regions returned by the API */}
          {/* {regions.map((region) => (
            <RegionsCell key={region} region={region} />
          ))} */}
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
