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

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';

import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';

import { getLinodeImages } from 'src/services/images';
import { createStackScript } from 'src/services/stackscripts';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import ScriptForm from 'src/features/StackScripts/StackScriptForm';

type ClassNames = 'root'
  | 'backButton'
  | 'titleWrapper'
  | 'createTitle';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
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
  titleWrapper: {
    display: 'flex',
    marginTop: 5,
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

  resetAllFields = () => {
    this.handleCloseDialog();
    this.setState({
      script: '',
      labelText: '',
      selectedImages: [],
      descriptionText: '',
      revisionNote: '',
    })
  }

  handleCreateStackScript = () => {
    const { script, labelText, selectedImages, descriptionText, revisionNote } = this.state;

    const { history } = this.props;

    const payload = {
      script,
      label: labelText,
      images: selectedImages,
      description: descriptionText,
      is_public: false,
      rev_note: revisionNote,
    }

    if (!this.mounted) { return; }
    this.setState({ isSubmitting: true });

    createStackScript(payload)
      .then((stackScript: Linode.StackScript.Response) => {
        if (!this.mounted) { return; }
        this.setState({ isSubmitting: false });
        history.push(
          '/stackscripts',
          { successMessage: `${stackScript.label} successfully created` }
        );
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
      <ActionsPanel>
        <Button
          type="cancel"
          onClick={this.handleCloseDialog}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          type="secondary"
          destructive
          onClick={this.resetAllFields}
          data-qa-confirm-cancel
          >
        Reset
        </Button>
      </ActionsPanel>
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
    const { availableImages, selectedImages, script,
      labelText, descriptionText, revisionNote, errors,
    isSubmitting } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Create New StackScript" />
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
            <Typography
              role="header"
              className={classes.createTitle}
              variant="headline"
              data-qa-create-header
            >
              Create New StackScript
            </Typography>
          </Grid>
        </Grid>
        <ScriptForm
          currentUser={profile.username}
          images={{
            available: availableImages,
            selected: selectedImages,
            handleRemove: this.handleRemoveImage
          }}
          label={{
            value: labelText,
            handler: this.handleLabelChange
          }}
          description={{
            value: descriptionText,
            handler: this.handleDescriptionChange
          }}
          revision={{
            value: revisionNote,
            handler: this.handleChangeRevisionNote
          }}
          script={{
            value: script,
            handler: this.handleChangeScript
          }}
          selectImages={{
            open: this.state.imageSelectOpen, // idk
            onOpen: this.handleOpenSelect,
            onClose: this.handleCloseSelect,
            onChange: this.handleChooseImage
          }}
          errors={errors}
          onSubmit={this.handleCreateStackScript}
          onCancel={this.handleOpenDialog}
          isSubmitting={isSubmitting}
        />
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
