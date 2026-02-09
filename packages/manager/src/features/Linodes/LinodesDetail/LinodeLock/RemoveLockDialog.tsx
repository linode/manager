import { getLocks } from '@linode/api-v4';
import { useDeleteLockMutation } from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { LockType } from '@linode/api-v4';

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeLocks: LockType[];
  onClose: () => void;
  open: boolean;
}

const getLockTypeDescription = (linodeLocks: LockType[]): string => {
  if (linodeLocks?.includes('cannot_delete_with_subresources')) {
    return 'Unlocking will allow this Linode and all its attached resources to be deleted or rebuilt.';
  }
  if (linodeLocks?.includes('cannot_delete')) {
    return 'Unlocking will allow this Linode to be deleted or rebuilt.';
  }
  return '';
};

export const RemoveLockDialog = (props: Props) => {
  const { linodeId, linodeLabel, linodeLocks, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { isPending, mutateAsync, reset } = useDeleteLockMutation();

  const [localError, setLocalError] = React.useState<null | string>(null);

  const handleSubmit = async () => {
    try {
      const locksResponse = await getLocks(
        {},
        {
          '+and': [{ 'entity.id': linodeId }, { 'entity.type': 'linode' }],
        }
      );

      const locks = locksResponse.data;

      if (locks.length === 0) {
        setLocalError('No active lock found for this Linode.');
        return;
      }
      // TODO: Currently only removes the first lock. If and when multiple locks are supported,
      // this dialog should be enhanced to let users select which lock to remove.
      const lock = locks[0];

      await mutateAsync({ lockId: lock.id, entityId: linodeId });

      enqueueSnackbar(`Lock removed from ${linodeLabel}.`, {
        variant: 'success',
      });
      onClose();
    } catch (err) {
      if (err) {
        setLocalError(
          getAPIErrorOrDefault(err, 'Failed to remove lock.')[0]?.reason
        );
        return;
      }
    }
  };

  // Reset mutation state when dialog opens
  React.useEffect(() => {
    if (open) {
      reset();
      setLocalError(null);
    }
  }, [open, reset]);

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            disabled: isPending,
            label: 'Remove Lock',
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
      title="Remove Lock?"
    >
      {localError && <Notice text={localError} variant="error" />}
      <Typography>{getLockTypeDescription(linodeLocks)}</Typography>
    </ConfirmationDialog>
  );
};
