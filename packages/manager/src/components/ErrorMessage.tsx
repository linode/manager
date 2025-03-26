import { Typography } from '@linode/ui';
import React from 'react';

import { LinodeResizeAllocationError } from './LinodeResizeAllocationError';
import { MigrateError } from './MigrateError';
import { SupportTicketGeneralError } from './SupportTicketGeneralError';

import type { EntityForTicketDetails } from './SupportLink/SupportLink';
import type { FormPayloadValues } from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface Props {
  entity?: EntityForTicketDetails;
  formPayloadValues?: FormPayloadValues;
  message: string;
}

export const migrationsDisabledRegex = /migrations are currently disabled/i;
export const supportTextRegex = /(open a support ticket|contact Support)/i;
export const allocationErrorRegex = /allocated more disk/i;

export const ErrorMessage = (props: Props) => {
  const { entity, formPayloadValues, message } = props;

  if (migrationsDisabledRegex.test(message)) {
    return <MigrateError entity={entity} />;
  }

  if (supportTextRegex.test(message)) {
    return (
      <SupportTicketGeneralError
        entity={entity}
        formPayloadValues={formPayloadValues}
        generalError={message}
      />
    );
  }

  if (allocationErrorRegex.test(message)) {
    return <LinodeResizeAllocationError />;
  }

  return <Typography py={2}>{message}</Typography>;
};
