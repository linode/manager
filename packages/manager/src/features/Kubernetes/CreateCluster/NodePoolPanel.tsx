import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import ErrorState from 'src/components/ErrorState';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import SelectPlanQuantityPanel, {
  ExtendedType,
  ExtendedTypeWithCount,
} from 'src/features/linodes/LinodesCreate/SelectPlanQuantityPanel';
import { getMonthlyPrice } from '.././kubeUtils';
import { PoolNodeWithPrice } from '.././types';

interface Props {
  types: ExtendedType[];
  typesLoading: boolean;
  typesError?: string;
  apiError?: string;
  isOnCreate?: boolean;
  addNodePool: (pool: Partial<PoolNodeWithPrice>) => any; // Has to accept both extended and non-extended pools
}

type CombinedProps = Props;

export const addCountToTypes = (
  types: ExtendedType[]
): ExtendedTypeWithCount[] => {
  return types.map((thisType) => ({
    ...thisType,
    count: 3,
  }));
};

export const NodePoolPanel: React.FunctionComponent<CombinedProps> = (
  props
) => {
  return <RenderLoadingOrContent {...props} />;
};

const RenderLoadingOrContent: React.FunctionComponent<CombinedProps> = (
  props
) => {
  const { typesError, typesLoading } = props;

  if (typesError) {
    return <ErrorState errorText={typesError} />;
  }

  if (typesLoading) {
    return <CircleProgress />;
  }

  return <Panel {...props} />;
};

const Panel: React.FunctionComponent<CombinedProps> = (props) => {
  const { addNodePool, apiError, types, isOnCreate } = props;

  const [_types, setNewType] = React.useState<ExtendedTypeWithCount[]>(
    addCountToTypes(types)
  );
  const [selectedType, setSelectedType] = React.useState<string | undefined>();

  const submitForm = (selectedPlanType: string, nodeCount: number) => {
    /**
     * Add pool and reset form state.
     */
    addNodePool({
      id: Math.random(),
      type: selectedPlanType,
      count: nodeCount,
      totalMonthlyPrice: getMonthlyPrice(selectedPlanType, nodeCount, types),
    });
    updatePlanCount(selectedPlanType, 0);
    setSelectedType(undefined);
  };

  const updatePlanCount = (planId: string, newCount: number) => {
    const newTypes = _types.map((thisType: ExtendedTypeWithCount) => {
      if (thisType.id === planId) {
        return { ...thisType, count: newCount };
      }
      return thisType;
    });
    setNewType(newTypes);
    setSelectedType(planId);
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <SelectPlanQuantityPanel
          types={_types.filter(
            (t) => t.class !== 'nanode' && t.class !== 'gpu'
          )} // No Nanodes or GPUs in clusters
          selectedID={selectedType}
          onSelect={(newType: string) => setSelectedType(newType)}
          error={apiError}
          header="Add Node Pools"
          copy="Add groups of Linodes to your cluster with a chosen size."
          updatePlanCount={updatePlanCount}
          submitForm={submitForm}
          isOnCreate={isOnCreate}
          resetValues={() => null} // In this flow we don't want to clear things on tab changes
        />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(NodePoolPanel);
