import * as React from 'react';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { useAllNodeBalancerConfigsQuery } from 'src/queries/nodebalancers';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { NodeBalancerActionMenu } from './NodeBalancerActionMenu';
import Skeleton from '@mui/material/Skeleton';

interface Props extends NodeBalancer {
  onDelete: () => void;
}

export const NodeBalancerTableRow = (props: Props) => {
  const { id, label, transfer, ipv4, region, onDelete } = props;

  const { data: configs } = useAllNodeBalancerConfigsQuery(id);

  const nodesUp =
    configs?.reduce((result, config) => config.nodes_status.up + result, 0) ??
    0;
  const nodesDown =
    configs?.reduce((result, config) => config.nodes_status.down + result, 0) ??
    0;

  return (
    <TableRow key={id} ariaLabel={label}>
      <TableCell>
        <Link to={`/nodebalancers/${id}`} tabIndex={0}>
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
          {configs?.map(({ port, id: configId }, i) => (
            <React.Fragment key={configId}>
              <Link to={`/nodebalancers/${id}/configurations/${configId}`}>
                {port}
              </Link>
              {i < configs.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
        </TableCell>
      </Hidden>
      <TableCell>
        <IPAddress ips={[ipv4]} showMore />
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-region>
          <RegionIndicator region={region} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <NodeBalancerActionMenu
          nodeBalancerId={id}
          toggleDialog={onDelete}
          label={label}
        />
      </TableCell>
    </TableRow>
  );
};
