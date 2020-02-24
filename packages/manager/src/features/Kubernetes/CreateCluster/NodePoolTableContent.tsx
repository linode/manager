import * as React from 'react';
import { compose } from 'recompose';
import { useTheme } from 'src/components/core/styles';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { PoolNodeWithPrice } from '.././types';
import NodePoolRow from './NodePoolRow';

export interface Props {
  pools: PoolNodeWithPrice[];
  types: ExtendedType[];
  loading: boolean;
  handleDelete?: (poolIdx: number) => void;
  updatePool?: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  editable?: boolean;
  error?: string;
}

type CombinedProps = Props;

export const NodePoolDisplayTable: React.FC<CombinedProps> = props => {
  const {
    editable,
    error,
    handleDelete,
    loading,
    pools,
    types,
    updatePool
  } = props;

  // This component doesn't use the theme directly, but it needs to update when the theme changes
  // (see updateFor below).
  const theme = useTheme();

  if (error) {
    return <TableRowError colSpan={12} message={error} />;
  }

  if (loading) {
    return <TableRowLoading colSpan={12} />;
  }

  if (pools.length === 0) {
    return (
      <TableRowEmptyState
        colSpan={12}
        message="You haven't added any Node Pools yet."
      />
    );
  }

  return (
    <>
      {pools.map((thisPool, idx) => {
        const thisPoolType = types.find(
          thisType => thisType.id === thisPool.type
        );
        return (
          <NodePoolRow
            key={`node-pool-row-${thisPool.id}`}
            editable={Boolean(editable)}
            idx={idx}
            pool={thisPool}
            type={thisPoolType}
            deletePool={handleDelete ? () => handleDelete(idx) : undefined}
            updatePool={updatePool}
            updateFor={[thisPool, thisPoolType, editable, updatePool, theme]}
          />
        );
      })}
    </>
  );
};

const enhanced = compose<CombinedProps, Props>(React.memo);

export default enhanced(NodePoolDisplayTable);
