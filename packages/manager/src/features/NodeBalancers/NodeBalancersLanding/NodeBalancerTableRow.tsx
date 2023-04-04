import * as React from 'react';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'tss-react/mui';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { useAllNodeBalancerConfigsQuery } from 'src/queries/nodebalancers';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { NodeBalancerActionMenu } from './NodeBalancerActionMenu';
import { Theme } from '@mui/material/styles';
import Skeleton from 'src/components/Skeleton';

const useStyles = makeStyles()((theme: Theme) => ({
  portLink: {
    color: theme.textColors.linkActiveLight,
  },
  link: {
    display: 'block',
    color: theme.textColors.linkActiveLight,
    lineHeight: '1.125rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
}));

interface Props extends NodeBalancer {
  onDelete: () => void;
}

export const NodeBalancerTableRow = (props: Props) => {
  const { classes } = useStyles();
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
        <Link to={`/nodebalancers/${id}`} tabIndex={0} className={classes.link}>
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
              <Link
                to={`/nodebalancers/${id}/configurations/${configId}`}
                className={classes.portLink}
              >
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
