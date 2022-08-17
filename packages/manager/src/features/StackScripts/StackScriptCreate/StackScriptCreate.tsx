import { Account, Grant } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import {
  createStackScript,
  getStackScript,
  StackScript,
  StackScriptPayload,
  updateStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withImages from 'src/containers/withImages.container';
import { StackScripts } from 'src/documentation';
import {
  getGrants,
  hasGrant,
  isRestrictedUser,
} from 'src/features/Profile/permissionsHelpers';
import ScriptForm from 'src/features/StackScripts/StackScriptForm';
import { filterImagesByType } from 'src/store/image/image.helpers';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';
import { debounce } from 'throttle-debounce';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/profile';
import withProfile, { ProfileProps } from 'src/components/withProfile';

type ClassNames = 'backButton' | 'createTitle';

const styles = (theme: Theme) =>
  createStyles({
    backButton: {
      margin: '5px 0 0 -16px',
      '& svg': {
        width: 34,
        height: 34,
      },
    },
    createTitle: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  });

interface State {
  label: string;
  description: string;
  images: string[];
  script: string;
  revisionNote: string;
  isSubmitting: boolean;
  errors?: APIError[];
  dialogOpen: boolean;
  apiResponse?: StackScript;
  isLoadingStackScript: boolean;
  updated: string;
}

interface Props {
  mode: 'create' | 'edit';
}

type CombinedProps = Props &
  ProfileProps &
  WithImagesProps &
  SetDocsProps &
  WithStyles<ClassNames> &
  RouteComponentProps<{ stackScriptID: string }>;

const errorResources = {
  label: 'A label',
  images: 'Images',
  script: 'A script',
};

export class StackScriptCreate extends React.Component<CombinedProps, State> {
  state: State = {
    label: '',
    description: '',
    images: [],
    /* available images to select from in the dropdown */
    script: '',
    revisionNote: '',
    isSubmitting: false,
    dialogOpen: false,
    isLoadingStackScript: false,
    updated: '',
  };

  static docs = [StackScripts];

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    const {
      match: {
        params: { stackScriptID },
      },
    } = this.props;
    const valuesFromStorage = storage.stackScriptInProgress.get();
    const account = queryClient.getQueryData<Account>('account');

    if (stackScriptID) {
      // If we have a stackScriptID we're in the edit flow and
      // should request the stackscript.
      this.setState({ isLoadingStackScript: true });
      getStackScript(+stackScriptID)
        .then((response) => {
          const responseUpdated = Date.parse(response.updated);
          const localUpdated = Date.parse(valuesFromStorage.updated);
          const stackScriptHasBeenUpdatedElsewhere =
            responseUpdated > localUpdated;
          if (
            response.id === valuesFromStorage.id &&
            !stackScriptHasBeenUpdatedElsewhere
          ) {
            this.setState({
              label: valuesFromStorage.label ?? '',
              description: valuesFromStorage.description ?? '',
              images: valuesFromStorage.images ?? [],
              script: valuesFromStorage.script ?? '',
              revisionNote: valuesFromStorage.rev_note ?? '',
              isLoadingStackScript: false,
              apiResponse: response,
            });
          } else {
            this.setState({
              label: response.label,
              description: response.description,
              images: response.images,
              revisionNote: response.rev_note,
              script: response.script,
              apiResponse: response, // Saved for use when resetting the form
              isLoadingStackScript: false,
              updated: response.updated,
            });
          }
        })
        .catch((error) => {
          this.setState({ errors: error, isLoadingStackScript: false });
        });
    } else if (valuesFromStorage.id === account?.euuid) {
      /**
       * We're creating a stackscript and we have cached
       * data from a user that was creating a stackscript,
       * so load that in.
       */
      this.setState({
        label: valuesFromStorage.label ?? '',
        description: valuesFromStorage.description ?? '',
        images: valuesFromStorage.images ?? [],
        script: valuesFromStorage.script ?? '',
        revisionNote: valuesFromStorage.rev_note ?? '',
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  _saveStateToLocalStorage = () => {
    const {
      label,
      description,
      script,
      images,
      revisionNote: rev_note,
      updated,
    } = this.state;
    const {
      mode,
      match: {
        params: { stackScriptID },
      },
    } = this.props;
    const account = queryClient.getQueryData<Account>('account');

    if (account) {
      // Use the euuid if we're creating to avoid loading another user's data
      // (if an expired token has left stale values in local storage)
      const id = mode === 'create' ? account.euuid : +stackScriptID;

      storage.stackScriptInProgress.set({
        id,
        label,
        description,
        script,
        images,
        rev_note,
        updated,
      });
    }
  };

  saveStateToLocalStorage = debounce(1000, this._saveStateToLocalStorage);

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ label: e.target.value }, this.saveStateToLocalStorage);
  };

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      { description: e.target.value },
      this.saveStateToLocalStorage
    );
  };

  handleChooseImage = (images: Item<string>[]) => {
    const imageList = images.map((image) => image.value);

    const anyAllOptionChosen = imageList.includes('any/all');

    this.setState(
      {
        /*
        'Any/All' indicates all image options are compatible with the StackScript,
        so users are not allowed to add additional selections.
        */
        images: anyAllOptionChosen ? ['any/all'] : imageList,
      },
      this.saveStateToLocalStorage
    );
  };

  handleChangeScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ script: e.target.value }, this.saveStateToLocalStorage);
  };

  handleChangeRevisionNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      { revisionNote: e.target.value },
      this.saveStateToLocalStorage
    );
  };

  resetAllFields = (payload?: StackScript) => {
    this.handleCloseDialog();
    this.setState(
      {
        script: payload?.script ?? '',
        label: payload?.label ?? '',
        images: payload?.images ?? [],
        description: payload?.description ?? '',
        revisionNote: payload?.rev_note ?? '',
      },
      this.saveStateToLocalStorage
    );
  };

  handleError = (errors: APIError[]) => {
    if (!this.mounted) {
      return;
    }

    this.setState(
      () => ({
        isSubmitting: false,
        errors,
      }),
      () => {
        scrollErrorIntoView();
      }
    );
  };

  handleUpdateStackScript = (payload: StackScriptPayload) => {
    const {
      history,
      match: {
        params: { stackScriptID },
      },
    } = this.props;

    return updateStackScript(+stackScriptID, payload)
      .then((updatedStackScript: StackScript) => {
        if (!this.mounted) {
          return;
        }
        this.setState({ isSubmitting: false });
        this.resetAllFields(updatedStackScript);
        history.push('/stackscripts/account', {
          successMessage: `${updatedStackScript.label} successfully updated`,
        });
      })
      .catch(this.handleError);
  };

  handleCreateStackScript = (payload: StackScriptPayload) => {
    const { history, profile } = this.props;
    createStackScript(payload)
      .then((stackScript: StackScript) => {
        if (!this.mounted) {
          return;
        }
        if (profile.data?.restricted) {
          queryClient.invalidateQueries(`${queryKey}-grants`);
        }
        this.setState({ isSubmitting: false });
        this.resetAllFields();
        history.push('/stackscripts/account', {
          successMessage: `${stackScript.label} successfully created`,
        });
      })
      .catch(this.handleError);
  };

  generatePayload = () => {
    const { script, label, images, description, revisionNote } = this.state;

    return {
      script,
      label,
      images,
      description,
      rev_note: revisionNote,
    };
  };

  hasUnsavedChanges = () => {
    const {
      apiResponse,
      script,
      label,
      images,
      description,
      revisionNote,
    } = this.state;
    if (!apiResponse) {
      // Create flow; return true if there's any input anywhere
      return (
        script || label || images.length > 0 || description || revisionNote
      );
    } else {
      // Edit flow; return true if anything has changes
      return (
        script !== apiResponse.script ||
        label !== apiResponse.label ||
        !equals(images, apiResponse.images) ||
        description !== apiResponse.description ||
        revisionNote !== apiResponse.rev_note
      );
    }
  };

  handleSubmit = () => {
    const { mode } = this.props;

    const payload = this.generatePayload();

    if (!this.mounted) {
      return;
    }

    this.setState({ isSubmitting: true });

    if (mode === 'create') {
      this.handleCreateStackScript(payload);
    } else {
      this.handleUpdateStackScript(payload);
    }
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
          buttonType="secondary"
          onClick={this.handleCloseDialog}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={() => this.resetAllFields(this.state.apiResponse)}
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
      location,
      imagesData,
      mode,
      grants,
      profile,
      match: {
        params: { stackScriptID },
      },
    } = this.props;
    const {
      images,
      script,
      label,
      description,
      revisionNote,
      errors,
      isSubmitting,
      isLoadingStackScript,
      // apiResponse
    } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const hasUnsavedChanges = this.hasUnsavedChanges();

    const availableImages = Object.values(imagesData).filter(
      (thisImage) =>
        !this.state.images.includes(thisImage.id) &&
        !thisImage.label.match(/kube/i)
    );

    const stackScriptGrants = getGrants(grants.data, 'stackscript');

    const grantsForThisStackScript = stackScriptGrants.find(
      (eachGrant: Grant) => eachGrant.id === Number(stackScriptID)
    );

    const userCannotCreateStackScripts =
      isRestrictedUser() && !hasGrant('add_stackscripts');
    const userCannotModifyStackScript =
      isRestrictedUser() &&
      grantsForThisStackScript?.permissions !== 'read_write';

    const shouldDisable =
      (mode === 'edit' && userCannotModifyStackScript) ||
      (mode === 'create' && userCannotCreateStackScripts);

    if (!profile.data?.username) {
      return (
        <ErrorState errorText="An error has occurred. Please try again." />
      );
    }

    if (isLoadingStackScript) {
      return <CircleProgress />;
    }

    const pageTitle = mode === 'create' ? 'Create' : 'Edit';

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={pageTitle} />
        {generalError && <Notice error text={generalError} />}
        <Grid container justifyContent="space-between">
          <Grid item className="py0">
            <Breadcrumb
              pathname={location.pathname}
              labelTitle={pageTitle}
              className={classes.createTitle}
              crumbOverrides={[
                {
                  position: 1,
                  label: 'StackScripts',
                },
              ]}
              data-qa-create-stackscript-breadcrumb
            />
          </Grid>
        </Grid>
        {shouldDisable && (
          <Notice
            text={`You don't have permission to ${
              mode === 'create'
                ? 'create StackScripts'
                : 'edit this StackScript'
            }. Please contact an account administrator for details.`}
            error={true}
            important
          />
        )}
        <ScriptForm
          currentUser={profile.data?.username || ''}
          disableSubmit={!hasUnsavedChanges}
          disabled={shouldDisable}
          mode={mode}
          images={{
            available: availableImages,
            selected: images,
          }}
          label={{
            value: label,
            handler: this.handleLabelChange,
          }}
          description={{
            value: description,
            handler: this.handleDescriptionChange,
          }}
          revision={{
            value: revisionNote,
            handler: this.handleChangeRevisionNote,
          }}
          script={{
            value: script,
            handler: this.handleChangeScript,
          }}
          onSelectChange={this.handleChooseImage}
          errors={errors}
          onSubmit={this.handleSubmit}
          onCancel={this.handleOpenDialog}
          isSubmitting={isSubmitting}
        />
        {this.renderCancelStackScriptDialog()}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

interface WithImagesProps {
  imagesData: Record<string, Image>;
  imagesLoading: boolean;
  imagesError?: APIError[];
}

const enhanced = compose<CombinedProps, Props>(
  setDocs(StackScriptCreate.docs),
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData: filterImagesByType(imagesData, 'public'),
    imagesLoading,
    imagesError,
  })),
  styled,
  withRouter,
  withProfile
);

export default enhanced(StackScriptCreate);
