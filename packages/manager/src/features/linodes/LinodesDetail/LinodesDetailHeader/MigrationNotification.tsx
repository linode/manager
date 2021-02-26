import { NotificationType } from '@linode/api-v4/lib/account';
import { scheduleOrQueueMigration } from '@linode/api-v4/lib/linodes';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

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

const MigrationNotification: React.FC<Props> = props => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const {
    linodeID,
    requestNotifications,
    notificationMessage,
    notificationType,
  } = props;

  /** Migrate */
  const migrate = () => {
    scheduleOrQueueMigration(linodeID)
      .then(_ => {
        // A 200 response indicates that the operation was successful.
        const successMessage =
          notificationType === 'migration_scheduled'
            ? 'Your Linode has been entered into the migration queue.'
            : 'Your migration has been scheduled.';
        enqueueSnackbar(successMessage, { variant: 'success' });
        requestNotifications();
      })
      .catch(_ => {
        const errorMessage =
          notificationType === 'migration_scheduled'
            ? 'An error occurred entering the migration queue.'
            : 'An error occurred scheduling your migration.';

        enqueueSnackbar(errorMessage, {
          variant: 'error',
        });
      });
  };

  return (
    <Notice important warning>
      <Typography>
        {notificationMessage}
        {notificationType === 'migration_scheduled'
          ? ' To enter the migration queue right now, please '
          : ' To schedule your migration, please '}
        <button className={classes.migrationLink} onClick={migrate}>
          click here.
        </button>
      </Typography>
    </Notice>
  );
};

export default React.memo(MigrationNotification);
