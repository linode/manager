import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';
import { Notice } from 'src/components/Notice/Notice';
import { TagsInput, TagsInputProps } from 'src/components/TagsInput/TagsInput';
import { useTheme } from '@mui/material/styles';

interface Props {
  error?: string;
  labelFieldProps?: TextFieldProps;
  tagsInputProps?: TagsInputProps;
}

export const LabelAndTagsPanel = (props: Props) => {
  const theme = useTheme();
  const { error, labelFieldProps, tagsInputProps } = props;

  return (
    <Paper
      data-qa-label-header
      sx={{
        backgroundColor: theme.color.white,
        flexGrow: 1,
        marginTop: theme.spacing(3),
        width: '100%',
      }}
    >
      {error && <Notice text={error} error />}
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
