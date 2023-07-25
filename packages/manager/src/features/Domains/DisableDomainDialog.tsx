import { Domain } from '@linode/api-v4/lib/domains';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useUpdateDomainMutation } from 'src/queries/domains';
import { sendDomainStatusChangeEvent } from 'src/utilities/analytics';

interface DisableDomainDialogProps {
  domain: Domain | undefined;
  onClose: () => void;
  open: boolean;
}

export const DisableDomainDialog = React.memo(
  (props: DisableDomainDialogProps) => {
    const { domain, onClose, open } = props;
    const {
      error,
      isLoading,
      mutateAsync: updateDomain,
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
        actions={
          <ActionsPanel
            primaryButtonProps={{
              label: 'Disable Domain',
              loading: isLoading,
              onClick: onSubmit,
            }}
            secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
          />
        }
        error={error?.[0]?.reason}
        onClose={onClose}
        open={open}
        title={`Disable Domain ${domain?.domain}?`}
      >
        Are you sure you want to disable this DNS zone?
      </ConfirmationDialog>
    );
  }
);
