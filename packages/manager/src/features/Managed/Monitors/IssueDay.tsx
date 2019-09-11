import * as React from 'react';
import { Link } from 'react-router-dom';
import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import { ExtendedIssue } from 'src/store/managed/issues.actions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2)
  },
}))

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
    <Grid container direction="row" alignItems="center" className={classes.root}>
      <Grid item>
        {icon}
      </Grid>
      <Grid item>
        <DateTimeDisplay value={day} format={'D-MMM-YYYY'} />
      </Grid>
      {ticketUrl &&
        <Link to={ticketUrl}>Ur ticket iz here</Link>
      }
    </Grid>
  )
}

const iconStyles = {
  width: 30,
  height: 30
}

export const IssueDay: React.FC<Props> = props => {
  const { day, issues } = props;

  const openIssueLinks = issues.reduce((accum, thisIssue) => {
    return thisIssue.dateClosed ? accum : [...accum, thisIssue.entity.id];
  }, []);
  
  if (openIssueLinks.length > 0) {
    return <DayDisplay
      icon={<Bad {...iconStyles} />}
      day={day}
      ticketUrl={`support/tickets/${openIssueLinks[0]}`}
    />
  }

  // No open issues for today
  return <DayDisplay
    icon={<Good {...iconStyles} />}
    day={day}
  />
} 

export default IssueDay;