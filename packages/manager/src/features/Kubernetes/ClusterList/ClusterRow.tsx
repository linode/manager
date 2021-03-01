import * as React from 'react';
import { Link } from 'react-router-dom';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { ExtendedCluster, PoolNodeWithPrice } from './../types';
import ActionMenu from './ClusterActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    color: theme.cmrTextColors.linkActiveLight,
    fontFamily: theme.font.bold,
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
  actionCell: {
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
  chip: {
    fontSize: '0.65rem',
    backgroundColor: theme.cmrBGColors.bgApp,
    textTransform: 'uppercase',
    minHeight: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    marginTop: 0,
    marginBottom: 0,
    marginLeft: theme.spacing(2),
    borderRadius: '1px',
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

type CombinedProps = Props;

export const ClusterRow: React.FunctionComponent<CombinedProps> = (props) => {
  const classes = useStyles();

  const { cluster, hasUpgrade, openDeleteDialog, openUpgradeDialog } = props;

  return (
    <TableRow
      key={cluster.id}
      data-qa-cluster-cell={cluster.id}
      data-testid={'cluster-row'}
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
                className={classes.chip}
                onClick={openUpgradeDialog}
                label="UPGRADE"
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
      <TableCell className={classes.actionCell}>
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
