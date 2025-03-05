import { Box, Button, Dialog, List } from '@linode/ui';
import React from 'react';

import { ConfigSelectDialogContent } from './DialogContents/ConfigSelectDialogContent';
import { ErrorDialogContent } from './DialogContents/ErrorDialogContent';
import { ProgressDialogContent } from './DialogContents/ProgressDialogContent';
import { SuccessDialogContent } from './DialogContents/SuccessDialogContent';
import { UpgradePromptDialogContent } from './DialogContents/UpgradePromptDialogContent';

import type { UpgradeInterfacesDialogState } from './types';

interface UpgradeInterfacesProps {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const UpgradeInterfacesDialog = (props: UpgradeInterfacesProps) => {
  const { linodeId, onClose, open } = props;

  const [
    dialogState,
    setDialogState,
  ] = React.useState<UpgradeInterfacesDialogState>({
    dialogTitle: 'Upgrade Interfaces',
    step: 'prompt',
  });

  const dialogProps = {
    linodeId,
    onClose,
    open,
    setDialogState,
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      title={dialogState.dialogTitle ?? 'Upgrade Interfaces'}
    >
      {dialogState.step === 'prompt' && (
        <UpgradePromptDialogContent {...dialogProps} state={dialogState} />
      )}{' '}
      {dialogState.step === 'configSelect' && (
        <ConfigSelectDialogContent {...dialogProps} state={dialogState} />
      )}
      {dialogState.step === 'progress' && (
        <ProgressDialogContent {...dialogProps} state={dialogState} />
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
