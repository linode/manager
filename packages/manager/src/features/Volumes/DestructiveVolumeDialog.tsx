import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  useDeleteVolumeMutation,
  useDetachVolumeMutation,
} from 'src/queries/volumes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  warningCopy: {
    color: theme.color.red,
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  mode: 'delete' | 'detach';
  onClose: () => void;
  open: boolean;
  volumeId: number;
  volumeLabel: string;
}

export const DestructiveVolumeDialog = (props: Props) => {
  const classes = useStyles();

  const { linodeId, mode, onClose, open, volumeId, volumeLabel: label } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined
  );

  const {
    error: detachError,
    isLoading: detachLoading,
    mutateAsync: detachVolume,
  } = useDetachVolumeMutation();

  const {
    error: deleteError,
    isLoading: deleteLoading,
    mutateAsync: deleteVolume,
  } = useDeleteVolumeMutation();

  const onDetach = () => {
    detachVolume({ id: volumeId }).then(() => {
      onClose();
      resetEventsPolling();
      enqueueSnackbar(`Volume detachment started`, {
        variant: 'info',
      });
    });
  };

  const onDelete = () => {
    deleteVolume({ id: volumeId }).then(() => {
      onClose();
      resetEventsPolling();
    });
  };

  const poweredOff = linode?.status === 'offline';

  const method = {
    delete: onDelete,
    detach: onDetach,
  }[props.mode];

  const loading = {
    delete: deleteLoading,
    detach: detachLoading,
  }[props.mode];

  const selectedError = {
    delete: deleteError,
    detach: detachError,
  }[props.mode];

  const error = selectedError
    ? getAPIErrorOrDefault(selectedError, `Unable to ${mode} volume.`)[0].reason
    : undefined;

  const title = {
    delete: `Delete ${label ? `Volume ${label}` : 'Volume'}?`,
    detach: `Detach ${label ? `Volume ${label}` : 'Volume'}?`,
  }[props.mode];

  return (
    <TypeToConfirmDialog
      entity={{
        action: mode === 'detach' ? 'detachment' : 'deletion',
        name: label,
        primaryBtnText: mode === 'detach' ? 'Detach' : 'Delete',
        type: 'Volume',
      }}
      label={'Volume Label'}
      loading={loading}
      onClick={method}
      onClose={onClose}
      open={open}
      title={title}
      typographyStyle={{ marginTop: '10px' }}
    >
      {error && <Notice variant="error" text={error} />}
      {mode === 'detach' && !poweredOff && linode !== undefined && (
        <Typography className={classes.warningCopy}>
          <strong>Warning:</strong> This operation could cause data loss. Please
          power off the Linode first or make sure it isn&rsquo;t currently
          writing to the volume before continuing. If this volume is currently
          mounted, detaching it could cause your Linode to restart.
        </Typography>
      )}
    </TypeToConfirmDialog>
  );
};
