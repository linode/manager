import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import withImages from 'src/containers/withImages.container';
import { StackScripts } from 'src/documentation';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import ScriptForm from 'src/features/StackScripts/StackScriptForm';
import { getStackScript, updateStackScript } from 'src/services/stackscripts';
import { MapState } from 'src/store/types';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'backButton' | 'titleWrapper' | 'createTitle';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
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
  titleWrapper: {
    display: 'flex',
    marginTop: 5,
    marginBottom: 20,
    alignItems: 'center',
    wordBreak: 'break-all'
  }
});

interface PreloadedProps {
  stackScript: { response: Linode.StackScript.Response };
}

interface State {
  stackScript: Linode.StackScript.Response;
  retrievalError?: Error; // error retrieving the stackscript
  labelText: string;
  descriptionText: string;
  selectedImages: string[];
  availableImages: Linode.Image[];
  script: string;
  revisionNote: string;
  isSubmitting: boolean;
  errors?: Linode.ApiFieldError[];
  dialogOpen: boolean;
}

type CombinedProps = StateProps &
  WithImagesProps &
  SetDocsProps &
  WithStyles<ClassNames> &
  PreloadedProps &
  RouteComponentProps<{ stackScriptID?: string }>;

const preloaded = PromiseLoader<CombinedProps>({
  stackScript: ({
    match: {
      params: { stackScriptID }
    }
  }) => {
    if (!stackScriptID) {
      return Promise.reject(new Error('stackScriptID param not set.'));
    }
    return getStackScript(+stackScriptID).then(response => response || []);
  }
});

const errorResources = {
  label: 'A label',
  images: 'Images',
  script: 'A script'
};

export class StackScriptUpdate extends React.Component<CombinedProps, State> {
  defaultStackScriptValues = {
    labelText: pathOr(undefined, ['response', 'label'], this.props.stackScript),
    descriptionText: pathOr(
      undefined,
      ['response', 'description'],
      this.props.stackScript
    ),
    selectedImages: pathOr(
      undefined,
      ['response', 'images'],
      this.props.stackScript
    ),
    script: pathOr(undefined, ['response', 'script'], this.props.stackScript),
    revisionNote: pathOr(
      undefined,
      ['response', 'rev_note'],
      this.props.stackScript
    )
  };

  constructor(props: CombinedProps) {
    super(props);

    this.state = {
      stackScript: pathOr(undefined, ['response'], this.props.stackScript),
      retrievalError: pathOr(undefined, ['error'], this.props.stackScript),
      labelText: this.defaultStackScriptValues.labelText,
      descriptionText: this.defaultStackScriptValues.descriptionText,
      selectedImages: this.defaultStackScriptValues.selectedImages,
      /* available images to select from in the dropdown */
      availableImages: this.props.imagesData,
      script: this.defaultStackScriptValues.script,
      revisionNote: this.defaultStackScriptValues.revisionNote,
      isSubmitting: false,
      dialogOpen: false
    };
  }

