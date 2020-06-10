import { Image } from '@linode/api-v4/lib/images';
import {
  createStackScript,
  StackScript
} from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
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
import withImages from 'src/containers/withImages.container';
import { StackScripts } from 'src/documentation';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import ScriptForm from 'src/features/StackScripts/StackScriptForm';
import { MapState } from 'src/store/types';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';
import { debounce } from 'throttle-debounce';

import { filterImagesByType } from 'src/store/image/image.helpers';

type ClassNames = 'backButton' | 'createTitle';

const styles = (theme: Theme) =>
  createStyles({
    backButton: {
      margin: '5px 0 0 -16px',
      '& svg': {
        width: 34,
        height: 34
      }
    },
    createTitle: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
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
}

type CombinedProps = StateProps &
  WithImagesProps &
  SetDocsProps &
  WithStyles<ClassNames> &
  RouteComponentProps<{}>;

const errorResources = {
  label: 'A label',
  images: 'Images',
  script: 'A script'
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
    dialogOpen: false
  };

  static docs = [StackScripts];

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    const valuesFromStorage = storage.stackScriptInProgress.get();
    this.setState({
      label: valuesFromStorage.label ?? '',
      description: valuesFromStorage.description ?? '',
      images: valuesFromStorage.images ?? [],
      script: valuesFromStorage.script ?? '',
      revisionNote: valuesFromStorage.rev_note ?? ''
    });
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
      revisionNote: rev_note
    } = this.state;
    storage.stackScriptInProgress.set({
      label,
      description,
      script,
      images,
      rev_note
    });
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
    const imageList = images.map(image => image.value);
    this.setState(
      {
        images: imageList
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

  resetAllFields = () => {
    this.handleCloseDialog();
    this.setState(
      {
        script: '',
        label: '',
        images: [],
        description: '',
        revisionNote: ''
      },
      this.saveStateToLocalStorage
    );
  };

  handleCreateStackScript = () => {
    const { script, label, images, description, revisionNote } = this.state;

    const { history } = this.props;

    const payload = {
      script,
      label,
      images,
      description,
      is_public: false,
      rev_note: revisionNote
    };

    if (!this.mounted) {
      return;
    }

    this.setState({ isSubmitting: true });

    createStackScript(payload)
      .then((stackScript: StackScript) => {
        if (!this.mounted) {
          return;
        }
        this.setState({ isSubmitting: false });
        this.resetAllFields();
        history.push('/stackscripts?type=account', {
          successMessage: `${stackScript.label} successfully created`
        });
      })
      .catch(error => {
        if (!this.mounted) {
          return;
        }

        this.setState(
          () => ({
            isSubmitting: false,
            errors: error
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
          buttonType="cancel"
          onClick={this.handleCloseDialog}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="secondary"
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
      username,
      userCannotCreateStackScripts,
      classes,
      location,
      imagesData
    } = this.props;
    const {
      images,
      script,
      label,
      description,
      revisionNote,
      errors,
      isSubmitting
    } = this.state;
    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const availableImages = Object.keys(imagesData).reduce((acc, eachKey) => {
      if (!this.state.images.includes(eachKey)) {
        acc[eachKey] = imagesData[eachKey];
      }
      return acc;
    }, {});

    if (!username) {
      return (
        <ErrorState errorText="An error has occurred. Please try again." />
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Create New StackScript" />
        {generalError && <Notice error text={generalError} />}
        <Grid container justify="space-between">
          <Grid item className="py0">
            <Breadcrumb
              pathname={location.pathname}
              labelTitle="Create New StackScript"
              className={classes.createTitle}
              crumbOverrides={[
                {
                  position: 1,
                  label: 'StackScripts'
                }
              ]}
              data-qa-create-stackscript-breadcrumb
            />
          </Grid>
        </Grid>
        {userCannotCreateStackScripts && (
          <Notice
            text={
              "You don't have permissions to create a new StackScript. Please contact an account administrator for details."
            }
            error={true}
            important
          />
        )}
        <ScriptForm
          currentUser={username}
          disabled={userCannotCreateStackScripts}
          images={{
            available: availableImages,
            selected: images
          }}
          label={{
            value: label,
            handler: this.handleLabelChange
          }}
          description={{
            value: description,
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
          onSubmit={this.handleCreateStackScript}
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
  userCannotCreateStackScripts: boolean;
}
const mapStateToProps: MapState<StateProps, {}> = state => ({
  username: path(['data', 'username'], state.__resources.profile),
  userCannotCreateStackScripts:
    isRestrictedUser(state) && !hasGrant(state, 'add_stackscripts')
});

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

interface WithImagesProps {
  imagesData: Record<string, Image>;
  imagesLoading: boolean;
  imagesError?: APIError[];
}

const enhanced = compose<CombinedProps, {}>(
  setDocs(StackScriptCreate.docs),
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData: filterImagesByType(imagesData, 'public'),
    imagesLoading,
    imagesError
  })),
  styled,
  withRouter,
  connected
);

export default enhanced(StackScriptCreate);
