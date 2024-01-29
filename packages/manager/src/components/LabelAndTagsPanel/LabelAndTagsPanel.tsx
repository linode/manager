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
  selectedRegionID?: string;
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
    selectedRegionID,
    tagsInputProps,
  } = props;

  const [labelString, setLabelString] = React.useState<string | undefined>('');

  React.useEffect(() => {
    const tempStr = regions
      ?.filter((region) => region.id === selectedRegionID)
      .map((item) => item.label)
      .join('');
    setLabelString(tempStr);
  }, [regions, selectedRegionID]);

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
          label={
            selectedRegionID
              ? `Placement Groups in ${labelString}(${selectedRegionID})`
              : 'Placement Group'
          }
          selectedRegionID={selectedRegionID}
        />
      ) : null}
    </Paper>
  );
};
