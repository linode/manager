import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import useVlans from 'src/hooks/useVlans';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  open: boolean;
  closeDialog: () => void;
  vlanLabel: string;
  vlanID: number;
  linodeID: number;
  linodeLabel: string;
}

type CombinedProps = Props;

const DetachLinodeDialog: React.FC<CombinedProps> = props => {
  const { detachVlan } = useVlans();

  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const { open, closeDialog, vlanID, vlanLabel, linodeID, linodeLabel } = props;

  /** reset error on open */
  React.useEffect(() => {
    if (open) {
      setError(undefined);
    }
  }, [open]);

  const handleSubmit = () => {
    const defaultError = 'There was an issue detaching this Linode.';
    if (!vlanID) {
      return setError(defaultError);
    }

    setSubmitting(true);
    setError(undefined);

    detachVlan(vlanID, [linodeID])
      .then(_ => {
        setSubmitting(false);
        closeDialog();
      })
      .catch(e => {
        setSubmitting(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  return (
    <Dialog
      open={open}
      title={`Detach ${linodeLabel}?`}
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
      Are you sure you want to detach Linode {linodeLabel} from {vlanLabel}?
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
        Detach
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(DetachLinodeDialog);
