import { DateTime } from 'luxon';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
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

const KEY = 'domain-banner';

export const DomainBanner: React.FC<Props> = (props) => {
  const { hidden } = props;
  const classes = useStyles();

  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const handleClose = () => {
    dismissNotifications([KEY], {
      expiry: DateTime.utc().plus({ days: 30 }).toISO(),
      label: KEY,
    });
  };

  if (hidden || hasDismissedNotifications([KEY])) {
    return null;
  }

  return (
    <Notice
      warning
      important
      className={classes.dnsWarning}
      dismissible
      onClose={handleClose}
    >
      <Typography>
        <div className={classes.banner}>
          <strong>Your DNS zones are not being served.</strong>
        </div>
        Your domains will not be served by Linode&#39;s nameservers unless you
        have at least one active Linode on your account.{` `}
        <Link to="/linodes/create">You can create one here.</Link>
      </Typography>
    </Notice>
  );
};

export default React.memo(DomainBanner);
