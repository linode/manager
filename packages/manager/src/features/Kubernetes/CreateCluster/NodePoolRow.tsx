import * as classNames from 'classnames';
import produce from 'immer';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { displayPrice } from 'src/components/DisplayPrice';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TextField from 'src/components/TextField';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { displayTypeForKubePoolNode } from 'src/features/linodes/presentation';
import useFlags from 'src/hooks/useFlags';
import { getErrorMap } from 'src/utilities/errorUtils';
import { PoolNodeWithPrice } from '.././types';

type ClassNames =
  | 'root'
  | 'link'
  | 'error'
  | 'toDelete'
  | 'regularCell'
  | 'toAdd'
  | 'disabled'
  | 'removeButton'
  | 'removeButtonWrapper'
  | 'editableCount'
  | 'priceTableCell';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    link: {
      color: `${theme.palette.primary.main} !important` as any
    },
    toDelete: {
      backgroundColor: 'rgba(207, 30, 30, 0.16)'
    },
    toAdd: {
      backgroundColor: theme.bg.main
    },
    disabled: {
      color: 'gray !important'
    },
    removeButton: {
      float: 'right'
    },
    removeButtonWrapper: {
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'flex-end !important' as 'flex-end',
        padding: 0,
        paddingRight: '0 !important' as '0',
        width: '10%'
      }
    },
    editableCount: {
      [theme.breakpoints.down('sm')]: {
        alignItems: 'flex-end'
      }
    },
    error: {
      border: `2px solid ${theme.color.red}`
    },
    priceTableCell: {
      // prevents position shift as price grows/shrinks
      minWidth: 130,
      width: '20%'
    },
    regularCell: {
      width: '25%'
    }
  });

interface Props {
  pool: PoolNodeWithPrice;
  type?: ExtendedType;
  editable: boolean;
  idx: number;
  deletePool?: (poolIdx: number) => void;
  updatePool?: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export interface NodeStatus {
  ready: number;
  not_ready: number;
}

export const getNodeStatus = (linodes: Linode.PoolNodeResponse[]) => {
  return produce<NodeStatus, NodeStatus>({ ready: 0, not_ready: 0 }, draft => {
    linodes.forEach(thisLinode => {
      draft[thisLinode.status]++;
    });
  });
};

export const getStatusString = (
  count: number,
  linodes?: Linode.PoolNodeResponse[]
) => {
  if (!count) {
    return '';
  }
  if (!linodes || linodes.length === 0) {
    return `${count} (0 up, ${count} down)`;
  }
  const status = getNodeStatus(linodes);
  return `${count} (${status.ready} up, ${status.not_ready} down)`;
};

export const NodePoolRow: React.FunctionComponent<CombinedProps> = props => {
  const { classes, editable, pool, idx, deletePool, type, updatePool } = props;
  const flags = useFlags();

  if (editable && !(updatePool && deletePool)) {
    // Checking for conditionally required props
    throw new Error(
      'handleDelete and updatePool must be provided to an editable NodePoolRow.'
    );
  }

  const handleUpdate = updatePool || (() => null);
  const handleDelete = deletePool || (() => null);

  const typeLabel = type
    ? displayTypeForKubePoolNode(type.class, type.memory, type.vcpus)
    : 'Unknown type'; // This should never happen, but better not to crash if it does.

  const statusClass = pool.queuedForAddition
    ? classes.toAdd
    : pool.queuedForDeletion
    ? classes.toDelete
    : ''; // Normal node

  const errorMap = getErrorMap(['count'], pool._error || []);

  return (
    <TableRow
      data-testid={'node-pool-table-row'}
      className={classNames({
        [statusClass]: true,
        [classes.error]: Boolean(errorMap.none)
      })}
    >
      <TableCell parentColumn="Plan" className={classes.regularCell}>
        <Typography>{typeLabel}</Typography>
      </TableCell>
      <TableCell parentColumn="Node Count" className={classes.regularCell}>
        {editable ? (
          <TextField
            small
            tiny
            min={0}
            max={100}
            errorText={errorMap.count}
            type="number"
            className={classes.editableCount}
            value={pool.count}
            onChange={e =>
              handleUpdate(idx, {
                ...pool,
                count: +e.target.value
              })
            }
          />
        ) : (
          <Typography>{getStatusString(pool.count, pool.linodes)}</Typography>
        )}
      </TableCell>
      <TableCell parentColumn="Pricing" className={classes.priceTableCell}>
        <Typography>{`${displayPrice(pool.totalMonthlyPrice)}/mo`}</Typography>
      </TableCell>
      <TableCell className={classes.removeButtonWrapper}>
        {(!flags.lkeHideButtons || editable) && (
          <Button
            buttonType="remove"
            deleteText={pool.queuedForDeletion ? 'Undo Remove' : 'Remove'}
            data-testid={`delete-node-row-${idx}`}
            onClick={() => handleDelete(idx)}
            className={classNames({
              [classes.link]: true,
              [classes.disabled]: !editable,
              [classes.removeButton]: true
            })}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(
  styled,
  renderGuard
);

export default enhanced(NodePoolRow);
