import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { PoolNodeWithPrice } from '.././types';
import NodePoolRow from './NodePoolRow';

type ClassNames = 'root' | 'small';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      border: `1px solid ${theme.palette.divider}`,
      borderBottom: 0,
      '& .data': {
        [theme.breakpoints.only('sm')]: {
          marginLeft: theme.spacing(1),
          textAlign: 'right'
        }
      }
    },
    small: {
      maxWidth: '50%'
    }
  });

interface Props {
  pools: PoolNodeWithPrice[];
  types: ExtendedType[];
  loading: boolean;
  handleDelete?: (poolIdx: number) => void;
  updatePool?: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  editable?: boolean;
  error?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolDisplayTable: React.FC<CombinedProps> = props => {
  const {
    classes,
    editable,
    error,
    handleDelete,
    loading,
    pools,
    types,
    updatePool
  } = props;

  if (error) {
    return <TableRowError colSpan={12} message={error} />;
  }

  if (loading) {
    return <TableRowLoading colSpan={12} />;
  }

  if (pools.length === 0) {
    return <TableRowEmptyState colSpan={12} />;
  }

  return (
    <>
      {pools.map((thisPool, idx) => {
        const thisPoolType = types.find(
          thisType => thisType.id === thisPool.type
        );
        return (
          <NodePoolRow
            key={`node-pool-row-${idx}`}
            editable={Boolean(editable)}
            idx={idx}
            pool={thisPool}
            type={thisPoolType}
            deletePool={handleDelete ? () => handleDelete(idx) : undefined}
            updatePool={updatePool}
            updateFor={[thisPool, thisPoolType, editable, classes, updatePool]}
          />
        );
      })}
    </>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(React.memo, styled);

export default enhanced(NodePoolDisplayTable);
