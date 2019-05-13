import * as React from 'react';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { getTotalClusterMemoryAndCPU } from './../kubeUtils';
import ActionMenu from './ClusterActionMenu';

type ClassNames = 'root' | 'label' | 'clusterDescription';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  label: {
    width: '30%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  clusterDescription: {
    paddingTop: theme.spacing.unit / 2
  }
});

interface Props {
  cluster: Linode.KubernetesCluster;
  typesData: ExtendedType[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ClusterRow: React.FunctionComponent<CombinedProps> = props => {
  const { classes, cluster, typesData } = props;
  const { RAM, CPU } = getTotalClusterMemoryAndCPU(
    cluster.node_pools,
    typesData
  );
  return (
    <TableRow
      key={cluster.id}
      data-qa-cluster-cell={cluster.id}
      data-testid={'cluster-row'}
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
            {/* @todo add cluster description when available */}
            {/* <Typography className={classes.clusterDescription}>
              64 CPUs
            </Typography> */}
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
        {`${RAM / 1024}GB`}
      </TableCell>
      <TableCell parentColumn="Total CPUs" data-qa-cluster-cpu>
        {`${CPU} ${CPU === 1 ? 'CPU' : 'CPUs'}`}
      </TableCell>
      <TableCell>
        <ActionMenu clusterId={cluster.id} />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(ClusterRow);
