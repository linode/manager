import { NotificationType } from '@linode/api-v4/lib/account';
import { scheduleOrQueueMigration } from '@linode/api-v4/lib/linodes';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useDialog } from 'src/hooks/useDialog';
import { useProfile } from 'src/queries/profile';
import { capitalize } from 'src/utilities/capitalize';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';

const useStyles = makeStyles((theme: Theme) => ({
  migrationLink: {
    ...theme.applyLinkStyles,
  },
}));

interface Props {
  linodeID: number;
  migrationTime: null | string;
  notificationMessage: string;
  notificationType: NotificationType;
  requestNotifications: () => void;
}

const MigrationNotification: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const {
    linodeID,
    migrationTime,
    notificationMessage,
    notificationType,
    requestNotifications,
  } = props;

  const { data: profile } = useProfile();

  const {
    closeDialog,
    dialog,
    handleError,
    openDialog,
    submitDialog,
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
      <Button buttonType="secondary" data-qa-cancel onClick={closeDialog}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        loading={dialog.isLoading}
        onClick={onSubmit}
      >
        Enter Migration Queue
      </Button>
    </ActionsPanel>
  );

  const migrationActionDescription =
    notificationType === 'migration_scheduled'
      ? 'enter the migration queue now'
      : 'schedule your migration now';

  const migrationScheduledText = () => {
    const baseText = `You have a scheduled migration, which will automatically execute`;

    const migrationTimeObject = parseAPIDate(migrationTime as string).toLocal();

    const formattedMigrationTime = formatDate(migrationTime as string, {
      timezone: profile?.timezone,
    });

    const now = DateTime.local();
    const roundedHourDifference = Math.round(
      migrationTimeObject.diff(now, 'hours').as('hours')
    );
    const approximateTime = pluralize('hour', 'hours', roundedHourDifference);

    return roundedHourDifference <= 24
      ? `${baseText} in approximately ${approximateTime} (${formattedMigrationTime}).`
      : `${baseText} on ${formattedMigrationTime}.`;
  };

  return (
    <>
      <Notice important warning>
        <Typography>
          {notificationType === 'migration_scheduled'
            ? migrationScheduledText()
            : notificationMessage}
          {` `}
          <button
            className={classes.migrationLink}
            onClick={() => openDialog(linodeID)}
          >
            {capitalize(migrationActionDescription)}
          </button>
          .
        </Typography>
      </Notice>
      <ConfirmationDialog
        actions={actions}
        error={dialog.error}
        onClose={() => closeDialog()}
        open={dialog.isOpen}
        title="Confirm Migration"
      >
        <Typography variant="subtitle1">
          Are you sure you want to {migrationActionDescription}?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(MigrationNotification);
