import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import FormControl from 'src/components/core/FormControl';
import InputAdornment from 'src/components/core/InputAdornment';
import InputLabel from 'src/components/core/InputLabel';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import ImageSelect from 'src/features/Images/ImageSelect';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import imageToItem from 'src/utilities/imageToItem';

type ClassNames =
  | 'root'
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

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2)
    },
    backButton: {
      margin: '5px 0 0 -16px',
      '& svg': {
        width: 34,
        height: 34
      }
    },
    createTitle: {
      lineHeight: '2.25em'
    },
    divider: {
      margin: `0 0 ${theme.spacing(2)}px 0`,
      height: 0
    },
    labelField: {
      '& input': {
        paddingLeft: 0
      }
    },
    titleWrapper: {
      display: 'flex',
      marginTop: 5
    },
    gridWithTips: {
      maxWidth: '50%',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
        width: '100%'
      }
    },
    tips: {
      marginLeft: theme.spacing(4),
      marginTop: `${theme.spacing(4)}px !important`,
      padding: theme.spacing(4),
      backgroundColor: theme.palette.divider,
      [theme.breakpoints.down('lg')]: {
        marginLeft: 0
      },
      [theme.breakpoints.down('md')]: {
        paddingLeft: theme.spacing(2)
      }
    },
    chipsContainer: {
      maxWidth: 415
    },
    warning: {
      marginTop: theme.spacing(4)
    },
    targetTag: {
      margin: `${theme.spacing(1)}px ${theme.spacing(1)}px 0 0`
    },
    scriptTextarea: {
      maxWidth: '100%',
      height: 400,
      '& textarea': {
        height: '100%'
      }
    },
    revisionTextarea: {
      maxWidth: '100%'
    }
  });

interface TextFieldHandler {
  value: string;
  handler: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface Images {
  // available to select in the dropdown
  available: Linode.Image[];
  // image ids that are already selected
  selected: string[];
}

interface Props {
  currentUser: string;
  images: Images;
  label: TextFieldHandler;
  revision: TextFieldHandler;
  description: TextFieldHandler;
  script: TextFieldHandler;
  errors?: Linode.ApiFieldError[];
  onSubmit: () => void;
  onCancel: () => void;
  onSelectChange: (image: Item<string>[]) => void;
  isSubmitting: boolean;
  disabled?: boolean;
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
    const {
      currentUser,
      classes,
      label,
      revision,
      description,
      script,
      errors,
      onSelectChange,
      onSubmit,
      onCancel,
      isSubmitting,
      images,
      disabled
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const selectedImages = imageToItem(images.selected);

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <Grid container>
            <Grid item className={classes.gridWithTips}>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="end">
                      {currentUser} /
                    </InputAdornment>
                  )
                }}
                label="StackScript Label"
                required
                onChange={label.handler}
                placeholder="Enter a label"
                value={label.value}
                errorText={hasErrorFor('label')}
                tooltipText="Give your StackScript a label"
                className={classes.labelField}
                disabled={disabled}
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
                disabled={disabled}
                data-qa-stackscript-description
              />
              <FormControl fullWidth>
                <InputLabel
                  htmlFor="image"
                  disableAnimation
                  shrink={true}
                  disabled={disabled}
                  required
                >
                  Target Images
                </InputLabel>
                <ImageSelect
                  images={images.available}
                  onSelect={onSelectChange}
                  value={selectedImages}
                  isMulti
                  imageFieldError={hasErrorFor('images')}
                  helperText={
                    'Select which images are compatible with this StackScript.'
                  }
                  disabled={disabled}
                  data-qa-stackscript-target-select
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.gridWithTips}>
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
            disabled={disabled}
            data-qa-stackscript-script
          />
          <TextField
            label="Revision Note"
            placeholder="Enter a revision note"
            onChange={revision.handler}
            value={revision.value}
            InputProps={{ className: classes.revisionTextarea }}
            disabled={disabled}
            data-qa-stackscript-revision
          />
          <ActionsPanel style={{ paddingBottom: 0 }}>
            <Button
              onClick={onSubmit}
              buttonType="primary"
              loading={isSubmitting}
              disabled={disabled}
              data-qa-save
            >
              Save
            </Button>
            <Button
              onClick={onCancel}
              buttonType="secondary"
              className="cancel"
              disabled={disabled}
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

const styled = withStyles(styles);

export default styled(StackScriptForm);
