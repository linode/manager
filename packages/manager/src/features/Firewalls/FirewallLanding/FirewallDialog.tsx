import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useDeleteFirewall, useMutateFirewall } from 'src/queries/firewalls';
import { capitalize } from 'src/utilities/capitalize';

export type Mode = 'delete' | 'disable' | 'enable';

interface Props {
  mode: Mode;
  onClose: () => void;
  open: boolean;
  selectedFirewallID?: number;
  selectedFirewallLabel: string;
}

export const FirewallDialog = React.memo((props: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    mode,
    onClose,
    open,
    selectedFirewallID,
    selectedFirewallLabel: label,
  } = props;

  const {
    error: updateError,
    isLoading: isUpdating,
    mutateAsync: updateFirewall,
  } = useMutateFirewall(selectedFirewallID ?? -1);
  const {
    error: deleteError,
    isLoading: isDeleting,
    mutateAsync: deleteFirewall,
  } = useDeleteFirewall(selectedFirewallID ?? -1);

  const requestMap = {
    delete: () => deleteFirewall(),
    disable: () => updateFirewall({ status: 'disabled' }),
    enable: () => updateFirewall({ status: 'enabled' }),
  };

  const isLoadingMap = {
    delete: isDeleting,
    disable: isUpdating,
    enable: isUpdating,
  };

  const errorMap = {
    delete: deleteError,
    disable: updateError,
    enable: updateError,
  };

  const onSubmit = async () => {
    try {
      await requestMap[mode]();
      enqueueSnackbar(`Successfully ${mode}d ${label}`, {
        variant: 'success',
      });
      onClose();
    } catch (e) {
      enqueueSnackbar(`Failed to ${mode} ${label}`, {
        variant: 'error',
      });
      errorMap[mode] = e;
    }
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: `${capitalize(mode)} Firewall`,
            loading: isLoadingMap[mode],
            onClick: onSubmit,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      }
      error={errorMap[mode]?.[0].reason}
      onClose={onClose}
      open={open}
      title={`${capitalize(mode)} Firewall ${label}?`}
    >
      Are you sure you want to {mode} this Firewall?
    </ConfirmationDialog>
  );
});
