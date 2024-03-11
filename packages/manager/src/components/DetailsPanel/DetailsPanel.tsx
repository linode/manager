import { Region } from '@linode/api-v4/lib/regions';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Notice } from 'src/components/Notice/Notice';
import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';
import {
  PlacementGroupsSelect,
  PlacementGroupsSelectProps,
} from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';
import { TagsInput, TagsInputProps } from 'src/components/TagsInput/TagsInput';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { PlacementGroupsCreateDrawer } from 'src/features/PlacementGroups/PlacementGroupsCreateDrawer';
import { hasRegionReachedPlacementGroupCapacity } from 'src/features/PlacementGroups/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useUnpaginatedPlacementGroupsQuery } from 'src/queries/placementGroups';
{
  /* TODO VM_Placement: 'Learn more' Link */
}
const tooltipText = `
Add your virtual machine (VM) to a group to best meet your needs.
You may want to group VMs closer together to help improve performance, or further apart to enable high-availability configurations.
Learn more.`;

interface DetailsPanelProps {
  error?: string;
  labelFieldProps?: TextFieldProps;
  placementGroupsSelectProps?: PlacementGroupsSelectProps;
  regions?: Region[];
  tagsInputProps?: TagsInputProps;
}

export const DetailsPanel = (props: DetailsPanelProps) => {
  const {
    error,
    labelFieldProps,
    placementGroupsSelectProps,
    regions,
    tagsInputProps,
  } = props;
  const theme = useTheme();
  const flags = useFlags();
  const selectedRegion = regions?.find(
    (thisRegion) =>
      thisRegion.id === placementGroupsSelectProps?.selectedRegionId
  );
  const hasRegionPlacementGroupCapability = Boolean(
    selectedRegion?.capabilities.includes('Placement Group')
  );
  const showPlacementGroups = Boolean(flags.placementGroups?.enabled);
  const { data: allPlacementGroups } = useUnpaginatedPlacementGroupsQuery(
    showPlacementGroups
  );
  const [
    isCreatePlacementGroupDrawerOpen,
    setIsCreatePlacementGroupDrawerOpen,
  ] = React.useState(false);
  const isPlacementGroupSelectDisabled =
    !selectedRegion ||
    !hasRegionPlacementGroupCapability ||
    props.placementGroupsSelectProps?.disabled;

  return (
    <Paper
      sx={{
        flexGrow: 1,
        marginTop: theme.spacing(3),
        width: '100%',
      }}
      data-qa-label-header
    >
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Details
      </Typography>

      {error && <Notice text={error} variant="error" />}

      <TextField
        {...(labelFieldProps || {
          label: 'Label',
          placeholder: 'Enter a label',
        })}
        data-qa-label-input
        noMarginTop
      />

      {tagsInputProps && <TagsInput {...tagsInputProps} />}

      {showPlacementGroups && (
        <>
          {!selectedRegion && (
            <Notice
              dataTestId="placement-groups-no-region-notice"
              spacingBottom={0}
              spacingTop={16}
              variant="warning"
            >
              <Typography>
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
              <Typography>
                The selected region does not currently have Placement Group
                capabilities.
              </Typography>
            </Notice>
          )}
          {placementGroupsSelectProps && (
            <Box>
              <PlacementGroupsSelect
                {...placementGroupsSelectProps}
                disabled={isPlacementGroupSelectDisabled}
                sx={{
                  mb: 1,
                  width: '100%',
                }}
                textFieldProps={{ tooltipText }}
              />
              {selectedRegion && hasRegionPlacementGroupCapability && (
                <Button
                  disabled={hasRegionReachedPlacementGroupCapacity({
                    allPlacementGroups,
                    region: selectedRegion,
                  })}
                  onClick={() => setIsCreatePlacementGroupDrawerOpen(true)}
                  sx={(theme) => ({
                    p: 0,
                    mt: -0.75,
                    fontFamily: theme.font.normal,
                    fontSize: '0.875rem',
                  })}
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
            open={isCreatePlacementGroupDrawerOpen}
            selectedRegionId={placementGroupsSelectProps?.selectedRegionId}
          />
        </>
      )}
    </Paper>
  );
};
