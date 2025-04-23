import { ActionsPanel } from '@linode/ui';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useUpdateDomainMutation } from 'src/queries/domains';
import { sendDomainStatusChangeEvent } from 'src/utilities/analytics/customEventAnalytics';

import type { Domain } from '@linode/api-v4';

interface DisableDomainDialogProps {
  domain: Domain | undefined;
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
}

export const DisableDomainDialog = React.memo(
  (props: DisableDomainDialogProps) => {
    const { domain, isFetching, onClose, open } = props;
    const {
      error,
      isPending,
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
              loading: isPending,
              onClick: onSubmit,
            }}
            secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
          />
        }
        error={error?.[0]?.reason}
        isFetching={isFetching}
        onClose={onClose}
        open={open}
        title={`Disable Domain ${domain?.domain}?`}
      >
        Are you sure you want to disable this DNS zone?
      </ConfirmationDialog>
    );
  }
);
