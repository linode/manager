import { DateTime } from 'luxon';
import * as React from 'react';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { makeStyles, Theme } from 'src/components/core/styles';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';

const useStyles = makeStyles((theme: Theme) => ({
  banner: {
    marginBottom: theme.spacing(),
  },
  dnsWarning: {
    '& h3:first-child': {
      marginBottom: theme.spacing(1),
    },
  },
}));

interface Props {
  hidden: boolean;
}

export type CombinedProps = Props;

export const DomainBanner: React.FC<Props> = (props) => {
  const { hidden } = props;
  const classes = useStyles();

  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const handleClose = () => {
    dismissNotifications(['domain-banner'], {
      expiry: DateTime.utc().plus({ days: 30 }).toISO(),
    });
  };

  if (hidden || hasDismissedNotifications(['domain-banner'])) {
    return null;
  }

  return (
    <Notice
      warning
      important
      className={classes.dnsWarning}
      dismissible
      onClick={handleClose}
    >
      <div className={classes.banner}>
        <strong>Your DNS zones are not being served.</strong>
      </div>
      Your domains will not be served by Linode&#39;s nameservers unless you
      have at least one active Linode on your account.
      <Link to="/linodes/create"> You can create one here.</Link>
    </Notice>
  );
};

export default React.memo(DomainBanner);
