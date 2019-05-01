import * as React from 'react';

import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

import SelectPlanPanel, { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { PoolNode } from './CreateCluster';
import NodePoolDisplayTable from './NodePoolDisplayTable';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2
  },
  title: {
    marginBottom: theme.spacing.unit,
  }
});

interface Props {
  pools: PoolNode[];
  types: ExtendedType[];
  selectedType?: string;
  nodeCount: number;
  addNodePool: (pool: PoolNode) => void;
  deleteNodePool: (poolIdx: number) => void;
  handleTypeSelect: (newType: string) => void;
  updateNodeCount: (newCount: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolPanel: React.FunctionComponent<CombinedProps> = props => {
  const { classes, addNodePool, deleteNodePool, handleTypeSelect, pools, selectedType, nodeCount, types } = props;

  return (
    <Paper className={classes.root} >
      <Typography variant="h2" className={classes.title} data-qa-tp-title>
        Add Node Pools
      </Typography>
      <Typography variant="body1">
        Add groups of Linodes to your cluster with a chosen size.
      </Typography>
      <SelectPlanPanel
        types={types}
        onSelect={handleTypeSelect}
        noHeader
      />
      <NodePoolDisplayTable
        pools={pools}
        handleDelete={(poolIdx: number) => deleteNodePool(poolIdx)}
      />
      <Button
        type="secondary"
        onClick={() => addNodePool({ type: selectedType, nodeCount })}
      >
        Add Node Pool
      </Button>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(NodePoolPanel);
