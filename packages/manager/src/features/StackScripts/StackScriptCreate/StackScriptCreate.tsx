import { Account, Grant } from '@linode/api-v4/lib/account';
import {
  StackScript,
  StackScriptPayload,
  createStackScript,
  getStackScript,
  updateStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import { equals } from 'ramda';
import * as React from 'react';
import { QueryClient } from 'react-query';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { debounce } from 'throttle-debounce';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Item } from 'src/components/EnhancedSelect/Select';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import withImages, {
  DefaultProps as ImagesProps,
} from 'src/containers/images.container';
import {
  WithProfileProps,
  withProfile,
} from 'src/containers/profile.container';
import {
  WithQueryClientProps,
  withQueryClient,
} from 'src/containers/withQueryClient.container';
import { StackScriptForm } from 'src/features/StackScripts/StackScriptForm/StackScriptForm';
import { queryKey } from 'src/queries/profile';
import { filterImagesByType } from 'src/store/image/image.helpers';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';

interface State {
  apiResponse?: StackScript;
  description: string;
  dialogOpen: boolean;
  errors?: APIError[];
  images: string[];
  isLoadingStackScript: boolean;
  isSubmitting: boolean;
  label: string;
  revisionNote: string;
  script: string;
  updated: string;
}

interface Props {
  mode: 'create' | 'edit';
}

type CombinedProps = Props &
  ImagesProps &
  WithProfileProps &
  RouteComponentProps<{ stackScriptID: string }> &
  WithQueryClientProps;

const errorResources = {
  images: 'Images',
  label: 'A label',
  script: 'A script',
};

