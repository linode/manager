import { Image } from '@linode/api-v4/lib/images';
import {
  deleteStackScript,
  StackScript,
  updateStackScript
} from '@linode/api-v4/lib/stackscripts';
import { ResourcePage } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import StackScriptsSection from './StackScriptsSection';
import StackScriptsSection_CMR from './StackScriptsSection_CMR';
import StackScriptBase, {
  StateProps
} from '../StackScriptBase/StackScriptBase';

interface DialogVariantProps {
  open: boolean;
  submitting: boolean;
  error?: string;
}
interface DialogState {
  makePublic: DialogVariantProps;
  delete: DialogVariantProps;
  stackScriptID: number | undefined;
  stackScriptLabel: string;
}

interface State {
  dialog: DialogState;
  successMessage: string;
  fieldError?: { reason: string };
}

interface Props {
  currentUser: string;
  publicImages: Record<string, Image>;
  request: (
    username: string,
    params?: any,
    filter?: any
  ) => Promise<ResourcePage<StackScript>>;
  category: string;
}

type CombinedProps = Props & FeatureFlagConsumerProps & StateProps;

class StackScriptPanelContent extends React.Component<CombinedProps, State> {
  state: State = {
    successMessage: '',
    dialog: {
      makePublic: {
        open: false,
        submitting: false
      },
      delete: {
        open: false,
        submitting: false
      },
      stackScriptID: undefined,
      stackScriptLabel: ''
    }
  };

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleOpenDeleteDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: true,
          submitting: false
        },
        makePublic: {
          open: false,
          submitting: false
        },
        stackScriptID: id,
        stackScriptLabel: label
      }
    });
  };

  handleOpenMakePublicDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: false,
          submitting: false
        },
        makePublic: {
          open: true,
          submitting: false
        },
        stackScriptID: id,
        stackScriptLabel: label
      }
    });
  };

  handleCloseDialog = () => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        delete: {
          open: false,
          submitting: false
        },
        makePublic: {
          open: false,
          submitting: false
        }
      }
    });
  };

  handleDeleteStackScript = () => {
    const { dialog } = this.state;
    this.setState({
      dialog: {
        ...dialog,
        delete: {
          ...dialog.delete,
          submitting: true,
          error: undefined
        }
      }
    });
    deleteStackScript(this.state.dialog.stackScriptID!)
      .then(_ => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            delete: {
              open: false,
              submitting: false
            },
            makePublic: {
              open: false,
              submitting: false
            },
            stackScriptID: undefined,
            stackScriptLabel: ''
          }
        });
        this.props.getDataAtPage(1, this.props.currentFilter, true);
      })
      .catch(e => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            ...dialog,
            delete: {
              open: true,
              submitting: false,
              error: e[0].reason
            },
            makePublic: {
              open: false,
              submitting: false
            }
          }
        });
      });
  };

  handleMakePublic = () => {
    const { dialog } = this.state;
    const { currentFilter } = this.props;

    updateStackScript(dialog.stackScriptID!, { is_public: true })
      .then(_ => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          successMessage: `${dialog.stackScriptLabel} successfully published to the public library`,
          dialog: {
            delete: {
              open: false,
              submitting: false
            },
            makePublic: {
              open: false,
              submitting: false
            },
            stackScriptID: undefined,
            stackScriptLabel: ''
          }
        });
        this.props.getDataAtPage(1, currentFilter, true);
      })
      .catch(_ => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            delete: {
              open: false,
              submitting: false
            },
            makePublic: {
              open: false,
              submitting: false
            },
            stackScriptID: undefined,
            stackScriptLabel: ''
          },
          fieldError: {
            reason: 'Unable to complete your request at this time'
          }
        });
      });
  };

  renderConfirmMakePublicActions = () => {
    return (
      <ActionsPanel>
        <Button buttonType="cancel" onClick={this.handleCloseDialog}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          destructive
          onClick={this.handleMakePublic}
        >
          Yes, make me a star!
        </Button>
      </ActionsPanel>
    );
  };

  renderConfirmDeleteActions = () => {
    return (
      <ActionsPanel>
        <Button buttonType="cancel" onClick={this.handleCloseDialog}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          destructive
          onClick={this.handleDeleteStackScript}
          loading={this.state.dialog.delete.submitting}
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  renderDeleteStackScriptDialog = () => {
    const { dialog } = this.state;

    return (
      <ConfirmationDialog
        title={`Delete ${dialog.stackScriptLabel}?`}
        open={dialog.delete.open}
        actions={this.renderConfirmDeleteActions}
        onClose={this.handleCloseDialog}
        error={dialog.delete.error}
      >
        <Typography>
          Are you sure you want to delete this StackScript?
        </Typography>
      </ConfirmationDialog>
    );
  };

  renderMakePublicDialog = () => {
    const { dialog } = this.state;

    return (
      <ConfirmationDialog
        title={`Woah, just a word of caution...`}
        open={dialog.makePublic.open}
        actions={this.renderConfirmMakePublicActions}
        onClose={this.handleCloseDialog}
      >
        <Typography>
          Are you sure you want to make {dialog.stackScriptLabel} public? This
          action cannot be undone, nor will you be able to delete the
          StackScript once made available to the public.
        </Typography>
      </ConfirmationDialog>
    );
  };

  render() {
    return (
      <React.Fragment>
        {this.props.flags.cmr ? (
          <StackScriptsSection_CMR
            isSorting={this.props.isSorting}
            data={this.props.listOfStackScripts}
            publicImages={this.props.publicImages}
            triggerDelete={this.handleOpenDeleteDialog}
            triggerMakePublic={this.handleOpenMakePublicDialog}
            currentUser={this.props.currentUser}
            category={this.props.category}
          />
        ) : (
          <StackScriptsSection
            isSorting={this.props.isSorting}
            data={this.props.listOfStackScripts}
            publicImages={this.props.publicImages}
            triggerDelete={this.handleOpenDeleteDialog}
            triggerMakePublic={this.handleOpenMakePublicDialog}
            currentUser={this.props.currentUser}
            category={this.props.category}
          />
        )}
        {this.renderDeleteStackScriptDialog()}
        {this.renderMakePublicDialog()}
      </React.Fragment>
    );
  }
}

export default compose<CombinedProps, Props>(
  StackScriptBase({ isSelecting: false, useQueryString: true }),
  withFeatureFlagConsumer
)(StackScriptPanelContent);
