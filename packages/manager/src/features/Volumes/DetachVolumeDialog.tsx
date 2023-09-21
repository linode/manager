import { Volume } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useDetachVolumeMutation } from 'src/queries/volumes';

interface Props {
  onClose: () => void;
  open: boolean;
  volume: Volume | undefined;
}

export const DetachVolumeDialog = (props: Props) => {
  const { onClose, open, volume } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(
    volume?.linode_id ?? -1,
    volume?.linode_id !== null && volume?.linode_id !== undefined
  );

  const {
    error,
    isLoading,
    mutateAsync: detachVolume,
  } = useDetachVolumeMutation();

  const onDetach = () => {
    detachVolume({ id: volume?.id ?? -1 }).then(() => {
      onClose();
      resetEventsPolling();
      enqueueSnackbar(`Volume detachment started`, {
        variant: 'info',
      });
    });
  };

  const poweredOff = linode?.status === 'offline';

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'detachment',
        name: volume?.label,
        primaryBtnText: 'Detach',
        type: 'Volume',
      }}
      label="Volume Label"
      loading={isLoading}
      onClick={onDetach}
      onClose={onClose}
      open={open}
      title={`Detach Volume ${volume?.label}?`}
      typographyStyle={{ marginTop: '10px' }}
    >
      {error && <Notice text={error?.[0].reason} variant="error" />}
      {!poweredOff && linode !== undefined && (
        <Typography
          sx={(theme) => ({
            color: theme.color.red,
            marginBottom: theme.spacing(2),
          })}
        >
          <strong>Warning:</strong> This operation could cause data loss. Please
          power off the Linode first or make sure it isn&rsquo;t currently
          writing to the volume before continuing. If this volume is currently
          mounted, detaching it could cause your Linode to restart.
        </Typography>
      )}
    </TypeToConfirmDialog>
  );
};
