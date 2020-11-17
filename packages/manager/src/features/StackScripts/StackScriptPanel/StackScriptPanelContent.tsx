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
import useFlags from 'src/hooks/useFlags';
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
  delete: DialogVariantProps;
  makePublic: DialogVariantProps;
  stackScriptID: number | undefined;
  stackScriptLabel: string;
}

interface Props {
  category: string;
  currentUser: string;
  publicImages: Record<string, Image>;
  request: (
    username: string,
    params?: any,
    filter?: any
  ) => Promise<ResourcePage<StackScript>>;
}

type CombinedProps = Props & StateProps;

const defaultDialogState = {
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
};

export const StackScriptPanelContent: React.FC<CombinedProps> = props => {
  const flags = useFlags();

  const { currentFilter } = props;

  const [mounted, setMounted] = React.useState<boolean>(false);
  const [dialog, setDialogState] = React.useState<DialogState>(
    defaultDialogState
  );

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  const handleCloseDialog = () => {
    setDialogState({
      ...defaultDialogState
    });
  };

  const handleOpenDeleteDialog = (id: number, label: string) => {
    setDialogState({
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
    });
  };

  const handleOpenMakePublicDialog = (id: number, label: string) => {
    setDialogState({
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
    });
  };

  const handleDeleteStackScript = () => {
    setDialogState({
      ...defaultDialogState,
      delete: {
        ...dialog.delete,
        submitting: true,
        error: undefined
      }
    });
    deleteStackScript(dialog.stackScriptID!)
      .then(_ => {
        if (!mounted) {
          return;
        }
        handleCloseDialog();
        props.getDataAtPage(1, props.currentFilter, true);
      })
      .catch(e => {
        if (!mounted) {
          return;
        }
        setDialogState({
          ...defaultDialogState,
          delete: {
            open: true,
            submitting: false,
            error: e[0].reason
          },
          makePublic: {
            open: false,
            submitting: false
          }
        });
      });
  };

  const handleMakePublic = () => {
    updateStackScript(dialog.stackScriptID!, { is_public: true })
      .then(_ => {
        if (!mounted) {
          return;
        }
        handleCloseDialog();
        props.getDataAtPage(1, currentFilter, true);
      })
      .catch(_ => {
        if (!mounted) {
          return;
        }
        handleCloseDialog();
      });
  };

  const renderConfirmDeleteActions = () => {
    return (
      <ActionsPanel>
        <Button buttonType="cancel" onClick={handleCloseDialog}>
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          destructive
          onClick={handleDeleteStackScript}
          loading={dialog.delete.submitting}
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  const renderConfirmMakePublicActions = () => {
    return (
      <ActionsPanel>
        <Button buttonType="cancel" onClick={handleCloseDialog}>
          Cancel
        </Button>
        <Button buttonType="secondary" destructive onClick={handleMakePublic}>
          Yes, make me a star!
        </Button>
      </ActionsPanel>
    );
  };

  const renderDeleteStackScriptDialog = () => {
    return (
      <ConfirmationDialog
        title={`Delete ${dialog.stackScriptLabel}?`}
        open={dialog.delete.open}
        actions={renderConfirmDeleteActions}
        onClose={handleCloseDialog}
        error={dialog.delete.error}
      >
        <Typography>
          Are you sure you want to delete this StackScript?
        </Typography>
      </ConfirmationDialog>
    );
  };

  const renderMakePublicDialog = () => {
    return (
      <ConfirmationDialog
        title={`Woah, just a word of caution...`}
        open={dialog.makePublic.open}
        actions={renderConfirmMakePublicActions}
        onClose={handleCloseDialog}
      >
        <Typography>
          Are you sure you want to make {dialog.stackScriptLabel} public? This
          action cannot be undone, nor will you be able to delete the
          StackScript once made available to the public.
        </Typography>
      </ConfirmationDialog>
    );
  };

  return (
    <React.Fragment>
      {flags.cmr ? (
        <StackScriptsSection_CMR
          isSorting={props.isSorting}
          data={props.listOfStackScripts}
          publicImages={props.publicImages}
          triggerDelete={handleOpenDeleteDialog}
          triggerMakePublic={handleOpenMakePublicDialog}
          currentUser={props.currentUser}
          category={props.category}
        />
      ) : (
        <StackScriptsSection
          isSorting={props.isSorting}
          data={props.listOfStackScripts}
          publicImages={props.publicImages}
          triggerDelete={handleOpenDeleteDialog}
          triggerMakePublic={handleOpenMakePublicDialog}
          currentUser={props.currentUser}
          category={props.category}
        />
      )}
      {renderDeleteStackScriptDialog()}
      {renderMakePublicDialog()}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(
  StackScriptBase({ isSelecting: false, useQueryString: true })
)(StackScriptPanelContent);
