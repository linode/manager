import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';

interface Props {
  open: boolean;
  closeDialog: () => void;
  selectedFirewallID?: number;
  selectedFirewallLabel: string;
}

type CombinedProps = Props;

const DeleteFirewallDialog: React.FC<CombinedProps> = props => {
  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const {
    open,
    closeDialog,
    selectedFirewallID,
    selectedFirewallLabel: label
  } = props;

  /** reset errors on open */
  React.useEffect(() => {
    if (open) {
      setErrors(undefined);
    }
  }, [open]);

  const handleDelete = () => {
    if (!selectedFirewallID) {
      return setErrors([
        {
          reason: 'There was an issue deleting this firewall.'
        }
      ]);
    }

    setDeleting(true);

    new Promise((resolve, reject) => {
      return setTimeout(() => {
        return reject([
          {
            reason: `This action faaaaaaaaaiiiled. You're a failure!`
          }
        ]);
      }, 1000);
    })
      .then(response => {
        setDeleting(false);
        closeDialog();
      })
      .catch(e => {
        setDeleting(false);
        setErrors(e);
      });
  };

  return (
    <Dialog
      open={open}
      title={`Delete ${label ? label : 'this firewall'}?`}
      onClose={props.closeDialog}
      error={errors ? errors[0].reason : ''}
      actions={
        <Actions
          onClose={props.closeDialog}
          isDeleting={isDeleting}
          onSubmit={handleDelete}
        />
      }
    >
      Are you sure you want to delete this firewall?
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
