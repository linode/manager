import * as React from 'react';
import ActionPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Domain } from '@linode/api-v4/lib/domains';
import { useUpdateDomainMutation } from 'src/queries/domains';
import { sendDomainStatusChangeEvent } from 'src/utilities/analytics';

interface Props {
  domain: Domain | undefined;
  onClose: () => void;
  open: boolean;
}

const DisableDomainDialog = (props: Props) => {
  const { domain, open, onClose } = props;
  const {
    mutateAsync: updateDomain,
    error,
    isLoading,
    reset,
  } = useUpdateDomainMutation();

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const onSubmit = () => {
    if (!domain) {
      return;
    }

    updateDomain({
      id: domain.id,
      status: 'disabled',
    }).then(() => {
      sendDomainStatusChangeEvent('Disable');
      onClose();
    });
  };

  return (
    <ConfirmationDialog
      open={open}
      title={`Disable Domain ${domain?.domain}?`}
      onClose={onClose}
      error={error?.[0]?.reason}
      actions={
        <ActionPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" onClick={onSubmit} loading={isLoading}>
            Disable Domain
          </Button>
        </ActionPanel>
      }
    >
      Are you sure you want to disable this DNS zone?
    </ConfirmationDialog>
  );
};

export default React.memo(DisableDomainDialog);
