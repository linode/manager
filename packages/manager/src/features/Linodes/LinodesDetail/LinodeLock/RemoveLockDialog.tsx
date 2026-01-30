import { deleteLock, getLocks } from '@linode/api-v4';
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
  if (linodeLocks.includes('cannot_delete_with_subresources')) {
    return 'Unlocking will allow this Linode and all its attached resources to be deleted or rebuilt.';
  }
  if (linodeLocks.includes('cannot_delete')) {
    return 'Unlocking will allow this Linode to be deleted or rebuilt.';
  }
  return '';
};

export const RemoveLockDialog = (props: Props) => {
  const { linodeId, linodeLabel, linodeLocks, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setError(undefined);
      setIsLoading(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Fetch lock ID
      const locksResponse = await getLocks(
        {},
        {
          '+and': [{ 'entity.id': linodeId }, { 'entity.type': 'linode' }],
        }
      );

      const lock = locksResponse.data[0];

      if (!lock) {
        setError('No lock found for this Linode.');
        setIsLoading(false);
        return;
      }

      // Delete lock
      await deleteLock(lock.id);

      enqueueSnackbar(`Lock removed from ${linodeLabel}.`, {
        variant: 'success',
      });
      onClose();
    } catch (err) {
      setError(getAPIErrorOrDefault(err, 'Failed to remove lock.')[0].reason);
      setIsLoading(false);
    }
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            disabled: isLoading,
            label: 'Remove Lock',
            loading: isLoading,
            onClick: handleSubmit,
          }}
          secondaryButtonProps={{
            disabled: isLoading,
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
      {error && <Notice text={error} variant="error" />}
      <Typography>{getLockTypeDescription(linodeLocks)}</Typography>
    </ConfirmationDialog>
  );
};
