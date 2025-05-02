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
      to={{
        pathname: '/support/tickets',
        state: {
          description,
          entity,
          formPayloadValues,
          open: true,
          ticketType,
          title,
        },
      }}
      onClick={onClick}
    >
      {text}
    </Link>
  );
};

export { SupportLink };
