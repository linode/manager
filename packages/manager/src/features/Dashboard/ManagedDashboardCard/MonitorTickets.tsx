import * as React from 'react';
import { Link } from 'react-router-dom';

import TicketIcon from 'src/assets/icons/ticket.svg';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { ExtendedIssue } from 'src/store/managed/issues.actions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(),
    textAlign: 'center'
  },
  happyTicket: {
    color: theme.color.blue
  },
  sadTicket: {
    color: theme.color.red
  }
}));

interface Props {
  issues: ExtendedIssue[];
}

export const MonitorTickets: React.FC<Props> = props => {
  const { issues } = props;
  const classes = useStyles();

  const openIssues = issues.filter(thisIssue => !thisIssue.dateClosed);

  const hasIssues = openIssues.length > 0;

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      className={classes.root}
    >
      <Grid
        item
        className={hasIssues ? classes.sadTicket : classes.happyTicket}
      >
        <TicketIcon width={50} height={50} />
      </Grid>
      <Grid item>
        <Typography variant="h2">
          {hasIssues
            ? `${openIssues.length} open Support ${
                openIssues.length === 1 ? 'ticket' : 'tickets'
              }`
            : 'No open Support tickets'}
        </Typography>
      </Grid>
      <Grid item>
        {hasIssues ? (
          <Typography>
            View the <Link to="/support/tickets">Support tickets page</Link> for
            a full list of open tickets.
          </Typography>
        ) : (
          <Button buttonType="primary" onClick={() => null}>
            Open a ticket
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default MonitorTickets;
