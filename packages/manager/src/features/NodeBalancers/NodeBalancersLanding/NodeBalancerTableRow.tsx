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

const useStyles = makeStyles()((theme: Theme) => ({
  // @todo: temporary measure that will cause scroll for the 'Name' and 'Backend Status'
  // column until we implement a hideOnTablet prop for EntityTables to prevent the
  // ActionCell from being misaligned
  labelWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  statusWrapper: {
    whiteSpace: 'nowrap',
  },
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
  ipsWrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    '& [data-qa-copy-ip] button > svg': {
      opacity: 0,
    },
  },
  row: {
    '&:hover': {
      '& [data-qa-copy-ip] button > svg': {
        opacity: 1,
      },
    },
    '& [data-qa-copy-ip] button:focus > svg': {
      opacity: 1,
    },
  },
}));

interface Props extends NodeBalancer {
  onDelete: (id: number) => void;
}

export const NodeBalancerTableRow = (props: Props) => {
  const { classes } = useStyles();
  const { id, label, transfer, ipv4, region, onDelete } = props;

  const { data: configs } = useAllNodeBalancerConfigsQuery(id);

  const nodesUp = configs?.reduce(
    (result, config) => config.nodes_status.up + result,
    0
  );
  const nodesDown = configs?.reduce(
    (result, config) => config.nodes_status.down + result,
    0
  );

  return (
    <TableRow
      key={id}
      data-qa-nodebalancer-cell={label}
      className={classes.row}
      ariaLabel={label}
    >
      <TableCell data-qa-nodebalancer-label>
        <div className={classes.labelWrapper}>
          <Link
            to={`/nodebalancers/${id}`}
            tabIndex={0}
            className={classes.link}
          >
            {label}
          </Link>
        </div>
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-node-status className={classes.statusWrapper}>
          <span>{nodesUp} up</span> - <span>{nodesDown} down</span>
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell data-qa-transferred>
          {convertMegabytesTo(transfer.total)}
        </TableCell>
        <TableCell data-qa-ports>
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
      <TableCell data-qa-nodebalancer-ips>
        <div className={classes.ipsWrapper}>
          <IPAddress ips={[ipv4]} showMore />
        </div>
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
