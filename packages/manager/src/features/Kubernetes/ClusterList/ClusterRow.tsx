import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

import { ExtendedCluster, PoolNodeWithPrice } from './../types';
import ActionMenu from './ClusterActionMenu';

type ClassNames = 'root' | 'label' | 'clusterDescription' | 'clusterRow';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    label: {
      width: '30%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    clusterDescription: {
      paddingTop: theme.spacing(1) / 2
    },
    clusterRow: {
      '&:before': {
        display: 'none'
      }
    }
  });

interface Props {
  cluster: ExtendedCluster;
  openDeleteDialog: (
    clusterID: number,
    clusterLabel: string,
    clusterNodePools: PoolNodeWithPrice[]
  ) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ClusterRow: React.FunctionComponent<CombinedProps> = props => {
  const { classes, cluster, openDeleteDialog } = props;
  return (
    <TableRow
      key={cluster.id}
      data-qa-cluster-cell={cluster.id}
      data-testid={'cluster-row'}
      rowLink={`/kubernetes/clusters/${cluster.id}`}
      className={classes.clusterRow}
    >
      <TableCell
        parentColumn="Cluster Label"
        className={classes.label}
        data-qa-cluster-label
      >
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="kube" marginTop={1} />
          </Grid>
          <Grid item>
            <Typography variant="h3">{cluster.label}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Version" data-qa-cluster-version>
        {cluster.version}
      </TableCell>
      <TableCell parentColumn="Created" data-qa-cluster-date>
        <DateTimeDisplay value={cluster.created} humanizeCutoff="month" />
      </TableCell>
      <TableCell parentColumn="Region" data-qa-cluster-region>
        {cluster.region}
      </TableCell>
      <TableCell parentColumn="Total Memory" data-qa-cluster-memory>
        {`${cluster.totalMemory / 1024}GB`}
      </TableCell>
      <TableCell parentColumn="Total CPUs" data-qa-cluster-cpu>
        {`${cluster.totalCPU} ${cluster.totalCPU === 1 ? 'CPU' : 'CPUs'}`}
      </TableCell>
      <TableCell>
        <ActionMenu
          clusterId={cluster.id}
          openDialog={() =>
            openDeleteDialog(cluster.id, cluster.label, cluster.node_pools)
          }
        />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(ClusterRow);
