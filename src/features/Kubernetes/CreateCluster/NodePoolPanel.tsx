import * as React from 'react';
import { compose } from 'recompose';

import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

import SelectPlanPanel, {
  ExtendedType
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { getMonthlyPrice } from '.././kubeUtils';
import { ExtendedPoolNode } from '.././types';
import NodePoolDisplayTable from './NodePoolDisplayTable';

type ClassNames = 'root' | 'title' | 'gridItem' | 'countInput';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& .tabbedPanel': {
      marginTop: 0
    }
  },
  title: {
    marginBottom: theme.spacing(1)
  },
  gridItem: {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  countInput: {
    maxWidth: '5em'
  }
});

interface Props {
  pools: ExtendedPoolNode[];
  types: ExtendedType[];
  typesLoading: boolean;
  typesError?: string;
  apiError?: string;
  selectedType?: string;
  nodeCount: number;
  addNodePool: (pool: ExtendedPoolNode) => void;
  deleteNodePool: (poolIdx: number) => void;
  handleTypeSelect: (newType?: string) => void;
  updateNodeCount: (newCount: number) => void;
  updatePool: (poolIdx: number, updatedPool: ExtendedPoolNode) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolPanel: React.FunctionComponent<CombinedProps> = props => {
  const { classes } = props;
  return (
    <Paper className={classes.root}>
      <RenderLoadingOrContent {...props} />
    </Paper>
  );
};

const RenderLoadingOrContent: React.FunctionComponent<
  CombinedProps
> = props => {
  const { typesError, typesLoading } = props;

  if (typesError) {
    return <ErrorState errorText={typesError} />;
  }

  if (typesLoading) {
    return <CircleProgress />;
  }

  return <Panel {...props} />;
};

const Panel: React.FunctionComponent<CombinedProps> = props => {
  const [typeError, setTypeError] = React.useState<string | undefined>(
    undefined
  );
  const [countError, setCountError] = React.useState<string | undefined>(
    undefined
  );
  const {
    classes,
    addNodePool,
    apiError,
    deleteNodePool,
    handleTypeSelect,
    pools,
    selectedType,
    nodeCount,
    updateNodeCount,
    updatePool,
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
     */
    addNodePool({
      type: selectedType,
      count: nodeCount,
      totalMonthlyPrice: getMonthlyPrice(selectedType, nodeCount, types)
    });
    handleTypeSelect(undefined);
    updateNodeCount(1);
  };

  const selectType = (newType: string) => {
    setTypeError(undefined);
    handleTypeSelect(newType);
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <SelectPlanPanel
          types={types.filter(t => !/nanode/.test(t.class))} // No Nanodes in clusters
          selectedID={selectedType}
          onSelect={selectType}
          error={apiError || typeError}
          header="Add Node Pools"
          copy="Add groups of Linodes to your cluster with a chosen size."
        />
      </Grid>
      <Grid item className={classes.gridItem}>
        <Typography variant="h3">Number of Linodes</Typography>
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
          updatePool={updatePool}
        />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(
  styled,
  renderGuard
);

export default enhanced(NodePoolPanel);
