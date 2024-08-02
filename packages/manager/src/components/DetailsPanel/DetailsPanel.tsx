import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { PlacementGroupsDetailPanel } from 'src/features/PlacementGroups/PlacementGroupsDetailPanel';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import type { PlacementGroup } from '@linode/api-v4';
import type { TagsInputProps } from 'src/components/TagsInput/TagsInput';
import type { TextFieldProps } from 'src/components/TextField';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

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
  const location = useLocation();
  const queryParams = getQueryParamsFromQueryString(location.search);

  const placementGroupFormEventOptions: LinodeCreateFormEventOptions = {
    createType: (queryParams.type as LinodeCreateType) ?? 'OS',
    headerName: 'Details',
    interaction: 'change',
    label: 'Placement Group',
    subheaderName: 'Placement Groups in Region',
  };

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
          handlePlacementGroupChange={(selected) => {
            handlePlacementGroupChange(selected);
            // Track clearing and changing the value once per form - this is configured on backend by inputValue.
            if (!selected) {
              sendLinodeCreateFormInputEvent({
                ...placementGroupFormEventOptions,
                interaction: 'clear',
              });
            } else {
              sendLinodeCreateFormInputEvent({
                ...placementGroupFormEventOptions,
              });
            }
          }}
          selectedPlacementGroupId={selectedPlacementGroupId}
          selectedRegionId={selectedRegionId}
        />
      )}
    </Paper>
  );
};