  static docs = [StackScripts];

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ labelText: e.target.value });
  };

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ descriptionText: e.target.value });
  };

  handleChooseImage = (images: Item<string>[]) => {
    this.setState({
      selectedImages: images.map(image => image.value)
    });
  };

  handleChangeScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ script: e.target.value });
  };

  handleChangeRevisionNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ revisionNote: e.target.value });
  };

  resetAllFields = () => {
    this.handleCloseDialog();
    this.setState({
      ...this.defaultStackScriptValues,
      availableImages: this.props.imagesData
    });
  };

  handleUpdateStackScript = () => {
    const {
      script,
      labelText,
      selectedImages,
      descriptionText,
      revisionNote
    } = this.state;

    const { stackScript } = this.props;

    const { history } = this.props;

    if (selectedImages.length < 1) {
      return this.setState({
        errors: [{ field: 'images', reason: 'An image is required.' }]
      });
    }

    const payload = {
      script,
      label: labelText,
      images: selectedImages,
      description: descriptionText,
      rev_note: revisionNote
    };

    if (!this.mounted) {
      return;
    }
    this.setState({ isSubmitting: true });

    updateStackScript(stackScript.response.id, payload)
      .then((updatedStackScript: Linode.StackScript.Response) => {
        if (!this.mounted) {
          return;
        }
        this.setState({ isSubmitting: false });
        history.push('/stackscripts', {
          successMessage: `${updatedStackScript.label} successfully updated`
        });
      })
      .catch((error: Linode.TodoAny) => {
        if (!this.mounted) {
          return;
        }

        this.setState(
          () => ({
            isSubmitting: false,
            errors:
              error.response &&
              error.response.data &&
              error.response.data.errors
          }),
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true });
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

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
    );
  };

  renderCancelStackScriptDialog = () => {
    const { dialogOpen } = this.state;

    return (
      <ConfirmationDialog
        title={`Clear StackScript Configuration?`}
        open={dialogOpen}
        actions={this.renderDialogActions}
        onClose={this.handleCloseDialog}
      >
        <Typography>
          Are you sure you want to reset your StackScript configuration?
        </Typography>
      </ConfirmationDialog>
    );
  };

  render() {
    const {
      classes,
      username,
      imagesLoading,
      userCannotModifyStackScript
    } = this.props;
    const {
      availableImages,
      selectedImages,
      script,
      labelText,
      descriptionText,
      revisionNote,
      errors,
      isSubmitting
    } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    if (!username) {
      return (
        <ErrorState errorText="An error has occurred, please reload and try again." />
      );
    }

    if (imagesLoading) {
      return <CircleProgress />;
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment
          segment={`${this.defaultStackScriptValues.labelText} - Edit`}
        />
        {generalError && <Notice error text={generalError} />}
        <Grid container justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <Breadcrumb
              linkTo="/stackscripts"
              linkText="StackScripts"
              labelTitle="Edit StackScript"
              data-qa-update-stackscript-breadcrumb
            />
          </Grid>
        </Grid>
        {/* If a user doesn't have permissions to modify a StackScript, they
        won't see an "Edit" button in the Action Menu, which means they'll most
        likely never see this page. But if they go to /stackscripts/:id/edit,
        they will, so we disable the forms and show an appropriate error message.
        */}
        {userCannotModifyStackScript && (
          <Notice
            text={
              "You don't have permissions to modify this StackScript. Please contact an account administrator for details."
            }
            error={true}
            important
          />
        )}
        {imagesLoading ? (
          <CircleProgress />
        ) : (
          <ScriptForm
            currentUser={username}
            disabled={userCannotModifyStackScript}
            images={{
              available: availableImages,
              selected: selectedImages
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
            onSelectChange={this.handleChooseImage}
            errors={errors}
            onSubmit={this.handleUpdateStackScript}
            onCancel={this.handleOpenDialog}
            isSubmitting={isSubmitting}
          />
        )}
        {this.renderCancelStackScriptDialog()}
      </React.Fragment>
    );
  }
}

interface StateProps {
  username?: string;
  userCannotModifyStackScript: boolean;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (
  state,
  ownProps
) => {
  // Grab StackScriptID from the URL (query param)
  const stackScriptID = ownProps.match.params.stackScriptID;

  const stackScriptGrants = pathOr(
    [],
    ['__resources', 'profile', 'data', 'grants', 'stackscript'],
    state
  );
  const grantsForThisStackScript = stackScriptGrants.find(
    (eachGrant: Linode.Grant) => eachGrant.id === Number(stackScriptID)
  );

  return {
    username: path(['data', 'username'], state.__resources.profile),
    userCannotModifyStackScript:
      isRestrictedUser(state) &&
      grantsForThisStackScript &&
      grantsForThisStackScript.permissions === 'read_only'
  };
};

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

const reloaded = reloadableWithRouter<
  PreloadedProps,
  { stackScriptID?: number }
>((routePropsOld, routePropsNew) => {
  return (
    routePropsOld.match.params.stackScriptID !==
    routePropsNew.match.params.stackScriptID
  );
});

interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
  imagesError?: Linode.ApiFieldError[];
}
const enhanced = compose<CombinedProps, {}>(
  setDocs(StackScriptUpdate.docs),
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData: imagesData.filter(i => i.is_public === true),
    imagesLoading,
    imagesError
  })),
  styled,
  connected,
  reloaded,
  preloaded
);

export default enhanced(StackScriptUpdate);
