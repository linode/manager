import { Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { SupportLink } from 'src/components/SupportLink';

import { supportTextRegex } from './ErrorMessage';

import type { EntityForTicketDetails } from './SupportLink/SupportLink';
import type { FormPayloadValues } from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface SupportTicketGeneralErrorProps {
  entity?: EntityForTicketDetails;
  formPayloadValues?: FormPayloadValues;
  generalError: string;
}

const accountLimitRegex = /(limit|limit for the number of active services) on your account/i;

export const SupportTicketGeneralError = (
  props: SupportTicketGeneralErrorProps
) => {
  const { entity, formPayloadValues, generalError } = props;
  const theme = useTheme();

  const limitError = generalError.split(supportTextRegex);

  // Determine whether we'll need to link to a specific support ticket form based on ticketType.
  const isAccountLimitSupportTicket = accountLimitRegex.test(generalError);

  return (
    <Typography
      sx={{
        font: theme.font.bold,
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
              entity={entity}
              formPayloadValues={formPayloadValues}
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
