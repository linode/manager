import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';

import SelectPlanQuantityPanel, {
  ExtendedType,
  ExtendedTypeWithCount
} from 'src/features/linodes/LinodesCreate/SelectPlanQuantityPanel';

import { getMonthlyPrice } from '.././kubeUtils';
import { PoolNodeWithPrice } from '.././types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .tabbedPanel': {
      marginTop: 0,
      paddingTop: 0
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
  types: ExtendedTypeWithCount[];
  typesLoading: boolean;
  typesError?: string;
  apiError?: string;
  selectedType?: string;
  hideTable?: boolean;
  addNodePool: (pool: PoolNodeWithPrice) => void;
  handleTypeSelect: (newType?: string) => void;
  updateNodeCount: (newCount: number) => void;
  // Props only needed if hideTable is false
  pools?: PoolNodeWithPrice[];
  deleteNodePool?: (poolIdx: number) => void;
  updatePool?: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  isOnCreate: boolean;
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

  const [_types, setNewType] = React.useState<ExtendedTypeWithCount[]>([]);

  const [count, setNewCount] = React.useState<number>(0);

  // TODO: add countError back when ready for error handling
  // const [_, setCountError] = React.useState<string | undefined>(undefined);

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
    isOnCreate
  } = props;

  if (!hideTable && !(pools && updatePool && deleteNodePool)) {
    /**
     * These props are required when showing the table,
     * which will be the case when hideTable is false or undefined
     * (i.e. omitted since it's an optional prop).
     *
     * @todo delete this
     */

    throw new Error(
      'You must provide pools, update and delete functions when displaying the table in NodePoolPanel.'
    );
  }

  const submitForm = (selectedPlanType: string, nodeCount: number) => {
    /** Do simple client validation for the two input fields */
    setTypeError(undefined);
    // setCountError(undefined);
    if (!selectedPlanType) {
      setTypeError('Please select a type.');
      return;
    }
    if (typeof nodeCount !== 'number') {
      // setCountError('Invalid value.');
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

  React.useEffect(() => {
    types.map(thisType => ({
      ...thisType,
      count
    }));
    setNewType(types);
  }, []);

  const updatePlanCount = (planId: string, newCount: number) => {
    const newTypes = types.map((thisType: any) => {
      if (thisType.id === planId) {
        return { ...thisType, count: setNewCount(newCount) };
      }
      return thisType;
    });
    setNewType(newTypes);
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <SelectPlanQuantityPanel
          types={types.filter(t => t.class !== 'nanode' && t.class !== 'gpu')} // No Nanodes or GPUs in clusters
          selectedID={selectedType}
          onSelect={selectType}
          error={apiError || typeError}
          header="Add Node Pools"
          copy="Add groups of Linodes to your cluster with a chosen size."
          updatePlanCount={updatePlanCount}
          submitForm={isOnCreate ? submitForm : undefined}
          addPool={!isOnCreate ? submitForm : undefined}
          isOnCreate={isOnCreate}
        />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(NodePoolPanel);
