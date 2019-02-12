import { InjectedNotistackProps } from 'notistack';
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
import { Context, withLinode } from '../context';

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

type CombinedProps = Context &
  InjectedNotistackProps & {
    requestNotifications: () => void;
  } & WithStyles<ClassNames>;

const Notifications: React.StatelessComponent<CombinedProps> = props => {
  const { classes, requestNotifications, enqueueSnackbar, linode } = props;
  const { _notifications } = linode;

  /** Migrate */
  const migrate = (type: string) => {
    scheduleOrQueueMigration(linode.id)
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
      {_notifications.map((n, idx) =>
        ['migration_scheduled', 'migration_pending'].includes(n.type) ? (
          linode.status !== 'migrating' && (
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

const enhanced = compose<CombinedProps, {}>(
  styled,
  withLinode(context => context),
  withNotifications(undefined, ({ requestNotifications }) => ({
    requestNotifications
  }))
);

export default enhanced(Notifications);
