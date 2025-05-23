import { useDeleteVolumeMutation } from '@linode/queries';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useEventsPollingActions } from 'src/queries/events/events';

import type { APIError, Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: undefined | Volume;
  volumeError?: APIError[] | null;
}

export const DeleteVolumeDialog = (props: Props) => {
  const { isFetching, onClose, open, volume, volumeError } = props;

  const {
    error,
    isPending,
    mutateAsync: deleteVolume,
  } = useDeleteVolumeMutation();

  const { checkForNewEvents } = useEventsPollingActions();

  const onDelete = () => {
    deleteVolume({ id: volume?.id ?? -1 }).then(() => {
      onClose();
      checkForNewEvents();
    });
  };

  return (
    <TypeToConfirmDialog
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
      title={`Delete Volume ${volume?.label ?? 'Unknown'}?`}
      typographyStyle={{ marginTop: '10px' }}
    />
  );
};
