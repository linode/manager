import { NotificationType } from '@linode/api-v4/lib/account';
import { scheduleOrQueueMigration } from '@linode/api-v4/lib/linodes';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { useDialog } from 'src/hooks/useDialog';

const useStyles = makeStyles((theme: Theme) => ({
  migrationLink: {
    ...theme.applyLinkStyles,
  },
}));

interface Props {
  linodeID: number;
  requestNotifications: () => void;
  notificationType: NotificationType;
  notificationMessage: string;
}

const MigrationNotification: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const {
    linodeID,
    requestNotifications,
    notificationMessage,
    notificationType,
  } = props;

  const {
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError,
  } = useDialog<number>((linodeID: number) =>
    scheduleOrQueueMigration(linodeID)
  );

  const onSubmit = () => {
    submitDialog(linodeID)
      .then((_) => {
        // A 200 response indicates that the operation was successful.
        const successMessage =
          notificationType === 'migration_scheduled'
            ? 'Your Linode has been entered into the migration queue.'
            : 'Your migration has been scheduled.';
        enqueueSnackbar(successMessage, { variant: 'success' });
        requestNotifications();
      })
      .catch((_) => {
        const errorMessage =
          notificationType === 'migration_scheduled'
            ? 'An error occurred entering the migration queue.'
            : 'An error occurred scheduling your migration.';

        handleError(errorMessage);
      });
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={closeDialog} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onSubmit}
        data-qa-submit-managed-enrollment
        loading={dialog.isLoading}
      >
        Enter Migration Queue
      </Button>
    </ActionsPanel>
  );

  const migrationActionDescription =
    notificationType === 'migration_scheduled'
      ? 'enter the migration queue right now'
      : 'schedule your migration';

  return (
    <>
      <Notice important warning>
        <Typography>
          {notificationMessage}
          {` To ${migrationActionDescription}, please `}
          <button
            className={classes.migrationLink}
            onClick={() => openDialog(linodeID)}
          >
            click here.
          </button>
        </Typography>
      </Notice>
      <ConfirmationDialog
        open={dialog.isOpen}
        error={dialog.error}
        onClose={() => closeDialog()}
        title="Confirm Migration"
        actions={actions}
      >
        <Typography variant="subtitle1">
          Are you sure you want to {migrationActionDescription}?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(MigrationNotification);
