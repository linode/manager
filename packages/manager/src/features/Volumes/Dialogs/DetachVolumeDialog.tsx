import { useDetachVolumeMutation, useLinodeQuery } from '@linode/queries';
import { Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useEventsPollingActions } from 'src/queries/events/events';

import type { APIError, Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: undefined | Volume;
  volumeError?: APIError[] | null;
}

export const DetachVolumeDialog = (props: Props) => {
  const { isFetching, onClose, open, volume, volumeError } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { checkForNewEvents } = useEventsPollingActions();

  const { data: linode } = useLinodeQuery(
    volume?.linode_id ?? -1,
    volume?.linode_id !== null && volume?.linode_id !== undefined
  );

  const { data: volumePermissions } = usePermissions(
    'volume',
    ['detach_volume'],
    volume?.id,
    open
  );

  const { data: linodePermissions } = usePermissions(
    'linode',
    ['delete_linode'],
    linode?.id,
    open
  );

  const {
    error,
    isPending,
    mutateAsync: detachVolume,
  } = useDetachVolumeMutation();

  const onDetach = () => {
    detachVolume({ id: volume?.id ?? -1 }).then(() => {
      onClose();
      checkForNewEvents();
      enqueueSnackbar(`Volume detachment started`, {
        variant: 'info',
      });
    });
  };

  const poweredOff = linode?.status === 'offline';

  return (
    <TypeToConfirmDialog
      disableTypeToConfirmInput={
        !(volumePermissions?.detach_volume && linodePermissions?.delete_linode)
      }
      entity={{
        action: 'detachment',
        name: volume?.label,
        primaryBtnText: 'Detach',
        type: 'Volume',
        error: volumeError,
      }}
      errors={error}
      expand
      isFetching={isFetching}
      label="Volume Label"
      loading={isPending}
      onClick={onDetach}
      onClose={onClose}
      open={open}
      title={`Detach Volume ${volume?.label ?? 'Unknown'}?`}
      typographyStyle={{ marginTop: '10px' }}
    >
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
