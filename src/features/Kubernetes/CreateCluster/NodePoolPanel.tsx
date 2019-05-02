import * as React from 'react';

import Button from 'src/components/Button';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

import SelectPlanPanel, {
  ExtendedType
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { PoolNode } from './CreateCluster';
import NodePoolDisplayTable from './NodePoolDisplayTable';

type ClassNames = 'root' | 'title' | 'gridItem' | 'nodeCountInput';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  },
  title: {
    marginBottom: theme.spacing.unit
  },
  gridItem: {
    paddingLeft: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 2
  },
  nodeCountInput: {
    maxWidth: '5em'
  }
});

interface Props {
  pools: PoolNode[];
  types: ExtendedType[];
  selectedType?: string;
  nodeCount: number;
  addNodePool: (pool: PoolNode) => void;
  deleteNodePool: (poolIdx: number) => void;
  handleTypeSelect: (newType?: string) => void;
  updateNodeCount: (newCount: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolPanel: React.FunctionComponent<CombinedProps> = props => {
  const [typeError, setTypeError] = React.useState<string | undefined>(
    undefined
  );
  const [countError, setCountError] = React.useState<string | undefined>(
    undefined
  );
  const {
    classes,
    addNodePool,
    deleteNodePool,
    handleTypeSelect,
    pools,
    selectedType,
    nodeCount,
    updateNodeCount,
    types
  } = props;

  const submitForm = () => {
    /** Do simple client validation for the two input fields */
    setTypeError(undefined);
    setCountError(undefined);
    if (!selectedType) {
      setTypeError('Please select a type.');
      return;
    }
    if (typeof nodeCount !== 'number') {
      setCountError('Invalid value.');
      return;
    }

    /**
     * Add pool and reset form state.
     * Price is calculated from the parent component when adding
     * bc this component doesn't have access to types data.
     */
    addNodePool({ type: selectedType, nodeCount, totalMonthlyPrice: 0 });
    handleTypeSelect(undefined);
    updateNodeCount(1);
  };

  const selectType = (newType: string) => {
    setTypeError(undefined);
    handleTypeSelect(newType);
  };

  return (
    <Paper className={classes.root}>
      <Grid container direction="column">
        <Grid item>
          <SelectPlanPanel
            types={types}
            selectedID={selectedType}
            onSelect={selectType}
            error={typeError}
            header="Add Node Pools"
            copy="Add groups of Linodes to your cluster with a chosen size."
          />
        </Grid>
        <Grid item className={classes.gridItem}>
          <Typography variant="body1">Number of Linodes</Typography>
          <TextField
            tiny
            type="number"
            value={nodeCount}
            onChange={e => updateNodeCount(+e.target.value)}
            errorText={countError}
          />
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button type="secondary" onClick={submitForm}>
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
