import * as React from 'react';
import { Link } from 'react-router-dom';
import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import { ExtendedIssue } from 'src/store/managed/issues.actions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2)
  },
  icon: {
    color: theme.color.red
  },
  failureText: {
    color: theme.color.red
  }
}));

interface Props {
  issues: ExtendedIssue[];
  day: string;
}

interface DisplayProps {
  day: string;
  icon: JSX.Element;
  ticketUrl?: string;
}

const DayDisplay: React.FC<DisplayProps> = props => {
  const { day, icon, ticketUrl } = props;
  const classes = useStyles();

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      className={classes.root}
    >
      <Grid item>{icon}</Grid>
      <Grid item>
        <DateTimeDisplay
          value={day}
          format={'D-MMM-YYYY'}
          className={`${ticketUrl ? classes.failureText : ''}`}
        />
      </Grid>
      {ticketUrl && (
        <Link to={ticketUrl} className={classes.icon}>
          <TicketIcon />
        </Link>
      )}
    </Grid>
  );
};

const iconStyles = {
  width: 30,
  height: 30
};

export const IssueDay: React.FC<Props> = props => {
  const { day, issues } = props;

  /**
   * Maybe we want to show resolved issues as a special case,
   * in which case this code should be used. Classic does not do
   * this, however, so for now it's safest to treat all issues
   * the same.
   */
  // const openIssueLinks = issues.reduce((accum, thisIssue) => {
  //   return thisIssue.dateClosed ? accum : [...accum, thisIssue.entity.id];
  // }, []);

  const openIssueLinks = issues.map(thisIssue => thisIssue.entity.id);

  if (issues.length === 0) {
    // No issues for today
    return <DayDisplay icon={<Good {...iconStyles} />} day={day} />;
  }

  // if (openIssueLinks.length > 0) {
  return (
    <DayDisplay
      icon={<Bad {...iconStyles} />}
      day={day}
      // For now, not worrying about the possibility of multiple tickets opened in a single day
      ticketUrl={`/support/tickets/${openIssueLinks[0]}`}
    />
  );
  // }

  /**
   * If we get here, there were one or more issues opened on this day,
   * but they've all since been resolved.
   */

  // return <DayDisplay icon={<Bad {...iconStyles} />} day={day} />;
};

export default IssueDay;
