import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import TicketIcon from 'src/assets/icons/ticket.svg';
import { Button } from 'src/components/Button/Button';
import { Typography } from 'src/components/Typography';
import { ExtendedIssue } from 'src/queries/managed/types';

const useStyles = makeStyles((theme: Theme) => ({
  happyTicket: {
    color: theme.color.grey1,
  },
  openTicketButton: {
    [theme.breakpoints.down('md')]: {
      paddingLeft: 12,
      paddingRight: 12,
    },
  },
  root: {
    padding: theme.spacing(),
    textAlign: 'center',
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
      alignItems="center"
      className={classes.root}
      container
      direction="column"
      justifyContent="center"
    >
      <Grid
        className={`${hasIssues ? classes.sadTicket : classes.happyTicket} py0`}
      >
        <TicketIcon height={39} width={50} />
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
            onClick={() =>
              history.push({
                pathname: '/support/tickets',
                state: {
                  open: true,
                  title: 'Managed monitor issue',
                },
              })
            }
            buttonType="primary"
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
