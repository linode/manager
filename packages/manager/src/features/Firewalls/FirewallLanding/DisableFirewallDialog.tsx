import { Firewall } from 'linode-js-sdk/lib/firewalls/types';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import { capitalize } from 'src/utilities/capitalize';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  open: boolean;
  mode: 'enable' | 'disable';
  closeDialog: () => void;
  enableFirewall: (firewallID: number) => Promise<Firewall>;
  disableFirewall: (firewallID: number) => Promise<Firewall>;
  selectedFirewallID?: number;
  selectedFirewallLabel: string;
}

type CombinedProps = Props;

const EnableDisableFirewallDialog: React.FC<CombinedProps> = props => {
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const {
    open,
    closeDialog,
    disableFirewall,
    enableFirewall,
    mode,
    selectedFirewallID,
    selectedFirewallLabel: label
  } = props;

  /** reset error on open */
  React.useEffect(() => {
    if (open) {
      setError(undefined);
    }
  }, [open]);

  const handleSubmit = () => {
    const defaultError = `There was an issue ${
      mode === 'disable' ? 'disabling' : 'enabling'
    } this firewall.`;
    if (!selectedFirewallID) {
      return setError(defaultError);
    }

    setSubmitting(true);

    const request = mode === 'disable' ? disableFirewall : enableFirewall;

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
      title={`Disable ${_label}?`}
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
  mode: 'enable' | 'disable';
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
        {capitalize(props.mode)}
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(EnableDisableFirewallDialog);
