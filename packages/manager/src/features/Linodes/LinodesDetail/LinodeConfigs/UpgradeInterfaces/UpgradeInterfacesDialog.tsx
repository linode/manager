import { 
  Box,
  Button,
  Dialog,
  List,
  ListItem,
  Notice,
  Stack,
  Typography 
} from '@linode/ui';
import React from 'react';

import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';

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
      )}
    </Dialog>
  );
};

interface UpgradeInterfacesDialogContentProps<State extends UpgradeInterfacesDialogState> {
  linodeId: number;
  onClose: () => void;
  open: boolean;
  setDialogState: (state: UpgradeInterfacesDialogState) => void;
  state: State;
}

const UpgradePromptDialogContent = (
  props: UpgradeInterfacesDialogContentProps<PromptDialogState>
) => {
  const { linodeId, onClose, open, setDialogState, state } = props;

  const { data: configs } = useAllLinodeConfigsQuery(linodeId, open);

  if (!configs) {
    return (
      <Typography>No Configuration Profiles found to upgrade.</Typography>
    )
  }

  const upgradeDryRun = configs?.length > 1 ? () => setDialogState({ step: 'configSelect', isDryRun: true, dialogTitle: 'Upgrade Dry Run' }) : () => {};
  const upgradeInterfaces = configs?.length > 1 ? () => setDialogState({ step: 'configSelect', isDryRun: false, dialogTitle: 'Upgrade Interfaces' }) : () => {};

  return(
    <Stack gap={2}>
      <Typography>
        Upgrading allows interface connections to be directly associated with
        the Linode and not the Linode's configuration profile.
      </Typography>
      <Typography>
        It is recommended that you perform a dry run before upgrading to verify
        and resolve potential conflicts during the upgrade.
      </Typography>
      <Typography>Upgrading will have the following impact:</Typography>
      <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
        <ListItem disablePadding sx={{ display: 'list-item' }}>
          Any firewall attached to the Linode will be removed and a default firewall
          will be attached to the new interface automatically.
        </ListItem>
        <ListItem disablePadding sx={{ display: 'list-item' }}>
          If a firewall is not currently assigned, one will be added during the
          upgrade to improve security.
        </ListItem>{' '}
        <ListItem disablePadding sx={{ display: 'list-item' }}>
          All networking configurations will be deleted from the configuration
          profile and re-assigned to the neew interfaces in the Linode Network
          tab.
        </ListItem>
      </List>
      <Box gap={2}>
        <Button buttonType="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button buttonType="outlined" onClick={upgradeDryRun}>
          Upgrade Dry Run
        </Button>
        <Button buttonType="primary" onClick={upgradeInterfaces}>
          Upgrade Interfaces
        </Button>
      </Box>
    </Stack>
  )
}