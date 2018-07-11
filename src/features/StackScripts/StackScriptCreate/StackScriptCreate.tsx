import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { compose, pathOr } from 'ramda';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { KeyboardArrowLeft } from '@material-ui/icons';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Checkbox from 'src/components/CheckBox';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import Select from 'src/components/Select';
import Tag from 'src/components/Tag';
import TextField from 'src/components/TextField';

import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';

import { getLinodeImages } from 'src/services/images';
import { createStackScript } from 'src/services/stackscripts';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root'
  | 'backButton'
  | 'titleWrapper'
  | 'createTitle'
  | 'labelField'
  | 'gridWithTips'
  | 'tips'
  | 'chipsContainer'
  | 'warning'
  | 'targetTag';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
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
    },
  },
  tips: {
    marginLeft: theme.spacing.unit * 4,
    marginTop: theme.spacing.unit * 4,
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
    marginTop: theme.spacing.unit * 2,
  },
  targetTag: {
    margin: `${theme.spacing.unit}px ${theme.spacing.unit}px 0 0`,
  },
});

interface Props {
  profile: Linode.Profile;
}

interface PreloadedProps {
  images: { response: Linode.Image[] }
}

interface State {
  labelText: string;
  descriptionText: string;
  imageSelectOpen: boolean;
  selectedImages: string[];
  availableImages: Linode.Image[];
  script: string;
  revisionNote: string;
  is_public: boolean;
  isSubmitting: boolean;
  errors?: Linode.ApiFieldError[];
  dialogOpen: boolean;
}

type CombinedProps = Props
  & SetDocsProps
  & WithStyles<ClassNames>
  & PreloadedProps
  & RouteComponentProps<{}>;

const preloaded = PromiseLoader<Props>({
  images: () => getLinodeImages()
    .then(response => response.data || [])
})

const errorResources = {
  label: 'A label',
  images: 'Images',
  script: 'A script'
};

export class StackScriptCreate extends React.Component<CombinedProps, State> {
  state: State = {
    labelText: '',
    descriptionText: '',
    imageSelectOpen: false,
    selectedImages: [],
    /* available images to select from in the dropdown */
    availableImages: this.props.images.response,
    script: '',
    revisionNote: '',
    is_public: false,
    isSubmitting: false,
    dialogOpen: false,
  };

