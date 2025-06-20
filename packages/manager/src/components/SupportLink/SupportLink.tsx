import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

import type {
  EntityType,
  FormPayloadValues,
  TicketType,
} from 'src/features/Support/SupportTickets/SupportTicketDialog';

export interface SupportLinkProps {
  description?: string;
  entity?: EntityForTicketDetails;
  formPayloadValues?: FormPayloadValues;
  onClick?: LinkProps['onClick'];
  text: string;
  ticketType?: TicketType;
  title?: string;
}

export interface EntityForTicketDetails {
  id?: number;
  type: EntityType;
}

const SupportLink = (props: SupportLinkProps) => {
  const {
    description,
    entity,
    formPayloadValues,
    onClick,
    text,
    ticketType,
    title,
  } = props;

  return (
    <Link
      onClick={onClick}
      to={{
        pathname: '/support/tickets/open?dialogOpen=true',
        state: {
          description,
          entity,
          formPayloadValues,
          ticketType,
          title,
        },
      }}
    >
      {text}
    </Link>
  );
};

export { SupportLink };
