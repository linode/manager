import * as React from 'react';
import { compose } from 'recompose';
import StackScriptBase, {
  StateProps
} from '../StackScriptBase/StackScriptBase';
import StackScriptsSection from './StackScriptsSection';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import {
  deleteStackScript,
  updateStackScript
} from 'src/services/stackscripts';

interface DialogVariantProps {
  open: boolean;
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
  publicImages: Linode.Image[];
  request: (
    username: string,
    params?: any,
    filter?: any
  ) => Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
  category: string;
}

type CombinedProps = Props & StateProps;

class StackScriptPanelContent extends React.Component<CombinedProps, State> {
  state: State = {
    successMessage: '',
    dialog: {
      makePublic: {
        open: false
      },
      delete: {
        open: false
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
          open: true
        },
        makePublic: {
          open: false
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
          open: false
        },
        makePublic: {
          open: true
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
          open: false
        },
        makePublic: {
          open: false
        }
      }
    });
  };

  handleDeleteStackScript = () => {
    deleteStackScript(this.state.dialog.stackScriptID!)
      .then(response => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            delete: {
              open: false
            },
            makePublic: {
              open: false
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
            delete: {
              open: false
            },
            makePublic: {
              open: false
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

  handleMakePublic = () => {
    const { dialog } = this.state;
    const { currentFilter } = this.props;

    updateStackScript(dialog.stackScriptID!, { is_public: true })
      .then(response => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          successMessage: `${
            dialog.stackScriptLabel
          } successfully published to the public library`,
          dialog: {
            delete: {
              open: false
            },
            makePublic: {
              open: false
            },
            stackScriptID: undefined,
            stackScriptLabel: ''
          }
        });
        this.props.getDataAtPage(1, currentFilter, true);
      })
      .catch(e => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            delete: {
              open: false
            },
            makePublic: {
              open: false
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
      <React.Fragment>
        <ActionsPanel>
          <Button buttonType="cancel" onClick={this.handleCloseDialog}>
            Cancel
          </Button>
          <Button
            buttonType="secondary"
            destructive
            onClick={this.handleMakePublic}
          >
            Yes, make me a star!
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  };

  renderConfirmDeleteActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button buttonType="cancel" onClick={this.handleCloseDialog}>
            Cancel
          </Button>
          <Button
            buttonType="secondary"
            destructive
            onClick={this.handleDeleteStackScript}
          >
            Delete
          </Button>
        </ActionsPanel>
      </React.Fragment>
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
        <StackScriptsSection
          isSorting={this.props.isSorting}
          data={this.props.listOfStackScripts}
          publicImages={this.props.publicImages}
          triggerDelete={this.handleOpenDeleteDialog}
          triggerMakePublic={this.handleOpenMakePublicDialog}
          currentUser={this.props.currentUser}
          category={this.props.category}
        />
        {this.renderDeleteStackScriptDialog()}
        {this.renderMakePublicDialog()}
      </React.Fragment>
    );
  }
}

export default compose<CombinedProps, Props>(StackScriptBase(false))(
  StackScriptPanelContent
);
