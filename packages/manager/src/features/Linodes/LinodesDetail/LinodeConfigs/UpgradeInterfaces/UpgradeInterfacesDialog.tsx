import { Dialog } from '@linode/ui';
import React from 'react';

import { ConfigSelectDialogContent } from './DialogContents/ConfigSelectDialogContent';
import { ErrorDialogContent } from './DialogContents/ErrorDialogContent';
import { PromptDialogContent } from './DialogContents/PromptDialogContent';
import { SuccessDialogContent } from './DialogContents/SuccessDialogContent';

import type { UpgradeInterfacesDialogState } from './types';

interface UpgradeInterfacesProps {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

const initialState: UpgradeInterfacesDialogState = {
  dialogTitle: 'Upgrade Interfaces',
  step: 'prompt',
};

export const UpgradeInterfacesDialog = (props: UpgradeInterfacesProps) => {
  const { linodeId, onClose, open } = props;

  const [
    dialogState,
    setDialogState,
  ] = React.useState<UpgradeInterfacesDialogState>({ ...initialState });

  const closeAndResetDialog = () => {
    onClose();
    setDialogState({
      ...initialState,
    });
  };

  const dialogProps = {
    linodeId,
    onClose: closeAndResetDialog,
    open,
    setDialogState,
  };

  return (
    <Dialog
      fullHeight // how do i make the dialog not change size
      fullWidth
      maxWidth="sm"
      onClose={closeAndResetDialog}
      open={open}
      title={dialogState.dialogTitle ?? 'Upgrade Interfaces'}
    >
      {dialogState.step === 'prompt' && (
        <PromptDialogContent {...dialogProps} state={dialogState} />
      )}
      {dialogState.step === 'configSelect' && (
        <ConfigSelectDialogContent {...dialogProps} state={dialogState} />
      )}
      {dialogState.step === 'error' && (
        <ErrorDialogContent {...dialogProps} state={dialogState} />
      )}
      {dialogState.step === 'success' && (
        <SuccessDialogContent {...dialogProps} state={dialogState} />
      )}
    </Dialog>
  );
};
