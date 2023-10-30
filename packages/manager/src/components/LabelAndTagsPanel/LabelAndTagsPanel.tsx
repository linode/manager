import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { TagsInput, TagsInputProps } from 'src/components/TagsInput/TagsInput';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Paper } from 'src/components/Paper';

interface LabelAndTagsProps {
  error?: string;
  labelFieldProps?: TextFieldProps;
  tagsInputProps?: TagsInputProps;
}

export const LabelAndTagsPanel = (props: LabelAndTagsProps) => {
  const theme = useTheme();
  const { error, labelFieldProps, tagsInputProps } = props;

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
    </Paper>
  );
};
