import { KubeNodePoolResponse, LinodeTypeClass, Region } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { ExtendedType, extendType } from 'src/utilities/extendType';

import { KubernetesPlansPanel } from '../KubernetesPlansPanel/KubernetesPlansPanel';

const DEFAULT_PLAN_COUNT = 3;

export interface NodePoolPanelProps {
  addNodePool: (pool: Partial<KubeNodePoolResponse>) => any; // Has to accept both extended and non-extended pools
  apiError?: string;
  hasSelectedRegion: boolean;
  isPlanPanelDisabled: (planType?: LinodeTypeClass) => boolean;
  isSelectedRegionEligibleForPlan: (planType?: LinodeTypeClass) => boolean;
  regionsData: Region[];
  selectedRegionId: Region['id'];
  types: ExtendedType[];
  typesError?: string;
  typesLoading: boolean;
}

export const NodePoolPanel: React.FunctionComponent<NodePoolPanelProps> = (
  props
) => {
  return <RenderLoadingOrContent {...props} />;
};

const RenderLoadingOrContent: React.FunctionComponent<NodePoolPanelProps> = (
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

const Panel: React.FunctionComponent<NodePoolPanelProps> = (props) => {
  const {
    addNodePool,
    apiError,
    hasSelectedRegion,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
    regionsData,
    selectedRegionId,
    types,
  } = props;

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
      count: nodeCount,
      id: Math.random(),
      type: selectedPlanType,
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
          getTypeCount={(planId) =>
            typeCountMap.get(planId) ?? DEFAULT_PLAN_COUNT
          }
          types={extendedTypes.filter(
            (t) => t.class !== 'nanode' && t.class !== 'gpu'
          )} // No Nanodes or GPUs in clusters
          copy="Add groups of Linodes to your cluster. You can have a maximum of 100 Linodes per node pool."
          error={apiError}
          hasSelectedRegion={hasSelectedRegion}
          header="Add Node Pools"
          isPlanPanelDisabled={isPlanPanelDisabled}
          isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
          onAdd={submitForm}
          onSelect={(newType: string) => setSelectedType(newType)}
          regionsData={regionsData}
          resetValues={() => null} // In this flow we don't want to clear things on tab changes
          selectedId={selectedType}
          selectedRegionId={selectedRegionId}
          updatePlanCount={updatePlanCount}
        />
      </Grid>
    </Grid>
  );
};
