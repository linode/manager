import { Volume } from '@linode/api-v4';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useEventsPollingActions } from 'src/queries/events/events';
import { useDeleteVolumeMutation } from 'src/queries/volumes';

interface Props {
  onClose: () => void;
  open: boolean;
  volume: Volume | undefined;
}

export const DeleteVolumeDialog = (props: Props) => {
  const { onClose, open, volume } = props;

  const {
    error,
    isLoading,
    mutateAsync: deleteVolume,
  } = useDeleteVolumeMutation();

  const { resetEventsPolling } = useEventsPollingActions();

  const onDelete = () => {
    deleteVolume({ id: volume?.id ?? -1 }).then(() => {
      onClose();
      resetEventsPolling();
    });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: volume?.label,
        primaryBtnText: 'Delete',
        type: 'Volume',
      }}
      label="Volume Label"
      loading={isLoading}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete Volume ${volume?.label}?`}
      typographyStyle={{ marginTop: '10px' }}
    >
      {error && <Notice text={error?.[0]?.reason} variant="error" />}
    </TypeToConfirmDialog>
  );
};
