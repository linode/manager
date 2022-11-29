import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { makeStyles, Theme } from 'src/components/core/styles';
import {
  useDeleteVolumeMutation,
  useDetachVolumeMutation,
} from 'src/queries/volumes';
import { useSnackbar } from 'notistack';
import { resetEventsPolling } from 'src/eventsPolling';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import useLinodes from 'src/hooks/useLinodes';

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

  const {
    volumeLabel: label,
    volumeId,
    linodeId,
    linodeLabel,
    mode,
    open,
    onClose,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const linodes = useLinodes();

  const linode =
    linodeId !== undefined ? linodes.linodes.itemsById[linodeId] : undefined;

  const {
    mutateAsync: detachVolume,
    error: detachError,
    isLoading: detachLoading,
  } = useDetachVolumeMutation();

  const {
    mutateAsync: deleteVolume,
    error: deleteError,
    isLoading: deleteLoading,
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
    detach: onDetach,
    delete: onDelete,
  }[props.mode];

  const action = {
    detach: 'Detach',
    delete: 'Delete',
  }[props.mode];

  const loading = {
    detach: detachLoading,
    delete: deleteLoading,
  }[props.mode];

  const selectedError = {
    detach: detachError,
    delete: deleteError,
  }[props.mode];

  const error = selectedError
    ? getAPIErrorOrDefault(selectedError, `Unable to ${mode} volume.`)[0].reason
    : undefined;

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={method}
        loading={loading}
        data-qa-confirm
      >
        {action} Volume
      </Button>
    </ActionsPanel>
  );

  const title = {
    detach: `Detach ${label ? `Volume ${label}` : 'Volume'}?`,
    delete: `Delete ${label ? `Volume ${label}` : 'Volume'}?`,
  }[props.mode];

  return (
    <ConfirmationDialog
      open={open}
      title={title}
      onClose={onClose}
      actions={actions}
    >
      {error && <Notice error text={error} />}
      {/* In 'detach' mode, show a warning if the Linode is powered on. */}
      {mode === 'detach' && !poweredOff && linode !== undefined && (
        <Typography className={classes.warningCopy}>
          <strong>Warning:</strong> This operation could cause data loss. Please
          power off the Linode first or make sure it isn't currently writing to
          the volume before continuing. If this volume is currently mounted,
          detaching it could cause your Linode to restart.
        </Typography>
      )}
      <Typography>
        Are you sure you want to {mode} this Volume
        {`${linodeLabel ? ` from ${linodeLabel}?` : '?'}`}
      </Typography>
    </ConfirmationDialog>
  );
};
