import { Image } from '@linode/api-v4/lib/images';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Item } from 'src/components/EnhancedSelect/Select';
import { InputAdornment } from 'src/components/InputAdornment';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import ImageSelect from 'src/features/Images/ImageSelect';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';
import { imageToItem } from 'src/utilities/imageToItem';

import {
  StyledActionsPanel,
  StyledGridWithTips,
  StyledNotice,
  StyledTextField,
} from './StackScriptForm.styles';

interface TextFieldHandler {
  handler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

interface Images {
  // available to select in the dropdown
  available: Image[];
  // image ids that are already selected
  selected: string[];
}

interface Props {
  currentUser: string;
  description: TextFieldHandler;
  disableSubmit: boolean;
  disabled?: boolean;
  errors?: APIError[];
  images: Images;
  isSubmitting: boolean;
  label: TextFieldHandler;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSelectChange: (image: Item<string>[]) => void;
  onSubmit: () => void;
  revision: TextFieldHandler;
  script: TextFieldHandler;
}

const errorResources = {
  images: 'Images',
  label: 'A label',
  script: 'A script',
};

export const StackScriptForm = React.memo((props: Props) => {
  const {
    currentUser,
    description,
    disableSubmit,
    disabled,
    errors,
    images,
    isSubmitting,
    label,
    mode,
    onCancel,
    onSelectChange,
    onSubmit,
    revision,
    script,
  } = props;

  const hasErrorFor = getAPIErrorFor(errorResources, errors);
  const selectedImages = imageToItem(images.selected);

  return (
    <Paper sx={(theme) => ({ padding: theme.spacing(2) })}>
      <Grid container spacing={2}>
        <StyledGridWithTips>
          <StyledTextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">{currentUser} /</InputAdornment>
              ),
            }}
            data-qa-stackscript-label
            disabled={disabled}
            errorText={hasErrorFor('label')}
            label="StackScript Label"
            onChange={label.handler}
            placeholder="Enter a label"
            required
            tooltipText="StackScript labels must be between 3 and 128 characters."
            value={label.value}
          />
          <TextField
            data-qa-stackscript-description
            disabled={disabled}
            label="Description"
            multiline
            onChange={description.handler}
            placeholder="Enter a description"
            rows={1}
            value={description.value}
          />
          <ImageSelect
            helperText={
              'Select which images are compatible with this StackScript. "Any/All" allows you to use private images.'
            }
            anyAllOption
            data-qa-stackscript-target-select
            disabled={disabled}
            imageFieldError={hasErrorFor('images')}
            images={images.available}
            isMulti
            label="Target Images"
            onSelect={onSelectChange}
            required
            value={selectedImages}
          />
        </StyledGridWithTips>
        <StyledGridWithTips>
          <StyledNotice>
            <Typography variant="h2">Tips</Typography>
            <Typography>
              There are four default environment variables provided to you:
            </Typography>
            <ul>
              <li>LINODE_ID</li>
              <li>LINODE_LISHUSERNAME</li>
              <li>LINODE_RAM</li>
              <li>LINODE_DATACENTERID</li>
            </ul>
          </StyledNotice>
        </StyledGridWithTips>
      </Grid>
      <TextField
        InputProps={{ sx: { maxWidth: '100%' } }}
        data-qa-stackscript-script
        disabled={disabled}
        errorText={hasErrorFor('script')}
        label="Script"
        multiline
        onChange={script.handler}
        placeholder={`#!/bin/bash \n\n# Your script goes here`}
        required
        rows={3}
        value={script.value}
      />
      <TextField
        InputProps={{ sx: { maxWidth: '100%' } }}
        data-qa-stackscript-revision
        disabled={disabled}
        label="Revision Note"
        onChange={revision.handler}
        placeholder="Enter a revision note"
        value={revision.value}
      />
      <StyledActionsPanel
        primaryButtonProps={{
          'data-testid': 'save',
          disabled: disabled || disableSubmit,
          label: mode === 'edit' ? 'Save Changes' : 'Create StackScript',
          loading: isSubmitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          disabled,
          label: 'Reset',
          onClick: onCancel,
        }}
      />
    </Paper>
  );
});

export default React.memo(StackScriptForm);
