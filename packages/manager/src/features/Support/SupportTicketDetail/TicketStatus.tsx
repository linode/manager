import { Paper, Stack, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import React from 'react';

import { Hidden } from '@linode/ui';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { useProfile } from '@linode/queries';
import { formatDate } from 'src/utilities/formatDate';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';

import { SeverityChip } from './SeverityChip';

import type { SupportTicket } from '@linode/api-v4/lib/support/types';

type Props = Pick<
  SupportTicket,
  'entity' | 'severity' | 'status' | 'updated' | 'updated_by'
>;

export const TicketStatus = (props: Props) => {
  const { entity, severity, status, updated, updated_by } = props;

  const { data: profile } = useProfile();

  const formattedDate = formatDate(updated, {
    timezone: profile?.timezone,
  });
  const statusUpdateText = status === 'closed' ? 'Closed' : 'Last updated';

  const renderEntityLabel = () => {
    if (!entity) {
      return null;
    }

    const target = getLinkTargets(entity);

    return (
      <Typography>
        | Regarding:{' '}
        {target ? <Link to={target}>{entity.label}</Link> : entity.label}
      </Typography>
    );
  };

  return (
    <Paper
      data-qa-ticket-status
      sx={(theme) => ({ p: `${theme.spacing()} ${theme.spacing(2)}` })}
    >
      <Stack direction="row">
        <Grid
          container
          direction="row"
          size="grow"
          sx={{
            alignItems: 'center',
          }}
        >
          <StyledStatusIcon
            ariaLabel={`Ticket status is ${status}`}
            status={status === 'closed' ? 'inactive' : 'active'}
          />
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {capitalize(status)}
          </Typography>
          <Hidden smDown>
            &nbsp;
            <Typography>
              | {statusUpdateText} by {updated_by} at {formattedDate}
            </Typography>
            &nbsp;
            {renderEntityLabel()}
          </Hidden>
        </Grid>
        {severity && (
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography>Severity:</Typography>
            <SeverityChip severity={severity} />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

const StyledStatusIcon = styled(StatusIcon, {
  label: 'StyledStatusIcon',
})(({ theme, ...props }) => ({
  alignSelf: 'center',
  ...(props.status === 'inactive' &&
    theme.name === 'light' && {
      backgroundColor: theme.color.grey3,
    }),
}));
