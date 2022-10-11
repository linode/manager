import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { useLinodeQuery } from 'src/queries/linodes';
import { makeStyles, Theme } from 'src/components/core/styles';
import { useDetachVolumeMutation } from 'src/queries/volumes';
import { useSnackbar } from 'notistack';
import { APIError } from '@linode/api-v4/lib/types';
import { resetEventsPolling } from 'src/eventsPolling';
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
  error?: string;
  onClose: () => void;
  onDelete: () => void;
  volumeLabel: string;
  volumeId: number;
  linodeLabel: string;
  linodeId: number;
}

export const DestructiveVolumeDialog = (props: Props) => {
  const classes = useStyles();

  const {
    error,
    volumeLabel: label,
    volumeId,
    linodeId,
    linodeLabel,
    mode,
    open,
    onClose,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(linodeId, open);

  const { mutateAsync: detachVolume } = useDetachVolumeMutation();

  const onDetach = () => {
    detachVolume({ id: volumeId })
      .then(() => {
        onClose();
        resetEventsPolling();
        enqueueSnackbar(`Volume detachment started`, {
          variant: 'info',
        });
      })
      .catch((error: APIError[]) => {
        enqueueSnackbar(
          getAPIErrorOrDefault(error, 'Unable to detach Volume.')[0].reason,
          {
            variant: 'error',
          }
        );
      });
  };

  const poweredOff = linode?.status === 'offline';

  const method = {
    detach: onDetach,
    delete: props.onDelete,
  }[props.mode];

  const action = {
    detach: 'Detach',
    delete: 'Delete',
  }[props.mode];

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={method} data-qa-confirm>
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
      {mode === 'detach' && !poweredOff && (
        <Typography className={classes.warningCopy}>
          <strong>Warning:</strong> This operation could cause data loss. Please
          power off the Linode first or make sure it isn't currently writing to
          the volume before continuing. If this volume is currently mounted,
          detaching it could cause your Linode to restart.
        </Typography>
      )}
      {mode === 'delete' && (
        <Typography>
          Are you sure you want to {mode} this Volume
          {`${linodeLabel ? ` from ${linodeLabel}?` : '?'}`}
        </Typography>
      )}
    </ConfirmationDialog>
  );
};
