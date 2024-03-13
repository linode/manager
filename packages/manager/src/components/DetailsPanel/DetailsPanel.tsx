import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TagsInput, TagsInputProps } from 'src/components/TagsInput/TagsInput';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { PlacementGroupsDetailPanel } from 'src/features/PlacementGroups/PlacementGroupsDetailPanel';
import { useFlags } from 'src/hooks/useFlags';

import type { PlacementGroupsSelectProps } from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';

interface DetailsPanelProps {
  error?: string;
  labelFieldProps?: TextFieldProps;
  placementGroupsSelectProps: PlacementGroupsSelectProps;
  tagsInputProps?: TagsInputProps;
}

export const DetailsPanel = (props: DetailsPanelProps) => {
  const {
    error,
    labelFieldProps,
    placementGroupsSelectProps,
    tagsInputProps,
  } = props;
  const theme = useTheme();
  const flags = useFlags();

  const showPlacementGroups = Boolean(flags.placementGroups?.enabled);

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
        <PlacementGroupsDetailPanel
          placementGroupsSelectProps={{
            ...placementGroupsSelectProps,
          }}
        />
      )}
    </Paper>
  );
};
