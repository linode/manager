import * as React from 'react';
import { Link } from 'react-router-dom';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { dcDisplayNames } from 'src/constants';
import { ExtendedCluster, PoolNodeWithPrice } from './../types';
import ActionMenu from './ClusterActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    color: theme.textColors.linkActiveLight,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  clusterRow: {
    '&:before': {
      display: 'none',
    },
  },
  version: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
}));

export interface Props {
  cluster: ExtendedCluster;
  hasUpgrade: boolean;
  openDeleteDialog: (
    clusterID: number,
    clusterLabel: string,
    clusterNodePools: PoolNodeWithPrice[]
  ) => void;
  openUpgradeDialog: () => void;
}

export const ClusterRow = (props: Props) => {
  const classes = useStyles();

  const { cluster, hasUpgrade, openDeleteDialog, openUpgradeDialog } = props;

  return (
    <TableRow
      key={cluster.id}
      data-qa-cluster-cell={cluster.id}
      data-testid="cluster-row"
      className={classes.clusterRow}
      ariaLabel={`Cluster ${cluster.label}`}
    >
      <TableCell data-qa-cluster-label>
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
        <TableCell data-qa-cluster-version>
          <div className={classes.version}>
            {cluster.k8s_version}
            {hasUpgrade ? (
              <Chip
                onClick={openUpgradeDialog}
                label="UPGRADE"
                size="small"
                clickable
                inTable
              />
            ) : null}
          </div>
        </TableCell>
      </Hidden>

      <Hidden smDown>
        <TableCell data-qa-cluster-date>
          <DateTimeDisplay value={cluster.created} />
        </TableCell>
      </Hidden>
      <TableCell data-qa-cluster-region>
        {dcDisplayNames[cluster.region] ?? cluster.region}
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-cluster-memory>
          {`${cluster.totalMemory / 1024} GB`}
        </TableCell>
      </Hidden>
      <Hidden xsDown>
        <TableCell data-qa-cluster-cpu>
          {`${cluster.totalCPU} ${cluster.totalCPU === 1 ? 'CPU' : 'CPUs'}`}
        </TableCell>
      </Hidden>
      <TableCell actionCell>
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

export default ClusterRow;
