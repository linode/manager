import { KubeNodePoolResponse } from '@linode/api-v4';
import * as React from 'react';
import { compose } from 'recompose';
import { CircleProgress } from 'src/components/CircleProgress';
import Grid from '@mui/material/Unstable_Grid2';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { KubernetesPlansPanel } from 'src/features/Linodes/LinodesCreate/SelectPlanPanel/KubernetesPlansPanel';
import { ExtendedType, extendType } from 'src/utilities/extendType';

const DEFAULT_PLAN_COUNT = 3;

interface Props {
  types: ExtendedType[];
  typesLoading: boolean;
  typesError?: string;
  apiError?: string;
  addNodePool: (pool: Partial<KubeNodePoolResponse>) => any; // Has to accept both extended and non-extended pools
}

type CombinedProps = Props;

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
  const { addNodePool, apiError, types } = props;

  const [typeCountMap, setTypeCountMap] = React.useState<Map<string, number>>(
    new Map()
  );
  const [selectedType, setSelectedType] = React.useState<string | undefined>();

  const extendedTypes = types.map(extendType);

  const submitForm = (selectedPlanType: string, nodeCount: number) => {
    /**
     * Add pool and reset form state.
     */
    addNodePool({
      id: Math.random(),
      type: selectedPlanType,
      count: nodeCount,
    });
    updatePlanCount(selectedPlanType, 0);
    setSelectedType(undefined);
  };

  const updatePlanCount = (planId: string, newCount: number) => {
    setTypeCountMap(new Map(typeCountMap).set(planId, newCount));
    setSelectedType(planId);
  };

  return (
    <Grid container direction="column">
      <Grid>
        <KubernetesPlansPanel
          types={extendedTypes.filter(
            (t) => t.class !== 'nanode' && t.class !== 'gpu'
          )} // No Nanodes or GPUs in clusters
          getTypeCount={(planId) =>
            typeCountMap.get(planId) ?? DEFAULT_PLAN_COUNT
          }
          selectedID={selectedType}
          onSelect={(newType: string) => setSelectedType(newType)}
          error={apiError}
          header="Add Node Pools"
          copy="Add groups of Linodes to your cluster. You can have a maximum of 100 Linodes per node pool."
          updatePlanCount={updatePlanCount}
          onAdd={submitForm}
          resetValues={() => null} // In this flow we don't want to clear things on tab changes
        />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(NodePoolPanel);
