import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
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
  small?: boolean;
  editable?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolDisplayTable: React.FunctionComponent<
  CombinedProps
> = props => {
  const {
    classes,
    editable,
    handleDelete,
    loading,
    pools,
    small,
    types,
    updatePool
  } = props;

  return (
    <Table
      tableClass={classNames({
        [classes.root]: true,
        [classes.small]: small
      })}
      spacingTop={16}
    >
      <TableHead>
        <TableRow>
          <TableCell data-qa-table-header="Plan">Plan</TableCell>
          <TableCell data-qa-table-header="Node Count">Node Count</TableCell>
          <TableCell data-qa-table-header="Pricing">Pricing</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {loading ? (
          <TableRowLoading colSpan={12} />
        ) : pools.length === 0 ? (
          <TableRowEmptyState
            colSpan={12}
            message={"You haven't added any node pools yet."}
          />
        ) : (
          pools.map((thisPool, idx) => {
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
                updateFor={[
                  thisPool,
                  thisPoolType,
                  editable,
                  classes,
                  updatePool
                ]}
              />
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  React.memo,
  styled
);

export default enhanced(NodePoolDisplayTable);
