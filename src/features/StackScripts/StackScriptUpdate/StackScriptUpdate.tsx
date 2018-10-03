import { clone, compose, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import ScriptForm from 'src/features/StackScripts/StackScriptForm';
import { getLinodeImages } from 'src/services/images';
import { getStackScript, updateStackScript } from 'src/services/stackscripts';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root'
  | 'backButton'
  | 'titleWrapper'
  | 'createTitle';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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

interface PreloadedProps {
  images: { response: Linode.Image[] }
  stackScript: { response: Linode.StackScript.Response }
}

interface State {
  stackScript: Linode.StackScript.Response;
  retrievalError?: Error; // error retrieving the stackscript
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

type CombinedProps = StateProps
  & SetDocsProps
  & WithStyles<ClassNames>
  & PreloadedProps
  & RouteComponentProps<{ stackScriptID?: number }>;

const preloaded = PromiseLoader<CombinedProps>({
  images: () => getLinodeImages()
    .then(response => response.data || []),
  stackScript: ({ match: { params: { stackScriptID } } }) => {
    if (!stackScriptID) {
      return Promise.reject(new Error('stackScriptID param not set.'));
    }
    return getStackScript(stackScriptID)
      .then(response => response || [])
  }
})

const errorResources = {
  label: 'A label',
  images: 'Images',
  script: 'A script'
};

export class StackScriptUpdate extends React.Component<CombinedProps, State> {

  defaultStackScriptValues = {
    labelText: pathOr(undefined, ['response', 'label'], this.props.stackScript),
    descriptionText: pathOr(undefined, ['response', 'description'], this.props.stackScript),
    selectedImages: pathOr(undefined, ['response', 'images'], this.props.stackScript),
    script: pathOr(undefined, ['response', 'script'], this.props.stackScript),
    revisionNote: pathOr(undefined, ['response', 'rev_note'], this.props.stackScript),
  }

  constructor(props: CombinedProps) {
    super(props);

    this.state = {
      stackScript: pathOr(undefined, ['response'], this.props.stackScript),
      retrievalError: pathOr(undefined, ['error'], this.props.stackScript),
      labelText: this.defaultStackScriptValues.labelText,
      descriptionText: this.defaultStackScriptValues.descriptionText,
      imageSelectOpen: false,
      selectedImages: this.defaultStackScriptValues.selectedImages,
      /* available images to select from in the dropdown */
      availableImages: this.availableImages,
      script: this.defaultStackScriptValues.script,
      revisionNote: this.defaultStackScriptValues.revisionNote,
      isSubmitting: false,
      dialogOpen: false,
    }
  }

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
  * Filter out already selected images in the available images dropdown
  */
  availableImages = this.props.images.response.filter(image => {
    if (this.defaultStackScriptValues.selectedImages) {
      for (const compatibleImage of this.defaultStackScriptValues.selectedImages) {
        // if the stackscript already has the image attached to it
        // do not render it in the dropdown
        if (compatibleImage === image.id) {
          return false;
        }
      }
    }
    return true;
  })

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
    const selectedImagesCopy = clone(this.state.selectedImages);
    const removedImage = selectedImagesCopy.splice(indexToRemove, 1);

    /*
    * add the remvoed image back to the selection list
    */
    const availableImagesCopy = clone(this.state.availableImages);
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
      ...this.defaultStackScriptValues,
      availableImages: this.availableImages,
    })
  }

  handleUpdateStackScript = () => {
    const { script, labelText, selectedImages, descriptionText, revisionNote } = this.state;

    const { stackScript } = this.props;

    const { history } = this.props;

    const payload = {
      script,
      label: labelText,
      images: selectedImages,
      description: descriptionText,
      rev_note: revisionNote,
    }

    if (!this.mounted) { return; }
    this.setState({ isSubmitting: true });

    updateStackScript(stackScript.response.id, payload)
      .then((updatedStackScript: Linode.StackScript.Response) => {
        if (!this.mounted) { return; }
        this.setState({ isSubmitting: false });
        history.push(
          '/stackscripts',
          { successMessage: `${updatedStackScript.label} successfully updated` }
        );
      })
      .catch((error: Linode.TodoAny) => {
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
          No
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
    const { classes, username } = this.props;
    const { availableImages, selectedImages, script,
      labelText, descriptionText, revisionNote, errors,
      isSubmitting } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    if (!username) {
      return <ErrorState errorText="An error has occured, please reload and try again." />
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${this.defaultStackScriptValues.labelText} - Edit`} />
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
              data-qa-edit-header
            >
              Edit StackScript
            </Typography>
          </Grid>
        </Grid>
        <ScriptForm
          currentUser={username}
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
          onSubmit={this.handleUpdateStackScript}
          onCancel={this.handleOpenDialog}
          isSubmitting={isSubmitting}
        />
        {this.renderCancelStackScriptDialog()}
      </React.Fragment>
    );
  }
}

interface StateProps {
  username?: string;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state) => ({
  username: path(['data', 'username'], state.__resources.profile),
});

const connected = connect(mapStateToProps);

const styled = withStyles(styles, { withTheme: true });

const reloaded = reloadableWithRouter<PreloadedProps, { stackScriptID?: number }>(
  (routePropsOld, routePropsNew) => {
    return routePropsOld.match.params.stackScriptID !== routePropsNew.match.params.stackScriptID;
  },
);

export default compose(
  setDocs(StackScriptUpdate.docs),
  styled,
  connected,
  reloaded,
  preloaded,
)(StackScriptUpdate)
