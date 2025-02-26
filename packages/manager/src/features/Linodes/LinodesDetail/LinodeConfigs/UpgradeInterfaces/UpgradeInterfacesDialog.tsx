import { Button, Dialog, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';

import type { APIError, LinodeInterface } from '@linode/api-v4';

interface UpgradeInterfacesProps {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export type UpgradeInterfacesDialogState =
  | ConfigSelectDialogState
  | ErrorDialogState
  | ProgressDialogState
  | PromptDialogState
  | SuccessDialogState;

interface BaseDialogState {
  dialogTitle: string;
  isDryRun: boolean;
  step: 'configSelect' | 'error' | 'progress' | 'prompt' | 'success';
}

interface PromptDialogState extends BaseDialogState {
  step: 'prompt';
}

interface ConfigSelectDialogState extends BaseDialogState {
  step: 'configSelect';
}

interface ProgressDialogState extends BaseDialogState {
  progress: number;
  step: 'progress';
}

interface SuccessDialogState extends BaseDialogState {
  linodeInterfaces: LinodeInterface[];
  step: 'success';
}

interface ErrorDialogState extends BaseDialogState {
  error: APIError[];
  step: 'error';
}

export const UpgradeInterfacesDialog = (props: UpgradeInterfacesProps) => {
  const { linodeId, onClose, open } = props;

  const [
    dialogState,
    setDialogState,
  ] = React.useState<UpgradeInterfacesDialogState>({
    dialogTitle: 'Upgrade Interfaces',
    isDryRun: true,
    step: 'prompt',
  });

  const dialogProps = {
    onClose,
    setDialogState,
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      title={dialogState.dialogTitle ?? 'Upgrade Interfaces'}
    >
      <Typography />
    </Dialog>
  );
};
