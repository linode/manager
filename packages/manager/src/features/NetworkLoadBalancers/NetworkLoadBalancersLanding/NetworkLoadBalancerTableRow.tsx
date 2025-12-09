import { Hidden } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { RegionIndicator } from 'src/features/Linodes/LinodesLanding/RegionIndicator';

import { PortsDisplay } from './PortsDisplay';

import type { NetworkLoadBalancer } from '@linode/api-v4/lib/netloadbalancers';

export const NetworkLoadBalancerTableRow = (props: NetworkLoadBalancer) => {
  const {
    id,
    address_v4,
    address_v6,
    label,
    region,
    status,
    listeners,
    lke_cluster,
  } = props;

  // Memoize port strings to avoid recalculation
  const portStrings = React.useMemo(() => {
    return listeners?.map((listener) => listener.port.toString()) ?? [];
  }, [listeners]);

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <TableRow
      data-qa-nlb={label}
      key={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TableCell noWrap>
        <Link
          accessibleAriaLabel={label}
          to={`/netloadbalancers/${id}/listeners`}
        >
          {label}
        </Link>
      </TableCell>
      <Hidden lgDown>
        <TableCell data-qa-status statusCell>
          <StatusIcon status={status === 'active' ? 'active' : 'inactive'} />
          {capitalize(status)}
        </TableCell>
      </Hidden>
      <Hidden data-qa-id lgDown>
        <TableCell>{id}</TableCell>
      </Hidden>
      <TableCell data-qa-ports>
        <PortsDisplay ports={portStrings} />
      </TableCell>
      <TableCell data-qa-ipv4>
        <IPAddress ips={[address_v4]} isHovered={isHovered} />
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-ipv6>
          {address_v6 ? (
            <IPAddress ips={[address_v6]} isHovered={isHovered} />
          ) : (
            'None'
          )}
        </TableCell>
      </Hidden>
      <TableCell data-qa-lke-cluster>
        {lke_cluster ? (
          <Link
            accessibleAriaLabel={lke_cluster.label}
            to={`/kubernetes/clusters/${lke_cluster.id}`}
          >
            {lke_cluster.label}
          </Link>
        ) : (
          'None'
        )}
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-region>
          <RegionIndicator region={region} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

export default NetworkLoadBalancerTableRow;
