import React from 'react';

import { SupportTicketGeneralError } from './SupportTicketGeneralError';
import { Typography } from './Typography';

import type { EntityType } from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface Props {
  entityType: EntityType;
  message: JSX.Element | string;
}

export const ErrorMessage = (props: Props) => {
  const { entityType, message } = props;

  if (typeof message === 'string') {
    return <Typography py={2}>{message}</Typography>;
  } else {
    return (
      <SupportTicketGeneralError
        entityType={entityType}
        generalError={message}
      />
    );
  }
};
