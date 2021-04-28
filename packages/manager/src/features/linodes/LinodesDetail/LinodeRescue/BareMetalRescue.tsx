import { useSnackbar } from 'notistack';
import * as React from 'react';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { rescueMetalLinode } from '@linode/api-v4/lib/linodes/actions';
import { resetEventsPolling } from 'src/eventsPolling';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
interface Props {
  linodeID: number;
  linodeLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BareMetalRescue: React.FC<Props> = (props) => {
  const { isOpen, onClose, linodeID, linodeLabel } = props;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (isOpen) {
      setError(undefined);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    setError(undefined);
    setLoading(true);
    rescueMetalLinode(linodeID)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Linode rescue started.', {
          variant: 'info',
        });
        resetEventsPolling();
        onClose();
      })
      .catch((err) => {
        setLoading(false);
        setError(
          getAPIErrorOrDefault(err, 'Error booting into rescue mode.')[0].reason
        );
      });
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={handleSubmit} loading={loading}>
        Reboot into Rescue Mode
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title={`Rescue Linode ${linodeLabel}`}
      open={isOpen}
      onClose={onClose}
      actions={actions}
      error={error}
    >
      If you suspect that your primary filesystem is corrupt, use the Linode
      Manager to boot your Linode into Rescue Mode. This is a safe environment
      for performing many system recovery and disk management tasks.
    </ConfirmationDialog>
  );
};

export default BareMetalRescue;
