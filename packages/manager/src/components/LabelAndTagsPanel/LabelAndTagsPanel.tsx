import { Region } from '@linode/api-v4/lib/regions';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { PlacementGroupsSelect } from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';
import { TagsInput, TagsInputProps } from 'src/components/TagsInput/TagsInput';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

interface LabelAndTagsProps {
  error?: string;
  labelFieldProps?: TextFieldProps;
  regions?: Region[];
  selectedRegionId?: string;
  tagsInputProps?: TagsInputProps;
}

export const LabelAndTagsPanel = (props: LabelAndTagsProps) => {
  const theme = useTheme();
  const flags = useFlags();
  const showPlacementGroups = Boolean(flags.vmPlacement);
  const {
    error,
    labelFieldProps,
    regions,
    selectedRegionId,
    tagsInputProps,
  } = props;

  const regionLabel = regions?.find((r) => r.id === selectedRegionId)?.label;

  return (
    <Paper
      sx={{
        flexGrow: 1,
        marginTop: theme.spacing(3),
        width: '100%',
      }}
      data-qa-label-header
    >
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
          {!selectedRegionId && (
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
          <PlacementGroupsSelect
            label={
              selectedRegionId && regionLabel
                ? `Placement Groups in ${regionLabel} (${selectedRegionId})`
                : 'Placement Group'
            }
            disabled={!selectedRegionId}
            selectedRegionId={selectedRegionId}
          />
        </>
      )}
    </Paper>
  );
};
