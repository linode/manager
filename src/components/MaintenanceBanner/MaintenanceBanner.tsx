import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

import isPast from 'src/utilities/isPast';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    '& p': {
      marginBottom: theme.spacing.unit * 2
    },
    '& p:last-child': {
      marginBottom: 0
    }
  }
});

interface Props {
  /** please keep in mind here that it's possible the start time can be in the past */
  maintenanceStart?: string | null;
  maintenanceEnd?: string | null;
  userTimezone?: string;
  userTimezoneLoading: boolean;
  userTimezoneError?: Linode.ApiFieldError[];
  type?: 'migration' | 'reboot';
}

type CombinedProps = Props & WithStyles<ClassNames>;

const MaintenanceBanner: React.FC<CombinedProps> = props => {
  const {
    type,
    maintenanceEnd,
    maintenanceStart,
    userTimezone,
    userTimezoneError,
    userTimezoneLoading
  } = props;

  const timezoneMsg = () => {
    if (userTimezoneLoading) {
      return 'Fetching timezone...';
    }

    if (userTimezoneError) {
      return 'Error retrieving timezone.';
    }

    if (!userTimezone) {
      return null;
    }

    return userTimezone;
  };

  return (
    <Notice warning important className={props.classes.root}>
      <Typography>
        {generateIntroText(type, maintenanceStart, maintenanceEnd)}
      </Typography>
      <Typography>
        Timezone: <Link to="/profile/display">{timezoneMsg()} </Link>
      </Typography>
      <Typography>
        Please see
        <a target="_blank" href="https://status.linode.com">
          {' '}
          the Linode status page{' '}
        </a>
        for additional information.
      </Typography>
    </Notice>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(MaintenanceBanner);

const generateIntroText = (
  type?: 'migration' | 'reboot',
  start?: string | null,
  end?: string | null
) => {
  const maintenanceInProgress = !!start
    ? isPast(new Date().toISOString())(start)
    : false;

  console.log(maintenanceInProgress);

  /** we're on the Linode Detail Screen */
  if (!!type) {
    return <React.Fragment>You are dumb.</React.Fragment>;
  }

  /** We are on the Dashboard on Linode Landing page. */
  return (
    <React.Fragment>
      Maintenance is required for one or more of your Linodes. Your maintenance
      times will be listed under the "Maintenance Status" column
      {!location.pathname.includes('/linodes') && (
        <Link to="/linodes"> here</Link>
      )}
      .
    </React.Fragment>
  );
};
