import { useUnReserveIPMutation } from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { IPAddress } from '@linode/api-v4';

interface Props {
  ipAddress: IPAddress;
  onClose: () => void;
  open: boolean;
}

export const UnreserveIPDialog = (props: Props) => {
  const { ipAddress, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { isPending, mutateAsync, reset } = useUnReserveIPMutation(
    ipAddress.address
  );

  const [error, setError] = React.useState<null | string>(null);

  // Reset mutation state when dialog opens
  React.useEffect(() => {
    if (open) {
      reset();
      setError(null);
    }
  }, [open, reset]);

  const handleSubmit = async () => {
    try {
      await mutateAsync();
      enqueueSnackbar(`${ipAddress.address} has been unreserved.`, {
        variant: 'success',
      });
      onClose();
    } catch (err) {
      setError(
        getAPIErrorOrDefault(err, 'Failed to unreserve IP address.')[0]?.reason
      );
    }
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            disabled: isPending,
            label: 'Unreserve',
            loading: isPending,
            onClick: handleSubmit,
          }}
          secondaryButtonProps={{
            disabled: isPending,
            label: 'Cancel',
            onClick: onClose,
          }}
          sx={{ padding: 0 }}
        />
      }
      onClose={onClose}
      open={open}
      title={`Unreserve ${ipAddress.address}?`}
    >
      {error && <Notice text={error} variant="error" />}
      <Typography>
        Unreserving this IP will remove it from your reserved list and make it
        unavailable to assign. This action can&apos;t be undone.
      </Typography>
    </ConfirmationDialog>
  );
};
