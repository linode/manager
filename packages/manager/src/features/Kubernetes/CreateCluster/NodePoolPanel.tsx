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
  types: ExtendedType[];
  typesLoading: boolean;
  typesError?: string;
  apiError?: string;
  selectedType?: string;
  isOnCreate?: boolean;
  addNodePool: (pool: any) => void;
  handleTypeSelect: (newType?: string) => void;
}

type CombinedProps = Props;

export const addCountToTypes = (
  types: ExtendedType[]
): ExtendedTypeWithCount[] => {
  return types.map(thisType => ({
    ...thisType,
    count: 0
  }));
};

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
  const {
    addNodePool,
    apiError,
    handleTypeSelect,
    selectedType,
    types,
    isOnCreate
  } = props;

  const [typeError, setTypeError] = React.useState<string | undefined>(
    undefined
  );

  const [_types, setNewType] = React.useState<ExtendedTypeWithCount[]>(
    addCountToTypes(types)
  );

  // TODO: add countError back when ready for error handling
  // const [_, setCountError] = React.useState<string | undefined>(undefined);

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
  };

  const selectType = (newType: string) => {
    setTypeError(undefined);
    handleTypeSelect(newType);
  };

  const updatePlanCount = (planId: string, newCount: number) => {
    const newTypes = _types.map((thisType: any) => {
      if (thisType.id === planId) {
        return { ...thisType, count: newCount };
      }
      return thisType;
    });
    setNewType(newTypes);
    handleTypeSelect(planId);
  };

  const handleAdd = () => {
    const type = _types.find(thisType => thisType.id === selectedType);
    console.log('type: ', selectedType);
    if (!type || !selectedType) {
      return;
    }
    addNodePool({ type: type.id, count: type.count });
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <SelectPlanQuantityPanel
          types={_types.filter(t => t.class !== 'nanode' && t.class !== 'gpu')} // No Nanodes or GPUs in clusters
          selectedID={selectedType}
          onSelect={selectType}
          error={apiError || typeError}
          header="Add Node Pools"
          copy="Add groups of Linodes to your cluster with a chosen size."
          updatePlanCount={updatePlanCount}
          submitForm={isOnCreate ? submitForm : undefined}
          addPool={!isOnCreate ? handleAdd : undefined}
          isOnCreate={isOnCreate}
        />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(NodePoolPanel);
