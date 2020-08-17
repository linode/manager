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
  tagWrapper: {
    marginTop: theme.spacing(1) / 2,
    '& [class*="MuiChip"]': {
      cursor: 'pointer'
    }
  },
  ipsWrapper: {
    display: 'inline-flex',
    flexDirection: 'column'
  },
  icon: {
    position: 'relative',
    top: 3,
    width: 40,
    height: 40,
    '& .circle': {
      fill: theme.bg.offWhiteDT
    },
    '& .outerCircle': {
      stroke: theme.bg.main
    }
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
      rowLink={`/nodebalancers/${id}`}
      className="fade-in-table"
      ariaLabel={label}
    >
      <TableCell parentColumn="Name" data-qa-nodebalancer-label>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="nodebalancer" marginTop={1} />
          </Grid>
          <Grid item>
            <Link to={`/nodebalancers/${id}`} tabIndex={0}>
              <Typography variant="h3">{label}</Typography>
            </Link>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Backend Status" data-qa-node-status>
        <span>{nodesUp} up</span> - <span>{nodesDown} down</span>
      </TableCell>
      <TableCell parentColumn="Transferred" data-qa-transferred>
        {convertMegabytesTo(transfer.total)}
      </TableCell>
      <TableCell parentColumn="Ports" data-qa-ports>
        {configs.length === 0 && 'None'}
        {configs.map(({ port, id: configId }, i) => (
          <React.Fragment key={id}>
            <Link
              to={`/nodebalancers/${id}/configurations/${configId}`}
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
