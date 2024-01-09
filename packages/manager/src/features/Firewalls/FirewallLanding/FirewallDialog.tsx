import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { queryKey as firewallQueryKey } from 'src/queries/firewalls';
import { useDeleteFirewall, useMutateFirewall } from 'src/queries/firewalls';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { queryKey as linodesQueryKey } from 'src/queries/linodes/linodes';
import { queryKey as nodebalancerQueryKey } from 'src/queries/nodebalancers';
import { capitalize } from 'src/utilities/capitalize';

export type Mode = 'delete' | 'disable' | 'enable';

interface Props {
  mode: Mode;
  onClose: () => void;
  open: boolean;
  selectedFirewallId?: number;
  selectedFirewallLabel: string;
}

export const FirewallDialog = React.memo((props: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const {
    mode,
    onClose,
    open,
    selectedFirewallId,
    selectedFirewallLabel: label,
  } = props;

  const { data: devices } = useAllFirewallDevicesQuery(
    selectedFirewallId ?? -1
  );

  const {
    error: updateError,
    isLoading: isUpdating,
    mutateAsync: updateFirewall,
  } = useMutateFirewall(selectedFirewallId ?? -1);
  const {
    error: deleteError,
    isLoading: isDeleting,
    mutateAsync: deleteFirewall,
  } = useDeleteFirewall(selectedFirewallId ?? -1);

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
    await requestMap[mode]();
    if (mode === 'delete') {
      devices?.forEach((device) => {
        const deviceType = device.entity.type;
        queryClient.invalidateQueries([
          deviceType === 'linode' ? linodesQueryKey : nodebalancerQueryKey,
          deviceType,
          device.entity.id,
          'firewalls',
        ]);
        queryClient.invalidateQueries([firewallQueryKey]);
      });
    }
    enqueueSnackbar(`Firewall ${label} successfully ${mode}d`, {
      variant: 'success',
    });
    onClose();
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
      Are you sure you want to {mode} this firewall?
    </ConfirmationDialog>
  );
});
