import { Image } from '@linode/api-v4/lib/images';
import {
  deleteStackScript,
  updateStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { StackScriptsRequest } from 'src/features/StackScripts/types';

import StackScriptBase, {
  StateProps,
} from '../StackScriptBase/StackScriptBase';
import { StackScriptsSection } from './StackScriptsSection';

interface DialogVariantProps {
  error?: string;
  open: boolean;
  submitting: boolean;
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
  request: StackScriptsRequest;
}

type CombinedProps = Props & StateProps;

const defaultDialogState = {
  delete: {
    open: false,
    submitting: false,
  },
  makePublic: {
    open: false,
    submitting: false,
  },
  stackScriptID: undefined,
  stackScriptLabel: '',
};

export const StackScriptPanelContent = (props: CombinedProps) => {
  const { currentFilter } = props;

  const [mounted, setMounted] = React.useState<boolean>(false);
  const [dialog, setDialogState] = React.useState<DialogState>(
    defaultDialogState
  );

  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  const handleCloseDialog = () => {
    setDialogState({
      ...defaultDialogState,
    });
  };

  const handleOpenDeleteDialog = (id: number, label: string) => {
    setDialogState({
      delete: {
        open: true,
        submitting: false,
      },
      makePublic: {
        open: false,
        submitting: false,
      },
      stackScriptID: id,
      stackScriptLabel: label,
    });
  };

  const handleOpenMakePublicDialog = (id: number, label: string) => {
    setDialogState({
      delete: {
        open: false,
        submitting: false,
      },
      makePublic: {
        open: true,
        submitting: false,
      },
      stackScriptID: id,
      stackScriptLabel: label,
    });
  };

  const handleDeleteStackScript = () => {
    setDialogState({
      ...defaultDialogState,
      delete: {
        ...dialog.delete,
        error: undefined,
        submitting: true,
      },
    });
    deleteStackScript(dialog.stackScriptID!)
      .then((_) => {
        if (!mounted) {
          return;
        }
        handleCloseDialog();
        props.getDataAtPage(1, props.currentFilter, true);
      })
      .catch((e) => {
        if (!mounted) {
          return;
        }
        setDialogState({
          ...defaultDialogState,
          delete: {
            error: e[0].reason,
            open: true,
            submitting: false,
          },
          makePublic: {
            open: false,
            submitting: false,
          },
        });
      });
  };

  const handleMakePublic = () => {
    updateStackScript(dialog.stackScriptID!, { is_public: true })
      .then((_) => {
        if (!mounted) {
          return;
        }
        handleCloseDialog();
        enqueueSnackbar(
          `${dialog.stackScriptLabel} successfully published to the public library.`,
          { variant: 'success' }
        );
        props.getDataAtPage(1, currentFilter, true);
      })
      .catch((_) => {
        if (!mounted) {
          return;
        }
        enqueueSnackbar(
          `There was an error publishing ${dialog.stackScriptLabel} to the public library.`,
          { variant: 'error' }
        );
        handleCloseDialog();
      });
  };

  const renderConfirmDeleteActions = () => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Delete StackScript',
          loading: dialog.delete.submitting,
          onClick: handleDeleteStackScript,
        }}
        secondaryButtonProps={{ label: 'Cancel', onClick: handleCloseDialog }}
      />
    );
  };

  const renderConfirmMakePublicActions = () => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Yes, make me a star!',
          onClick: handleMakePublic,
        }}
        secondaryButtonProps={{ label: 'Cancel', onClick: handleCloseDialog }}
      />
    );
  };

  const renderDeleteStackScriptDialog = () => {
    return (
      <ConfirmationDialog
        actions={renderConfirmDeleteActions}
        error={dialog.delete.error}
        onClose={handleCloseDialog}
        open={dialog.delete.open}
        title={`Delete StackScript ${dialog.stackScriptLabel}?`}
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
        actions={renderConfirmMakePublicActions}
        onClose={handleCloseDialog}
        open={dialog.makePublic.open}
        title={`Woah, just a word of caution...`}
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
      <StackScriptsSection
        category={props.category}
        currentUser={props.currentUser}
        data={props.listOfStackScripts}
        isSorting={props.isSorting}
        publicImages={props.publicImages}
        triggerDelete={handleOpenDeleteDialog}
        triggerMakePublic={handleOpenMakePublicDialog}
      />
      {renderDeleteStackScriptDialog()}
      {renderMakePublicDialog()}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(
  StackScriptBase({ isSelecting: false, useQueryString: true })
)(StackScriptPanelContent);
