import { Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import React from 'react';

import { SupportLink } from 'src/components/SupportLink';

import { supportTextRegex } from './ErrorMessage';

import type {
  EntityForTicketDetails,
  SupportLinkProps,
} from './SupportLink/SupportLink';
import type { FormPayloadValues } from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface SupportTicketGeneralErrorProps {
  entity?: EntityForTicketDetails;
  formPayloadValues?: FormPayloadValues;
  generalError: string;
  supportLinkProps?: Partial<SupportLinkProps>;
}

const accountLimitRegex =
  /(limit|limit for the number of active services) on your account/i;

export const SupportTicketGeneralError = (
  props: SupportTicketGeneralErrorProps
) => {
  const { entity, formPayloadValues, generalError, supportLinkProps } = props;

  const limitError = generalError.split(supportTextRegex);

  // Determine whether we'll need to link to a specific support ticket form based on ticketType.
  const isAccountLimitSupportTicket = accountLimitRegex.test(generalError);

  return (
    <Typography
      sx={{
        font: 'inherit',
        fontSize: 'inherit',
        lineHeight: '20px',
      }}
    >
      {limitError.map((substring: string, idx: number) => {
        const openTicket = substring.match(supportTextRegex);

        if (openTicket) {
          return (
            <SupportLink
              entity={entity}
              formPayloadValues={formPayloadValues}
              key={`${substring}-${idx}`}
              text={
                substring.match(/^[A-Z]/)
                  ? capitalize(openTicket[0])
                  : openTicket[0]
              }
              ticketType={
                isAccountLimitSupportTicket ? 'accountLimit' : 'general'
              }
              {...supportLinkProps}
            />
          );
        } else {
          return substring;
        }
      })}
    </Typography>
  );
};
