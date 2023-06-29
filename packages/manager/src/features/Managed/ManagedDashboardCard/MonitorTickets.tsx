import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { Button } from 'src/components/Button/Button';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { ExtendedIssue } from 'src/queries/managed/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(),
    textAlign: 'center',
  },
  openTicketButton: {
    [theme.breakpoints.down('md')]: {
      paddingLeft: 12,
      paddingRight: 12,
    },
  },
  happyTicket: {
    color: theme.color.grey1,
  },
  sadTicket: {
    color: theme.color.red,
  },
}));

interface Props {
  issues: ExtendedIssue[];
}

export const MonitorTickets: React.FC<Props> = (props) => {
  const { issues } = props;
  const classes = useStyles();
  const history = useHistory();

  const openIssues = issues.filter((thisIssue) => !thisIssue.dateClosed);

  const hasIssues = openIssues.length > 0;

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      className={classes.root}
    >
      <Grid
        className={`${hasIssues ? classes.sadTicket : classes.happyTicket} py0`}
      >
        <TicketIcon width={50} height={39} />
      </Grid>
      <Grid>
        <Typography variant="h2">
          {hasIssues
            ? `${openIssues.length} open support ${
                openIssues.length === 1 ? 'ticket' : 'tickets'
              }`
            : 'No open support tickets'}
        </Typography>
      </Grid>
      <Grid>
        {hasIssues ? (
          <Typography>
            View the <Link to="/support/tickets">Support tickets page</Link> for
            a full list of open tickets.
          </Typography>
        ) : (
          <Button
            buttonType="primary"
            onClick={() =>
              history.push({
                pathname: '/support/tickets',
                state: {
                  open: true,
                  title: 'Managed monitor issue',
                },
              })
            }
            className={classes.openTicketButton}
          >
            Open a ticket
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default MonitorTickets;
