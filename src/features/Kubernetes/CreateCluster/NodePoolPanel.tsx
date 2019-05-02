import * as React from 'react';

import Button from 'src/components/Button';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
// import Typography from 'src/components/core/Typography';

import SelectPlanPanel, {
  ExtendedType
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { PoolNode } from './CreateCluster';
import NodePoolDisplayTable from './NodePoolDisplayTable';

type ClassNames = 'root' | 'title' | 'gridItem';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  },
  title: {
    marginBottom: theme.spacing.unit
  },
  gridItem: {
    paddingLeft: theme.spacing.unit * 3
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
  const {
    classes,
    addNodePool,
    deleteNodePool,
    handleTypeSelect,
    pools,
    selectedType,
    nodeCount,
    types
  } = props;

  return (
    <Paper className={classes.root}>
      <Grid container direction="column">
        <Grid item>
          <SelectPlanPanel
            types={types}
            selectedID={selectedType}
            onSelect={handleTypeSelect}
            header="Add Node Pools"
            copy="Add groups of Linodes to your cluster with a chosen size."
          />
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button
            type="secondary"
            onClick={() => addNodePool({ type: selectedType, nodeCount })}
          >
            Add Node Pool
          </Button>
        </Grid>
        <Grid item className={classes.gridItem}>
          <NodePoolDisplayTable
            pools={pools}
            types={types}
            handleDelete={(poolIdx: number) => deleteNodePool(poolIdx)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(NodePoolPanel);
