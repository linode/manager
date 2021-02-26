import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import useVlans from 'src/hooks/useVlans';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  open: boolean;
  closeDialog: () => void;
  selectedVlanID?: number;
  selectedVlanLabel: string;
  redirectToLanding?: boolean;
}

type CombinedProps = Props;

const VlanDialog: React.FC<CombinedProps> = props => {
  const { deleteVlan } = useVlans();

  const history = useHistory();

  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const {
    open,
    closeDialog,
    selectedVlanID,
    selectedVlanLabel: label,
    redirectToLanding,
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

    deleteVlan(selectedVlanID)
      .then(_ => {
        setSubmitting(false);
        closeDialog();

        if (redirectToLanding) {
          history.push({
            pathname: `/vlans/`,
          });
        }
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
        buttonType="primary"
      >
        Delete
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(VlanDialog);
