import { SupportTicket } from '@linode/api-v4/lib/support/types';
import { styled } from '@mui/material/styles';
import React from 'react';

import { Link } from 'src/components/Link';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';
import { capitalize } from 'src/utilities/capitalize';
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
    <Stack
      sx={(theme) => ({
        flexFlow: 'row wrap',
        marginBottom: theme.spacing(3),
        [theme.breakpoints.down('md')]: {
          marginLeft: theme.spacing(1),
        },
      })}
    >
      <Stack
        sx={{
          display: 'inline-flex',
          flexDirection: 'row',
        }}
      >
        <StyledStatusIcon
          ariaLabel={`Ticket status is ${status}`}
          status={status === 'closed' ? 'inactive' : 'active'}
        />
        {capitalize(status)}
      </Stack>
      &nbsp;
      <Typography>
        | {statusUpdateText} by {updated_by} at {formattedDate}
      </Typography>
      &nbsp;
      {renderEntityLabel()}
    </Stack>
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
