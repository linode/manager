import React from 'react';

import { SupportTicketGeneralError } from './SupportTicketGeneralError';
import { Typography } from './Typography';

import type { EntityType } from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface Props {
  entityType: EntityType;
  message: string;
}

export const supportTextRegex = /(open a support ticket|contact Support)/i;

export const ErrorMessage = (props: Props) => {
  const { entityType, message } = props;
  const isSupportTicketError = supportTextRegex.test(message);

  if (isSupportTicketError) {
    return (
      <SupportTicketGeneralError
        entityType={entityType}
        generalError={message}
      />
    );
  }

  return <Typography py={2}>{message}</Typography>;
};
