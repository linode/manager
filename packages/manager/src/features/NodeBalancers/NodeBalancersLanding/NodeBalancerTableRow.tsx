import { NodeBalancerWithConfigs } from '@linode/api-v4/lib/nodebalancers';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import NodeBalancerActionMenu from './NodeBalancerActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
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
    color: theme.cmrTextColors.linkActiveLight,
  },
  link: {
    display: 'block',
    fontFamily: theme.font.bold,
    color: theme.cmrTextColors.linkActiveLight,
    lineHeight: '1.125rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  ipsWrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
  },
  actionCell: {
    // @todo: remove action cell duplication (this is from DomainTableRow_CMR)
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
    /*
      Explicitly stating this as the theme file is automatically adding padding to the last cell
      We can remove once we make the full switch to CMR styling
      */
    paddingRight: '0 !important',
  },
}));

interface Props {
  toggleDialog: (id: number, label: string) => void;
}

type CombinedProps = NodeBalancerWithConfigs & Props;

const NodeBalancerTableRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { id, label, configs, transfer, ipv4, region, toggleDialog } = props;

  const nodesUp = configs.reduce(
    (result, config) => config.nodes_status.up + result,
    0
  );
  const nodesDown = configs.reduce(
    (result, config) => config.nodes_status.down + result,
    0
  );

  return (
    <TableRow
      key={id}
      data-qa-nodebalancer-cell={label}
      className="fade-in-table"
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

      <Hidden xsDown>
        <TableCell data-qa-node-status className={classes.statusWrapper}>
          <span>{nodesUp} up</span> - <span>{nodesDown} down</span>
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell data-qa-transferred>
          {convertMegabytesTo(transfer.total)}
        </TableCell>

        <TableCell data-qa-ports>
          {configs.length === 0 && 'None'}
          {configs.map(({ port, id: configId }, i) => (
            <React.Fragment key={id}>
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
          <IPAddress ips={[ipv4]} copyRight showMore />
        </div>
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-region>
          <RegionIndicator region={region} />
        </TableCell>
      </Hidden>

      <TableCell className={classes.actionCell}>
        <NodeBalancerActionMenu
          nodeBalancerId={id}
          toggleDialog={toggleDialog}
          label={label}
        />
      </TableCell>
    </TableRow>
  );
};

export default NodeBalancerTableRow;
