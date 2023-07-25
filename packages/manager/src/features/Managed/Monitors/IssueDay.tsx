import { ManagedIssue } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Tooltip } from 'src/components/Tooltip';

const useStyles = makeStyles((theme: Theme) => ({
  failureText: {
    color: theme.color.red,
  },
  icon: {
    '&:hover': {
      color: theme.color.red,
    },
    marginLeft: theme.spacing(1),
    transition: 'color 225ms ease-in-out',
  },
  root: {
    marginTop: theme.spacing(2),
  },
}));

export interface Props {
  day: string;
  issues: ManagedIssue[];
}

interface DisplayProps {
  day: string;
  icon: JSX.Element;
  ticketUrl?: string;
}

const DayDisplay: React.FC<DisplayProps> = (props) => {
  const { day, icon, ticketUrl } = props;
  const classes = useStyles();

  return (
    <Grid
      alignItems="center"
      className={classes.root}
      container
      direction="row"
      spacing={2}
    >
      <Grid>{icon}</Grid>
      <Grid>
        <DateTimeDisplay
          className={`${ticketUrl ? classes.failureText : ''}`}
          displayTime={false}
          value={day}
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
          <Link className={classes.icon} to={ticketUrl}>
            <TicketIcon />
          </Link>
        </Tooltip>
      )}
    </Grid>
  );
};

const iconStyles = {
  height: 30,
  width: 30,
};

export const IssueDay: React.FC<Props> = (props) => {
  const { day, issues } = props;

  const issueLinks = issues.map((thisIssue) => thisIssue.entity.id);

  if (issues.length === 0) {
    // No issues for today
    return <DayDisplay day={day} icon={<Good {...iconStyles} />} />;
  }

  return (
    <DayDisplay
      day={day}
      icon={<Bad {...iconStyles} />}
      // For now, not worrying about the possibility of multiple tickets opened in a single day
      ticketUrl={`/support/tickets/${issueLinks[0]}`}
    />
  );
};

export default IssueDay;
