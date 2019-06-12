import { WithStyles } from '@material-ui/core/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { scheduleOrQueueMigration } from 'src/services/linodes';

type ClassNames = 'migrationLink';

const styles = (theme: Theme) =>
  createStyles({
    migrationLink: {
      color: theme.palette.primary.main,
      cursor: 'pointer',
      display: 'inline',
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  });

interface Props {
  linodeID: number;
  requestNotifications: () => void;
  notificationType: Linode.NotificationType;
  notificationMessage: string;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithSnackbarProps;

const MigrationNotification: React.FC<CombinedProps> = props => {
  const {
    linodeID,
    requestNotifications,
    enqueueSnackbar,
    classes,
    notificationMessage,
    notificationType
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
          variant: 'error'
        });
      });
  };

  return (
    <Notice important warning>
      {notificationMessage}
      {notificationType === 'migration_scheduled'
        ? ' To enter the migration queue right now, please '
        : ' To schedule your migration, please '}
      <Typography className={classes.migrationLink} onClick={migrate}>
        click here.
      </Typography>
    </Notice>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  withSnackbar,
  React.memo,
  styled
)(MigrationNotification);
