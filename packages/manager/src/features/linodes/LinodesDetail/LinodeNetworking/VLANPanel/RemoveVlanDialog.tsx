import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { VLAN } from '@linode/api-v4/lib/vlans/types';
import { getLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { useDispatch } from 'react-redux';

interface Props {
  open: boolean;
  closeDialog: () => void;
  selectedVlanID?: number;
  selectedVlanLabel: string;
  linodeId: number;
  removeVlan: (vlanID: number, linodes: number[]) => Promise<VLAN>;
}

type CombinedProps = Props;

const RemoveVlanDialog: React.FC<CombinedProps> = props => {
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const {
    open,
    closeDialog,
    removeVlan,
    selectedVlanID,
    selectedVlanLabel: label,
    linodeId
  } = props;

  const dispatch = useDispatch();

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

    removeVlan(selectedVlanID, [linodeId])
      .then(_ => {
        setSubmitting(false);
        closeDialog();
        dispatch(getLinodeConfigs({ linodeId })); // Re-request Linode Configs so that the page refreshes.
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
      title={`Remove ${_label}?`}
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
      Are you sure you want to remove {_label}?
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
        Remove
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(RemoveVlanDialog);
