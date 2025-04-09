import { Box, Button, ListItem, Notice, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { PlacementGroupsSelect } from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';
import { TextTooltip } from 'src/components/TextTooltip';
import { NO_PLACEMENT_GROUPS_IN_SELECTED_REGION_MESSAGE } from 'src/features/PlacementGroups/constants';
import { PlacementGroupsCreateDrawer } from 'src/features/PlacementGroups/PlacementGroupsCreateDrawer';
import { hasRegionReachedPlacementGroupCapacity } from 'src/features/PlacementGroups/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAllPlacementGroupsQuery } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import {
  NO_REGIONS_SUPPORT_PLACEMENT_GROUPS_MESSAGE,
  PLACEMENT_GROUP_SELECT_TOOLTIP_COPY,
} from './constants';
import { StyledDetailPanelFormattedRegionList } from './PlacementGroups.styles';

import type { PlacementGroup } from '@linode/api-v4';

interface Props {
  handlePlacementGroupChange: (selected: PlacementGroup | null) => void;
  selectedPlacementGroupId: null | number;
  selectedRegionId?: string;
}

export const PlacementGroupsDetailPanel = (props: Props) => {
  const theme = useTheme();
  const {
    handlePlacementGroupChange,
    selectedPlacementGroupId,
    selectedRegionId,
  } = props;
  const { data: allPlacementGroupsInRegion } = useAllPlacementGroupsQuery({
    enabled: Boolean(selectedRegionId),
    filter: {
      region: selectedRegionId,
    },
  });
  const { data: regions } = useRegionsQuery();

  const [
    isCreatePlacementGroupDrawerOpen,
    setIsCreatePlacementGroupDrawerOpen,
  ] = React.useState(false);

  const selectedRegion = regions?.find(
    (thisRegion) => thisRegion.id === selectedRegionId
  );

  const hasRegionPlacementGroupCapability = Boolean(
    selectedRegion?.capabilities.includes('Placement Group')
  );

  const isLinodeReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const handlePlacementGroupCreated = (placementGroup: PlacementGroup) => {
    handlePlacementGroupChange(placementGroup);
  };

  const allRegionsWithPlacementGroupCapability = regions?.filter((region) =>
    region.capabilities.includes('Placement Group')
  );
  const isPlacementGroupSelectDisabled =
    !selectedRegionId || !hasRegionPlacementGroupCapability;

  const placementGroupSelectLabel = selectedRegion
    ? `Placement Groups in ${`${selectedRegion.label} (${selectedRegion.id})`}`
    : 'Placement Group';

  return (
    <>
      {!selectedRegion && (
        <Notice
          dataTestId="placement-groups-no-region-notice"
          spacingBottom={0}
          spacingTop={16}
          variant="warning"
        >
          <Typography sx={{ font: theme.font.bold }}>
            Select a Region for your Linode to see existing placement groups.
          </Typography>
        </Notice>
      )}
      {selectedRegion && !hasRegionPlacementGroupCapability && (
        <Notice
          dataTestId="placement-groups-no-capability-notice"
          spacingBottom={0}
          spacingTop={16}
          variant="warning"
        >
          <Typography sx={{ font: theme.font.bold }}>
            Currently, only specific{' '}
            <TextTooltip
              sxTypography={{
                font: theme.font.bold,
              }}
              tooltipText={
                allRegionsWithPlacementGroupCapability?.length ? (
                  <StyledDetailPanelFormattedRegionList>
                    {allRegionsWithPlacementGroupCapability?.map((region) => (
                      <ListItem
                        data-testid={`supported-pg-region-${region.id}`}
                        key={region.id}
                      >
                        {region.label} ({region.id})
                      </ListItem>
                    ))}
                  </StyledDetailPanelFormattedRegionList>
                ) : (
                  NO_REGIONS_SUPPORT_PLACEMENT_GROUPS_MESSAGE
                )
              }
              dataQaTooltip="Regions that support placement groups"
              displayText="regions"
              minWidth={225}
            />{' '}
            support placement groups.
          </Typography>
        </Notice>
      )}
      <Box>
        <PlacementGroupsSelect
          sx={{
            mb: 1,
            width: '100%',
          }}
          textFieldProps={{
            tooltipPosition: 'right',
            tooltipText: PLACEMENT_GROUP_SELECT_TOOLTIP_COPY,
          }}
          disabled={isPlacementGroupSelectDisabled}
          handlePlacementGroupChange={handlePlacementGroupChange}
          label={placementGroupSelectLabel}
          noOptionsMessage={NO_PLACEMENT_GROUPS_IN_SELECTED_REGION_MESSAGE}
          selectedPlacementGroupId={selectedPlacementGroupId}
          selectedRegion={selectedRegion}
        />
        {selectedRegion && hasRegionPlacementGroupCapability && (
          <Button
            disabled={hasRegionReachedPlacementGroupCapacity({
              allPlacementGroups: allPlacementGroupsInRegion,
              region: selectedRegion,
            })}
            onClick={() => {
              setIsCreatePlacementGroupDrawerOpen(true);
              sendLinodeCreateFormInputEvent({
                createType: 'OS',
                headerName: 'Details',
                interaction: 'click',
                label: 'Create Placement Group',
              });
            }}
            sx={(theme) => ({
              font: theme.font.normal,
              fontSize: '0.875rem',
              mt: -0.75,
              p: 0,
            })}
            sxEndIcon={{
              color: theme.color.grey4,
            }}
            tooltipText="This region has reached its Placement Group capacity."
            variant="text"
          >
            Create Placement Group
          </Button>
        )}
      </Box>
      <PlacementGroupsCreateDrawer
        disabledPlacementGroupCreateButton={isLinodeReadOnly}
        onClose={() => setIsCreatePlacementGroupDrawerOpen(false)}
        onPlacementGroupCreate={handlePlacementGroupCreated}
        open={isCreatePlacementGroupDrawerOpen}
        selectedRegionId={selectedRegionId}
      />
    </>
  );
};
