import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import { Link } from 'react-router-dom';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';

import { ExtendedCluster, PoolNodeWithPrice } from './../types';
import ActionMenu from './ClusterActionMenu_CMR';
import Hidden from 'src/components/core/Hidden';

type ClassNames =
  | 'root'
  | 'label'
  | 'clusterDescription'
  | 'clusterRow'
  | 'labelStatusWrapper'
  | 'link';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    label: {},
    link: {
      display: 'block',
      fontFamily: theme.font.bold,
      fontSize: '.875rem',
      lineHeight: '1.125rem',
      textDecoration: 'underline',
      color: theme.cmrTextColors.linkActiveLight
    },
    labelStatusWrapper: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',
      whiteSpace: 'nowrap'
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
      className={classes.clusterRow}
      ariaLabel={`Cluster ${cluster.label}`}
    >
      <TableCell className={classes.label} data-qa-cluster-label>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <div className={classes.labelStatusWrapper}>
              <Link
                className={classes.link}
                to={`/kubernetes/clusters/${cluster.id}/summary`}
                tabIndex={0}
              >
                {cluster.label}
              </Link>
            </div>
          </Grid>
        </Grid>
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-cluster-version>{cluster.k8s_version}</TableCell>
      </Hidden>

      <Hidden smDown>
        <TableCell data-qa-cluster-date>
          <DateTimeDisplay value={cluster.created} humanizeCutoff="month" />
        </TableCell>
      </Hidden>
      <TableCell data-qa-cluster-region>{cluster.region}</TableCell>
      <Hidden xsDown>
        <TableCell data-qa-cluster-memory>
          {`${cluster.totalMemory / 1024}GB`}
        </TableCell>
      </Hidden>
      <Hidden xsDown>
        <TableCell data-qa-cluster-cpu>
          {`${cluster.totalCPU} ${cluster.totalCPU === 1 ? 'CPU' : 'CPUs'}`}
        </TableCell>
      </Hidden>
      <TableCell>
        <ActionMenu
          clusterId={cluster.id}
          clusterLabel={cluster.label}
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
