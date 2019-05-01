import * as React from 'react';

import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

import { PoolNode } from './CreateCluster';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  pool: PoolNode;
  handleDelete: (poolIdx: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolRow: React.FunctionComponent<CombinedProps> = props => {
  return (
    <TableRow>
      <TableCell>a</TableCell>
      <TableCell>b</TableCell>
      <TableCell>c</TableCell>
      <TableCell>d</TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(NodePoolRow);