export class StackScriptCreate extends React.Component<CombinedProps, State> {
  componentDidMount() {
    this.mounted = true;
    const {
      match: {
        params: { stackScriptID },
      },
    } = this.props;
    const valuesFromStorage = storage.stackScriptInProgress.get();
    const account = this.props.queryClient.getQueryData<Account>('account');

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
              apiResponse: response,
              description: valuesFromStorage.description ?? '',
              images: valuesFromStorage.images ?? [],
              isLoadingStackScript: false,
              label: valuesFromStorage.label ?? '',
              revisionNote: valuesFromStorage.rev_note ?? '',
              script: valuesFromStorage.script ?? '',
            });
          } else {
            this.setState({
              apiResponse: response, // Saved for use when resetting the form
              description: response.description,
              images: response.images,
              isLoadingStackScript: false,
              label: response.label,
              revisionNote: response.rev_note,
              script: response.script,
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
        description: valuesFromStorage.description ?? '',
        images: valuesFromStorage.images ?? [],
        label: valuesFromStorage.label ?? '',
        revisionNote: valuesFromStorage.rev_note ?? '',
        script: valuesFromStorage.script ?? '',
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const {
      grants,
      imagesData,
      location,
      match: {
        params: { stackScriptID },
      },
      mode,
      profile,
    } = this.props;
    const {
      description,
      errors,
      images,
      isLoadingStackScript,
      isSubmitting,
      label,
      revisionNote,
      script,
      // apiResponse
    } = this.state;

    const _imagesData = filterImagesByType(imagesData, 'public');

    const hasErrorFor = getAPIErrorFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const hasUnsavedChanges = this.hasUnsavedChanges();

    const availableImages = Object.values(_imagesData).filter(
      (thisImage) =>
        !this.state.images.includes(thisImage.id) &&
        !thisImage.label.match(/kube/i)
    );

    const stackScriptGrants = grants.data?.stackscript;

    const grantsForThisStackScript = stackScriptGrants?.find(
      (eachGrant: Grant) => eachGrant.id === Number(stackScriptID)
    );

    const userCannotCreateStackScripts =
      profile.data?.restricted && !grants.data?.global.add_stackscripts;
    const userCannotModifyStackScript =
      profile.data?.restricted &&
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
        {generalError && <Notice text={generalError} variant="error" />}
        <LandingHeader
          breadcrumbProps={{
            breadcrumbDataAttrs: {
              'data-qa-create-stackscript-breadcrumb': true,
            },
            crumbOverrides: [
              {
                label: 'StackScripts',
                position: 1,
              },
            ],
            pathname: location.pathname,
          }}
          title={pageTitle}
        />
        {shouldDisable && (
          <Notice
            text={`You don't have permission to ${
              mode === 'create'
                ? 'create StackScripts'
                : 'edit this StackScript'
            }. Please contact an account administrator for details.`}
            important
            variant="error"
          />
        )}
        <StackScriptForm
          description={{
            handler: this.handleDescriptionChange,
            value: description,
          }}
          images={{
            available: availableImages,
            selected: images,
          }}
          label={{
            handler: this.handleLabelChange,
            value: label,
          }}
          revision={{
            handler: this.handleChangeRevisionNote,
            value: revisionNote,
          }}
          script={{
            handler: this.handleChangeScript,
            value: script,
          }}
          currentUser={profile.data?.username || ''}
          disableSubmit={!hasUnsavedChanges}
          disabled={shouldDisable}
          errors={errors}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={this.handleOpenDialog}
          onSelectChange={this.handleChooseImage}
          onSubmit={this.handleSubmit}
        />
        {this.renderCancelStackScriptDialog()}
      </React.Fragment>
    );
  }

  _saveStateToLocalStorage = (queryClient: QueryClient) => {
    const {
      description,
      images,
      label,
      revisionNote: rev_note,
      script,
      updated,
    } = this.state;
    const {
      match: {
        params: { stackScriptID },
      },
      mode,
    } = this.props;
    const account = queryClient.getQueryData<Account>('account');

    if (account) {
      // Use the euuid if we're creating to avoid loading another user's data
      // (if an expired token has left stale values in local storage)
      const id = mode === 'create' ? account.euuid : +stackScriptID;

      storage.stackScriptInProgress.set({
        description,
        id,
        images,
        label,
        rev_note,
        script,
        updated,
      });
    }
  };

  generatePayload = () => {
    const { description, images, label, revisionNote, script } = this.state;

    return {
      description,
      images,
      label,
      rev_note: revisionNote,
      script,
    };
  };

  handleChangeRevisionNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ revisionNote: e.target.value }, () =>
      this.saveStateToLocalStorage(this.props.queryClient)
    );
  };

  handleChangeScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ script: e.target.value }, () =>
      this.saveStateToLocalStorage(this.props.queryClient)
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
      () => this.saveStateToLocalStorage(this.props.queryClient)
    );
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  handleCreateStackScript = (
    payload: StackScriptPayload,
    queryClient: QueryClient
  ) => {
    const { history, profile } = this.props;
    createStackScript(payload)
      .then((stackScript: StackScript) => {
        if (!this.mounted) {
          return;
        }
        if (profile.data?.restricted) {
          queryClient.invalidateQueries([queryKey, 'grants']);
        }
        this.setState({ isSubmitting: false });
        this.resetAllFields();
        history.push('/stackscripts/account', {
          successMessage: `${stackScript.label} successfully created`,
        });
      })
      .catch(this.handleError);
  };

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: e.target.value }, () =>
      this.saveStateToLocalStorage(this.props.queryClient)
    );
  };

  handleError = (errors: APIError[]) => {
    if (!this.mounted) {
      return;
    }

    this.setState(
      () => ({
        errors,
        isSubmitting: false,
      }),
      () => {
        scrollErrorIntoView();
      }
    );
  };

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ label: e.target.value }, () =>
      this.saveStateToLocalStorage(this.props.queryClient)
    );
  };

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true });
  };

  handleSubmit = () => {
    const { mode } = this.props;

    const payload = this.generatePayload();

    if (!this.mounted) {
      return;
    }

    this.setState({ isSubmitting: true });

    if (mode === 'create') {
      this.handleCreateStackScript(payload, this.props.queryClient);
    } else {
      this.handleUpdateStackScript(payload);
    }
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

  hasUnsavedChanges = () => {
    const {
      apiResponse,
      description,
      images,
      label,
      revisionNote,
      script,
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

  mounted: boolean = false;

  renderCancelStackScriptDialog = () => {
    const { dialogOpen } = this.state;

    return (
      <ConfirmationDialog
        actions={this.renderDialogActions}
        onClose={this.handleCloseDialog}
        open={dialogOpen}
        title={`Clear StackScript Configuration?`}
      >
        <Typography>
          Are you sure you want to reset your StackScript configuration?
        </Typography>
      </ConfirmationDialog>
    );
  };

  renderDialogActions = () => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'confirm-cancel',
          label: 'Reset',
          onClick: () => this.resetAllFields(this.state.apiResponse),
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel-cancel',
          label: 'Cancel',
          onClick: this.handleCloseDialog,
        }}
      />
    );
  };

  resetAllFields = (payload?: StackScript) => {
    this.handleCloseDialog();
    this.setState(
      {
        description: payload?.description ?? '',
        images: payload?.images ?? [],
        label: payload?.label ?? '',
        revisionNote: payload?.rev_note ?? '',
        script: payload?.script ?? '',
      },
      () => this.saveStateToLocalStorage(this.props.queryClient)
    );
  };

  saveStateToLocalStorage = debounce(1000, this._saveStateToLocalStorage);

  state: State = {
    description: '',
    dialogOpen: false,
    images: [],
    isLoadingStackScript: false,
    isSubmitting: false,
    label: '',
    revisionNote: '',
    /* available images to select from in the dropdown */
    script: '',
    updated: '',
  };
}

const enhanced = compose<CombinedProps, Props>(
  withImages,
  withRouter,
  withProfile,
  withQueryClient
);

export default enhanced(StackScriptCreate);
