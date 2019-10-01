import { Domain, UpdateDomainPayload } from 'linode-js-sdk/lib/domains';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';

import ActionPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';

import { sendDomainStatusChangeEvent } from 'src/utilities/ga';

interface Props {
  updateDomain: (
    payload: UpdateDomainPayload & { domainId: number }
  ) => Promise<Domain>;
  selectedDomainID?: number;
  selectedDomainLabel: string;
  closeDialog: () => void;
  open: boolean;
  errors?: APIError[];
}

type CombinedProps = Props;

const DisableDomainDialog: React.FC<CombinedProps> = props => {
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  React.useEffect(() => {
    if (props.open) {
      setErrors(undefined);
    }
  }, [props.open]);

  const handleSubmit = () => {
    if (!props.selectedDomainID) {
      return setErrors([
        {
          reason: 'Something went wrong.'
        }
      ]);
    }

    setSubmitting(true);

    props
      .updateDomain({
        domainId: props.selectedDomainID,
        status: 'disabled'
      })
      .then(() => {
        setSubmitting(false);
        sendDomainStatusChangeEvent('Disable');
        props.closeDialog();
      })
      .catch(e => {
        setSubmitting(false);
        setErrors(e);
      });
  };
  return (
    <Dialog
      open={props.open}
      title={`Disable ${props.selectedDomainLabel}?`}
      onClose={props.closeDialog}
      error={errors ? errors[0].reason : ''}
      actions={
        <Actions
          onClose={props.closeDialog}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      }
    >
      Are you sure you want to disable this DNS zone?
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
    <ActionPanel>
      <Button onClick={props.onClose} buttonType="cancel">
        Cancel
      </Button>
      <Button
        onClick={props.onSubmit}
        loading={props.isSubmitting}
        destructive
        buttonType="secondary"
      >
        Disable
      </Button>
    </ActionPanel>
  );
};

export default React.memo(DisableDomainDialog);
