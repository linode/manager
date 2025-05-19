import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import TicketIcon from 'src/assets/icons/ticket.svg';
import { Link } from 'src/components/Link';

import { StyledButton, StyledGrid } from './MonitorTickets.styles';

import type { ExtendedIssue } from 'src/queries/managed/types';

interface MonitorTicketsProps {
  issues: ExtendedIssue[];
}

export const MonitorTickets = (props: MonitorTicketsProps) => {
  const { issues } = props;
  const navigate = useNavigate();

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
            buttonType="primary"
            onClick={() =>
              navigate({
                search: {
                  dialogOpen: true,
                  // dialogTitle: 'Managed monitor issue',
                },
                state: (prev) => ({
                  ...prev,
                  supportTicketFormFields: {
                    title: 'Managed monitor issue',
                  },
                }),
                to: '/support/tickets/open',
              })
            }
          >
            Open a ticket
          </StyledButton>
        )}
      </Grid>
    </StyledGrid>
  );
};

export default MonitorTickets;
