import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';

import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ExtendedPoolNode } from '.././types';
import NodePoolRow from './NodePoolRow';

type ClassNames = 'root' | 'small';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    border: `1px solid ${theme.palette.divider}`,
    borderBottom: 0
  },
  small: {
    maxWidth: '50%'
  }
});

interface Props {
  pools: ExtendedPoolNode[];
  types: ExtendedType[];
  handleDelete?: (poolIdx: number) => void;
  updatePool?: (poolIdx: number, updatedPool: ExtendedPoolNode) => void;
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
        {pools.length === 0 ? (
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