  static docs = [
    {
      title: 'Automate Deployment with StackScripts',
      src: 'https://www.linode.com/docs/platform/stackscripts/',
      body: `Create Custom Instances and Automate Deployment with StackScripts.`,
    },
  ];

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  /*
  * Gets images by two types: deprecated and non-deprecated
  */
  getImagesByDeprecationStatus = (deprecated: boolean) => {
    return this.state.availableImages.filter(image => image.deprecated === deprecated);
  }

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ labelText: e.target.value });
  }

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ descriptionText: e.target.value });
  }

  handleOpenSelect = () => {
    this.setState({ imageSelectOpen: true });
  }

  handleCloseSelect = () => {
    this.setState({ imageSelectOpen: false });
  }

  handleRemoveImage = (indexToRemove: any) => {
    /*
    * remove selected image from the selected list
    */
    const selectedImagesCopy = this.state.selectedImages;
    const removedImage = selectedImagesCopy.splice(indexToRemove, 1);

    /*
    * add the remvoed image back to the selection list
    */
    const availableImagesCopy = this.state.availableImages;
    const imageToBeReAdded = this.props.images.response.find(image =>
      image.id === removedImage[0]);
    availableImagesCopy.unshift(imageToBeReAdded!);

    this.setState({
      selectedImages: selectedImagesCopy,
      availableImages: availableImagesCopy,
    });
  }

  handleChooseImage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { availableImages } = this.state;
    const filteredAvailableImages = availableImages.filter((image) => {
      return image.id !== e.target.value;
    })
    this.setState({
      selectedImages: [...this.state.selectedImages, e.target.value],
      availableImages: filteredAvailableImages,
    })
    this.setState({ imageSelectOpen: true });
  }

  handleChangeScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ script: e.target.value });
  }

  handleChangeRevisionNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ revisionNote: e.target.value });
  }

  handleToggleIsPublic = () => {
    this.setState({ is_public: !this.state.is_public });
  }

  resetAllFields = () => {
    this.handleCloseDialog();
    this.setState({
      script: '',
      labelText: '',
      selectedImages: [],
      descriptionText: '',
      is_public: false,
      revisionNote: '',
    })
  }

  handleCreateStackScript = () => {
    const { script, labelText, selectedImages, descriptionText,
      is_public, revisionNote } = this.state;

    const { history } = this.props;

    const payload = {
      script,
      label: labelText,
      images: selectedImages,
      description: descriptionText,
      is_public,
      rev_note: revisionNote,
    }

    if (!this.mounted) { return; }
    this.setState({ isSubmitting: true });

    createStackScript(payload)
      .then(stackScript => {
        if (!this.mounted) { return; }
        this.setState({ isSubmitting: false });
        history.push('/stackscripts');
      })
      .catch(error => {
        if (!this.mounted) { return; }

        this.setState(() => ({
          isSubmitting: false,
          errors: error.response && error.response.data && error.response.data.errors,
        }), () => {
          scrollErrorIntoView();
        });
      })
  }

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true })
  }

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false })
  }

  renderDialogActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            type="secondary"
            destructive
            onClick={this.resetAllFields}>
            Yes
          </Button>
          <Button
            type="cancel"
            onClick={this.handleCloseDialog}
          >
            No
          </Button>
        </ActionsPanel>
      </React.Fragment>
    )
  }

  renderCancelStackScriptDialog = () => {
    const { dialogOpen } = this.state;

    return (
      <ConfirmationDialog
        title={`Clear StackScript Configuration?`}
        open={dialogOpen}
        actions={this.renderDialogActions}
        onClose={this.handleCloseDialog}
      >
        <Typography>Are you sure you want to reset your StackScript configuration?</Typography>
      </ConfirmationDialog>
    )
  }

  render() {
    const { classes, profile } = this.props;
    const { selectedImages, script,
      labelText, descriptionText, revisionNote, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {generalError &&
          <Notice error text={generalError} />
        }
        <Grid
          container
          justify="space-between"
        >
          <Grid item className={classes.titleWrapper}>
            <Link to={`/stackscripts`}>
              <IconButton
                className={classes.backButton}
              >
                <KeyboardArrowLeft />
              </IconButton>
            </Link>
            <Typography className={classes.createTitle} variant="headline">
              Create New StackScript
            </Typography>
          </Grid>
        </Grid>
        <Paper className={classes.root}>
          <Grid container>
            <Grid item className={classes.gridWithTips}>
              <TextField
                InputProps={{
                  startAdornment:
                    <InputAdornment position="end">
                      {profile.username} /
                    </InputAdornment>,
                }}
                label='StackScript Label'
                required
                onChange={this.handleLabelChange}
                placeholder='Enter a label'
                value={labelText}
                errorText={hasErrorFor('label')}
                tooltipText="Select a StackScript Label"
                className={classes.labelField}
              />
              <TextField
                multiline
                rows={1}
                label="Description"
                placeholder="Enter a description"
                onChange={this.handleDescriptionChange}
                value={descriptionText}
                tooltipText="Give your StackScript a description"
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
                  open={this.state.imageSelectOpen}
                  onOpen={this.handleOpenSelect}
                  onClose={this.handleCloseSelect}
                  value='none'
                  onChange={this.handleChooseImage}
                  inputProps={{ name: 'image', id: 'image' }}
                  helpText='Select which images are compatible with this StackScript'
                  error={Boolean(hasErrorFor('images'))}
                  errorText={hasErrorFor('images')}
                >
                  <MenuItem disabled key="none" value="none">Select Compatible Images</MenuItem>,
                {this.getImagesByDeprecationStatus(false).map(image =>
                    <MenuItem
                      key={image.id}
                      value={image.id}
                    >
                      {image.label}
                    </MenuItem>,
                  )}
                  <MenuItem disabled key="deprecated" value="deprecated">Older Images</MenuItem>,
                {this.getImagesByDeprecationStatus(true).map(image =>
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
                {selectedImages && selectedImages.map((selectedImage, index) => {
                  return (
                    <Tag
                      key={selectedImage}
                      label={selectedImage}
                      variant='lightBlue'
                      onDelete={() => this.handleRemoveImage(index)}
                      className={classes.targetTag}
                    />
                  )
                })}
              </div>
            </Grid>
            <Grid item className={classes.gridWithTips}>
              <Notice
                className={classes.tips}
                component="div"
              >
                <Typography variant="title">Tips</Typography>
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
          <TextField
            multiline
            rows={1}
            label="Script"
            placeholder={`#!/bin/bash \n\n# Your script goes here`}
            onChange={this.handleChangeScript}
            value={script}
            errorText={hasErrorFor('script')}
            required
          />
          <TextField
            multiline
            rows={1}
            label="Revision Note"
            placeholder='Enter a revision note'
            onChange={this.handleChangeRevisionNote}
            value={revisionNote}
          />
          <Notice
            component="div"
            warning
            flag
            className={classes.warning}
          >
            <Typography variant="title">Woah, just a word of caution...</Typography>
            <Typography>
              Making this StackScript public cannot be undone. Once made public, your StackScript will
              be available to all Linode users and can be used to provision new Linodes.
            </Typography>
          </Notice>
          <FormControlLabel
            control={
              <Checkbox
                name='make_public'
                variant='warning'
                onChange={this.handleToggleIsPublic}
                checked={this.state.is_public}
              />
            }
            label="Publish this StackScript to the Public Library"
          />
          <ActionsPanel style={{ paddingBottom: 0 }}>
            <Button
              data-qa-confirm-cancel
              onClick={this.handleCreateStackScript}
              type="primary"
              loading={this.state.isSubmitting}
            >
              Save
            </Button>
            <Button
              onClick={this.handleOpenDialog}
              type="secondary"
              className="cancel"
              data-qa-cancel-cancel
            >
              Cancel
            </Button>
          </ActionsPanel>
        </Paper>
        {this.renderCancelStackScriptDialog()}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: Linode.AppState) => ({
  profile: pathOr({}, ['resources', 'profile', 'data'], state),
});

const styled = withStyles(styles, { withTheme: true });

export default compose(
  setDocs(StackScriptCreate.docs),
  styled,
  withRouter,
  connect(mapStateToProps),
  preloaded,
)(StackScriptCreate)
