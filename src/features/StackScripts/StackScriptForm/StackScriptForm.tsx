import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Select from 'src/components/Select';
import Tag from 'src/components/Tag';
import TextField from 'src/components/TextField';

import { Divider } from '../../../../node_modules/@material-ui/core';

import filterImagesByDeprecationStatus from 'src/utilities/filterImagesByDeprecationStatus';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';


type ClassNames = 'root'
  | 'backButton'
  | 'titleWrapper'
  | 'createTitle'
  | 'labelField'
  | 'divider'
  | 'gridWithTips'
  | 'tips'
  | 'chipsContainer'
  | 'scriptTextarea'
  | 'revisionTextarea'
  | 'warning'
  | 'targetTag';

  const styles: StyleRulesCallback<ClassNames> = (theme) => ({
    root: {
      padding: theme.spacing.unit * 2,
    },
    backButton: {
      margin: '5px 0 0 -16px',
      '& svg': {
        width: 34,
        height: 34,
      },
    },
    createTitle: {
      lineHeight: '2.25em'
    },
    divider: {
      margin: `0 0 ${theme.spacing.unit * 2}px 0`,
      height: 0,
    },
    labelField: {
      '& input': {
        paddingLeft: 0,
      },
    },
    titleWrapper: {
      display: 'flex',
      marginTop: 5,
    },
    gridWithTips: {
      maxWidth: '50%',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
        width: '100%',
      },
    },
    tips: {
      marginLeft: theme.spacing.unit * 4,
      marginTop: `${theme.spacing.unit * 4}px !important`,
      padding: theme.spacing.unit * 4,
      backgroundColor: theme.palette.divider,
      [theme.breakpoints.down('lg')]: {
        marginLeft: 0,
      },
      [theme.breakpoints.down('md')]: {
        paddingLeft: theme.spacing.unit * 2,
      },
    },
    chipsContainer: {
      maxWidth: 415,
    },
    warning: {
      marginTop: theme.spacing.unit * 4,
    },
    targetTag: {
      margin: `${theme.spacing.unit}px ${theme.spacing.unit}px 0 0`,
    },
    scriptTextarea: {
      maxWidth: '100%',
      height: 400,
      '& textarea': {
        height: '100%',
      }
    },
    revisionTextarea: {
      maxWidth: '100%',
    },
  });

interface TextFieldHandler {
  value: string;
  handler: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SelectFieldHandler {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface Images {
  // available to select in the dropdown
  available: Linode.Image[];
  // image ids that are already selected
  selected: string[];
  handleRemove: (index: number) => void;
}

interface Props {
  currentUser: string;
  images: Images;
  label: TextFieldHandler;
  revision: TextFieldHandler;
  description: TextFieldHandler;
  script: TextFieldHandler;
  selectImages: SelectFieldHandler;
  errors?: Linode.ApiFieldError[];
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const errorResources = {
  label: 'A label',
  images: 'Images',
  script: 'A script'
};

// exported as a class component, otherwise no display name
// appears in tests
export class StackScriptForm extends React.Component<CombinedProps> {

  render() {

    const { currentUser, classes, label, revision, description,
      script, selectImages, errors, onSubmit, onCancel,
      isSubmitting, images } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <Grid container>
            <Grid item className={classes.gridWithTips}>
              <TextField
                InputProps={{
                  startAdornment:
                    <InputAdornment position="end">
                      {currentUser} /
                    </InputAdornment>,
                }}
                label='StackScript Label'
                required
                onChange={label.handler}
                placeholder='Enter a label'
                value={label.value}
                errorText={hasErrorFor('label')}
                tooltipText="Give your StackScript a label"
                className={classes.labelField}
                data-qa-stackscript-label
              />
              <TextField
                multiline
                rows={1}
                label="Description"
                placeholder="Enter a description"
                onChange={description.handler}
                value={description.value}
                tooltipText="Give your StackScript a description"
                data-qa-stackscript-description
              />
              <FormControl fullWidth>
                <InputLabel
                  htmlFor="image"
                  disableAnimation
                  shrink={true}
                  required
                >
                  Target Images
              </InputLabel>
                <Select
                  open={selectImages.open}
                  onOpen={selectImages.onOpen}
                  onClose={selectImages.onClose}
                  value='none'
                  onChange={selectImages.onChange}
                  inputProps={{ name: 'image', id: 'image' }}
                  tooltipText='Select which images are compatible with this StackScript'
                  error={Boolean(hasErrorFor('images'))}
                  errorText={hasErrorFor('images')}
                  data-qa-stackscript-target-select
                >
                  <MenuItem disabled key="none" value="none">Select Compatible Images</MenuItem>,
                {filterImagesByDeprecationStatus(images.available, false).map(image =>
                    <MenuItem
                      key={image.id}
                      value={image.id}
                      data-qa-stackscript-image={image.id}
                    >
                      {image.label}
                    </MenuItem>,
                  )}
                  <MenuItem disabled key="deprecated" value="deprecated">Older Images</MenuItem>,
                {filterImagesByDeprecationStatus(images.available, true).map(image =>
                    <MenuItem
                      key={image.id}
                      value={image.id}
                    >
                      {image.label}
                    </MenuItem>,
                  )}
                </Select>
              </FormControl>
              <div className={classes.chipsContainer}>
                {images.selected && images.selected.map((selectedImage, index) => {
                  return (
                    <Tag
                      key={selectedImage}
                      label={stripImageName(selectedImage)}
                      variant='lightBlue'
                      onDelete={() => images.handleRemove(index)}
                      className={classes.targetTag}
                    />
                  )
                })}
              </div>
            </Grid>
            <Grid item className={classes.gridWithTips}>
              <Notice
                className={classes.tips}
              >
                <Typography role="header" variant="title">Tips</Typography>
                <Typography>There are four default environment variables provided to you:</Typography>
                <ul>
                  <li>LINODE_ID</li>
                  <li>LINODE_LISTUSERNAME</li>
                  <li>LINODE_RAM</li>
                  <li>LINODE_DATACENTERID</li>
                </ul>
              </Notice>
            </Grid>
          </Grid>
          <Divider className={classes.divider} />
          <TextField
            multiline
            rows={1}
            label="Script"
            placeholder={`#!/bin/bash \n\n# Your script goes here`}
            onChange={script.handler}
            value={script.value}
            errorText={hasErrorFor('script')}
            required
            InputProps={{ className: classes.scriptTextarea }}
            data-qa-stackscript-script
          />
          <TextField
            label="Revision Note"
            placeholder='Enter a revision note'
            onChange={revision.handler}
            value={revision.value}
            InputProps={{ className: classes.revisionTextarea }}
            data-qa-stackscript-revision
          />
          <ActionsPanel style={{ paddingBottom: 0 }}>
            <Button
              onClick={onSubmit}
              type="primary"
              loading={isSubmitting}
              data-qa-save
            >
              Save
            </Button>
            <Button
              onClick={onCancel}
              type="secondary"
              className="cancel"
              data-qa-cancel
            >
              Cancel
            </Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }
}

/*
* @TODO Deprecate once we have a reliable way of mapping
* the slug to the display name
*/
const stripImageName = (image: string) => {
  return image.replace('linode/', '');
};

const styled = withStyles(styles, { withTheme: true });

export default styled<CombinedProps>(StackScriptForm);

