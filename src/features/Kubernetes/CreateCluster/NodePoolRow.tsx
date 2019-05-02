import Close from '@material-ui/icons/Close';
import * as React from 'react';

import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { displayTypeForKubePoolNode } from 'src/features/linodes/presentation';

import { PoolNode } from './CreateCluster';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  pool: PoolNode;
  type?: ExtendedType;
  idx: number;
  handleDelete: (poolIdx: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolRow: React.FunctionComponent<CombinedProps> = props => {
  const { pool, idx, handleDelete, type } = props;
  const typeLabel = type
    ? displayTypeForKubePoolNode(type.class, type.memory, type.vcpus)
    : 'Unknown type'; // This should never happen, but better not to crash if it does.
  return (
    <TableRow>
      <TableCell>{typeLabel}</TableCell>
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
