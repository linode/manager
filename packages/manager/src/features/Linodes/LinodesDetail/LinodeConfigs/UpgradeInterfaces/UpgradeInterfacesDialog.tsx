import { Dialog } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import React from 'react';

import { LinodeInterfaceFeatureChip } from '../../LinodeNetworking/LinodeInterfaces/LinodeInterfaceFeatureChip';
import { ConfigSelectDialogContent } from './DialogContents/ConfigSelectDialogContent';
import { ErrorDialogContent } from './DialogContents/ErrorDialogContent';
import { PromptDialogContent } from './DialogContents/PromptDialogContent';
import { SuccessDialogContent } from './DialogContents/SuccessDialogContent';

import type { UpgradeInterfacesDialogState } from './types';
import type { Theme } from '@mui/material/styles';

interface UpgradeInterfacesProps {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const initialState: UpgradeInterfacesDialogState = {
  dialogTitle: 'Upgrade to Linode Interfaces',
  step: 'prompt',
};

export const UpgradeInterfacesDialog = (props: UpgradeInterfacesProps) => {
  const { linodeId, onClose, open } = props;

  const isDesktopSize = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('md')
  );

  const [dialogState, setDialogState] =
    React.useState<UpgradeInterfacesDialogState>({ ...initialState });

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
      fullHeight={!isDesktopSize}
      fullWidth
      maxWidth="sm"
      onClose={closeAndResetDialog}
      open={open}
      slotProps={{
        paper: {
          sx: {
            minHeight: '500px',
          },
        },
      }}
      title={dialogState.dialogTitle ?? 'Upgrade Interfaces'}
      titleSuffix={<LinodeInterfaceFeatureChip />}
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
