import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  open: boolean;
  closeDialog: () => void;
  selectedFirewallID?: number;
  selectedFirewallLabel: string;
  deleteFirewall: (firewallID: number) => Promise<{}>;
}

type CombinedProps = Props;

const DeleteFirewallDialog: React.FC<CombinedProps> = props => {
  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const {
    open,
    closeDialog,
    deleteFirewall,
    selectedFirewallID,
    selectedFirewallLabel: label
  } = props;

  /** reset error on open */
  React.useEffect(() => {
    if (open) {
      setError(undefined);
    }
  }, [open]);

  const handleDelete = () => {
    const defaultError = 'There was an error deleting this Firewall.';
    if (!selectedFirewallID) {
      return setError(defaultError);
    }

    setDeleting(true);

    deleteFirewall(selectedFirewallID)
      .then(response => {
        setDeleting(false);
        closeDialog();
      })
      .catch(e => {
        setDeleting(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  const _label = label ? label : 'this Firewall';

  return (
    <Dialog
      open={open}
      title={`Delete ${_label}?`}
      onClose={props.closeDialog}
      error={error}
      actions={
        <Actions
          onClose={props.closeDialog}
          isDeleting={isDeleting}
          onSubmit={handleDelete}
        />
      }
    >
      Are you sure you want to delete {label}?
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isDeleting: boolean;
}

const Actions: React.FC<ActionsProps> = props => {
  return (
    <ActionsPanel>
      <Button onClick={props.onClose} buttonType="cancel">
        Cancel
      </Button>
      <Button
        onClick={props.onSubmit}
        loading={props.isDeleting}
        destructive
        buttonType="secondary"
      >
        Delete
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(DeleteFirewallDialog);
