import { SupportTicket } from '@linode/api-v4/lib/support/types';
import { Stack, Typography } from '@mui/material';
import React from 'react';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { useProfile } from 'src/queries/profile';
import { formatDate } from 'src/utilities/formatDate';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';

type Props = Pick<
  SupportTicket,
  'entity' | 'status' | 'updated' | 'updated_by'
>;

export const TicketStatus = (props: Props) => {
  const { entity, status, updated, updated_by } = props;

  const { data: profile } = useProfile();

  const formattedDate = formatDate(updated, {
    timezone: profile?.timezone,
  });
  const statusText = status === 'closed' ? 'Closed' : 'Last updated';

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
    <Stack
      sx={(theme) => ({
        flexFlow: 'row wrap',
        marginBottom: theme.spacing(3),
        [theme.breakpoints.down('md')]: {
          marginLeft: theme.spacing(1),
        },
      })}
    >
      <Typography
        sx={{
          display: 'inline-flex',
        }}
      >
        <StatusIcon
          status={status === 'closed' ? 'inactive' : 'active'}
          sx={{ alignSelf: 'center' }}
        />
        {statusText === 'Closed' ? statusText : 'Open'}
      </Typography>
      &nbsp;
      <Typography>
        | {statusText} by {updated_by} at {formattedDate}
      </Typography>
      &nbsp;
      {renderEntityLabel()}
    </Stack>
  );
};
