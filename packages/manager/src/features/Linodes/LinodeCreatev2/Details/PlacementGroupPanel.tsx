import React from 'react';
import { useController, useWatch } from 'react-hook-form';

import { PlacementGroupsDetailPanel } from 'src/features/PlacementGroups/PlacementGroupsDetailPanel';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const PlacementGroupPanel = () => {
  const { field } = useController<CreateLinodeRequest>({
    name: 'placement_group.id',
  });

  const regionId = useWatch<CreateLinodeRequest>({ name: 'region' });

  return (
    <PlacementGroupsDetailPanel
      handlePlacementGroupChange={(placementGroup) =>
        field.onChange(placementGroup?.id)
      }
      selectedPlacementGroupId={field.value ?? null}
      selectedRegionId={regionId}
    />
  );
};
