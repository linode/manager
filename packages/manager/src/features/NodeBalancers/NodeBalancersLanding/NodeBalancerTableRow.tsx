import { useAllNodeBalancerConfigsQuery } from '@linode/queries';
import { convertMegabytesTo } from '@linode/utilities';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Skeleton } from 'src/components/Skeleton';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { RegionIndicator } from 'src/features/Linodes/LinodesLanding/RegionIndicator';

import { NodeBalancerActionMenu } from './NodeBalancerActionMenu';

import type { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';

export const NodeBalancerTableRow = (props: NodeBalancer) => {
  const { id, ipv4, label, region, transfer } = props;

  const { data: configs } = useAllNodeBalancerConfigsQuery(id);

  const nodesUp =
    configs?.reduce((result, config) => config.nodes_status.up + result, 0) ??
    0;
  const nodesDown =
    configs?.reduce((result, config) => config.nodes_status.down + result, 0) ??
    0;

  return (
    <TableRow key={id}>
      <TableCell>
        <Link
          accessibleAriaLabel={label}
          tabIndex={0}
          to={`/nodebalancers/${id}`}
        >
          {label}
        </Link>
      </TableCell>
      <Hidden smDown>
        <TableCell noWrap>
          <span>{nodesUp} up</span> - <span>{nodesDown} down</span>
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>{convertMegabytesTo(transfer.total)}</TableCell>
        <TableCell>
          {!configs ? <Skeleton /> : null}
          {configs?.length === 0 && 'None'}
          {configs?.map(({ id: configId, port }, i) => (
            <React.Fragment key={configId}>
              <Link
                accessibleAriaLabel={`NodeBalancer Port ${port}`}
                to={`/nodebalancers/${id}/configurations/${configId}`}
              >
                {port}
              </Link>
              {i < configs.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
        </TableCell>
      </Hidden>
      <TableCell>
        <IPAddress ips={[ipv4]} isHovered={true} showMore />
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-region>
          <RegionIndicator region={region} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <NodeBalancerActionMenu nodeBalancerId={id} />
      </TableCell>
    </TableRow>
  );
};
