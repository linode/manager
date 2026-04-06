import { useDeleteVolumeMutation } from '@linode/queries';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useEventsPollingActions } from 'src/queries/events/events';

import type { APIError, Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  open: boolean;
  volume: undefined | Volume;
  volumeError?: APIError[] | null;
}

export const DeleteVolumeDialog = (props: Props) => {
  const { isFetching, onClose, onDeleteSuccess, open, volume, volumeError } =
    props;

  const { data: volumePermissions } = usePermissions(
    'volume',
    ['delete_volume'],
    volume?.id,
    open
  );

  const isAttached = volume?.linode_id !== null;

  const {
    error,
    isPending,
    mutateAsync: deleteVolume,
  } = useDeleteVolumeMutation();

  const { checkForNewEvents } = useEventsPollingActions();

  const onDelete = () => {
    deleteVolume({ id: volume?.id ?? -1 }).then(() => {
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        onClose();
      }

      checkForNewEvents();
    });
  };

  return (
    <TypeToConfirmDialog
      disableTypeToConfirmInput={
        !volumePermissions?.delete_volume || isAttached
      }
      entity={{
        action: 'deletion',
        name: volume?.label,
        primaryBtnText: 'Delete',
        type: 'Volume',
        error: volumeError,
      }}
      errors={error}
      expand
      isFetching={isFetching}
      label="Volume Label"
      loading={isPending}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete Volume${volume ? ` ${volume.label}` : ''}?`}
      typographyStyle={{ marginTop: '10px' }}
    />
  );
};
