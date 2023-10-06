import { Image } from '@linode/api-v4/lib/images';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Item } from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { InputAdornment } from 'src/components/InputAdornment';
import ImageSelect from 'src/features/Images/ImageSelect';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { imageToItem } from 'src/utilities/imageToItem';

const useStyles = makeStyles((theme: Theme) => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  gridWithTips: {
    maxWidth: '50%',
    [theme.breakpoints.down('md')]: {
      maxWidth: '100%',
      width: '100%',
    },
  },
  labelField: {
    '& input': {
      paddingLeft: 0,
    },
  },
  revisionTextarea: {
    maxWidth: '100%',
  },
  root: {
    padding: theme.spacing(2),
  },
  scriptTextarea: {
    maxWidth: '100%',
  },
  tips: {
    backgroundColor: theme.palette.divider,
    marginLeft: theme.spacing(4),
    marginTop: `${theme.spacing(4)} !important`,
    padding: theme.spacing(4),
    [theme.breakpoints.down('lg')]: {
      paddingLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('xl')]: {
      marginLeft: 0,
    },
  },
}));

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

// exported as a class component, otherwise no display name
// appears in tests
export const StackScriptForm = (props: Props) => {
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

  const classes = useStyles();

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);
  const selectedImages = imageToItem(images.selected);

  return (
    <Paper className={classes.root}>
      <Grid container spacing={2}>
        <Grid className={classes.gridWithTips}>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">{currentUser} /</InputAdornment>
              ),
            }}
            className={classes.labelField}
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
        </Grid>
        <Grid className={classes.gridWithTips}>
          <Notice className={classes.tips}>
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
          </Notice>
        </Grid>
      </Grid>
      <TextField
        InputProps={{ className: classes.scriptTextarea }}
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
        InputProps={{ className: classes.revisionTextarea }}
        data-qa-stackscript-revision
        disabled={disabled}
        label="Revision Note"
        onChange={revision.handler}
        placeholder="Enter a revision note"
        value={revision.value}
      />
      <ActionsPanel
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
        className={classes.actions}
      />
    </Paper>
  );
};

export default React.memo(StackScriptForm);
