import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import { DispatchProps } from 'src/containers/firewalls.container';
import { capitalize } from 'src/utilities/capitalize';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export type Mode = 'enable' | 'disable' | 'delete';
interface Props
  extends Pick<
    DispatchProps,
    'enableFirewall' | 'disableFirewall' | 'deleteFirewall'
  > {
  open: boolean;
  mode: Mode;
  closeDialog: () => void;
  selectedFirewallID?: number;
  selectedFirewallLabel: string;
}

type CombinedProps = Props;

const toContinuousTense = (s: string) => {
  return s.replace(/e$/, 'ing');
};

const FirewallDialog: React.FC<CombinedProps> = props => {
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const {
    open,
    closeDialog,
    deleteFirewall,
    disableFirewall,
    enableFirewall,
    mode,
    selectedFirewallID,
    selectedFirewallLabel: label,
  } = props;

  /** reset error on open */
  React.useEffect(() => {
    if (open) {
      setError(undefined);
    }
  }, [open]);

  const determineRequest = () => {
    switch (mode) {
      case 'enable':
        return enableFirewall;
      case 'disable':
        return disableFirewall;
      case 'delete':
        return deleteFirewall;
    }
  };

  const handleSubmit = () => {
    const defaultError = `There was an issue ${toContinuousTense(
      mode
    )} this Firewall.`;
    if (!selectedFirewallID) {
      return setError(defaultError);
    }

    setSubmitting(true);
    setError(undefined);

    const request = determineRequest();

    request(selectedFirewallID)
      .then(_ => {
        setSubmitting(false);
        closeDialog();
      })
      .catch(e => {
        setSubmitting(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  const _label = label ? label : 'this Firewall';

  return (
    <Dialog
      open={open}
      title={`${capitalize(mode)} ${_label}?`}
      onClose={props.closeDialog}
      error={error}
      actions={
        <Actions
          onClose={props.closeDialog}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          mode={mode}
        />
      }
    >
      Are you sure you want to {mode} {label}?
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  mode: Mode;
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
        destructive={props.mode === 'delete'}
        buttonType="primary"
      >
        {capitalize(props.mode)}
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(FirewallDialog);
