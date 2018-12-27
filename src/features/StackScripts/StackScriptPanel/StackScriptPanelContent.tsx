import * as React from 'react';
import { ChildrenProps, StackScriptPanelContentBase, StackScriptPanelContentBaseProps, StackScriptPanelContentBaseState, styled } from '../StackScriptPanelContentBase';
import StackScriptsSection from './StackScriptsSection';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { deleteStackScript, updateStackScript } from 'src/services/stackscripts';

interface DialogVariantProps {
  open: boolean;
}
interface DialogState {
  makePublic: DialogVariantProps,
  delete: DialogVariantProps,
  stackScriptID: number | undefined;
  stackScriptLabel: string;  
}

interface State {
  dialog: DialogState;
};

export type combinedState = StackScriptPanelContentBaseState & State;


class StackScriptPanelContent extends StackScriptPanelContentBase<StackScriptPanelContentBaseProps, combinedState> {


  getDefaultState(): combinedState {
    return {
      ...super.getDefaultState(),
      dialog: {
        makePublic: {
          open: false,
        },
        delete: {
          open: false,
        },
        stackScriptID: undefined,
        stackScriptLabel: '',
      }
    }
  }

  state: combinedState = this.getDefaultState();

  handleOpenDeleteDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: true,
        },
        makePublic: {
          open: false,
        },
        stackScriptID: id,
        stackScriptLabel: label,
      }
    } as combinedState)
  }

  handleOpenMakePublicDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: false,
        },
        makePublic: {
          open: true,
        },
        stackScriptID: id,
        stackScriptLabel: label,
      }
    } as combinedState)
  }

  handleCloseDialog = () => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        delete: {
          open: false,
        },
        makePublic: {
          open: false,
        },
      }
    } as combinedState)
  }

  handleDeleteStackScript = () => {
    deleteStackScript(this.state.dialog.stackScriptID!)
      .then(response => {
        this.setState({
          dialog: {
            delete: {
              open: false,
            },
            makePublic: {
              open: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          }
        } as combinedState);
        this.getDataAtPage(1, this.state.currentFilter, true);
      })
      .catch(e => {
        this.setState({
          dialog: {
            delete: {
              open: false,
            },
            makePublic: {
              open: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          },
          fieldError: {
            reason: 'Unable to complete your request at this time'
          }
        } as combinedState)
      });
  }

  handleMakePublic = () => {
    const { dialog, currentFilter } = this.state;

    updateStackScript(dialog.stackScriptID!, { is_public: true })
      .then(response => {
        if (!this.mounted) { return; }
        this.setState({
          successMessage: `${dialog.stackScriptLabel} successfully published to the public library`,
          dialog: {
            delete: {
              open: false,
            },
            makePublic: {
              open: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          }
        } as combinedState);
        this.getDataAtPage(1, currentFilter, true);
      })
      .catch(e => {
        this.setState({
          dialog: {
            delete: {
              open: false,
            },
            makePublic: {
              open: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          },
          fieldError: {
            reason: 'Unable to complete your request at this time'
          }
        } as combinedState)
      });
  }


  renderConfirmMakePublicActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            type="cancel"
            onClick={this.handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            type="secondary"
            destructive
            onClick={this.handleMakePublic}>
            Yes, make me a star!
          </Button>
        </ActionsPanel>
      </React.Fragment>
    )
  }

  renderConfirmDeleteActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            type="cancel"
            onClick={this.handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            type="secondary"
            destructive
            onClick={this.handleDeleteStackScript}>
            Delete
          </Button>
        </ActionsPanel>
      </React.Fragment>
    )
  }

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
    )
  }

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
          Are you sure you want to make {dialog.stackScriptLabel} public?
          This action cannot be undone, nor will you be able to delete the StackScript once
          made available to the public.
        </Typography>
      </ConfirmationDialog>
    )
  }

  renderChildren(baseProps: ChildrenProps ) {
    return <React.Fragment>
      <StackScriptsSection
        isSorting={baseProps.isSorting}
        data={this.state.listOfStackScripts}
        publicImages={baseProps.publicImages}
        triggerDelete={this.handleOpenDeleteDialog}
        triggerMakePublic={this.handleOpenMakePublicDialog}
        currentUser={baseProps.currentUser}
      />
      {this.renderDeleteStackScriptDialog()}
      {this.renderMakePublicDialog()}
    </React.Fragment>
}
};

export default styled(StackScriptPanelContent);
