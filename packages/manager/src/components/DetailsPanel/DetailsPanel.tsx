import { Region } from '@linode/api-v4/lib/regions';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import {
  PlacementGroupsSelect,
  PlacementGroupsSelectProps,
} from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';
import { TagsInput, TagsInputProps } from 'src/components/TagsInput/TagsInput';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

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
  const theme = useTheme();
  const flags = useFlags();
  const showPlacementGroups = Boolean(flags.placementGroups?.enabled);
  const {
    error,
    labelFieldProps,
    placementGroupsSelectProps,
    tagsInputProps,
  } = props;

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
          {!placementGroupsSelectProps?.selectedRegionId && (
            <Notice
              dataTestId="placement-groups-no-region-notice"
              spacingBottom={0}
              spacingTop={16}
              variant="warning"
            >
              <Typography>
                <b>Select a region above to see available Placement Groups.</b>
              </Typography>
            </Notice>
          )}
          {placementGroupsSelectProps && (
            <Box alignItems="flex-end" display="flex">
              <PlacementGroupsSelect
                {...placementGroupsSelectProps}
                sx={{
                  [theme.breakpoints.down('sm')]: {
                    width: 320,
                  },
                  width: '400px',
                }}
                textFieldProps={{ tooltipText }}
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};
