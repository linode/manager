import { NodeBalancerWithConfigs } from '@linode/api-v4/lib/nodebalancers';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import NodeBalancerActionMenu from './NodeBalancerActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  labelWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    wordBreak: 'break-all'
  },
  link: {
    display: 'block',
    fontFamily: theme.font.bold,
    lineHeight: '1.125rem',
    textDecoration: 'underline'
  },
  ipsWrapper: {
    display: 'inline-flex',
    flexDirection: 'column'
  }
}));

interface Props {
  toggleDialog: (id: number, label: string) => void;
}

type CombinedProps = NodeBalancerWithConfigs & Props;

const NodeBalancerTableRow: React.FC<CombinedProps> = props => {
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
      <TableCell parentColumn="Name" data-qa-nodebalancer-label>
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
      <TableCell parentColumn="Backend Status" data-qa-node-status>
        <span>{nodesUp} up</span> - <span>{nodesDown} down</span>
      </TableCell>
      <TableCell parentColumn="Transferred" data-qa-transferred>
        {convertMegabytesTo(transfer.total)}
      </TableCell>
      <TableCell parentColumn="Ports" data-qa-ports>
        {configs.length === 0 && 'None'}
        {configs.map(({ port, id }, i) => (
          <React.Fragment key={id}>
            <Link
              to={`/nodebalancers/${id}/configurations/${id}`}
              className="secondaryLink"
            >
              {port}
            </Link>
            {i < configs.length - 1 ? ', ' : ''}
          </React.Fragment>
        ))}
      </TableCell>
      <TableCell parentColumn="IP Address" data-qa-nodebalancer-ips>
        <div className={classes.ipsWrapper}>
          <IPAddress ips={[ipv4]} copyRight showMore />
        </div>
      </TableCell>
      <TableCell parentColumn="Region" data-qa-region>
        <RegionIndicator region={region} />
      </TableCell>
      <TableCell>
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
