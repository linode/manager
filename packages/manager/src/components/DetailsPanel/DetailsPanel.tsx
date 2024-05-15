import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TagsInput, TagsInputProps } from 'src/components/TagsInput/TagsInput';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { PlacementGroupsDetailPanel } from 'src/features/PlacementGroups/PlacementGroupsDetailPanel';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';

import type { PlacementGroup } from '@linode/api-v4';

interface DetailsPanelProps {
  error?: string;
  handlePlacementGroupChange: (selected: PlacementGroup | null) => void;
  labelFieldProps?: TextFieldProps;
  selectedPlacementGroupId: null | number;
  selectedRegionId?: string;
  tagsInputProps?: TagsInputProps;
}

export const DetailsPanel = (props: DetailsPanelProps) => {
  const {
    error,
    handlePlacementGroupChange,
    labelFieldProps,
    selectedPlacementGroupId,
    selectedRegionId,
    tagsInputProps,
  } = props;
  const theme = useTheme();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();

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

      {isPlacementGroupsEnabled && (
        <PlacementGroupsDetailPanel
          handlePlacementGroupChange={handlePlacementGroupChange}
          selectedPlacementGroupId={selectedPlacementGroupId}
          selectedRegionId={selectedRegionId}
        />
      )}
    </Paper>
  );
};
