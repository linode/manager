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
  const [isDisabling, setDisabling] = React.useState<boolean>(false);
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

    setDisabling(true);

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
        setDisabling(false);
        closeDialog();
      })
      .catch(e => {
        setDisabling(false);
        setErrors(e);
      });
  };

  return (
    <Dialog
      open={open}
      title={`Disable ${label ? label : 'this firewall'}?`}
      onClose={props.closeDialog}
      error={errors ? errors[0].reason : ''}
      actions={
        <Actions
          onClose={props.closeDialog}
          isDisabling={isDisabling}
          onSubmit={handleDelete}
        />
      }
    >
      Are you sure you want to disable this firewall?
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isDisabling: boolean;
}

const Actions: React.FC<ActionsProps> = props => {
  return (
    <ActionsPanel>
      <Button onClick={props.onClose} buttonType="cancel">
        Cancel
      </Button>
      <Button
        onClick={props.onSubmit}
        loading={props.isDisabling}
        destructive
        buttonType="secondary"
      >
        Disable
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(DeleteFirewallDialog);
