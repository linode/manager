import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
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

const FirewallDialog = (props: Props) => {
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
    await requestMap[mode]();
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            loading={isLoadingMap[mode]}
            onClick={onSubmit}
          >
            {capitalize(mode)} Firewall
          </Button>
        </ActionsPanel>
      }
      error={errorMap[mode]?.[0].reason}
      onClose={onClose}
      open={open}
      title={`${capitalize(mode)} Firewall ${label}?`}
    >
      Are you sure you want to {mode} this Firewall?
    </ConfirmationDialog>
  );
};

export default React.memo(FirewallDialog);
