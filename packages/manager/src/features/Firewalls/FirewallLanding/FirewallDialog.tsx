import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useDeleteFirewall, useMutateFirewall } from 'src/queries/firewalls';
import { capitalize } from 'src/utilities/capitalize';

export type Mode = 'enable' | 'disable' | 'delete';

interface Props {
  open: boolean;
  mode: Mode;
  onClose: () => void;
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
      open={open}
      title={`${capitalize(mode)} Firewall ${label}?`}
      onClose={onClose}
      error={errorMap[mode]?.[0].reason}
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={onSubmit}
            loading={isLoadingMap[mode]}
          >
            {capitalize(mode)} Firewall
          </Button>
        </ActionsPanel>
      }
    >
      Are you sure you want to {mode} this Firewall?
    </ConfirmationDialog>
  );
};

export default React.memo(FirewallDialog);
