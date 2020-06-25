import * as React from 'react';
import { Link } from 'react-router-dom';
import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import { ExtendedIssue } from 'src/store/managed/issues.actions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2)
  },
  icon: {
    marginLeft: theme.spacing(1),
    transition: 'color 225ms ease-in-out',
    '&:hover': {
      color: theme.color.red
    }
  },
  failureText: {
    color: theme.color.red
  }
}));

export interface Props {
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
          format={'d-LLL-yyyy'}
          className={`${ticketUrl ? classes.failureText : ''}`}
        />
      </Grid>
      {ticketUrl && (
        <Tooltip
          data-qa-open-ticket-tooltip
          enterTouchDelay={0}
          leaveTouchDelay={5000}
          placement={'top'}
          title={'See the ticket associated with this incident'}
        >
          <Link to={ticketUrl} className={classes.icon}>
            <TicketIcon />
          </Link>
        </Tooltip>
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

  const issueLinks = issues.map(thisIssue => thisIssue.entity.id);

  if (issues.length === 0) {
    // No issues for today
    return <DayDisplay icon={<Good {...iconStyles} />} day={day} />;
  }

  return (
    <DayDisplay
      icon={<Bad {...iconStyles} />}
      day={day}
      // For now, not worrying about the possibility of multiple tickets opened in a single day
      ticketUrl={`/support/tickets/${issueLinks[0]}`}
    />
  );
};

export default IssueDay;
