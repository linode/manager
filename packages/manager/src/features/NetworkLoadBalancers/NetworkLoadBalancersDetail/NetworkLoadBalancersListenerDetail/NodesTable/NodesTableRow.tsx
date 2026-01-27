import { Hidden } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';

import type { NetworkLoadBalancerNode } from '@linode/api-v4/lib/netloadbalancers';

export const NodesTableRow = (props: NetworkLoadBalancerNode) => {
  const { id, label, linode_id, address_v6, updated, created } = props;

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <TableRow
      data-testid={`nlb-node-row-${id}`}
      key={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TableCell>{label}</TableCell>
      <TableCell>{id}</TableCell>
      <TableCell>
        <Link
          accessibleAriaLabel={linode_id.toString()}
          to={`/linodes/${linode_id}`}
        >
          {linode_id}
        </Link>
      </TableCell>
      <TableCell>
        {address_v6 ? (
          <IPAddress ips={[address_v6]} isHovered={isHovered} />
        ) : (
          'None'
        )}
      </TableCell>
      <Hidden mdDown>
        <TableCell>
          <DateTimeDisplay value={updated} />
        </TableCell>
        <TableCell>
          <DateTimeDisplay value={created} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};
