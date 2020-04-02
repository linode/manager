import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';

import SelectPlanPanel, {
  ExtendedType
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { getMonthlyPrice } from '.././kubeUtils';
import { PoolNodeWithPrice } from '.././types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    '& .tabbedPanel': {
      marginTop: 0
    }
  },
  title: {
    marginBottom: theme.spacing(1)
  },
  gridItem: {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  countInput: {
    maxWidth: '5em'
  },
  notice: {
    paddingLeft: theme.spacing(3)
  }
}));

interface Props {
  types: ExtendedType[];
  typesLoading: boolean;
  typesError?: string;
  apiError?: string;
  selectedType?: string;
  hideTable?: boolean;
  // nodeCount?: number;
  addNodePool: (pool: PoolNodeWithPrice) => void;
  handleTypeSelect: (newType?: string) => void;
  updateNodeCount: (newCount: number) => void;
  // Props only needed if hideTable is false
  pools?: PoolNodeWithPrice[];
  deleteNodePool?: (poolIdx: number) => void;
  updatePool?: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
}

type CombinedProps = Props;

export const NodePoolPanel: React.FunctionComponent<CombinedProps> = props => {
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <RenderLoadingOrContent {...props} />
    </Paper>
  );
};

const RenderLoadingOrContent: React.FunctionComponent<CombinedProps> = props => {
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

  // TODO: add countError back when ready for error handling
  const [_, setCountError] = React.useState<string | undefined>(undefined);

  const {
    addNodePool,
    apiError,
    deleteNodePool,
    handleTypeSelect,
    hideTable,
    pools,
    selectedType,
    // nodeCount,
    updateNodeCount,
    updatePool,
    types
  } = props;

  if (!hideTable && !(pools && updatePool && deleteNodePool)) {
    /**
     * These props are required when showing the table,
     * which will be the case when hideTable is false or undefined
     * (i.e. omitted since it's an optional prop).
     */
    throw new Error(
      'You must provide pools, update and delete functions when displaying the table in NodePoolPanel.'
    );
  }

  const submitForm = (selectedPlanType: string, nodeCount: number) => {
    /** Do simple client validation for the two input fields */
    setTypeError(undefined);
    setCountError(undefined);
    if (!selectedPlanType) {
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
      id: Math.random(),
      type: selectedPlanType,
      count: nodeCount,
      totalMonthlyPrice: getMonthlyPrice(selectedPlanType, nodeCount, types)
    });
    handleTypeSelect(undefined);
    updateNodeCount(3);
  };

  const selectType = (newType: string) => {
    setTypeError(undefined);
    handleTypeSelect(newType);
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <SelectPlanPanel
          types={types.filter(t => t.class !== 'nanode' && t.class !== 'gpu')} // No Nanodes or GPUs in clusters
          selectedID={selectedType}
          onSelect={selectType}
          error={apiError || typeError}
          header="Add Node Pools"
          copy="Add groups of Linodes to your cluster with a chosen size."
          // nodeCount={nodeCount}
          inputIsIncluded
          submitForm={submitForm}
        />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(NodePoolPanel);
