import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { resetEventsPolling } from 'src/eventsPolling';
import useLinodes from 'src/hooks/useLinodes';
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
  open: boolean;
  mode: 'detach' | 'delete';
  onClose: () => void;
  volumeLabel: string;
  volumeId: number;
  linodeLabel?: string;
  linodeId?: number;
}

export const DestructiveVolumeDialog = (props: Props) => {
  const classes = useStyles();

  const { linodeId, mode, onClose, open, volumeId, volumeLabel: label } = props;

  const { enqueueSnackbar } = useSnackbar();
  const linodes = useLinodes();

  const linode =
    linodeId !== undefined ? linodes.linodes.itemsById[linodeId] : undefined;

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

  const action = {
    delete: {
      noun: 'deletion',
      verb: 'Delete',
    },
    detach: {
      noun: 'detachment',
      verb: 'Detach',
    },
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
      title={title}
      entity={{ label, type: 'Volume' }}
      open={open}
      loading={loading}
      onClose={onClose}
      onClick={method}
      confirmationText={
        <span>
          To confirm {action.noun}, type the name of the Volume (<b>{label}</b>)
          in the field below:
        </span>
      }
      typographyStyle={{ marginTop: '10px' }}
    >
      {error && <Notice error text={error} />}
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
