import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
// import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
// import TextField from 'src/components/TextField';

import SelectPlanPanel, {
  ExtendedType
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { getMonthlyPrice, nodeWarning } from '.././kubeUtils';
import { PoolNodeWithPrice } from '.././types';
// import NodePoolDisplayTable from './NodePoolDisplayTable';

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
  nodeCount: number;
  hideTable?: boolean;
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
  const [countError, setCountError] = React.useState<string | undefined>(
    undefined
  );
  const classes = useStyles();

  const {
    addNodePool,
    apiError,
    deleteNodePool,
    handleTypeSelect,
    hideTable,
    pools,
    selectedType,
    updateNodeCount,
    updatePool,
    types,
    nodeCount
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
      id: Math.random(),
      type: selectedType,
      count: nodeCount,
      totalMonthlyPrice: getMonthlyPrice(selectedType, nodeCount, types)
    });
    handleTypeSelect(undefined);
    updateNodeCount(3);
  };

  const selectType = (newType: string) => {
    setTypeError(undefined);
    handleTypeSelect(newType);
  };

  // If the user is about to create a cluster with a single node,
  // we want to show a warning.
  const showSingleNodeWarning =
    pools?.reduce((acc, thisPool) => {
      return acc + thisPool.count;
    }, 0) === 1;

  return (
    <Grid container direction="column">
      {showSingleNodeWarning && (
        <Grid item className={classes.notice}>
          <Notice warning text={nodeWarning} spacingBottom={0} />
        </Grid>
      )}
      <Grid item>
        <SelectPlanPanel
          types={types.filter(t => t.class !== 'nanode' && t.class !== 'gpu')} // No Nanodes or GPUs in clusters
          selectedID={selectedType}
          onSelect={selectType}
          error={apiError || typeError}
          header="Add Node Pools"
          copy="Add groups of Linodes to your cluster with a chosen size."
          nodeCount={nodeCount}
          setInputValue={nodeCount => updateNodeCount(Math.max(+nodeCount, 0))}
          inputIsIncluded
          submitForm={submitForm}
          inputErrorText={countError}
        />
      </Grid>
      {/* {!hideTable && (
         We checked for these props above so it's safe to assume they're defined.
        <>
          {showSingleNodeWarning && (
            <Grid item className={classes.notice}>
              <Notice warning text={nodeWarning} spacingBottom={0} />
            </Grid>
          )}
          <Grid item className={classes.gridItem}>
            <NodePoolDisplayTable
              small
              editable
              loading={false} // When creating we never need to load node pools from the API
              pools={pools || []}
              types={types}
              handleDelete={(poolIdx: number) => deleteNodePool!(poolIdx)}
              updatePool={updatePool!}
            />
          </Grid>
        </>
      )} */}
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(NodePoolPanel);
