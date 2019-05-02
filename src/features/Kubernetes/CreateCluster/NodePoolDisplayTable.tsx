import * as React from 'react';

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

import { PoolNode } from './CreateCluster';
import NodePoolRow from './NodePoolRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    maxWidth: '50%'
  }
});

interface Props {
  pools: PoolNode[];
  handleDelete: (poolIdx: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolDisplayTable: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes, handleDelete, pools } = props;
  return (
    <Table tableClass={classes.root} spacingTop={16}>
      <TableHead>
        <TableRow>
          <TableCell data-qa-table-header="Plan">Plan</TableCell>
          <TableCell data-qa-table-header="Node Count">Node Count</TableCell>
          <TableCell data-qa-table-header="Pricing">Pricing</TableCell>
          <TableCell /> {/* Blank cell for delete button */}
        </TableRow>
      </TableHead>
      <TableBody>
        {pools.map((thisPool, idx) => (
          <NodePoolRow
            key={`node-pool-row-${idx}`}
            idx={idx}
            pool={thisPool}
            handleDelete={() => handleDelete(idx)}
          />
        ))}
      </TableBody>
    </Table>
  );
};

const styled = withStyles(styles);

export default styled(NodePoolDisplayTable);
