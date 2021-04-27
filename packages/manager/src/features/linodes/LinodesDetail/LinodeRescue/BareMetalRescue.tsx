import * as React from 'react';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { rescueMetalLinode } from '@linode/api-v4/lib/linodes/actions';

// import { makeStyles, Theme } from 'src/components/core/styles';

// const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {
  linodeID: number;
  linodeLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bare Metal Linodes have a much simpler Rescue flow,
 * since it's not possible to select disk mounts. Rather
 * than conditionally handle everything in RescueDialog,
 * we instead render a simple ConfirmationDialog for
 * these instances.
 */
export const BareMetalRescue: React.FC<Props> = (props) => {
  const { isOpen, onClose, linodeID, linodeLabel } = props;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const handleSubmit = () => {
    setError(undefined);
    setLoading(true);
    rescueMetalLinode(linodeID);
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleSubmit}
        data-qa-submit-managed-enrollment
        loading={loading}
      >
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
      for performing many system recovery and disk management tasks.{' '}
    </ConfirmationDialog>
  );
};

export default BareMetalRescue;
