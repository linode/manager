import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import TicketIcon from 'src/assets/icons/ticket.svg';
import { Link } from 'src/components/Link';

import { StyledButton, StyledGrid } from './MonitorTickets.styles';

import type { ExtendedIssue } from 'src/queries/managed/types';

interface MonitorTicketsProps {
  issues: ExtendedIssue[];
}

export const MonitorTickets = (props: MonitorTicketsProps) => {
  const { issues } = props;
  const history = useHistory();

  const openIssues = issues.filter((thisIssue) => !thisIssue.dateClosed);

  const hasIssues = openIssues.length > 0;

  return (
    <StyledGrid
      alignItems="center"
      container
      direction="column"
      justifyContent="center"
    >
      <Grid
        sx={(theme) => ({
          color: hasIssues ? theme.color.red : theme.color.grey1,
          padding: `0 ${theme.spacing(1)}`,
        })}
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
          <StyledButton
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
          >
            Open a ticket
          </StyledButton>
        )}
      </Grid>
    </StyledGrid>
  );
};

export default MonitorTickets;
