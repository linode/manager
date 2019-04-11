import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TagsCell from 'src/components/TagsCell';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { convertMegabytesTo } from 'src/utilities/convertMegabytesTo';
import NodeBalancerActionMenu from './NodeBalancerActionMenu';

type ClassNames = 'ip' | 'tagWrapper' | 'ipsWrapper' | 'icon';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  ip: {
    width: '30%',
    minWidth: 200
  },
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
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
});

interface Props {
  data: Linode.NodeBalancerWithConfigs[];
  toggleDialog: (id: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NodeBalancersLandingTableRows: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, data, toggleDialog } = props;

  return (
    <>
      {data.map(nodeBalancer => {
        const configs = nodeBalancer.configs || [];
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
            key={nodeBalancer.id}
            data-qa-nodebalancer-cell={nodeBalancer.label}
            rowLink={`/nodebalancers/${nodeBalancer.id}`}
            className="fade-in-table"
            aria-label={nodeBalancer.label}
          >
            <TableCell parentColumn="Name" data-qa-nodebalancer-label>
              <Grid container wrap="nowrap" alignItems="center">
                <Grid item className="py0">
                  <EntityIcon variant="nodebalancer" marginTop={1} />
                </Grid>
                <Grid item>
                  <Typography variant="h3">{nodeBalancer.label}</Typography>
                </Grid>
              </Grid>
            </TableCell>
            <TagsCell tags={nodeBalancer.tags} />
            <TableCell parentColumn="Node Status" data-qa-node-status>
              <span>{nodesUp} up</span> <br />
              <span>{nodesDown} down</span>
            </TableCell>
            <TableCell parentColumn="Transferred" data-qa-transferred>
              {convertMegabytesTo(nodeBalancer.transfer.total)}
            </TableCell>
            <TableCell parentColumn="Ports" data-qa-ports>
              {configs.length === 0 && 'None'}
              {configs.map(({ port, id }, i) => (
                <React.Fragment key={id}>
                  <Link
                    to={`/nodebalancers/${
                      nodeBalancer.id
                    }/configurations/${id}`}
                    className="secondaryLink"
                  >
                    {port}
                  </Link>
                  {i < configs.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </TableCell>
            <TableCell parentColumn="IP Addresses" data-qa-nodebalancer-ips>
              <div className={classes.ipsWrapper}>
                <IPAddress ips={[nodeBalancer.ipv4]} copyRight showMore />
                {nodeBalancer.ipv6 && (
                  <IPAddress ips={[nodeBalancer.ipv6]} copyRight showMore />
                )}
              </div>
            </TableCell>
            <TableCell parentColumn="Region" data-qa-region>
              <RegionIndicator region={nodeBalancer.region} />
            </TableCell>
            <TableCell>
              <NodeBalancerActionMenu
                nodeBalancerId={nodeBalancer.id}
                toggleDialog={toggleDialog}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

const styled = withStyles(styles);

export default styled(NodeBalancersLandingTableRows);
