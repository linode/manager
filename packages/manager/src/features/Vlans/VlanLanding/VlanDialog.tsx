import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import { DispatchProps } from 'src/containers/vlans.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props extends Pick<DispatchProps, 'deleteVLAN'> {
  open: boolean;
  closeDialog: () => void;
  selectedVlanID?: number;
  selectedVlanLabel: string;
}

type CombinedProps = Props;

const VlanDialog: React.FC<CombinedProps> = props => {
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const {
    open,
    closeDialog,
    deleteVLAN,
    selectedVlanID,
    selectedVlanLabel: label
  } = props;

  /** reset error on open */
  React.useEffect(() => {
    if (open) {
      setError(undefined);
    }
  }, [open]);

  const handleSubmit = () => {
    const defaultError = 'There was an issue deleting this Virtual LAN.';
    if (!selectedVlanID) {
      return setError(defaultError);
    }

    setSubmitting(true);
    setError(undefined);

    deleteVLAN(selectedVlanID)
      .then(_ => {
        setSubmitting(false);
        closeDialog();
      })
      .catch(e => {
        setSubmitting(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  const _label = label ? label : 'this Virtual LAN';

  return (
    <Dialog
      open={open}
      title={`Delete ${_label}?`}
      onClose={props.closeDialog}
      error={error}
      actions={
        <Actions
          onClose={props.closeDialog}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
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
  isSubmitting: boolean;
}

const Actions: React.FC<ActionsProps> = props => {
  return (
    <ActionsPanel>
      <Button onClick={props.onClose} buttonType="cancel">
        Cancel
      </Button>
      <Button
        onClick={props.onSubmit}
        loading={props.isSubmitting}
        destructive
        buttonType="secondary"
      >
        Delete
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(VlanDialog);
