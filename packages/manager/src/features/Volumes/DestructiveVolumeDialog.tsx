import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TypeToConfirm from 'src/components/TypeToConfirm';
import { resetEventsPolling } from 'src/eventsPolling';
import useLinodes from 'src/hooks/useLinodes';
import usePreferences from 'src/hooks/usePreferences';
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

  const {
    volumeLabel: label,
    volumeId,
    linodeId,
    linodeLabel,
    mode,
    open,
    onClose,
  } = props;

  const [confirmText, setConfirmText] = React.useState('');

  const { preferences } = usePreferences();
  const { enqueueSnackbar } = useSnackbar();
  const linodes = useLinodes();

  const linode =
    linodeId !== undefined ? linodes.linodes.itemsById[linodeId] : undefined;

  const disabled =
    preferences?.type_to_confirm !== false && confirmText !== label;

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
    detach: {
      verb: 'Detach',
      noun: 'detachment',
    },
    delete: {
      verb: 'Delete',
      noun: 'deletion',
    },
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
        disabled={disabled}
        data-qa-confirm
      >
        {action.verb} Volume
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
      <TypeToConfirm
        label="Volume Label"
        confirmationText={
          <span>
            To confirm {action.noun}, type the name of the Volume (
            <b>{label}</b>) in the field below:
          </span>
        }
        value={confirmText}
        typographyStyle={{ marginTop: '20px' }}
        data-testid={'dialog-confirm-text-input'}
        expand
        onChange={(input) => {
          setConfirmText(input);
        }}
        visible={preferences?.type_to_confirm}
      />
    </ConfirmationDialog>
  );
};
