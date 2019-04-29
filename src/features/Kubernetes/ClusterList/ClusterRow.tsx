import * as React from 'react';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';

type ClassNames = 'root' | 'label';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  label: {
    width: '30%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
});

interface Props {
  cluster: Linode.KubernetesCluster;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ClusterRow: React.FunctionComponent<CombinedProps> = props => {
  const { classes, cluster } = props;
  return (
    <TableRow key={cluster.id} data-qa-cluster-cell={cluster.id}>
      <TableCell
        parentColumn="Cluster Label"
        className={classes.label}
        data-qa-cluster-label
      >
        {cluster.label}
      </TableCell>
      <TableCell parentColumn="Version" data-qa-cluster-date>
        {cluster.version}
      </TableCell>
      <TableCell parentColumn="Created" data-qa-cluster-date>
        <DateTimeDisplay value={cluster.created} humanizeCutoff="month" />
      </TableCell>
      <TableCell parentColumn="Region" data-qa-cluster-size>
        {cluster.region}
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(ClusterRow);
