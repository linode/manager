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

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    maxWidth: '50%',
    border: `1px solid ${theme.palette.divider}`,
    borderBottom: 0
  }
});

interface Props {
  pools: ExtendedPoolNode[];
  types: ExtendedType[];
  handleDelete: (poolIdx: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolDisplayTable: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes, handleDelete, pools, types } = props;
  return (
    <Table tableClass={classes.root} spacingTop={16}>
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
                idx={idx}
                pool={thisPool}
                type={thisPoolType}
                handleDelete={() => handleDelete(idx)}
                updateFor={[thisPool, thisPoolType, classes]}
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
  styled,
  React.memo
);

export default enhanced(NodePoolDisplayTable);
