import { useRegionsQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { doesRegionSupportFeature } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { useFlags } from 'src/hooks/useFlags';

import { useIsAcceleratedPlansEnabled } from 'src/features/components/PlansPanel/utils';
import { extendType } from 'src/utilities/extendType';

import {
  ADD_NODE_POOLS_DESCRIPTION,
  ADD_NODE_POOLS_ENCRYPTION_DESCRIPTION,
  ADD_NODE_POOLS_ENTERPRISE_DESCRIPTION,
  ADD_NODE_POOLS_NO_ENCRYPTION_DESCRIPTION,
} from '../ClusterList/constants';
import { KubernetesPlansPanel } from '../KubernetesPlansPanel/KubernetesPlansPanel';

import type {
  KubeNodePoolResponse,
  KubernetesTier,
  LinodeTypeClass,
  Region,
} from '@linode/api-v4';
import type { ExtendedType } from 'src/utilities/extendType';

const DEFAULT_PLAN_COUNT = 3;

export interface NodePoolPanelProps {
  addNodePool: (pool: Partial<KubeNodePoolResponse>) => any; // Has to accept both extended and non-extended pools
  apiError?: string;
  hasSelectedRegion: boolean;
  isAPLEnabled?: boolean;
  isPlanPanelDisabled: (planType?: LinodeTypeClass) => boolean;
  isSelectedRegionEligibleForPlan: (planType?: LinodeTypeClass) => boolean;
  regionsData: Region[];
  selectedRegionId: Region['id'] | undefined;
  selectedTier: KubernetesTier;
  types: ExtendedType[];
  typesError?: string;
  typesLoading: boolean;
}

export const NodePoolPanel = (props: NodePoolPanelProps) => {
  return <RenderLoadingOrContent {...props} />;
};

const RenderLoadingOrContent = (props: NodePoolPanelProps) => {
  const { typesError, typesLoading } = props;

  if (typesError) {
    return <ErrorState errorText={typesError} />;
  }

  if (typesLoading) {
    return <CircleProgress />;
  }

  return <Panel {...props} />;
};

const Panel = (props: NodePoolPanelProps) => {
  const {
    addNodePool,
    apiError,
    hasSelectedRegion,
    isAPLEnabled,
    isPlanPanelDisabled,
    isSelectedRegionEligibleForPlan,
    regionsData,
    selectedRegionId,
    selectedTier,
    types,
  } = props;

  const flags = useFlags();

  const { isAcceleratedLKEPlansEnabled } = useIsAcceleratedPlansEnabled();

  const regions = useRegionsQuery().data ?? [];

  const [typeCountMap, setTypeCountMap] = React.useState<Map<string, number>>(
    new Map()
  );
  const [selectedType, setSelectedType] = React.useState<string | undefined>();

  const extendedTypes = types.map(extendType);

  const addPool = (selectedPlanType: string, nodeCount: number) => {
    addNodePool({
      count: nodeCount,
      id: Math.random(),
      type: selectedPlanType,
    });
  };

  const updatePlanCount = (planId: string, newCount: number) => {
    setTypeCountMap(new Map(typeCountMap).set(planId, newCount));
    setSelectedType(planId);
  };

  // "Disk Encryption" indicates general availability and "LA Disk Encryption" indicates limited availability
  const regionSupportsDiskEncryption =
    doesRegionSupportFeature(
      selectedRegionId ?? '',
      regions,
      'Disk Encryption'
    ) ||
    doesRegionSupportFeature(
      selectedRegionId ?? '',
      regions,
      'LA Disk Encryption'
    );

  const getPlansPanelCopy = () => {
    // TODO - LKE-E: Remove the 'ADD_NODE_POOLS_NO_ENCRYPTION_DESCRIPTION' copy once LDE is enabled on LKE-E.
    if (selectedTier === 'enterprise') {
      return `${ADD_NODE_POOLS_ENTERPRISE_DESCRIPTION} ${ADD_NODE_POOLS_NO_ENCRYPTION_DESCRIPTION}`;
    }
    return regionSupportsDiskEncryption && Boolean(flags.linodeDiskEncryption)
      ? `${ADD_NODE_POOLS_DESCRIPTION} ${ADD_NODE_POOLS_ENCRYPTION_DESCRIPTION}`
      : ADD_NODE_POOLS_DESCRIPTION;
  };

  return (
    <Grid container direction="column">
      <Grid>
        <KubernetesPlansPanel
          getTypeCount={(planId) =>
            typeCountMap.get(planId) ?? DEFAULT_PLAN_COUNT
          }
          types={extendedTypes.filter((t) => {
            if (!isAcceleratedLKEPlansEnabled && t.class === 'accelerated') {
              // Accelerated plans will appear only if they are enabled (account capability exists and feature flag on)
              return false;
            }

            // No Nanodes in Kubernetes clusters
            return t.class !== 'nanode';
          })}
          copy={getPlansPanelCopy()}
          error={apiError}
          hasSelectedRegion={hasSelectedRegion}
          header="Add Node Pools"
          isAPLEnabled={isAPLEnabled}
          isPlanPanelDisabled={isPlanPanelDisabled}
          isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
          onAdd={addPool}
          onSelect={(newType: string) => setSelectedType(newType)}
          regionsData={regionsData}
          resetValues={() => null} // In this flow we don't want to clear things on tab changes
          selectedId={selectedType}
          selectedRegionId={selectedRegionId}
          selectedTier={selectedTier}
          updatePlanCount={updatePlanCount}
        />
      </Grid>
    </Grid>
  );
};
