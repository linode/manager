import Close from '@material-ui/icons/Close';
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
  idx: number;
  handleDelete: (poolIdx: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolRow: React.FunctionComponent<CombinedProps> = props => {
  const { pool, idx, handleDelete } = props;
  return (
    <TableRow>
      <TableCell>{pool.type}</TableCell>
      <TableCell>{pool.nodeCount}</TableCell>
      <TableCell>$3</TableCell>
      <TableCell>
        <Close onClick={() => handleDelete(idx)} />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(NodePoolRow);
