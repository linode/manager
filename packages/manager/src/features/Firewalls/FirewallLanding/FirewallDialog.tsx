import { capitalize } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useDeleteFirewall, useMutateFirewall } from 'src/queries/firewalls';
import { linodeQueries } from 'src/queries/linodes/linodes';
import { nodebalancerQueries } from 'src/queries/nodebalancers';

import type { Firewall } from '@linode/api-v4';

export type Mode = 'delete' | 'disable' | 'enable';

interface Props {
  mode: Mode;
  onClose: () => void;
  open: boolean;
  selectedFirewall: Firewall;
}

export const FirewallDialog = React.memo((props: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { mode, onClose, open, selectedFirewall } = props;

  const {
    error: updateError,
    isPending: isUpdating,
    mutateAsync: updateFirewall,
  } = useMutateFirewall(selectedFirewall.id);
  const {
    error: deleteError,
    isPending: isDeleting,
    mutateAsync: deleteFirewall,
  } = useDeleteFirewall(selectedFirewall.id);

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

    // Invalidate Firewalls assigned to NodeBalancers and Linodes when Firewall is enabled, disabled, or deleted.
    for (const entity of selectedFirewall.entities) {
      if (entity.type === 'nodebalancer') {
        queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancer(entity.id)._ctx.firewalls
            .queryKey,
        });
      }

      if (entity.type === 'linode') {
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(entity.id)._ctx.firewalls.queryKey,
        });
      }
    }

    enqueueSnackbar(
      `Firewall ${selectedFirewall.label} successfully ${mode}d`,
      {
        variant: 'success',
      }
    );

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
      title={`${capitalize(mode)} Firewall ${selectedFirewall.label}?`}
    >
      Are you sure you want to {mode} this firewall?
    </ConfirmationDialog>
  );
});
