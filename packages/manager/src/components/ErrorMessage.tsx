import React from 'react';

import { MigrateError } from './MigrateError';
import { SupportTicketGeneralError } from './SupportTicketGeneralError';
import { Typography } from './Typography';

import type {
  EntityType,
  FormPayloadValues,
} from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface Props {
  entityType?: EntityType;
  formPayloadValues?: FormPayloadValues;
  message: string;
}

export const migrationsDisabledRegex = /migrations are currently disabled/i;
export const supportTextRegex = /(open a support ticket|contact Support)/i;

export const ErrorMessage = (props: Props) => {
  const { entityType, formPayloadValues, message } = props;

  if (migrationsDisabledRegex.test(message)) {
    return <MigrateError />;
  }

  if (supportTextRegex.test(message)) {
    return (
      <SupportTicketGeneralError
        entityType={entityType}
        formPayloadValues={formPayloadValues}
        generalError={message}
      />
    );
  }

  return <Typography py={2}>{message}</Typography>;
};
