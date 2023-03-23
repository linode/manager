import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
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
    open,
    onClose,
    mode,
    selectedFirewallID,
    selectedFirewallLabel: label,
  } = props;

  const {
    mutateAsync: updateFirewall,
    isLoading: isUpdating,
    error: updateError,
  } = useMutateFirewall(selectedFirewallID ?? -1);
  const {
    mutateAsync: deleteFirewall,
    isLoading: isDeleting,
    error: deleteError,
  } = useDeleteFirewall(selectedFirewallID ?? -1);

  const requestMap = {
    enable: () => updateFirewall({ status: 'enabled' }),
    disable: () => updateFirewall({ status: 'disabled' }),
    delete: () => deleteFirewall(),
  };

  const isLoadingMap = {
    enable: isUpdating,
    disable: isUpdating,
    delete: isDeleting,
  };

  const errorMap = {
    enable: updateError,
    disable: updateError,
    delete: deleteError,
  };

  const onSubmit = async () => {
    await requestMap[mode]();
    onClose();
  };

  return (
    <Dialog
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
    </Dialog>
  );
};

export default React.memo(FirewallDialog);
