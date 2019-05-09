import Close from '@material-ui/icons/Close';
import * as React from 'react';

import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { displayPrice } from 'src/components/DisplayPrice';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { displayTypeForKubePoolNode } from 'src/features/linodes/presentation';

import { PoolNode } from '.././types';

type ClassNames = 'root' | 'link';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  link: {
    textDecoration: 'none',
    color: 'inherit'
  }
});

interface Props {
  pool: PoolNode;
  type?: ExtendedType;
  idx: number;
  handleDelete: (poolIdx: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolRow: React.FunctionComponent<CombinedProps> = props => {
  const { classes, pool, idx, handleDelete, type } = props;
  const typeLabel = type
    ? displayTypeForKubePoolNode(type.class, type.memory, type.vcpus)
    : 'Unknown type'; // This should never happen, but better not to crash if it does.

  return (
    <TableRow data-testid={'node-pool-table-row'}>
      <TableCell parentColumn="Plan">
        <Typography>{typeLabel}</Typography>
      </TableCell>
      <TableCell parentColumn="Node Count">
        <Typography>{pool.count}</Typography>
      </TableCell>
      <TableCell parentColumn="Pricing">
        <Typography>{`${displayPrice(pool.totalMonthlyPrice)}/mo`}</Typography>
      </TableCell>
      <TableCell>
        <a className={classes.link}>
          <Close
            onClick={() => handleDelete(idx)}
            data-testid={`delete-node-row-${idx}`}
          />
        </a>
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(NodePoolRow);
