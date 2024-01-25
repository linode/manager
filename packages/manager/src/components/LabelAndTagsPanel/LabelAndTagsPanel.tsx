import { Region } from '@linode/api-v4/lib/regions';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { PlacementGroupsSelect } from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';
import { TagsInput, TagsInputProps } from 'src/components/TagsInput/TagsInput';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { useFlags } from 'src/hooks/useFlags';

interface LabelAndTagsProps {
  error?: string;
  labelFieldProps?: TextFieldProps;
  regions?: Region[];
  selectedId?: string;
  tagsInputProps?: TagsInputProps;
}

export const LabelAndTagsPanel = (props: LabelAndTagsProps) => {
  const theme = useTheme();
  const flags = useFlags();
  const showPlacementGroups = Boolean(flags.vmPlacement);
  const { error, labelFieldProps, regions, selectedId, tagsInputProps } = props;

  const labelString = regions
    ?.filter((region) => region.id === selectedId)
    .map((item) => item.label);

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
      {showPlacementGroups ? (
        <PlacementGroupsSelect
          // onSelectionChange={ }
          // value={values ?? null}
          // region={region}
          label={
            selectedId
              ? `Placement Groups in ${labelString}(${selectedId})`
              : 'Placement Group'
          }
        />
      ) : null}
    </Paper>
  );
};
