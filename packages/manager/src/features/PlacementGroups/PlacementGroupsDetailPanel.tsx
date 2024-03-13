import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { Notice } from 'src/components/Notice/Notice';
import { PlacementGroupsSelect } from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { PlacementGroupsCreateDrawer } from 'src/features/PlacementGroups/PlacementGroupsCreateDrawer';
import {
  hasPlacementGroupReachedCapacity,
  hasRegionReachedPlacementGroupCapacity,
} from 'src/features/PlacementGroups/utils';
import { useUnpaginatedPlacementGroupsQuery } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';

import type { PlacementGroup } from '@linode/api-v4';
import type { PlacementGroupsSelectProps } from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';

interface Props {
  placementGroupsSelectProps: Pick<
    PlacementGroupsSelectProps,
    'handlePlacementGroupChange' | 'selectedRegionId'
  >;
}

const PG_SELECT_TOOLTIP_COPY = `
Add your virtual machine (VM) to a group to best meet your needs.
You may want to group VMs closer together to help improve performance, or further apart to enable high-availability configurations.
Learn more.`;

export const PlacementGroupsDetailPanel = ({
  placementGroupsSelectProps,
}: Props) => {
  const theme = useTheme();
  const { selectedRegionId } = placementGroupsSelectProps;
  const { data: allPlacementGroups } = useUnpaginatedPlacementGroupsQuery();
  const { data: regions } = useRegionsQuery();
  const [
    isCreatePlacementGroupDrawerOpen,
    setIsCreatePlacementGroupDrawerOpen,
  ] = React.useState(false);
  const [selectedPlacementGroup, setSelectedPlacementGroup] = React.useState<
    PlacementGroup | undefined
  >();

  const selectedRegion = regions?.find(
    (thisRegion) => thisRegion.id === selectedRegionId
  );

  const hasRegionPlacementGroupCapability = Boolean(
    selectedRegion?.capabilities.includes('Placement Group')
  );

  const handlePlacementGroupChange =
    placementGroupsSelectProps.handlePlacementGroupChange;

  const onPlacementGroupSelectChange = (placementGroup: PlacementGroup) => {
    setSelectedPlacementGroup(placementGroup);
    handlePlacementGroupChange(placementGroup);
  };

  const handlePlacementGroupCreated = (placementGroup: PlacementGroup) => {
    onPlacementGroupSelectChange(placementGroup);
  };

  const allRegionsWithPlacementGroupCapability = regions?.filter((region) =>
    region.capabilities.includes('Placement Group')
  );
  const isPlacementGroupSelectDisabled =
    !selectedRegionId || !hasRegionPlacementGroupCapability;

  const errorText = hasPlacementGroupReachedCapacity({
    placementGroup: selectedPlacementGroup,
    region: selectedRegion,
  })
    ? "This Placement Group doesn't have any capacity"
    : undefined;

  const placementGroupSelectLabel = selectedRegion
    ? `Placement Groups in ${selectedRegion.label} (${selectedRegion.id})`
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
          <Typography fontFamily={theme.font.bold}>
            Select a region above to see available Placement Groups.
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
          <Typography fontFamily={theme.font.bold}>
            The selected region does not currently have Placement Group
            capabilities. Only these{' '}
            <TextTooltip
              tooltipText={
                <StyledFormattedRegionList>
                  {allRegionsWithPlacementGroupCapability?.map((region) => (
                    <ListItem key={region.id}>
                      {region.label} ({region.id})
                    </ListItem>
                  ))}
                </StyledFormattedRegionList>
              }
              displayText="regions"
              minWidth={225}
            />{' '}
            support Placement Groups.
          </Typography>
        </Notice>
      )}
      {placementGroupsSelectProps && (
        <Box>
          <PlacementGroupsSelect
            {...placementGroupsSelectProps}
            handlePlacementGroupChange={(placementGroup) => {
              onPlacementGroupSelectChange(placementGroup);
            }}
            sx={{
              mb: 1,
              width: '100%',
            }}
            disabled={isPlacementGroupSelectDisabled}
            errorText={errorText}
            key={selectedRegion?.id}
            label={placementGroupSelectLabel}
            noOptionsMessage="There are no Placement Groups in this region"
            textFieldProps={{ tooltipText: PG_SELECT_TOOLTIP_COPY }}
          />
          {selectedRegion && hasRegionPlacementGroupCapability && (
            <Button
              disabled={hasRegionReachedPlacementGroupCapacity({
                allPlacementGroups,
                region: selectedRegion,
              })}
              sx={(theme) => ({
                fontFamily: theme.font.normal,
                fontSize: '0.875rem',
                mt: -0.75,
                p: 0,
              })}
              onClick={() => setIsCreatePlacementGroupDrawerOpen(true)}
              tooltipText="This region has reached its Placement Group capacity."
              variant="text"
            >
              Create Placement Group
            </Button>
          )}
        </Box>
      )}
      <PlacementGroupsCreateDrawer
        allPlacementGroups={allPlacementGroups || []}
        onClose={() => setIsCreatePlacementGroupDrawerOpen(false)}
        onPlacementGroupCreate={handlePlacementGroupCreated}
        open={isCreatePlacementGroupDrawerOpen}
        selectedRegionId={selectedRegionId}
      />
    </>
  );
};

export const StyledFormattedRegionList = styled(List, {
  label: 'StyledFormattedRegionList',
})(({ theme }) => ({
  '& li': {
    padding: `4px 0`,
  },
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
}));
