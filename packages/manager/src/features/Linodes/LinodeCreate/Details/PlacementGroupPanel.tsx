import React from 'react';
import { useController, useWatch } from 'react-hook-form';

import { PlacementGroupsDetailPanel } from 'src/features/PlacementGroups/PlacementGroupsDetailPanel';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import { useLinodeCreateQueryParams } from '../utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

export const PlacementGroupPanel = () => {
  const { field } = useController<CreateLinodeRequest>({
    name: 'placement_group.id',
  });

  const regionId = useWatch<CreateLinodeRequest>({ name: 'region' });

  const { params } = useLinodeCreateQueryParams();

  const placementGroupFormEventOptions: LinodeCreateFormEventOptions = {
    createType: params.type ?? 'OS',
    headerName: 'Details',
    interaction: 'change',
    label: 'Placement Group',
    subheaderName: 'Placement Groups in Region',
    trackOnce: true,
  };

  return (
    <PlacementGroupsDetailPanel
      handlePlacementGroupChange={(placementGroup) => {
        field.onChange(placementGroup?.id);
        if (!placementGroup?.id) {
          sendLinodeCreateFormInputEvent({
            ...placementGroupFormEventOptions,
            interaction: 'clear',
          });
        } else {
          sendLinodeCreateFormInputEvent(placementGroupFormEventOptions);
        }
      }}
      selectedPlacementGroupId={field.value ?? null}
      selectedRegionId={regionId}
    />
  );
};
