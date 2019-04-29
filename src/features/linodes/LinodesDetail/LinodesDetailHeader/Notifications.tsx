import { WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import ProductNotification from 'src/components/ProductNotification';
import { scheduleOrQueueMigration } from 'src/services/linodes';
import { withNotifications } from 'src/store/notification/notification.containers';
import { withLinodeDetailContext } from '../linodeDetailContext';

type ClassNames = 'migrationLink';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  migrationLink: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
});

type CombinedProps = ContextProps &
  WithSnackbarProps & {
    requestNotifications: () => void;
  } & WithStyles<ClassNames>;

const Notifications: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    requestNotifications,
    enqueueSnackbar,
    linodeNotifications,
    linodeId,
    linodeStatus
  } = props;

  /** Migrate */
  const migrate = (type: string) => {
    scheduleOrQueueMigration(linodeId)
      .then(_ => {
        // A 200 response indicates that the operation was successful.
        const successMessage =
          type === 'migration_scheduled'
            ? 'Your Linode has been entered into the migration queue.'
            : 'Your migration has been scheduled.';
        enqueueSnackbar(successMessage, { variant: 'success' });
        requestNotifications();
      })
      .catch(_ => undefined);
  };

  return (
    <>
      {linodeNotifications.map((n, idx) =>
        ['migration_scheduled', 'migration_pending'].includes(n.type) ? (
          linodeStatus !== 'migrating' && (
            <Notice key={idx} important warning>
              {n.message}
              {n.type === 'migration_scheduled'
                ? ' To enter the migration queue right now, please '
                : ' To schedule your migration, please '}
              <span
                className={classes.migrationLink}
                onClick={() => migrate(n.type)}
              >
                click here
              </span>
              .
            </Notice>
          )
        ) : (
          <ProductNotification
            key={idx}
            severity={n.severity}
            text={n.message}
          />
        )
      )}
    </>
  );
};

const styled = withStyles(styles);

interface ContextProps {
  linodeNotifications: Linode.Notification[];
  linodeId: number;
  linodeStatus: Linode.LinodeStatus;
}

const enhanced = compose<CombinedProps, {}>(
  styled,
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeNotifications: linode._notifications,
    linodeId: linode.id,
    linodeStatus: linode.status
  })),
  withNotifications(undefined, ({ requestNotifications }) => ({
    requestNotifications
  }))
);

export default enhanced(Notifications);
