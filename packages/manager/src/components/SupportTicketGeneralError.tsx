import { useTheme } from '@mui/material/styles';
import React from 'react';

import { SupportLink } from 'src/components/SupportLink';
import { capitalize } from 'src/utilities/capitalize';

import { Typography } from './Typography';

import type { EntityType } from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface SupportTicketGeneralErrorProps {
  entityType: EntityType;
  generalError: JSX.Element;
}

export const SupportTicketGeneralError = (
  props: SupportTicketGeneralErrorProps
) => {
  const { entityType, generalError } = props;
  const theme = useTheme();

  const supportTextRegex = new RegExp(
    /(open a support ticket|contact Support)/i
  );
  const reason: string = generalError.props.errors[0].reason;
  const limitError = reason.split(supportTextRegex);

  // Determine whether we'll need to link to a specific support ticket form based on ticketType.
  const accountLimitRegex = new RegExp(
    /(limit|limit for the number of active services) on your account/i
  );
  const isAccountLimitSupportTicket = reason.match(accountLimitRegex);

  return (
    <Typography
      sx={{
        fontFamily: theme.font.bold,
        fontSize: '1rem',
        lineHeight: '20px',
      }}
    >
      {limitError.map((substring: string, idx: number) => {
        const openTicket = substring.match(supportTextRegex);

        if (openTicket) {
          return (
            <SupportLink
              text={
                substring.match(/^[A-Z]/)
                  ? capitalize(openTicket[0])
                  : openTicket[0]
              }
              ticketType={
                isAccountLimitSupportTicket ? 'accountLimit' : 'general'
              }
              entity={{ id: undefined, type: entityType }}
              key={`${substring}-${idx}`}
            />
          );
        } else {
          return substring;
        }
      })}
    </Typography>
  );
};
